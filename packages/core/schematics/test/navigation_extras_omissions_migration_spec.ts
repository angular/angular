/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import * as shx from 'shelljs';

describe('NavigationExtras omissions migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
        strictNullChecks: true,
      },
    }));
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));
    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/router/index.d.ts', `
      export declare class Router {
        navigateByUrl(url: string, extras?: any);
        createUrlTree(commands: any[], extras?: any);
      }
    `);

    previousWorkingDir = shx.pwd();
    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  it('should not change calls with a single argument', async () => {
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

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`this._router.navigateByUrl('/');`);
    expect(content).toContain(`return router.createUrlTree(['/']);`);
  });

  it('should not change calls with an empty object literal', async () => {
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

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`this._router.navigateByUrl('/', {});`);
    expect(content).toContain(`return router.createUrlTree(['/'], {});`);
  });

  it('should not change objects that are used in multiple different methods', async () => {
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

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`const config = {replaceUrl: true, fragment: 'foo', state: {}};`);
  });

  it('should preserve calls if the router does not come from @angular/router', async () => {
    writeFile('/index.ts', `
      import {Router} from '@custom/router';

      function createTree(router: Router) {
        return router.createUrlTree(['/'], {foo: 1, bar: 2});
      }
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`return router.createUrlTree(['/'], {foo: 1, bar: 2});`);
  });

  it('should change invalid navigateByUrl calls', async () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      class Navigator {
        constructor(private _router: Router) {}

        goHome() {
          this._router.navigateByUrl('/', {preserveFragment: false, skipLocationChange: false, fragment: 'foo'});
        }
      }
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `this._router.navigateByUrl('/', { /* Removed unsupported properties by Angular migration: preserveFragment, fragment. */ skipLocationChange: false });`);
  });

  it('should change invalid navigateByUrl calls', async () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      function createTree(router: Router) {
        return router.createUrlTree(['/'], {replaceUrl: true, preserveFragment: true, state: {}});
      }
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `return router.createUrlTree(['/'], { /* Removed unsupported properties by Angular migration: replaceUrl, state. */ preserveFragment: true });`);
  });

  it('should set the comment outside the object if all properties were removed', async () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      function navigate(router: Router) {
        router.navigateByUrl('/', {fragment: 'foo'});
      }
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `router.navigateByUrl('/', /* Removed unsupported properties by Angular migration: fragment. */ {});`);
  });

  it('should migrate object literals defined as variables', async () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      const config = {skipLocationChange: false, fragment: 'foo'};
      const proxy = config;

      function navigate(router: Router) {
        router.navigateByUrl('/', proxy);
      }
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `const config = { /* Removed unsupported properties by Angular migration: fragment. */ skipLocationChange: false };`);
    expect(content).toContain(`const proxy = config;`);
    expect(content).toContain(`router.navigateByUrl('/', proxy);`);
  });

  it('should pick up calls where the router is returned by a function', async () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      function navigate(router: Router) {
        getRouter().navigateByUrl('/', {fragment: 'foo'});
      }

      function getRouter() {
        return {} as Router;
      }
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `getRouter().navigateByUrl('/', /* Removed unsupported properties by Angular migration: fragment. */ {});`);
  });

  it('should pick up calls where the router is aliased', async () => {
    writeFile('/index.ts', `
      import {Router as AliasedRouter} from '@angular/router';

      function navigate(router: AliasedRouter) {
        router.navigateByUrl('/', {fragment: 'foo'});
      }
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `router.navigateByUrl('/', /* Removed unsupported properties by Angular migration: fragment. */ {});`);
  });

  it('should preserve object spread assignments', async () => {
    writeFile('/index.ts', `
      import {Router} from '@angular/router';

      function navigate(router: Router) {
        const overrides = {foo: 1};
        router.navigateByUrl('/', {replaceUrl: true, fragment: 'foo', ...overrides});
      }
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `router.navigateByUrl('/', { /* Removed unsupported properties by Angular migration: fragment. */ replaceUrl: true, ...overrides });`);
  });

  it('should migrate objects that are used in multiple calls of the same method', async () => {
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

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `const config = { /* Removed unsupported properties by Angular migration: fragment. */ skipLocationChange: false };`);
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v11-navigation-extras-omissions', {}, tree)
        .toPromise();
  }
});
