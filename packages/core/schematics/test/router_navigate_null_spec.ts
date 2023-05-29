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
import {runfiles} from '@bazel/runfiles';
import shx from 'shelljs';

describe('Router.navigate/navigateByUrl migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {lib: ['es2015'], strictNullChecks: true},
    }));
    writeFile('/angular.json', JSON.stringify({
      version: 1,
      projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/router/index.d.ts', `
       export declare class Router {
         navigate(commands: any[], extras?: any): Promise<boolean | null>;
         navigateByUrl(url: string, extras?: any): Promise<boolean | null>;
       }
     `);

    writeFile('/node_modules/@angular/core/index.d.ts', `
        export interface Type<T> extends Function {
          new(...args: any[]): T;
        }
        export declare function inject<T>(token: Type<T>): T;
     `);

    // Fake non-Angular package to make sure that we don't migrate packages we don't own.
    writeFile('/node_modules/@not-angular/router/index.d.ts', `
        export declare class Router {
          navigate(commands: any[], extras?: any): Promise<boolean | null>;
          navigateByUrl(url: string, extras?: any): Promise<boolean | null>;
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

  it('should add type cast when router is injected via inject function', async () => {
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

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`return this._router.navigateByUrl('/').then((result) => result!);`);
  });

  it('should add type cast when router is injected via inject function in local scope',
     async () => {
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

       await runMigration();
       expect(tree.readContent('/index.ts'))
           .toContain(`return router.navigateByUrl('/').then((result) => result!);`);
       expect(tree.readContent('/index.ts'))
           .toContain(`return inject(Router).navigate(['/']).then((result) => result!);`);
     });

  it('should add type cast when router is injected via constructor', async () => {
    writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         navigate(): Promise<boolean> {
           return this._router.navigate(['/']);
         }
       }
     `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`return this._router.navigate(['/']).then((result) => result!);`);
  });

  it('should add type cast when the return value is stored into variable', async () => {
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

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`const promise = this._router.navigateByUrl('/').then((result) => result!);`);
    expect(tree.readContent('/index.ts'))
        .toContain(
            `const result = await this._router.navigateByUrl('/').then((result) => result!);`);
  });

  it('should add type cast when the return value is stored into a object', async () => {
    writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         navigate(): void {
           const obj = {prop: this._router.navigateByUrl('/')};
         }
       }
     `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(
            `const obj = {prop: this._router.navigateByUrl('/').then((result) => result!)};`);
  });

  it('should add type cast before .then() call when navigation result is used', async () => {
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

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`this._router.navigateByUrl('/').then((result) => result!).then(this.next);`);
    expect(tree.readContent('/index.ts'))
        .toContain(
            `this._router.navigateByUrl('/').then((result) => result!).then(this.nextArrow);`);
    expect(tree.readContent('/index.ts'))
        .toContain(
            `this._router.navigateByUrl('/').then((result) => result!).then((v) => this.next(v));`);
    expect(tree.readContent('/index.ts'))
        .toContain(
            `this._router.navigateByUrl('/').then((result) => result!).then(function(v) { this.next(v) });`);
  });

  it('should add type cast when the return promise value is used as function parameter',
     async () => {
       writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         navigate(): void {
           this.wrapperFn(this._router.navigateByUrl('/'));
         }
         wrapperFn(result: Promise<boolean>) {}
       }
     `);

       await runMigration();
       expect(tree.readContent('/index.ts'))
           .toContain(`this.wrapperFn(this._router.navigateByUrl('/').then((result) => result!));`);
     });

  it('should add type cast when the return value is used as function parameter', async () => {
    writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         async navigate(): void {
           this.wrapperFn(await this._router.navigateByUrl('/'));
         }
         wrapperFn(result: boolean) {}
       }
     `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(
            `this.wrapperFn(await this._router.navigateByUrl('/').then((result) => result!));`);
  });

  it('should not add type cast if the result of the navigation is not used', async () => {
    writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         navigate(): void {
           this._router.navigate(['/']);
           this._router.navigateByUrl('/');
         }
       }
     `);

    await runMigration();
    // No one is interested of the navigation result, no need to migrate
    expect(tree.readContent('/index.ts')).toContain(`this._router.navigate(['/']);`);
    expect(tree.readContent('/index.ts')).toContain(`this._router.navigateByUrl('/');`);
  });

  it('should not add type cast if the awaited result of the navigation is not used', async () => {
    writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         async navigate(): Promise<void> {
           await this._router.navigate(['/']);
           await this._router.navigateByUrl('/');
         }
       }
     `);

    await runMigration();
    // No one is interested of the navigation result, no need to migrate
    expect(tree.readContent('/index.ts')).toContain(`await this._router.navigate(['/']);`);
    expect(tree.readContent('/index.ts')).toContain(`await this._router.navigateByUrl('/');`);
  });

  it('should not add type cast if the promise value is used', async () => {
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

    await runMigration();
    // No one is interested of the navigation result, no need to migrate
    expect(tree.readContent('/index.ts')).toContain(`this._router.navigateByUrl('/').then();`);
    expect(tree.readContent('/index.ts'))
        .toContain(`this._router.navigateByUrl('/').then(this.ignored);`);
    expect(tree.readContent('/index.ts'))
        .toContain(`this._router.navigateByUrl('/').then(this.ignoredArrow);`);
    expect(tree.readContent('/index.ts'))
        .toContain(`this._router.navigateByUrl('/').then(() => this.ignored());`);
    expect(tree.readContent('/index.ts'))
        .toContain(`this._router.navigateByUrl('/').then(function() { this.ignored() });`);
  });

  it('should not add type cast if the function is not called', async () => {
    writeFile('/index.ts', `
       import {Router} from '@angular/router';
       class Component {
         constructor(private _router: Router) {}
         navigate(): void {
           // Saved to variable
           const fn = this._router.navigate;

           // Real world use case would be: expect(router.navigate).toHaveBeenCalled...
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

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`const fn = this._router.navigate;`);
    expect(tree.readContent('/index.ts'))
        .toContain(`this.wrapperFn(this._router.navigate).response;`);
    expect(tree.readContent('/index.ts'))
        .toContain(`this.promiseWrapperFn(this._router.navigate).then((v) => console.log(v));`);
  });

  it('should not add type cast if the symbol does not come from @angular/router', async () => {
    writeFile('/index.ts', `
     import {Router} from '@not-angular/router';
     async function notNavigate() {
       const _router = new Router();
       const r1 = await this._router.navigate(['/']);
       const r2 = await this._router.navigateByUrl('/');
     }
   `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`const r1 = await this._router.navigate(['/']);`);
    expect(tree.readContent('/index.ts'))
        .toContain(`const r2 = await this._router.navigateByUrl('/');`);
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-router-navigate-null', {}, tree);
  }
});
