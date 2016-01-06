import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  el,
  AsyncTestCompleter,
  fakeAsync,
  tick,
  inject,
  SpyObject
} from 'angular2/testing_internal';
import {SpyChangeDetectorRef} from './spies';
import {ApplicationRef_, ApplicationRef, PlatformRef_} from "angular2/src/core/application_ref";
import {Injector, Provider, APP_INITIALIZER} from "angular2/core";
import {PromiseWrapper, PromiseCompleter, TimerWrapper} from "angular2/src/facade/async";
import {ListWrapper} from "angular2/src/facade/collection";
import {ExceptionHandler} from 'angular2/src/facade/exception_handler';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';

export function main() {
  describe("ApplicationRef", () => {
    it("should throw when reentering tick", () => {
      var cdRef = <any>new SpyChangeDetectorRef();
      var ref = new ApplicationRef_(null, null, null);
      ref.registerChangeDetector(cdRef);
      cdRef.spy("detectChanges").andCallFake(() => ref.tick());
      expect(() => ref.tick()).toThrowError("ApplicationRef.tick is called recursively");
    });
  });

  describe("PlatformRef", () => {
    var exceptionHandler =
        new Provider(ExceptionHandler, {useValue: new ExceptionHandler(DOM, true)});
    describe("asyncApplication", () => {
      function expectProviders(injector: Injector, providers: Array<any>): void {
        for (let i = 0; i < providers.length; i++) {
          let provider = providers[i];
          expect(injector.get(provider.token)).toBe(provider.useValue);
        }
      }

      it("should merge syncronous and asyncronous providers",
         inject([AsyncTestCompleter, Injector], (async, injector) => {
           let ref = new PlatformRef_(injector, null);
           let ASYNC_PROVIDERS = [new Provider(Foo, {useValue: new Foo()}), exceptionHandler];
           let SYNC_PROVIDERS = [new Provider(Bar, {useValue: new Bar()})];
           ref.asyncApplication((zone) => PromiseWrapper.resolve(ASYNC_PROVIDERS), SYNC_PROVIDERS)
               .then((appRef) => {
                 var providers = ListWrapper.concat(ASYNC_PROVIDERS, SYNC_PROVIDERS);
                 expectProviders(appRef.injector, providers);
                 async.done();
               });
         }));

      it("should allow function to be null",
         inject([AsyncTestCompleter, Injector], (async, injector) => {
           let ref = new PlatformRef_(injector, null);
           let SYNC_PROVIDERS = [new Provider(Bar, {useValue: new Bar()}), exceptionHandler];
           ref.asyncApplication(null, SYNC_PROVIDERS)
               .then((appRef) => {
                 expectProviders(appRef.injector, SYNC_PROVIDERS);
                 async.done();
               });
         }));

      function mockAsyncAppInitializer(completer: PromiseCompleter<any>,
                                       providers: Array<any> = null, injector?: Injector) {
        return () => {
          if (providers != null) {
            expectProviders(injector, providers);
          }
          TimerWrapper.setTimeout(() => completer.resolve(true), 1);
          return completer.promise;
        };
      }

      it("should wait for asyncronous app initializers",
         inject([AsyncTestCompleter, Injector], (async, injector) => {
           let ref = new PlatformRef_(injector, null);

           let completer: PromiseCompleter<any> = PromiseWrapper.completer();
           let SYNC_PROVIDERS = [
             new Provider(Bar, {useValue: new Bar()}),
             new Provider(APP_INITIALIZER,
                          {useValue: mockAsyncAppInitializer(completer), multi: true})
           ];
           ref.asyncApplication(null, [SYNC_PROVIDERS, exceptionHandler])
               .then((appRef) => {
                 expectProviders(appRef.injector,
                                 SYNC_PROVIDERS.slice(0, SYNC_PROVIDERS.length - 1));
                 completer.promise.then((_) => async.done());
               });
         }));

      it("should wait for async providers and then async app initializers",
         inject([AsyncTestCompleter, Injector], (async, injector) => {
           let ref = new PlatformRef_(injector, null);
           let ASYNC_PROVIDERS = [new Provider(Foo, {useValue: new Foo()})];
           let completer: PromiseCompleter<any> = PromiseWrapper.completer();
           let SYNC_PROVIDERS = [
             new Provider(Bar, {useValue: new Bar()}),
             new Provider(APP_INITIALIZER,
                          {
                            useFactory: (injector) => mockAsyncAppInitializer(
                                            <any>completer, ASYNC_PROVIDERS, injector),
                            multi: true,
                            deps: [Injector]
                          })
           ];
           ref.asyncApplication((zone) => PromiseWrapper.resolve(ASYNC_PROVIDERS),
                                [SYNC_PROVIDERS, exceptionHandler])
               .then((appRef) => {
                 expectProviders(appRef.injector,
                                 SYNC_PROVIDERS.slice(0, SYNC_PROVIDERS.length - 1));
                 completer.promise.then((_) => async.done());
               });
         }));
    });

    describe("application", () => {
      it("should throw if an APP_INITIIALIZER returns a promise", inject([Injector], (injector) => {
           let ref = new PlatformRef_(injector, null);
           let appInitializer = new Provider(
               APP_INITIALIZER, {useValue: () => PromiseWrapper.resolve([]), multi: true});
           expect(() => ref.application([appInitializer, exceptionHandler]))
               .toThrowError(
                   "Cannot use asyncronous app initializers with application. Use asyncApplication instead.");
         }));
    });
  });
}

class Foo {
  constructor() {}
}

class Bar {
  constructor() {}
}
