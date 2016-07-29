/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_INITIALIZER, ChangeDetectorRef, CompilerFactory, Component, Injector, NgModule, PlatformRef} from '@angular/core';
import {ApplicationRef, ApplicationRef_} from '@angular/core/src/application_ref';
import {Console} from '@angular/core/src/console';
import {ComponentRef} from '@angular/core/src/linker/component_factory';
import {BrowserModule} from '@angular/platform-browser';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DOCUMENT} from '@angular/platform-browser/src/dom/dom_tokens';
import {expect} from '@angular/platform-browser/testing/matchers';

import {PromiseCompleter, PromiseWrapper} from '../src/facade/async';
import {ExceptionHandler} from '../src/facade/exception_handler';
import {BaseException} from '../src/facade/exceptions';
import {ConcreteType} from '../src/facade/lang';
import {TestBed, async, inject} from '../testing';

import {SpyChangeDetectorRef} from './spies';

@Component({selector: 'comp', template: 'hello'})
class SomeComponent {
}

export function main() {
  describe('bootstrap', () => {
    var errorLogger: _ArrayLogger;
    var fakeDoc: Document;

    beforeEach(() => {
      fakeDoc = getDOM().createHtmlDocument();
      const el = getDOM().createElement('comp', fakeDoc);
      getDOM().appendChild(fakeDoc.body, el);
      errorLogger = new _ArrayLogger();
    });

    function createModule(providers: any[] = []): ConcreteType<any> {
      @NgModule({
        providers: [
          {provide: Console, useValue: new _MockConsole()},
          {provide: ExceptionHandler, useValue: new ExceptionHandler(errorLogger, false)},
          {provide: DOCUMENT, useValue: fakeDoc}, providers
        ],
        imports: [BrowserModule],
        declarations: [SomeComponent],
        entryComponents: [SomeComponent]
      })
      class MyModule {
      }

      return MyModule;
    }

    describe('ApplicationRef', () => {
      var ref: ApplicationRef_;
      beforeEach(() => { TestBed.configureTestingModule({imports: [createModule()]}); });
      beforeEach(inject([ApplicationRef], (_ref: ApplicationRef_) => { ref = _ref; }));

      it('should throw when reentering tick', () => {
        var cdRef = <any>new SpyChangeDetectorRef();
        try {
          ref.registerChangeDetector(cdRef);
          cdRef.spy('detectChanges').andCallFake(() => ref.tick());
          expect(() => ref.tick()).toThrowError('ApplicationRef.tick is called recursively');
        } finally {
          ref.unregisterChangeDetector(cdRef);
        }
      });

      describe('run', () => {
        it('should rethrow errors even if the exceptionHandler is not rethrowing', () => {
          expect(() => ref.run(() => { throw new BaseException('Test'); })).toThrowError('Test');
        });

        it('should return a promise with rejected errors even if the exceptionHandler is not rethrowing',
           async(() => {
             var promise: Promise<any> = ref.run(() => Promise.reject('Test'));
             promise.then(() => expect(false).toBe(true), (e) => { expect(e).toEqual('Test'); });
           }));
      });

      describe('registerBootstrapListener', () => {
        it('should be called when a component is bootstrapped', () => {
          const capturedCompRefs: ComponentRef<any>[] = [];
          ref.registerBootstrapListener((compRef) => capturedCompRefs.push(compRef));
          const compRef = ref.bootstrap(SomeComponent);
          expect(capturedCompRefs).toEqual([compRef]);
        });

        it('should be called immediately when a component was bootstrapped before', () => {
          ref.registerBootstrapListener((compRef) => capturedCompRefs.push(compRef));
          const capturedCompRefs: ComponentRef<any>[] = [];
          const compRef = ref.bootstrap(SomeComponent);
          expect(capturedCompRefs).toEqual([compRef]);
        });
      });
    });

    describe('bootstrapModule', () => {
      var defaultPlatform: PlatformRef;
      beforeEach(
          inject([PlatformRef], (_platform: PlatformRef) => { defaultPlatform = _platform; }));

      it('should wait for asynchronous app initializers', async(() => {
           let completer: PromiseCompleter<any> = PromiseWrapper.completer();
           var initializerDone = false;
           setTimeout(() => {
             completer.resolve(true);
             initializerDone = true;
           }, 1);

           defaultPlatform
               .bootstrapModule(createModule(
                   [{provide: APP_INITIALIZER, useValue: () => completer.promise, multi: true}]))
               .then(_ => { expect(initializerDone).toBe(true); });
         }));

      it('should rethrow sync errors even if the exceptionHandler is not rethrowing', async(() => {
           defaultPlatform
               .bootstrapModule(createModule(
                   [{provide: APP_INITIALIZER, useValue: () => { throw 'Test'; }, multi: true}]))
               .then(() => expect(false).toBe(true), (e) => {
                 expect(e).toBe('Test');
                 expect(errorLogger.res).toEqual(['EXCEPTION: Test']);
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
                 expect(errorLogger.res).toEqual(['EXCEPTION: Test']);
               });
         }));

      it('should throw useful error when ApplicationRef is not configured', async(() => {
           @NgModule()
           class EmptyModule {
           }

           return defaultPlatform.bootstrapModule(EmptyModule)
               .then(() => fail('expecting error'), (error) => {
                 expect(error.message)
                     .toEqual('No ExceptionHandler. Is platform module (BrowserModule) included?');
               });
         }));
    });

    describe('bootstrapModuleFactory', () => {
      var defaultPlatform: PlatformRef;
      beforeEach(
          inject([PlatformRef], (_platform: PlatformRef) => { defaultPlatform = _platform; }));
      it('should wait for asynchronous app initializers', async(() => {
           let completer: PromiseCompleter<any> = PromiseWrapper.completer();
           var initializerDone = false;
           setTimeout(() => {
             completer.resolve(true);
             initializerDone = true;
           }, 1);

           const compilerFactory: CompilerFactory =
               defaultPlatform.injector.get(CompilerFactory, null);
           const moduleFactory = compilerFactory.createCompiler().compileModuleSync(createModule(
               [{provide: APP_INITIALIZER, useValue: () => completer.promise, multi: true}]));
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
           expect(errorLogger.res).toEqual(['EXCEPTION: Test']);
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
                 expect(errorLogger.res).toEqual(['EXCEPTION: Test']);
               });
         }));
    });
  });
}

@Component({selector: 'my-comp', template: ''})
class MyComp6 {
}

class _ArrayLogger {
  res: any[] = [];
  log(s: any): void { this.res.push(s); }
  logError(s: any): void { this.res.push(s); }
  logGroup(s: any): void { this.res.push(s); }
  logGroupEnd(){};
}

class _MockConsole implements Console {
  log(message: string) {}
  warn(message: string) {}
}
