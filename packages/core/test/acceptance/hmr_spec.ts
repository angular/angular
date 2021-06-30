/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, destroyPlatform, NgModule, NgModuleRef, PlatformRef, resetCompilation, Type} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {onlyInIvy, withBody} from '../../../private/testing';

onlyInIvy('HMR APIs are specific to Ivy').describe('hot module replacement', () => {
  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);

  let platformRef: PlatformRef;
  let ngModuleRef: NgModuleRef<unknown>|null = null;
  beforeEach(() => {
    platformRef = platformBrowserDynamic();
    ngModuleRef = null;
  });
  afterEach(destroyModule);

  function destroyModule() {
    if (ngModuleRef !== null) {
      ngModuleRef.destroy();
      ngModuleRef = null;
    }
  }

  async function bootstrap(moduleType: Type<unknown>) {
    destroyModule();
    resetCompilation();
    ngModuleRef = await platformRef.bootstrapModule(moduleType);
  }

  it('should allow declaring a component in a new module after resetting the compilation',
     withBody('<my-app></my-app>', async () => {
       // This test emulates the scenario of having a single NgModule with components `AppCmp` and
       // `FooCmp`, where `AppCmp` uses `FooCmp`. The `AppCmp` is updated and HMR is emulated, such
       // that the module for `AppCmp` and the module for the NgModule are reloaded, but `FooCmp` is
       // not (as there is no dependency from `FooCmp` to any other module).
       //
       // Consequently, `FooCmp` will be redeclared in the reloaded NgModule, which would ordinarily
       // mean that it's declared in two NgModules, both the originally loaded NgModule and the
       // newly loaded NgModule. In the HMR case, however, we know that the original NgModule should
       // no longer participate as it has been replaced. Unfortunately, there is no reliable way to
       // correlate the newly loaded NgModule with the original one, so Angular cannot detect this
       // situation automatically. Therefore, Angular needs to be made of aware of the HMR event by
       // resetting the compilation, after which prior compilation results will no longer be
       // considered.
       const hmr = new HmrHarness();

       const app = hmr.declare(() => {
         @Component({selector: 'my-app', template: '<my-foo>app1</my-foo>'})
         class AppCmp {
         }
         return {AppCmp};
       });

       const foo = hmr.declare(() => {
         @Component({selector: 'my-foo', template: 'foo1 - <ng-content></ng-content>'})
         class FooCmp {
         }
         return {FooCmp};
       });

       const appModule = hmr.declare(load => {
         const {AppCmp} = load(app);
         const {FooCmp} = load(foo);

         @NgModule({
           imports: [BrowserModule],
           declarations: [AppCmp, FooCmp],
           bootstrap: [AppCmp],
         })
         class AppModule {
         }
         return {AppModule};
       });

       await bootstrap(appModule.load().AppModule);
       expect(document.body.innerHTML).toContain('foo1 - app1');

       // Now update the app and bootstrap the module again
       app.update(() => {
         @Component({selector: 'my-app', template: '<my-foo>app2</my-foo>'})
         class AppCmp {
         }
         return {AppCmp};
       });

       await bootstrap(appModule.load().AppModule);
       expect(document.body.innerHTML).toContain('foo1 - app2');
     }));

  it('should refresh a component\'s scope when a used component in the same NgModule is updated',
     withBody('<my-app></my-app>', async () => {
       // This test emulates the scenario of having a single NgModule with components `AppCmp` and
       // `FooCmp`, where `AppCmp` uses `FooCmp`. The `FooCmp` is updated and HMR is emulated, such
       // that the module for `AppCmp` and the module for the NgModule are reloaded, but `AppCmp` is
       // not (as there is no module dependency from `FooCmp` to `AppCmp`). The runtime however has
       // captured a reference of `FooCmp` in the runtime definitions of `AppCmp`, so the runtime
       // definitions have to be updated accordingly.
       const hmr = new HmrHarness();

       const app = hmr.declare(() => {
         @Component({selector: 'my-app', template: '<my-foo>app1</my-foo>'})
         class AppCmp {
         }
         return {AppCmp};
       });

       const foo = hmr.declare(() => {
         @Component({selector: 'my-foo', template: 'foo1 - <ng-content></ng-content>'})
         class FooCmp {
         }
         return {FooCmp};
       });

       const appModule = hmr.declare(load => {
         const {AppCmp} = load(app);
         const {FooCmp} = load(foo);

         @NgModule({
           imports: [BrowserModule],
           declarations: [AppCmp, FooCmp],
           bootstrap: [AppCmp],
         })
         class AppModule {
         }
         return {AppModule};
       });

       await bootstrap(appModule.load().AppModule);
       expect(document.body.innerHTML).toContain('foo1 - app1');

       foo.update(() => {
         @Component({selector: 'my-foo', template: 'foo2 - <ng-content></ng-content>'})
         class FooCmp {
         }
         return {FooCmp};
       });

       await bootstrap(appModule.load().AppModule);
       expect(document.body.innerHTML).toContain('foo2 - app1');
     }));

  it('should refresh a component\'s scope when a used component in a transitive NgModule is updated',
     withBody('<my-app></my-app>', async () => {
       // This test introduces a secondary NgModule `SharedModule` that declares `FooCmp`, which is
       // imported in the root `AppModule`. The root module itself declares `AppCmp` that uses
       // `FooCmp`. A HMR update of `FooCmp` is emulated and it is verified that `AppCmp` in
       // `AppModule` properly uses the updated `FooCmp` after rebootstrapping.
       const hmr = new HmrHarness();

       const foo = hmr.declare(() => {
         @Component({selector: 'my-foo', template: 'foo1 - <ng-content></ng-content>'})
         class FooCmp {
         }
         return {FooCmp};
       });

       const sharedModule = hmr.declare(load => {
         const {FooCmp} = load(foo);

         @NgModule({
           declarations: [FooCmp],
           exports: [FooCmp],
         })
         class SharedModule {
         }
         return {SharedModule};
       });

       const app = hmr.declare(() => {
         @Component({selector: 'my-app', template: '<my-foo>app1</my-foo>'})
         class AppCmp {
         }

         return {AppCmp};
       });

       const appModule = hmr.declare(load => {
         const {AppCmp} = load(app);
         const {SharedModule} = load(sharedModule);

         @NgModule({
           imports: [BrowserModule, SharedModule],
           declarations: [AppCmp],
           bootstrap: [AppCmp],
         })
         class AppModule {
         }
         return {AppModule};
       });

       await bootstrap(appModule.load().AppModule);
       expect(document.body.innerHTML).toContain('foo1 - app1');

       foo.update(() => {
         @Component({selector: 'my-foo', template: 'foo2 - <ng-content></ng-content>'})
         class FooCmp {
         }
         return {FooCmp};
       });

       await bootstrap(appModule.load().AppModule);
       expect(document.body.innerHTML).toContain('foo2 - app1');
     }));

  it('should report an error when a component is declared in two NgModules after an update and be able to recover from it',
     withBody('<my-app></my-app>', async () => {
       // This test introduces an error into the compilation during HMR, by adding a component to
       // an NgModule such that it is declared in two NgModules. This is not allowed so should
       // throw an error. It is then verified that resolving the issue by deleting the duplicate
       // declaration allows the app to bootstrap again.
       const hmr = new HmrHarness();

       const foo = hmr.declare(() => {
         @Component({selector: 'my-foo', template: 'foo1 - <ng-content></ng-content>'})
         class FooCmp {
         }

         return {FooCmp};
       });

       const sharedModule = hmr.declare(load => {
         const {FooCmp} = load(foo);

         @NgModule({
           declarations: [FooCmp],
           exports: [FooCmp],
         })
         class SharedModule {
         }

         return {SharedModule};
       });

       const app = hmr.declare(() => {
         @Component({selector: 'my-app', template: '<my-foo>app1</my-foo>'})
         class AppCmp {
         }

         return {AppCmp};
       });

       const appModule = hmr.declare(load => {
         const {SharedModule} = load(sharedModule);
         const {AppCmp} = load(app);

         @NgModule({
           imports: [BrowserModule, SharedModule],
           declarations: [AppCmp],
           bootstrap: [AppCmp],
         })
         class AppModule {
         }
         return {AppModule};
       });

       await bootstrap(appModule.load().AppModule);
       expect(document.body.innerHTML).toContain('foo1 - app1');

       // Update the module so that both NgModules declare FooCmp, this should not be allowed.
       appModule.update(load => {
         const {SharedModule} = load(sharedModule);
         const {AppCmp} = load(app);
         const {FooCmp} = load(foo);

         @NgModule({
           imports: [BrowserModule, SharedModule],
           declarations: [AppCmp, FooCmp],
           bootstrap: [AppCmp],
         })
         class AppModule {
         }

         return {AppModule};
       });

       await expectAsync(bootstrap(appModule.load().AppModule))
           .toBeRejectedWith(jasmine.stringMatching(
               'Type FooCmp is part of the declarations of 2 modules: AppModule and SharedModule!'));

       // Fix the error by removing the duplicate declaration
       appModule.update(load => {
         const {SharedModule} = load(sharedModule);
         const {AppCmp} = load(app);

         @NgModule({
           imports: [BrowserModule, SharedModule],
           declarations: [AppCmp],
           bootstrap: [AppCmp],
         })
         class AppModule {
         }

         return {AppModule};
       });

       // Also update the template of `AppCmp` to notice a change in the rendered template.
       app.update(() => {
         @Component({selector: 'my-app', template: '<my-foo>app2</my-foo>'})
         class AppCmp {
         }

         return {AppCmp};
       });

       await bootstrap(appModule.load().AppModule);
       expect(document.body.innerHTML).toContain('foo1 - app2');
     }));
});

type HmrModuleLoader = <M>(module: HmrModule<M>) => M;
type HmrModuleDeclaration<Exports> = (loader: HmrModuleLoader) => Exports;

/**
 * Implements a simple module loader to emulate Hot Module Replacement scenarios. Declaring a module
 * returns a handle for that module, which can be used to load and update the module. Updating the
 * module invalidates all modules that transitively depend on that module, emulating the behavior
 * that would occur in HMR environments.
 *
 * Note: the harness does not currently support cyclic imports.
 */
class HmrHarness {
  private env = new HmrEnv();

  /**
   * Declares a new module using the provided declaration callback and returns a module handle. The
   * module will only be loaded when first requested and may be reloaded when it or one of its
   * transitive imports are invalidated.
   *
   * @param declaration The logic to execute when loading the module. The return value is
   * represents the exported symbols.
   * @returns a handle to the declared module.
   */
  declare<Exports>(declaration: HmrModuleDeclaration<Exports>): HmrModule<Exports> {
    return new HmrModule(declaration, this.env);
  }
}

/**
 * The HMR environment keeps track of the module dependency graph such that invalidating a module
 * will invalidate all dependent modules.
 */
class HmrEnv {
  private importedBy = new Map<HmrModule, Set<HmrModule>>();

  /**
   * Initiates a request for loading `module` from module `from`, creating an import dependency for
   * `module` on `from`.
   *
   * @param module The module that is requested.
   * @param from The module from which the request originates.
   * @returns The exported symbols for `module`.
   */
  require<Exports>(module: HmrModule<Exports>, from: HmrModule): Exports {
    if (!this.importedBy.has(module)) {
      this.importedBy.set(module, new Set());
    }
    this.importedBy.get(module)!.add(from);

    return module.load();
  }

  /**
   * Notifies the environment that `module` has been invalidated, triggering invalidation of the
   * modules that depend on it.
   */
  invalidated(module: HmrModule): void {
    if (!this.importedBy.has(module)) {
      return;
    }

    for (const dep of this.importedBy.get(module)!) {
      dep.invalidate();
    }
    this.importedBy.delete(module);
  }
}

class HmrModule<Exports = unknown> {
  private exports: Exports|null = null;

  constructor(private declaration: HmrModuleDeclaration<Exports>, private env: HmrEnv) {}

  /**
   * Loads the exported symbols from the module.
   */
  load(): Exports {
    if (this.exports === null) {
      this.exports = this.declaration(module => this.env.require(module, this));
    }
    return this.exports;
  }

  /**
   * Updates the module with a new declaration. Any module that depends on this module will be
   * invalidated such that they will be reloaded with the updated logic.
   */
  update(declaration: HmrModuleDeclaration<Exports>): void {
    this.declaration = declaration;
    this.invalidate();
  }

  /**
   * Resets the loaded module and all modules that depend on it.
   */
  invalidate(): void {
    this.exports = null;
    this.env.invalidated(this);
  }
}
