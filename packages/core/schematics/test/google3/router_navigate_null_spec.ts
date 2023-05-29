
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runfiles} from '@bazel/runfiles';
import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 Router.navigate/navigateByUrl TSLint rule', () => {
  const rulesDirectory = dirname(
      runfiles.resolvePackageRelative('../../migrations/google3/routerNavigateNullCjsRule.js'));

  let tmpDir: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);
    shx.cd(tmpDir);

    writeFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
        strictNullChecks: true,
      },
    }));

    shx.mkdir('-p', 'node_modules/@angular/router');
    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('node_modules/@angular/router/index.d.ts', `
       export declare class Router {
         navigate(commands: any[], extras?: any): Promise<boolean | null>;
         navigateByUrl(url: string, extras?: any): Promise<boolean | null>;
       }
     `);

    shx.mkdir('-p', 'node_modules/@angular/core');
    writeFile('/node_modules/@angular/core/index.d.ts', `
       export interface Type<T> extends Function {
        new(...args: any[]): T;
       }
       export declare function inject<T>(token: Type<T>): T;
     `);

    previousWorkingDir = shx.pwd();

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDir);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDir);
  });

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'router-navigate-null-cjs': true}});

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

  it('should flag navigate and navigateByUrl usages', () => {
    writeFile('/index.ts', `
      import { Router } from '@angular/router';
      class Component {
        constructor(private _router: Router) {}
        async navigate() {
          const r1 = await this._router.navigate(['/']);
          const r2 = await this._router.navigateByUrl('/');
        }
      }
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());
    expect(failures.length).toBe(2);
    expect(failures[0])
        .toMatch(
            /Router\.navigate and Router\.navigateByUrl functions may return null when navigation is skipped/);
    expect(failures[1])
        .toMatch(
            /Router\.navigate and Router\.navigateByUrl functions may return null when navigation is skipped/);
  });

  it('should add type cast to Router.navigate', () => {
    writeFile('/index.ts', `
      import { Router } from '@angular/router';
      class Component {
        constructor(private _router: Router) {}
        async navigate() {
          const result = await this._router.navigate(['/']);
        }
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`const result = await this._router.navigate(['/']).then((result) => result!);`);
  });

  it('should add type cast to Router.navigateByUrl', () => {
    writeFile('/index.ts', `
      import { Router } from '@angular/router';
      class Component {
        constructor(private _router: Router) {}
        async navigate() {
          const result = await this._router.navigateByUrl('/home');
        }
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(
            `const result = await this._router.navigateByUrl('/home').then((result) => result!)`);
  });

  it('should add type cast when router is injected via inject function', () => {
    writeFile('/index.ts', `
       import {inject} from '@angular/core';
       import {Router} from '@angular/router';
       class Component {
         private _router = inject(Router);
         navigate(): Promise<boolean> {
           return this._router.navigateByUrl('/');
         }
       }
     `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`return this._router.navigateByUrl('/').then((result) => result!);`);
  });

  it('should add type cast when router is injected via inject function in local scope', () => {
    writeFile('/index.ts', `
       import {inject} from '@angular/core';
       import {Router} from '@angular/router';
       async function activateGuard(): Promise<boolean> {
          const router = inject(Router);
          return router.navigateByUrl('/');
       }
       async function loadGuard(): Promise<boolean> {
        return inject(Router).navigate(['/']);
       }
     `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`return router.navigateByUrl('/').then((result) => result!);`);
    expect(getFile('/index.ts'))
        .toContain(`return inject(Router).navigate(['/']).then((result) => result!);`);
  });

  it('should add type cast when the return value is stored into variable', () => {
    writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         async navigate(): Promise<void> {
           const promise = this._router.navigateByUrl('/');
           const result = await this._router.navigateByUrl('/');
         }
       }
     `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`const promise = this._router.navigateByUrl('/').then((result) => result!);`);
    expect(getFile('/index.ts'))
        .toContain(
            `const result = await this._router.navigateByUrl('/').then((result) => result!);`);
  });

  it('should add type cast when the return value is stored into a object', () => {
    writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         navigate(): void {
           const obj = {prop: this._router.navigateByUrl('/')};
         }
       }
     `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(
            `const obj = {prop: this._router.navigateByUrl('/').then((result) => result!)};`);
  });

  it('should add type cast when the navigation result is returned', () => {
    writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         navigate(): Promise<boolean> {
           return this._router.navigateByUrl('/');
         }
       }
     `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`return this._router.navigateByUrl('/').then((result) => result!);`);
  });

  it('should add type cast before .then() call when navigation result is used', () => {
    writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         navigate(): void {
          // Return value is passed to function
          this._router.navigateByUrl('/').then(this.next);
          this._router.navigateByUrl('/').then(this.nextArrow);
          this._router.navigateByUrl('/').then((v) => this.next(v));
          this._router.navigateByUrl('/').then(function(v) { this.next(v) });
         }
         next(result: boolean) {}
         nextArrow = (result: boolean) => {}
       }
     `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`this._router.navigateByUrl('/').then((result) => result!).then(this.next);`);
    expect(getFile('/index.ts'))
        .toContain(
            `this._router.navigateByUrl('/').then((result) => result!).then(this.nextArrow);`);
    expect(getFile('/index.ts'))
        .toContain(
            `this._router.navigateByUrl('/').then((result) => result!).then((v) => this.next(v));`);
    expect(getFile('/index.ts'))
        .toContain(
            `this._router.navigateByUrl('/').then((result) => result!).then(function(v) { this.next(v) });`);
  });

  it('should add type cast when return promise value is used as function parameter', () => {
    writeFile('/index.ts', `
      import { Router } from '@angular/router';
      class Component {
        constructor(private _router: Router) {}
        navigate() {
          this.wrapperFn(this._router.navigateByUrl('/'));
        }
        wrapperFn(result: Promise<boolean>) {}
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`this.wrapperFn(this._router.navigateByUrl('/').then((result) => result!));`);
  });

  it('should add type cast when return value is used as function parameter', () => {
    writeFile('/index.ts', `
      import { Router } from '@angular/router';
      class Component {
        constructor(private _router: Router) {}
        navigate() {
          this.wrapperFn(await this._router.navigateByUrl('/'));
        }
        wrapperFn(result: boolean) {}
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(
            `this.wrapperFn(await this._router.navigateByUrl('/').then((result) => result!));`);
  });

  it('should not add type cast if result of the navigation is not used', () => {
    writeFile('/index.ts', `
      import { Router } from '@angular/router';
      class Component {
        constructor(private _router: Router) {}
        navigate() {
          this._router.navigate(['/']);
          this._router.navigateByUrl('/');
        }
      }
    `);

    runTSLint(true);
    // No one is interested of the navigation result, no need to migrate
    expect(getFile('/index.ts')).toContain(`this._router.navigate(['/']);`);
    expect(getFile('/index.ts')).toContain(`this._router.navigateByUrl('/');`);
  });

  it('should not add type cast if the promise value is used', () => {
    writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         navigate(): void {
           // Return value is not used in then expression
           this._router.navigateByUrl('/').then();
           this._router.navigateByUrl('/').then(this.ignored);
           this._router.navigateByUrl('/').then(this.ignoredArrow);
           this._router.navigateByUrl('/').then(() => this.ignored());
           this._router.navigateByUrl('/').then(function() { this.ignored() });
         }
         ignored() {}
         ignoredArrow = () => {}
       }
     `);

    runTSLint(true);
    // No one is interested of the navigation result, no need to migrate
    expect(getFile('/index.ts')).toContain(`this._router.navigateByUrl('/').then();`);
    expect(getFile('/index.ts')).toContain(`this._router.navigateByUrl('/').then(this.ignored);`);
    expect(getFile('/index.ts'))
        .toContain(`this._router.navigateByUrl('/').then(this.ignoredArrow);`);
    expect(getFile('/index.ts'))
        .toContain(`this._router.navigateByUrl('/').then(() => this.ignored());`);
    expect(getFile('/index.ts'))
        .toContain(`this._router.navigateByUrl('/').then(function() { this.ignored() });`);
  });

  it('should not add type cast if the function is not called', () => {
    writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         navigate(): void {
           // Saved to variable
           const fn = this._router.navigate;

           // Real world use case could be: expect(router.navigate).toHaveBeenCalled...
           this.wrapperFn(this._router.navigate).response;

           this.promiseWrapperFn(this._router.navigate).then((v) => console.log(v));
         }
         wrapperFn(fn: any): any {
           return { response: 1 };
         }
         promiseWrapperFn(): Promise<any[]> {
           return Promise.resolve([]);
         }
       }
     `);

    runTSLint(true);
    expect(getFile('/index.ts')).toContain(`const fn = this._router.navigate;`);
    expect(getFile('/index.ts')).toContain(`this.wrapperFn(this._router.navigate).response;`);
    expect(getFile('/index.ts'))
        .toContain(`this.promiseWrapperFn(this._router.navigate).then((v) => console.log(v));`);
  });

  it('should not add type cast if awaited result of the navigation is not used', () => {
    writeFile('/index.ts', `
      import { Router } from '@angular/router';
      class Component {
        constructor(private _router: Router) {}
        navigate() {
          await this._router.navigate(['/']);
          await this._router.navigateByUrl('/');
        }
      }
    `);

    runTSLint(true);
    // No one is interested of the navigation result, no need to migrate
    expect(getFile('/index.ts')).toContain(`await this._router.navigate(['/']);`);
    expect(getFile('/index.ts')).toContain(`await this._router.navigateByUrl('/');`);
  });
});
