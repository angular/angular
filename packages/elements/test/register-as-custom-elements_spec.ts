/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerFactory, Component, NgModule, NgModuleFactory, NgModuleRef, PlatformRef, Type, destroyPlatform} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {NgElementImpl} from '../src/ng-element';
import {registerAsCustomElements} from '../src/register-as-custom-elements';
import {isFunction} from '../src/utils';
import {patchEnv, restoreEnv, supportsCustomElements} from '../testing/index';

type BootstrapFn<M> = () => Promise<NgModuleRef<M>>;
type ArgsWithModuleFactory<M> = [PlatformRef, NgModuleFactory<M>];
type ArgsWithBootstrapFn<M> = [BootstrapFn<M>];

if (supportsCustomElements()) {
  describe('registerAsCustomElements()', () => {
    const createArgsToRegisterWithModuleFactory = (platformFn: () => PlatformRef) => {
      const tempPlatformRef = platformBrowserDynamic();
      const compilerFactory = tempPlatformRef.injector.get(CompilerFactory) as CompilerFactory;
      const compiler = compilerFactory.createCompiler([]);
      tempPlatformRef.destroy();

      const platformRef = platformFn();
      const moduleFactory = compiler.compileModuleSync(TestModule);

      return [platformRef, moduleFactory] as ArgsWithModuleFactory<TestModule>;
    };
    const createArgsToRegisterWithBootstrapFn =
        () => [() => platformBrowserDynamic().bootstrapModule(TestModule)] as
            ArgsWithBootstrapFn<TestModule>;

    beforeAll(() => patchEnv());
    afterAll(() => restoreEnv());

    // Run the tests with both an `NgModuleFactory` and a `bootstrapFn()`.
    runTests(
        'with `NgModuleFactory` (on `platformBrowserDynamic`)',
        () => createArgsToRegisterWithModuleFactory(platformBrowserDynamic));
    runTests(
        'with `NgModuleFactory` (on `platformBrowser`)',
        () => createArgsToRegisterWithModuleFactory(platformBrowser));
    runTests('with `bootstrapFn()`', createArgsToRegisterWithBootstrapFn);

    function runTests<M>(
        description: string, createArgs: () => ArgsWithModuleFactory<M>| ArgsWithBootstrapFn<M>) {
      describe(description, () => {
        const hasBootstrapFn = (arr: any[]): arr is ArgsWithBootstrapFn<M> => isFunction(arr[0]);
        let doRegister: () => Promise<NgModuleRef<M>>;
        let defineSpy: jasmine.Spy;

        beforeEach(() => {
          destroyPlatform();

          const customElementComponents: Type<any>[] = [FooBarComponent, BazQuxComponent];
          const args = createArgs();
          doRegister = hasBootstrapFn(args) ?
              () => registerAsCustomElements(customElementComponents, args[0]) :
              () => registerAsCustomElements(customElementComponents, args[0], args[1]);

          defineSpy = spyOn(customElements, 'define');
        });

        afterEach(() => destroyPlatform());

        it('should bootstrap the `NgModule` and return an `NgModuleRef` instance', done => {
          doRegister()
              .then(ref => expect(ref.instance).toEqual(jasmine.any(TestModule)))
              .then(done, done.fail);
        });

        it('should define a custom element for each component', done => {
          doRegister()
              .then(() => {
                expect(defineSpy).toHaveBeenCalledTimes(2);
                expect(defineSpy).toHaveBeenCalledWith('foo-bar', jasmine.any(Function));
                expect(defineSpy).toHaveBeenCalledWith('baz-qux', jasmine.any(Function));

                expect(defineSpy.calls.argsFor(0)[1]).toEqual(jasmine.objectContaining({
                  is: 'foo-bar',
                  observedAttributes: [],
                  upgrade: jasmine.any(Function),
                }));
                expect(defineSpy.calls.argsFor(1)[1]).toEqual(jasmine.objectContaining({
                  is: 'baz-qux',
                  observedAttributes: [],
                  upgrade: jasmine.any(Function),
                }));
              })
              .then(done, done.fail);
        });
      });
    }

    // Helpers
    @Component({
      selector: 'foo-bar',
      template: 'FooBar',
    })
    class FooBarComponent {
    }

    @Component({
      selector: 'baz-qux',
      template: 'BazQux',
    })
    class BazQuxComponent {
    }

    @NgModule({
      imports: [BrowserModule],
      declarations: [FooBarComponent, BazQuxComponent],
      entryComponents: [FooBarComponent, BazQuxComponent],
    })
    class TestModule {
      ngDoBootstrap() {}
    }
  });
}
