import {NgZone, NgZoneError} from 'angular2/src/core/zone/ng_zone';
import {
  Type,
  isBlank,
  isPresent,
  assertionsEnabled,
  print,
  IS_DART,
  CONST_EXPR
} from 'angular2/src/facade/lang';
import {provide, Provider, Injector, Injectable} from 'angular2/src/core/di';
import {
  APP_COMPONENT,
  APP_ID_RANDOM_PROVIDER,
  PLATFORM_INITIALIZER,
  APP_INITIALIZER
} from './application_tokens';
import {PromiseWrapper, PromiseCompleter, ObservableWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';
import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';
import {Compiler} from 'angular2/src/core/linker/compiler';
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
import {lockMode} from 'angular2/src/facade/lang';
import {ElementRef_} from 'angular2/src/core/linker/element_ref';
import {ComponentFactory} from 'angular2/src/core/linker/component_factory';

/**
 * Create an Angular zone.
 */
export function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: assertionsEnabled()});
}

var _platform: PlatformRef;

/**
 * @internal
 */
export function platformFactory(injector: Injector): PlatformRef {
  lockMode();
  if (isPresent(_platform)) {
    throw new BaseException(
        "There can be only one platform. Destroy the previous one to create a new one.");
  }
  _platform = new PlatformRef_(injector, () => { _platform = null; });
  _runPlatformInitializers(injector);
  return _platform;
}

/**
 * Dispose the existing platform.
 */
export function disposePlatform(): void {
  if (isPresent(_platform)) {
    _platform.dispose();
    _platform = null;
  }
}

function _runPlatformInitializers(injector: Injector): void {
  let inits: Function[] = <Function[]>injector.get(PLATFORM_INITIALIZER, null);
  if (isPresent(inits)) inits.forEach(init => init());
}


/**
 * @internal
 */
export function applicationFactory(platform: PlatformRef_, injector: Injector): ApplicationRef {
  var app = platform.createApplication(injector);
  _runAppInitializers(injector);
  return app;
}

function _runAppInitializers(injector: Injector): void {
  let inits: Function[] = injector.get(APP_INITIALIZER, null);
  if (isPresent(inits)) {
    inits.forEach(init => init());
  }
}

export function basicBootstrap(injector: Injector,
                               componentFactory: ComponentFactory): ComponentRef {
  var exceptionHandler = injector.get(ExceptionHandler);
  try {
    var appRef: ApplicationRef = injector.get(ApplicationRef);
    return appRef.bootstrap(componentFactory);
  } catch (e) {
    exceptionHandler.call(e, e.stack);
    throw e;
  }
}

export function basicLoadAndBootstrap(injector: Injector,
                                      componentType: Type): Promise<ComponentRef> {
  var completer = PromiseWrapper.completer();
  var exceptionHandler = injector.get(ExceptionHandler);
  try {
    var compiler: Compiler = injector.get(Compiler);
    var compileResult = compiler.compileComponent(componentType)
                            .then((componentFactory) => basicBootstrap(injector, componentFactory));
    PromiseWrapper.then(compileResult, (ref) => { completer.resolve(ref); }, (err, stackTrace) => {
      completer.reject(err, stackTrace);
      exceptionHandler.call(err, stackTrace);
    });
  } catch (e) {
    exceptionHandler.call(e, e.stack);
    completer.reject(e, e.stack);
  }
  return completer.promise;
}

/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
 * explicitly by calling {@link platform}().
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

export class PlatformRef_ extends PlatformRef {
  /** @internal */
  _applications: ApplicationRef[] = [];
  /** @internal */
  _disposeListeners: Function[] = [];

  private _disposed: boolean = false;

  constructor(private _injector: Injector, private _dispose: () => void) { super(); }

  registerDisposeListener(dispose: () => void): void { this._disposeListeners.push(dispose); }

  get injector(): Injector { return this._injector; }

  get disposed() { return this._disposed; }

  createApplication(injector: Injector): ApplicationRef {
    var zone: NgZone = injector.get(NgZone);
    zone.run(() => {
      var exceptionHandler: Function;
      try {
        exceptionHandler = injector.get(ExceptionHandler);
        ObservableWrapper.subscribe(zone.onError, (error: NgZoneError) => {
          exceptionHandler.call(error.error, error.stackTrace);
        });
      } catch (e) {
        if (isPresent(exceptionHandler)) {
          exceptionHandler.call(e, e.stack);
        } else {
          print(e.toString());
        }
      }
    });
    var appRef = new ApplicationRef_(this, zone, injector);
    this._applications.push(appRef);
    return appRef;
  }

  dispose(): void {
    ListWrapper.clone(this._applications).forEach((app) => app.dispose());
    this._disposeListeners.forEach((dispose) => dispose());
    this._disposed = true;
    this._dispose();
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

  constructor(private _platform: PlatformRef_, private _zone: NgZone, private _injector: Injector) {
    super();
    if (isPresent(this._zone)) {
      ObservableWrapper.subscribe(this._zone.onMicrotaskEmpty,
                                  (_) => { this._zone.run(() => { this.tick(); }); });
    }
    this._enforceNoNewChanges = assertionsEnabled();
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

  bootstrap(componentFactory: ComponentFactory): ComponentRef {
    return this._zone.run(() => {
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
    var appChangeDetector = (<ElementRef_>componentRef.location).internalElement.parentView;
    this._changeDetectorRefs.push(appChangeDetector.ref);
    this.tick();
    this._rootComponents.push(componentRef);
    this._bootstrapListeners.forEach((listener) => listener(componentRef));
  }

  /** @internal */
  _unloadComponent(componentRef: ComponentRef): void {
    if (!ListWrapper.contains(this._rootComponents, componentRef)) {
      return;
    }
    this.unregisterChangeDetector(
        (<ElementRef_>componentRef.location).internalElement.parentView.ref);
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
export const PLATFORM_BASIC_PROVIDERS = CONST_EXPR([
  CONST_EXPR(
      new Provider(PlatformRef, {useFactory: platformFactory, deps: CONST_EXPR([Injector])}))
]);

/**
 * @internal
 */
export const APPLICATION_BASIC_PROVIDERS = CONST_EXPR([
  CONST_EXPR(new Provider(NgZone, {useFactory: createNgZone, deps: CONST_EXPR([])})),
  CONST_EXPR(
      new Provider(ApplicationRef,
                   {useFactory: applicationFactory, deps: CONST_EXPR([PlatformRef, Injector])}))
]);
