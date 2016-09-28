/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BOOTSTRAP_LISTENER, APP_INITIALIZER, CompilerFactory, Component, NgModule, PlatformRef, Type} from '@angular/core';
import {ApplicationRef, ApplicationRef_} from '@angular/core/src/application_ref';
import {ErrorHandler} from '@angular/core/src/error_handler';
import {ComponentRef} from '@angular/core/src/linker/component_factory';
import {BrowserModule} from '@angular/platform-browser';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DOCUMENT} from '@angular/platform-browser/src/dom/dom_tokens';
import {expect} from '@angular/platform-browser/testing/matchers';

import {TestBed, async, inject, withModule} from '../testing';

import {SpyChangeDetectorRef} from './spies';

@Component({selector: 'comp', template: 'hello'})
class SomeComponent {
}

export function main() {
  describe('bootstrap', () => {
    var mockConsole: MockConsole;
    var fakeDoc: Document;

    beforeEach(() => {
      fakeDoc = getDOM().createHtmlDocument();
      const el = getDOM().createElement('comp', fakeDoc);
      getDOM().appendChild(fakeDoc.body, el);
      mockConsole = new MockConsole();
    });

    type CreateModuleOptions = {providers?: any[], ngDoBootstrap?: any, bootstrap?: any[]};

    function createModule(providers?: any[]): Type<any>;
    function createModule(options: CreateModuleOptions): Type<any>;
    function createModule(providersOrOptions: any[] | CreateModuleOptions): Type<any> {
      let options: CreateModuleOptions = {};
      if (providersOrOptions instanceof Array) {
        options = {providers: providersOrOptions};
      } else {
        options = providersOrOptions || {};
      }
      const errorHandler = new ErrorHandler(false);
      errorHandler._console = mockConsole as any;

      @NgModule({
        providers: [
          {provide: ErrorHandler, useValue: errorHandler}, {provide: DOCUMENT, useValue: fakeDoc},
          options.providers || []
        ],
        imports: [BrowserModule],
        declarations: [SomeComponent],
        entryComponents: [SomeComponent],
        bootstrap: options.bootstrap || []
      })
      class MyModule {
      }
      if (options.ngDoBootstrap !== false) {
        (<any>MyModule.prototype).ngDoBootstrap = options.ngDoBootstrap || (() => {});
      }
      return MyModule;
    }

    describe('ApplicationRef', () => {
      beforeEach(() => { TestBed.configureTestingModule({imports: [createModule()]}); });

      it('should throw when reentering tick', inject([ApplicationRef], (ref: ApplicationRef_) => {
           var cdRef = <any>new SpyChangeDetectorRef();
           try {
             ref.registerChangeDetector(cdRef);
             cdRef.spy('detectChanges').andCallFake(() => ref.tick());
             expect(() => ref.tick()).toThrowError('ApplicationRef.tick is called recursively');
           } finally {
             ref.unregisterChangeDetector(cdRef);
           }
         }));

      describe('APP_BOOTSTRAP_LISTENER', () => {
        let capturedCompRefs: ComponentRef<any>[];
        beforeEach(() => {
          capturedCompRefs = [];
          TestBed.configureTestingModule({
            providers: [{
              provide: APP_BOOTSTRAP_LISTENER,
              multi: true,
              useValue: (compRef: any) => { capturedCompRefs.push(compRef); }
            }]
          });
        });

        it('should be called when a component is bootstrapped',
           inject([ApplicationRef], (ref: ApplicationRef_) => {
             const compRef = ref.bootstrap(SomeComponent);
             expect(capturedCompRefs).toEqual([compRef]);
           }));
      });

      describe('bootstrap', () => {
        beforeEach(
            () => {

            });
        it('should throw if an APP_INITIIALIZER is not yet resolved',
           withModule(
               {
                 providers: [
                   {provide: APP_INITIALIZER, useValue: () => new Promise(() => {}), multi: true}
                 ]
               },
               inject([ApplicationRef], (ref: ApplicationRef_) => {
                 expect(() => ref.bootstrap(SomeComponent))
                     .toThrowError(
                         'Cannot bootstrap as there are still asynchronous initializers running. Bootstrap components in the `ngDoBootstrap` method of the root module.');
               })));
      });

    });

    describe('bootstrapModule', () => {
      var defaultPlatform: PlatformRef;
      beforeEach(
          inject([PlatformRef], (_platform: PlatformRef) => { defaultPlatform = _platform; }));

      it('should wait for asynchronous app initializers', async(() => {
           let resolve: (result: any) => void;
           let promise: Promise<any> = new Promise((res) => { resolve = res; });
           var initializerDone = false;
           setTimeout(() => {
             resolve(true);
             initializerDone = true;
           }, 1);

           defaultPlatform
               .bootstrapModule(
                   createModule([{provide: APP_INITIALIZER, useValue: () => promise, multi: true}]))
               .then(_ => { expect(initializerDone).toBe(true); });
         }));

      it('should rethrow sync errors even if the exceptionHandler is not rethrowing', async(() => {
           defaultPlatform
               .bootstrapModule(createModule(
                   [{provide: APP_INITIALIZER, useValue: () => { throw 'Test'; }, multi: true}]))
               .then(() => expect(false).toBe(true), (e) => {
                 expect(e).toBe('Test');
                 // Note: if the modules throws an error during construction,
                 // we don't have an injector and therefore no way of
                 // getting the exception handler. So
                 // the error is only rethrown but not logged via the exception handler.
                 expect(mockConsole.res).toEqual([]);
               });
         }));

      it('should rethrow promise errors even if the exceptionHandler is not rethrowing',
         async(() => {
           defaultPlatform
               .bootstrapModule(createModule([
                 {provide: APP_INITIALIZER, useValue: () => Promise.reject('Test'), multi: true}
               ]))
               .then(() => expect(false).toBe(true), (e) => {
                 expect(e).toBe('Test');
                 expect(mockConsole.res).toEqual(['EXCEPTION: Test']);
               });
         }));

      it('should throw useful error when ApplicationRef is not configured', async(() => {
           @NgModule()
           class EmptyModule {
           }

           return defaultPlatform.bootstrapModule(EmptyModule)
               .then(() => fail('expecting error'), (error) => {
                 expect(error.message)
                     .toEqual('No ErrorHandler. Is platform module (BrowserModule) included?');
               });
         }));

      it('should call the `ngDoBootstrap` method with `ApplicationRef` on the main module',
         async(() => {
           const ngDoBootstrap = jasmine.createSpy('ngDoBootstrap');
           defaultPlatform.bootstrapModule(createModule({ngDoBootstrap: ngDoBootstrap}))
               .then((moduleRef) => {
                 const appRef = moduleRef.injector.get(ApplicationRef);
                 expect(ngDoBootstrap).toHaveBeenCalledWith(appRef);
               });
         }));

      it('should auto bootstrap components listed in @NgModule.bootstrap', async(() => {
           defaultPlatform.bootstrapModule(createModule({bootstrap: [SomeComponent]}))
               .then((moduleRef) => {
                 const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
                 expect(appRef.componentTypes).toEqual([SomeComponent]);
               });
         }));

      it('should error if neither `ngDoBootstrap` nor @NgModule.bootstrap was specified',
         async(() => {
           defaultPlatform.bootstrapModule(createModule({ngDoBootstrap: false}))
               .then(() => expect(false).toBe(true), (e) => {
                 const expectedErrMsg =
                     `The module MyModule was bootstrapped, but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. Please define one of these.`;
                 expect(e.message).toEqual(expectedErrMsg);
                 expect(mockConsole.res[0]).toEqual('EXCEPTION: ' + expectedErrMsg);
               });
         }));
    });

    describe('bootstrapModuleFactory', () => {
      var defaultPlatform: PlatformRef;
      beforeEach(
          inject([PlatformRef], (_platform: PlatformRef) => { defaultPlatform = _platform; }));
      it('should wait for asynchronous app initializers', async(() => {
           let resolve: (result: any) => void;
           let promise: Promise<any> = new Promise((res) => { resolve = res; });
           var initializerDone = false;
           setTimeout(() => {
             resolve(true);
             initializerDone = true;
           }, 1);

           const compilerFactory: CompilerFactory =
               defaultPlatform.injector.get(CompilerFactory, null);
           const moduleFactory = compilerFactory.createCompiler().compileModuleSync(
               createModule([{provide: APP_INITIALIZER, useValue: () => promise, multi: true}]));
           defaultPlatform.bootstrapModuleFactory(moduleFactory).then(_ => {
             expect(initializerDone).toBe(true);
           });
         }));

      it('should rethrow sync errors even if the exceptionHandler is not rethrowing', async(() => {
           const compilerFactory: CompilerFactory =
               defaultPlatform.injector.get(CompilerFactory, null);
           const moduleFactory = compilerFactory.createCompiler().compileModuleSync(createModule(
               [{provide: APP_INITIALIZER, useValue: () => { throw 'Test'; }, multi: true}]));
           expect(() => defaultPlatform.bootstrapModuleFactory(moduleFactory)).toThrow('Test');
           // Note: if the modules throws an error during construction,
           // we don't have an injector and therefore no way of
           // getting the exception handler. So
           // the error is only rethrown but not logged via the exception handler.
           expect(mockConsole.res).toEqual([]);
         }));

      it('should rethrow promise errors even if the exceptionHandler is not rethrowing',
         async(() => {
           const compilerFactory: CompilerFactory =
               defaultPlatform.injector.get(CompilerFactory, null);
           const moduleFactory = compilerFactory.createCompiler().compileModuleSync(createModule(
               [{provide: APP_INITIALIZER, useValue: () => Promise.reject('Test'), multi: true}]));
           defaultPlatform.bootstrapModuleFactory(moduleFactory)
               .then(() => expect(false).toBe(true), (e) => {
                 expect(e).toBe('Test');
                 expect(mockConsole.res).toEqual(['EXCEPTION: Test']);
               });
         }));
    });
  });
}

@Component({selector: 'my-comp', template: ''})
class MyComp6 {
}

class MockConsole {
  res: any[] = [];
  log(s: any): void { this.res.push(s); }
  error(s: any): void { this.res.push(s); }
}
