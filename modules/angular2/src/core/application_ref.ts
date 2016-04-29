import {NgZone, NgZoneError} from 'angular2/src/core/zone/ng_zone';
import {
  Type,
  isBlank,
  isPresent,
  assertionsEnabled,
  print,
  IS_DART,
  CONST_EXPR,
  lockMode,
  isPromise
} from 'angular2/src/facade/lang';
import {provide, Provider, Injector, Injectable} from 'angular2/src/core/di';
import {APP_ID_RANDOM_PROVIDER, PLATFORM_INITIALIZER, APP_INITIALIZER} from './application_tokens';
import {PromiseWrapper, PromiseCompleter, ObservableWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';
import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';
import {ComponentResolver} from 'angular2/src/core/linker/component_resolver';
import {ComponentRef} from 'angular2/src/core/linker/component_factory';
import {
  BaseException,
  WrappedException,
  ExceptionHandler,
  unimplemented
} from 'angular2/src/facade/exceptions';
import {Console} from 'angular2/src/core/console';
import {wtfLeave, wtfCreateScope, WtfScopeFn} from './profile/profile';
import {ChangeDetectorRef} from 'angular2/src/core/change_detection/change_detector_ref';
import {ComponentFactory} from 'angular2/src/core/linker/component_factory';

/**
 * Create an Angular zone.
 */
export function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: assertionsEnabled()});
}

var _platform: PlatformRef;
var _inPlatformCreate: boolean = false;

/**
 * Creates a platform.
 * Platforms have to be eagerly created via this function.
 */
export function createPlatform(injector: Injector): PlatformRef {
  if (_inPlatformCreate) {
    throw new BaseException('Already creating a platform...');
  }
  if (isPresent(_platform) && !_platform.disposed) {
    throw new BaseException(
        "There can be only one platform. Destroy the previous one to create a new one.");
  }
  lockMode();
  _inPlatformCreate = true;
  try {
    _platform = injector.get(PlatformRef);
  } finally {
    _inPlatformCreate = false;
  }
  return _platform;
}

/**
 * Checks that there currently is a platform
 * which contains the given token as a provider.
 */
export function assertPlatform(requiredToken: any): PlatformRef {
  var platform = getPlatform();
  if (isBlank(platform)) {
    throw new BaseException('Not platform exists!');
  }
  if (isPresent(platform) && isBlank(platform.injector.get(requiredToken, null))) {
    throw new BaseException(
        'A platform with a different configuration has been created. Please destroy it first.');
  }
  return platform;
}

/**
 * Dispose the existing platform.
 */
export function disposePlatform(): void {
  if (isPresent(_platform) && !_platform.disposed) {
    _platform.dispose();
  }
}

/**
 * Returns the current platform.
 */
export function getPlatform(): PlatformRef {
  return isPresent(_platform) && !_platform.disposed ? _platform : null;
}

/**
 * Shortcut for ApplicationRef.bootstrap.
 * Requires a platform the be created first.
 */
export function coreBootstrap(injector: Injector,
                              componentFactory: ComponentFactory): ComponentRef {
  var appRef: ApplicationRef = injector.get(ApplicationRef);
  return appRef.bootstrap(componentFactory);
}

/**
 * Resolves the componentFactory for the given component,
 * waits for asynchronous initializers and bootstraps the component.
 * Requires a platform the be created first.
 */
export function coreLoadAndBootstrap(injector: Injector,
                                     componentType: Type): Promise<ComponentRef> {
  var appRef: ApplicationRef = injector.get(ApplicationRef);
  return appRef.run(() => {
    var componentResolver: ComponentResolver = injector.get(ComponentResolver);
    return PromiseWrapper
        .all([componentResolver.resolveComponent(componentType), appRef.waitForAsyncInitializers()])
        .then((arr) => appRef.bootstrap(arr[0]));
  });
}

/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
 * explicitly by calling {@link createPlatform}().
 */
export abstract class PlatformRef {
  /**
   * Register a listener to be called when the platform is disposed.
   */
  abstract registerDisposeListener(dispose: () => void): void;

  /**
   * Retrieve the platform {@link Injector}, which is the parent injector for
   * every Angular application on the page and provides singleton providers.
   */
  get injector(): Injector { throw unimplemented(); };

  /**
   * Destroy the Angular platform and all Angular applications on the page.
   */
  abstract dispose(): void;

  get disposed(): boolean { throw unimplemented(); }
}

@Injectable()
export class PlatformRef_ extends PlatformRef {
  /** @internal */
  _applications: ApplicationRef[] = [];
  /** @internal */
  _disposeListeners: Function[] = [];

  private _disposed: boolean = false;

  constructor(private _injector: Injector) {
    super();
    if (!_inPlatformCreate) {
      throw new BaseException('Platforms have to be created via `createPlatform`!');
    }
    let inits: Function[] = <Function[]>_injector.get(PLATFORM_INITIALIZER, null);
    if (isPresent(inits)) inits.forEach(init => init());
  }

  registerDisposeListener(dispose: () => void): void { this._disposeListeners.push(dispose); }

  get injector(): Injector { return this._injector; }

  get disposed() { return this._disposed; }

  addApplication(appRef: ApplicationRef) { this._applications.push(appRef); }

  dispose(): void {
    ListWrapper.clone(this._applications).forEach((app) => app.dispose());
    this._disposeListeners.forEach((dispose) => dispose());
    this._disposed = true;
  }

  /** @internal */
  _applicationDisposed(app: ApplicationRef): void { ListWrapper.remove(this._applications, app); }
}

/**
 * A reference to an Angular application running on a page.
 *
 * For more about Angular applications, see the documentation for {@link bootstrap}.
 */
export abstract class ApplicationRef {
  /**
   * Register a listener to be called each time `bootstrap()` is called to bootstrap
   * a new root component.
   */
  abstract registerBootstrapListener(listener: (ref: ComponentRef) => void): void;

  /**
   * Register a listener to be called when the application is disposed.
   */
  abstract registerDisposeListener(dispose: () => void): void;

  /**
   * Returns a promise that resolves when all asynchronous application initializers
   * are done.
   */
  abstract waitForAsyncInitializers(): Promise<any>;

  /**
   * Runs the given callback in the zone and returns the result of the callback.
   * Exceptions will be forwarded to the ExceptionHandler and rethrown.
   */
  abstract run(callback: Function): any;

  /**
   * Bootstrap a new component at the root level of the application.
   *
   * ### Bootstrap process
   *
   * When bootstrapping a new root component into an application, Angular mounts the
   * specified application component onto DOM elements identified by the [componentType]'s
   * selector and kicks off automatic change detection to finish initializing the component.
   *
   * ### Example
   * {@example core/ts/platform/platform.ts region='longform'}
   */
  abstract bootstrap(componentFactory: ComponentFactory): ComponentRef;

  /**
   * Retrieve the application {@link Injector}.
   */
  get injector(): Injector { return <Injector>unimplemented(); };

  /**
   * Retrieve the application {@link NgZone}.
   */
  get zone(): NgZone { return <NgZone>unimplemented(); };

  /**
   * Dispose of this application and all of its components.
   */
  abstract dispose(): void;

  /**
   * Invoke this method to explicitly process change detection and its side-effects.
   *
   * In development mode, `tick()` also performs a second change detection cycle to ensure that no
   * further changes are detected. If additional changes are picked up during this second cycle,
   * bindings in the app have side-effects that cannot be resolved in a single change detection
   * pass.
   * In this case, Angular throws an error, since an Angular application can only have one change
   * detection pass during which all change detection must complete.
   */
  abstract tick(): void;

  /**
   * Get a list of component types registered to this application.
   */
  get componentTypes(): Type[] { return <Type[]>unimplemented(); };
}

@Injectable()
export class ApplicationRef_ extends ApplicationRef {
  /** @internal */
  static _tickScope: WtfScopeFn = wtfCreateScope('ApplicationRef#tick()');

  /** @internal */
  private _bootstrapListeners: Function[] = [];
  /** @internal */
  private _disposeListeners: Function[] = [];
  /** @internal */
  private _rootComponents: ComponentRef[] = [];
  /** @internal */
  private _rootComponentTypes: Type[] = [];
  /** @internal */
  private _changeDetectorRefs: ChangeDetectorRef[] = [];
  /** @internal */
  private _runningTick: boolean = false;
  /** @internal */
  private _enforceNoNewChanges: boolean = false;

  private _exceptionHandler: ExceptionHandler;

  private _asyncInitDonePromise: Promise<any>;
  private _asyncInitDone: boolean;

  constructor(private _platform: PlatformRef_, private _zone: NgZone, private _injector: Injector) {
    super();
    var zone: NgZone = _injector.get(NgZone);
    this._enforceNoNewChanges = assertionsEnabled();
    zone.run(() => { this._exceptionHandler = _injector.get(ExceptionHandler); });
    this._asyncInitDonePromise = this.run(() => {
      let inits: Function[] = _injector.get(APP_INITIALIZER, null);
      var asyncInitResults = [];
      var asyncInitDonePromise;
      if (isPresent(inits)) {
        for (var i = 0; i < inits.length; i++) {
          var initResult = inits[i]();
          if (isPromise(initResult)) {
            asyncInitResults.push(initResult);
          }
        }
      }
      if (asyncInitResults.length > 0) {
        asyncInitDonePromise =
            PromiseWrapper.all(asyncInitResults).then((_) => this._asyncInitDone = true);
        this._asyncInitDone = false;
      } else {
        this._asyncInitDone = true;
        asyncInitDonePromise = PromiseWrapper.resolve(true);
      }
      return asyncInitDonePromise;
    });
    ObservableWrapper.subscribe(zone.onError, (error: NgZoneError) => {
      this._exceptionHandler.call(error.error, error.stackTrace);
    });
    ObservableWrapper.subscribe(this._zone.onMicrotaskEmpty,
                                (_) => { this._zone.run(() => { this.tick(); }); });
  }

  registerBootstrapListener(listener: (ref: ComponentRef) => void): void {
    this._bootstrapListeners.push(listener);
  }

  registerDisposeListener(dispose: () => void): void { this._disposeListeners.push(dispose); }

  registerChangeDetector(changeDetector: ChangeDetectorRef): void {
    this._changeDetectorRefs.push(changeDetector);
  }

  unregisterChangeDetector(changeDetector: ChangeDetectorRef): void {
    ListWrapper.remove(this._changeDetectorRefs, changeDetector);
  }

  waitForAsyncInitializers(): Promise<any> { return this._asyncInitDonePromise; }

  run(callback: Function): any {
    var zone = this.injector.get(NgZone);
    var result;
    // Note: Don't use zone.runGuarded as we want to know about
    // the thrown exception!
    // Note: the completer needs to be created outside
    // of `zone.run` as Dart swallows rejected promises
    // via the onError callback of the promise.
    var completer = PromiseWrapper.completer();
    zone.run(() => {
      try {
        result = callback();
        if (isPromise(result)) {
          PromiseWrapper.then(result, (ref) => { completer.resolve(ref); }, (err, stackTrace) => {
            completer.reject(err, stackTrace);
            this._exceptionHandler.call(err, stackTrace);
          });
        }
      } catch (e) {
        this._exceptionHandler.call(e, e.stack);
        throw e;
      }
    });
    return isPromise(result) ? completer.promise : result;
  }

  bootstrap(componentFactory: ComponentFactory): ComponentRef {
    if (!this._asyncInitDone) {
      throw new BaseException(
          'Cannot bootstrap as there are still asynchronous initializers running. Wait for them using waitForAsyncInitializers().');
    }
    return this.run(() => {
      this._rootComponentTypes.push(componentFactory.componentType);
      var compRef = componentFactory.create(this._injector, [], componentFactory.selector);
      compRef.onDestroy(() => { this._unloadComponent(compRef); });
      var testability = compRef.injector.get(Testability, null);
      if (isPresent(testability)) {
        compRef.injector.get(TestabilityRegistry)
            .registerApplication(compRef.location.nativeElement, testability);
      }

      this._loadComponent(compRef);
      let c = this._injector.get(Console);
      if (assertionsEnabled()) {
        c.log(
            "Angular 2 is running in the development mode. Call enableProdMode() to enable the production mode.");
      }
      return compRef;
    });
  }

  /** @internal */
  _loadComponent(componentRef: ComponentRef): void {
    this._changeDetectorRefs.push(componentRef.changeDetectorRef);
    this.tick();
    this._rootComponents.push(componentRef);
    this._bootstrapListeners.forEach((listener) => listener(componentRef));
  }

  /** @internal */
  _unloadComponent(componentRef: ComponentRef): void {
    if (!ListWrapper.contains(this._rootComponents, componentRef)) {
      return;
    }
    this.unregisterChangeDetector(componentRef.changeDetectorRef);
    ListWrapper.remove(this._rootComponents, componentRef);
  }

  get injector(): Injector { return this._injector; }

  get zone(): NgZone { return this._zone; }

  tick(): void {
    if (this._runningTick) {
      throw new BaseException("ApplicationRef.tick is called recursively");
    }

    var s = ApplicationRef_._tickScope();
    try {
      this._runningTick = true;
      this._changeDetectorRefs.forEach((detector) => detector.detectChanges());
      if (this._enforceNoNewChanges) {
        this._changeDetectorRefs.forEach((detector) => detector.checkNoChanges());
      }
    } finally {
      this._runningTick = false;
      wtfLeave(s);
    }
  }

  dispose(): void {
    // TODO(alxhub): Dispose of the NgZone.
    ListWrapper.clone(this._rootComponents).forEach((ref) => ref.destroy());
    this._disposeListeners.forEach((dispose) => dispose());
    this._platform._applicationDisposed(this);
  }

  get componentTypes(): Type[] { return this._rootComponentTypes; }
}

/**
 * @internal
 */
export const PLATFORM_CORE_PROVIDERS =
    CONST_EXPR([PlatformRef_, CONST_EXPR(new Provider(PlatformRef, {useExisting: PlatformRef_}))]);

/**
 * @internal
 */
export const APPLICATION_CORE_PROVIDERS = CONST_EXPR([
  CONST_EXPR(new Provider(NgZone, {useFactory: createNgZone, deps: CONST_EXPR([])})),
  ApplicationRef_,
  CONST_EXPR(new Provider(ApplicationRef, {useExisting: ApplicationRef_}))
]);
