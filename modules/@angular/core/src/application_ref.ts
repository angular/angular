/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ObservableWrapper, PromiseWrapper} from '../src/facade/async';
import {ListWrapper} from '../src/facade/collection';
import {BaseException, ExceptionHandler, unimplemented} from '../src/facade/exceptions';
import {ConcreteType, IS_DART, Type, isBlank, isPresent, isPromise} from '../src/facade/lang';

import {APP_INITIALIZER, PLATFORM_INITIALIZER} from './application_tokens';
import {ChangeDetectorRef} from './change_detection/change_detector_ref';
import {Console} from './console';
import {Inject, Injectable, Injector, OpaqueToken, Optional, OptionalMetadata, ReflectiveInjector, SkipSelf, SkipSelfMetadata, forwardRef} from './di';
import {AppModuleFactory, AppModuleRef} from './linker/app_module_factory';
import {Compiler, CompilerFactory, CompilerOptions} from './linker/compiler';
import {ComponentFactory, ComponentRef} from './linker/component_factory';
import {ComponentFactoryResolver} from './linker/component_factory_resolver';
import {ComponentResolver} from './linker/component_resolver';
import {WtfScopeFn, wtfCreateScope, wtfLeave} from './profile/profile';
import {Testability, TestabilityRegistry} from './testability/testability';
import {NgZone, NgZoneError} from './zone/ng_zone';



/**
 * Create an Angular zone.
 * @experimental
 */
export function createNgZone(parent: NgZone): NgZone {
  // If an NgZone is already present in the parent injector,
  // use that one. Creating the NgZone in the same injector as the
  // application is dangerous as some services might get created before
  // the NgZone has been created.
  // We keep the NgZone factory in the application providers for
  // backwards compatibility for now though.
  if (parent) {
    return parent;
  }
  return new NgZone({enableLongStackTrace: isDevMode()});
}

var _devMode: boolean = true;
var _runModeLocked: boolean = false;
var _platform: PlatformRef;
var _inPlatformCreate: boolean = false;

/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function enableProdMode(): void {
  if (_runModeLocked) {
    // Cannot use BaseException as that ends up importing from facade/lang.
    throw new BaseException('Cannot enable prod mode after platform setup.');
  }
  _devMode = false;
}

/**
 * Locks the run mode of Angular. After this has been called,
 * it can't be changed any more. I.e. `isDevMode()` will always
 * return the same value.
 *
 * @deprecated This is a noop now. {@link isDevMode} automatically locks the run mode on first call.
 */
export function lockRunMode(): void {
  console.warn('lockRunMode() is deprecated and not needed any more.');
}

/**
 * Returns whether Angular is in development mode. After called once,
 * the value is locked and won't change any more.
 *
 * By default, this is true, unless a user calls `enableProdMode` before calling this.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function isDevMode(): boolean {
  _runModeLocked = true;
  return _devMode;
}

/**
 * Creates a platform.
 * Platforms have to be eagerly created via this function.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function createPlatform(injector: Injector): PlatformRef {
  if (_inPlatformCreate) {
    throw new BaseException('Already creating a platform...');
  }
  if (isPresent(_platform) && !_platform.disposed) {
    throw new BaseException(
        'There can be only one platform. Destroy the previous one to create a new one.');
  }
  _inPlatformCreate = true;
  try {
    _platform = injector.get(PlatformRef);
  } finally {
    _inPlatformCreate = false;
  }
  return _platform;
}

/**
 * Creates a fatory for a platform
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function createPlatformFactory(name: string, providers: any[]): () => PlatformRef {
  const marker = new OpaqueToken(`Platform: ${name}`);
  return () => {
    if (!getPlatform()) {
      createPlatform(
          ReflectiveInjector.resolveAndCreate(providers.concat({provide: marker, useValue: true})));
    }
    return assertPlatform(marker);
  };
}

/**
 * Checks that there currently is a platform
 * which contains the given token as a provider.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function assertPlatform(requiredToken: any): PlatformRef {
  var platform = getPlatform();
  if (isBlank(platform)) {
    throw new BaseException('No platform exists!');
  }
  if (isPresent(platform) && isBlank(platform.injector.get(requiredToken, null))) {
    throw new BaseException(
        'A platform with a different configuration has been created. Please destroy it first.');
  }
  return platform;
}

/**
 * Dispose the existing platform.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function disposePlatform(): void {
  if (isPresent(_platform) && !_platform.disposed) {
    _platform.dispose();
  }
}

/**
 * Returns the current platform.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function getPlatform(): PlatformRef {
  return isPresent(_platform) && !_platform.disposed ? _platform : null;
}

/**
 * Creates an instance of an `@AppModule` for the given platform
 * for offline compilation.
 *
 * ## Simple Example
 *
 * ```typescript
 * my_module.ts:
 *
 * @AppModule({
 *   modules: [BrowserModule]
 * })
 * class MyModule {}
 *
 * main.ts:
 * import {MyModuleNgFactory} from './my_module.ngfactory';
 * import {bootstrapModuleFactory} from '@angular/core';
 * import {browserPlatform} from '@angular/platform-browser';
 *
 * let moduleRef = bootstrapModuleFactory(MyModuleNgFactory, browserPlatform());
 * ```
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function bootstrapModuleFactory<M>(
    moduleFactory: AppModuleFactory<M>, platform: PlatformRef): AppModuleRef<M> {
  // Note: We need to create the NgZone _before_ we instantiate the module,
  // as instantiating the module creates some providers eagerly.
  // So we create a mini parent injector that just contains the new NgZone and
  // pass that as parent to the AppModuleFactory.
  const ngZone = new NgZone({enableLongStackTrace: isDevMode()});
  const ngZoneInjector =
      ReflectiveInjector.resolveAndCreate([{provide: NgZone, useValue: ngZone}], platform.injector);
  return ngZone.run(() => moduleFactory.create(ngZoneInjector));
}

/**
 * Creates an instance of an `@AppModule` for a given platform using the given runtime compiler.
 *
 * ## Simple Example
 *
 * ```typescript
 * @AppModule({
 *   modules: [BrowserModule]
 * })
 * class MyModule {}
 *
 * let moduleRef = bootstrapModule(MyModule, browserPlatform());
 * ```
 * @stable
 */
export function bootstrapModule<M>(
    moduleType: ConcreteType<M>, platform: PlatformRef,
    compilerOptions: CompilerOptions = {}): Promise<AppModuleRef<M>> {
  const compilerFactory: CompilerFactory = platform.injector.get(CompilerFactory);
  const compiler = compilerFactory.createCompiler(compilerOptions);
  return compiler.compileAppModuleAsync(moduleType)
      .then((moduleFactory) => bootstrapModuleFactory(moduleFactory, platform))
      .then((moduleRef) => {
        const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
        return appRef.waitForAsyncInitializers().then(() => moduleRef);
      });
}

/**
 * Shortcut for ApplicationRef.bootstrap.
 * Requires a platform to be created first.
 *
 * @deprecated Use {@link bootstrapModuleFactory} instead.
 */
export function coreBootstrap<C>(
    componentFactory: ComponentFactory<C>, injector: Injector): ComponentRef<C> {
  let console = injector.get(Console);
  console.warn('coreBootstrap is deprecated. Use bootstrapModuleFactory instead.');
  var appRef: ApplicationRef = injector.get(ApplicationRef);
  return appRef.bootstrap(componentFactory);
}

/**
 * Resolves the componentFactory for the given component,
 * waits for asynchronous initializers and bootstraps the component.
 * Requires a platform to be created first.
 *
 * @deprecated Use {@link bootstrapModule} instead.
 */
export function coreLoadAndBootstrap(
    componentType: Type, injector: Injector): Promise<ComponentRef<any>> {
  let console = injector.get(Console);
  console.warn('coreLoadAndBootstrap is deprecated. Use bootstrapModule instead.');
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
 *
 * @experimental APIs related to application bootstrap are currently under review.
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
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export abstract class ApplicationRef {
  /**
   * Register a listener to be called each time `bootstrap()` is called to bootstrap
   * a new root component.
   */
  abstract registerBootstrapListener(listener: (ref: ComponentRef<any>) => void): void;

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
  abstract bootstrap<C>(componentFactory: ComponentFactory<C>|ConcreteType<C>): ComponentRef<C>;

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
  private _rootComponents: ComponentRef<any>[] = [];
  /** @internal */
  private _rootComponentTypes: Type[] = [];
  /** @internal */
  private _changeDetectorRefs: ChangeDetectorRef[] = [];
  /** @internal */
  private _runningTick: boolean = false;
  /** @internal */
  private _enforceNoNewChanges: boolean = false;

  private _asyncInitDonePromise: Promise<any>;
  private _asyncInitDone: boolean;

  constructor(
      private _platform: PlatformRef_, private _zone: NgZone, private _console: Console,
      private _injector: Injector, private _exceptionHandler: ExceptionHandler,
      private _componentFactoryResolver: ComponentFactoryResolver,
      @Optional() private _testabilityRegistry: TestabilityRegistry,
      @Optional() private _testability: Testability,
      @Optional() @Inject(APP_INITIALIZER) inits: Function[]) {
    super();
    this._enforceNoNewChanges = isDevMode();
    this._asyncInitDonePromise = this.run(() => {
      var asyncInitResults: Promise<any>[] = [];
      var asyncInitDonePromise: Promise<any>;
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
    ObservableWrapper.subscribe(this._zone.onError, (error: NgZoneError) => {
      this._exceptionHandler.call(error.error, error.stackTrace);
    });
    ObservableWrapper.subscribe(
        this._zone.onMicrotaskEmpty, (_) => { this._zone.run(() => { this.tick(); }); });
  }

  registerBootstrapListener(listener: (ref: ComponentRef<any>) => void): void {
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
    var result: any;
    // Note: Don't use zone.runGuarded as we want to know about
    // the thrown exception!
    // Note: the completer needs to be created outside
    // of `zone.run` as Dart swallows rejected promises
    // via the onError callback of the promise.
    var completer = PromiseWrapper.completer();
    this._zone.run(() => {
      try {
        result = callback();
        if (isPromise(result)) {
          PromiseWrapper.then(
              result, (ref) => { completer.resolve(ref); },
              (err, stackTrace) => {
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

  bootstrap<C>(componentOrFactory: ComponentFactory<C>|ConcreteType<C>): ComponentRef<C> {
    if (!this._asyncInitDone) {
      throw new BaseException(
          'Cannot bootstrap as there are still asynchronous initializers running. Wait for them using waitForAsyncInitializers().');
    }
    return this.run(() => {
      let componentFactory: ComponentFactory<C>;
      if (componentOrFactory instanceof ComponentFactory) {
        componentFactory = componentOrFactory;
      } else {
        componentFactory =
            this._componentFactoryResolver.resolveComponentFactory(componentOrFactory);
      }
      this._rootComponentTypes.push(componentFactory.componentType);
      var compRef = componentFactory.create(this._injector, [], componentFactory.selector);
      compRef.onDestroy(() => { this._unloadComponent(compRef); });
      var testability = compRef.injector.get(Testability, null);
      if (isPresent(testability)) {
        compRef.injector.get(TestabilityRegistry)
            .registerApplication(compRef.location.nativeElement, testability);
      }

      this._loadComponent(compRef);
      if (isDevMode()) {
        let prodDescription = IS_DART ? 'Production mode is disabled in Dart.' :
                                        'Call enableProdMode() to enable the production mode.';
        this._console.log(`Angular 2 is running in the development mode. ${prodDescription}`);
      }
      return compRef;
    });
  }

  /** @internal */
  _loadComponent(componentRef: ComponentRef<any>): void {
    this._changeDetectorRefs.push(componentRef.changeDetectorRef);
    this.tick();
    this._rootComponents.push(componentRef);
    this._bootstrapListeners.forEach((listener) => listener(componentRef));
  }

  /** @internal */
  _unloadComponent(componentRef: ComponentRef<any>): void {
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
      throw new BaseException('ApplicationRef.tick is called recursively');
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

export const PLATFORM_CORE_PROVIDERS =
    /*@ts2dart_const*/[
      PlatformRef_,
      /*@ts2dart_const*/ (
          /* @ts2dart_Provider */ {provide: PlatformRef, useExisting: PlatformRef_})
    ];

export const APPLICATION_CORE_PROVIDERS = /*@ts2dart_const*/[
  /* @ts2dart_Provider */ {
    provide: NgZone,
    useFactory: createNgZone,
    deps: <any>[[new SkipSelfMetadata(), new OptionalMetadata(), NgZone]]
  },
  ApplicationRef_,
  /* @ts2dart_Provider */ {provide: ApplicationRef, useExisting: ApplicationRef_},
];
