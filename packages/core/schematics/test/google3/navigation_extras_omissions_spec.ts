/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import * as shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 NavigationExtras omissions TSLint rule', () => {
  const rulesDirectory =
      dirname(require.resolve('../../migrations/google3/navigationExtrasOmissionsRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('router.d.ts', `
      export declare class Router {
        navigateByUrl(url: string, extras?: any);
        createUrlTree(commands: any[], extras?: any);
      }
    `);

    writeFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        module: 'es2015',
        baseUrl: './',
        paths: {
          '@angular/router': ['router.d.ts'],
        }
      },
    }));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'navigation-extras-omissions': true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }

  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  function getFile(fileName: string) {
    return readFileSync(join(tmpDir, fileName), 'utf8');
  }

  it('should flag objects with invalid properties used inside the relevant method calls', () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      class Navigator {
        constructor(private _router: Router) {}

        goHome() {
          this._router.navigateByUrl('/', {fragment: 'foo'});
        }

        createTree() {
          return this._router.createUrlTree(['/'], {state: {}});
        }

        goAway() {
          this._router.navigateByUrl('/away');
        }
      }
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());

    expect(failures.length).toBe(2);
    expect(failures[0])
        .toMatch(
            /Object used in navigateByUrl or createUrlTree call contains unsupported properties/);
    expect(failures[1])
        .toMatch(
            /Object used in navigateByUrl or createUrlTree call contains unsupported properties/);
  });

  it('should not change calls with a single argument', () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      class Navigator {
        constructor(private _router: Router) {}

        goHome() {
          this._router.navigateByUrl('/');
        }
      }

      function createTree(router: Router) {
        return router.createUrlTree(['/']);
      }
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(`this._router.navigateByUrl('/');`);
    expect(content).toContain(`return router.createUrlTree(['/']);`);
  });

  it('should not change calls with an empty object literal', () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      class Navigator {
        constructor(private _router: Router) {}

        goHome() {
          this._router.navigateByUrl('/', {});
        }
      }

      function createTree(router: Router) {
        return router.createUrlTree(['/'], {});
      }
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(`this._router.navigateByUrl('/', {});`);
    expect(content).toContain(`return router.createUrlTree(['/'], {});`);
  });

  it('should not change objects that are used in multiple different methods', () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      const config = {replaceUrl: true, fragment: 'foo', state: {}};

      class Navigator {
        constructor(private _router: Router) {}

        goHome() {
          this._router.navigateByUrl('/', config);
          return this._router.createUrlTree(['/'], config);
        }
      }
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(`const config = {replaceUrl: true, fragment: 'foo', state: {}};`);
  });

  it('should preserve calls if the router does not come from @angular/router', () => {
    writeFile('/index.ts', `
      import {Router} from '@custom/router';

      function createTree(router: Router) {
        return router.createUrlTree(['/'], {foo: 1, bar: 2});
      }
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(`return router.createUrlTree(['/'], {foo: 1, bar: 2});`);
  });

  it('should change invalid navigateByUrl calls', () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      class Navigator {
        constructor(private _router: Router) {}

        goHome() {
          this._router.navigateByUrl('/', {preserveFragment: false, skipLocationChange: false, fragment: 'foo'});
        }
      }
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(
        `this._router.navigateByUrl('/', { /* Removed unsupported properties by Angular migration: preserveFragment, fragment. */ skipLocationChange: false });`);
  });

  it('should change invalid navigateByUrl calls', () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      function createTree(router: Router) {
        return router.createUrlTree(['/'], {replaceUrl: true, preserveFragment: true, state: {}});
      }
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(
        `return router.createUrlTree(['/'], { /* Removed unsupported properties by Angular migration: replaceUrl, state. */ preserveFragment: true });`);
  });

  it('should set the comment outside the object if all properties were removed', () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      function navigate(router: Router) {
        router.navigateByUrl('/', {fragment: 'foo'});
      }
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(
        `router.navigateByUrl('/', /* Removed unsupported properties by Angular migration: fragment. */ {});`);
  });

  it('should migrate object literals defined as variables', () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      const config = {skipLocationChange: false, fragment: 'foo'};
      const proxy = config;

      function navigate(router: Router) {
        router.navigateByUrl('/', proxy);
      }
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(
        `const config = { /* Removed unsupported properties by Angular migration: fragment. */ skipLocationChange: false };`);
    expect(content).toContain(`const proxy = config;`);
    expect(content).toContain(`router.navigateByUrl('/', proxy);`);
  });

  it('should pick up calls where the router is returned by a function', () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      function navigate(router: Router) {
        getRouter().navigateByUrl('/', {fragment: 'foo'});
      }

      function getRouter() {
        return {} as Router;
      }
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(
        `getRouter().navigateByUrl('/', /* Removed unsupported properties by Angular migration: fragment. */ {});`);
  });

  it('should pick up calls where the router is aliased', () => {
    writeFile('/index.ts', `
      import {Router as AliasedRouter} from '@angular/router';

      function navigate(router: AliasedRouter) {
        router.navigateByUrl('/', {fragment: 'foo'});
      }
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(
        `router.navigateByUrl('/', /* Removed unsupported properties by Angular migration: fragment. */ {});`);
  });

  it('should preserve object spread assignments', () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      function navigate(router: Router) {
        const overrides = {foo: 1};
        router.navigateByUrl('/', {replaceUrl: true, fragment: 'foo', ...overrides});
      }
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(
        `router.navigateByUrl('/', { /* Removed unsupported properties by Angular migration: fragment. */ replaceUrl: true, ...overrides });`);
  });

  it('should migrate objects that are used in multiple calls of the same method', () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      const config = {skipLocationChange: false, fragment: 'foo'};

      class Navigator {
        constructor(private _router: Router) {}

        goHome() {
          this._router.navigateByUrl('/', config);
        }

        goFish() {
          this._router.navigateByUrl('/fish', config);
        }
      }
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(
        `const config = { /* Removed unsupported properties by Angular migration: fragment. */ skipLocationChange: false };`);
  });
});
