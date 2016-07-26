/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach, inject,} from '@angular/core/testing/testing_internal';
import {SpyChangeDetectorRef} from './spies';
import {ConcreteType} from '../src/facade/lang';
import {ApplicationRef_, ApplicationRef} from '@angular/core/src/application_ref';
import {Type, NgModule, CompilerFactory, Injector, APP_INITIALIZER, Component, ReflectiveInjector, PlatformRef, disposePlatform, createPlatformFactory, ComponentResolver, ComponentFactoryResolver, ChangeDetectorRef, ApplicationModule} from '@angular/core';
import {platformCoreDynamic} from '@angular/compiler';
import {Console} from '@angular/core/src/console';
import {BaseException} from '../src/facade/exceptions';
import {PromiseWrapper, PromiseCompleter, TimerWrapper} from '../src/facade/async';
import {ComponentFactory, ComponentRef_, ComponentRef} from '@angular/core/src/linker/component_factory';
import {ExceptionHandler} from '../src/facade/exception_handler';

export function main() {
  describe('bootstrap', () => {
    var defaultPlatform: PlatformRef;
    var errorLogger: _ArrayLogger;
    var someCompFactory: ComponentFactory<any>;
    var appProviders: any[];

    beforeEach(() => {
      errorLogger = new _ArrayLogger();
      disposePlatform();
      defaultPlatform = createPlatformFactory(platformCoreDynamic, 'test')();
      someCompFactory =
          new _MockComponentFactory(new _MockComponentRef(ReflectiveInjector.resolveAndCreate([])));
      appProviders = [
        {provide: Console, useValue: new _MockConsole()},
        {provide: ExceptionHandler, useValue: new ExceptionHandler(errorLogger, false)},
        {provide: ComponentResolver, useValue: new _MockComponentResolver(someCompFactory)}
      ];
    });

    afterEach(() => { disposePlatform(); });

    function createModule(providers: any[] = []): ConcreteType<any> {
      @NgModule({providers: [appProviders, providers], imports: [ApplicationModule]})
      class MyModule {
      }

      return MyModule;
    }

    function createApplication(
        providers: any[] = [], platform: PlatformRef = defaultPlatform): ApplicationRef_ {
      const compilerFactory: CompilerFactory = platform.injector.get(CompilerFactory);
      const compiler = compilerFactory.createCompiler();
      const appInjector =
          platform.bootstrapModuleFactory(compiler.compileModuleSync(createModule(providers)))
              .injector;
      return appInjector.get(ApplicationRef);
    }

    describe('ApplicationRef', () => {
      it('should throw when reentering tick', () => {
        var cdRef = <any>new SpyChangeDetectorRef();
        var ref = createApplication();
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
          var ref = createApplication();
          expect(() => ref.run(() => { throw new BaseException('Test'); })).toThrowError('Test');
        });

        it('should return a promise with rejected errors even if the exceptionHandler is not rethrowing',
           inject(
               [AsyncTestCompleter, Injector], (async: AsyncTestCompleter, injector: Injector) => {
                 var ref = createApplication();
                 var promise = ref.run(() => PromiseWrapper.reject('Test', null));
                 PromiseWrapper.catchError(promise, (e) => {
                   expect(e).toEqual('Test');
                   async.done();
                 });
               }));
      });
    });

    describe('bootstrapModule', () => {
      it('should wait for asynchronous app initializers',
         inject([AsyncTestCompleter, Injector], (async: AsyncTestCompleter, injector: Injector) => {
           let completer: PromiseCompleter<any> = PromiseWrapper.completer();
           var initializerDone = false;
           TimerWrapper.setTimeout(() => {
             completer.resolve(true);
             initializerDone = true;
           }, 1);

           defaultPlatform
               .bootstrapModule(createModule(
                   [{provide: APP_INITIALIZER, useValue: () => completer.promise, multi: true}]))
               .then(_ => {
                 expect(initializerDone).toBe(true);
                 async.done();
               });
         }));
    });

    describe('ApplicationRef.bootstrap', () => {
      it('should throw if an APP_INITIIALIZER is not yet resolved',
         inject([Injector], (injector: Injector) => {
           var app = createApplication([{
             provide: APP_INITIALIZER,
             useValue: () => PromiseWrapper.completer().promise,
             multi: true
           }]);
           expect(() => app.bootstrap(someCompFactory))
               .toThrowError(
                   'Cannot bootstrap as there are still asynchronous initializers running. Wait for them using waitForAsyncInitializers().');
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

class _MockComponentFactory extends ComponentFactory<any> {
  constructor(private _compRef: ComponentRef<any>) { super(null, null, null); }
  create(
      injector: Injector, projectableNodes: any[][] = null,
      rootSelectorOrNode: string|any = null): ComponentRef<any> {
    return this._compRef;
  }
}

class _MockComponentResolver implements ComponentResolver {
  constructor(private _compFactory: ComponentFactory<any>) {}

  resolveComponent(type: Type): Promise<ComponentFactory<any>> {
    return PromiseWrapper.resolve(this._compFactory);
  }
  clearCache() {}
}

class _MockComponentRef extends ComponentRef_<any> {
  constructor(private _injector: Injector) { super(null, null); }
  get injector(): Injector { return this._injector; }
  get changeDetectorRef(): ChangeDetectorRef { return <any>new SpyChangeDetectorRef(); }
  onDestroy(cb: Function) {}
}

class _MockConsole implements Console {
  log(message: string) {}
  warn(message: string) {}
}
