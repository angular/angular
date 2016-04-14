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
import {Type} from 'angular2/src/facade/lang';
import {SpyChangeDetectorRef} from './spies';
import {
  ApplicationRef_,
  ApplicationRef,
  PLATFORM_CORE_PROVIDERS,
  APPLICATION_CORE_PROVIDERS
} from "angular2/src/core/application_ref";
import {
  Injector,
  Provider,
  APP_INITIALIZER,
  Component,
  ReflectiveInjector,
  coreLoadAndBootstrap,
  coreBootstrap,
  PlatformRef,
  createPlatform,
  disposePlatform,
  ComponentResolver,
  ChangeDetectorRef
} from "angular2/core";
import {Console} from 'angular2/src/core/console';
import {BaseException} from 'angular2/src/facade/exceptions';
import {PromiseWrapper, PromiseCompleter, TimerWrapper} from "angular2/src/facade/async";
import {
  ComponentFactory,
  ComponentRef_,
  ComponentRef
} from 'angular2/src/core/linker/component_factory';
import {ExceptionHandler} from 'angular2/src/facade/exception_handler';

export function main() {
  describe("bootstrap", () => {
    var platform: PlatformRef;
    var errorLogger: _ArrayLogger;
    var someCompFactory: ComponentFactory;

    beforeEach(() => {
      errorLogger = new _ArrayLogger();
      disposePlatform();
      platform = createPlatform(ReflectiveInjector.resolveAndCreate(PLATFORM_CORE_PROVIDERS));
      someCompFactory =
          new _MockComponentFactory(new _MockComponentRef(ReflectiveInjector.resolveAndCreate([])));
    });

    afterEach(() => { disposePlatform(); });

    function createApplication(providers: any[]): ApplicationRef_ {
      var appInjector = ReflectiveInjector.resolveAndCreate(
          [
            APPLICATION_CORE_PROVIDERS,
            new Provider(Console, {useValue: new _MockConsole()}),
            new Provider(ExceptionHandler, {useValue: new ExceptionHandler(errorLogger, false)}),
            new Provider(ComponentResolver,
                         {useValue: new _MockComponentResolver(someCompFactory)}),
            providers
          ],
          platform.injector);
      return appInjector.get(ApplicationRef);
    }

    describe("ApplicationRef", () => {
      it("should throw when reentering tick", () => {
        var cdRef = <any>new SpyChangeDetectorRef();
        var ref = createApplication([]);
        try {
          ref.registerChangeDetector(cdRef);
          cdRef.spy("detectChanges").andCallFake(() => ref.tick());
          expect(() => ref.tick()).toThrowError("ApplicationRef.tick is called recursively");
        } finally {
          ref.unregisterChangeDetector(cdRef);
        }
      });

      describe('run', () => {
        it('should rethrow errors even if the exceptionHandler is not rethrowing', () => {
          var ref = createApplication([]);
          expect(() => ref.run(() => { throw new BaseException('Test'); })).toThrowError('Test');
        });

        it('should return a promise with rejected errors even if the exceptionHandler is not rethrowing',
           inject([AsyncTestCompleter, Injector], (async, injector) => {
             var ref = createApplication([]);
             var promise = ref.run(() => PromiseWrapper.reject('Test', null));
             PromiseWrapper.catchError(promise, (e) => {
               expect(e).toEqual('Test');
               async.done();
             });
           }));
      });
    });

    describe("coreLoadAndBootstrap", () => {
      it("should wait for asynchronous app initializers",
         inject([AsyncTestCompleter, Injector], (async, injector) => {
           let completer: PromiseCompleter<any> = PromiseWrapper.completer();
           var initializerDone = false;
           TimerWrapper.setTimeout(() => {
             completer.resolve(true);
             initializerDone = true;
           }, 1);
           var app = createApplication(
               [new Provider(APP_INITIALIZER, {useValue: () => completer.promise, multi: true})]);
           coreLoadAndBootstrap(app.injector, MyComp)
               .then((compRef) => {
                 expect(initializerDone).toBe(true);
                 async.done();
               });
         }));
    });

    describe("coreBootstrap", () => {
      it("should throw if an APP_INITIIALIZER is not yet resolved",
         inject([Injector], (injector) => {
           var app = createApplication([
             new Provider(APP_INITIALIZER,
                          {useValue: () => PromiseWrapper.completer().promise, multi: true})
           ]);
           expect(() => app.bootstrap(someCompFactory))
               .toThrowError(
                   "Cannot bootstrap as there are still asynchronous initializers running. Wait for them using waitForAsyncInitializers().");
         }));
    });
  });
}

@Component({selector: 'my-comp', template: ''})
class MyComp {
}

class _ArrayLogger {
  res: any[] = [];
  log(s: any): void { this.res.push(s); }
  logError(s: any): void { this.res.push(s); }
  logGroup(s: any): void { this.res.push(s); }
  logGroupEnd(){};
}

class _MockComponentFactory extends ComponentFactory {
  constructor(private _compRef: ComponentRef) { super(null, null, null); }
  create(injector: Injector, projectableNodes: any[][] = null,
         rootSelectorOrNode: string | any = null): ComponentRef {
    return this._compRef;
  }
}

class _MockComponentResolver implements ComponentResolver {
  constructor(private _compFactory: ComponentFactory) {}

  resolveComponent(type: Type): Promise<ComponentFactory> {
    return PromiseWrapper.resolve(this._compFactory);
  }
  clearCache() {}
}

class _MockComponentRef extends ComponentRef_ {
  constructor(private _injector: Injector) { super(null, null); }
  get injector(): Injector { return this._injector; }
  get changeDetectorRef(): ChangeDetectorRef { return <any>new SpyChangeDetectorRef(); }
  onDestroy(cb: Function) {}
}

class _MockConsole implements Console {
  log(message) {}
}
