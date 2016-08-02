/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ObservableWrapper, PromiseCompleter, PromiseWrapper} from '../src/facade/async';
import {ListWrapper} from '../src/facade/collection';
import {BaseException, ExceptionHandler, unimplemented} from '../src/facade/exceptions';
import {ConcreteType, Type, isBlank, isPresent, isPromise} from '../src/facade/lang';

import {APP_INITIALIZER, PLATFORM_INITIALIZER} from './application_tokens';
import {ChangeDetectorRef} from './change_detection/change_detector_ref';
import {Console} from './console';
import {Inject, Injectable, Injector, OpaqueToken, Optional, ReflectiveInjector, SkipSelf, forwardRef} from './di';
import {Compiler, CompilerFactory, CompilerOptions} from './linker/compiler';
import {ComponentFactory, ComponentRef} from './linker/component_factory';
import {ComponentFactoryResolver} from './linker/component_factory_resolver';
import {ComponentResolver} from './linker/component_resolver';
import {NgModuleFactory, NgModuleRef} from './linker/ng_module_factory';
import {WtfScopeFn, wtfCreateScope, wtfLeave} from './profile/profile';
import {Testability, TestabilityRegistry} from './testability/testability';
import {NgZone, NgZoneError} from './zone/ng_zone';

var _devMode: boolean = true;
var _runModeLocked: boolean = false;
var _platform: PlatformRef;

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
  if (isPresent(_platform) && !_platform.disposed) {
    throw new BaseException(
        'There can be only one platform. Destroy the previous one to create a new one.');
  }
  _platform = injector.get(PlatformRef);
  const inits: Function[] = <Function[]>injector.get(PLATFORM_INITIALIZER, null);
  if (isPresent(inits)) inits.forEach(init => init());
  return _platform;
}

/**
 * Factory for a platform.
 *
 * @experimental
 */
export type PlatformFactory = (extraProviders?: any[]) => PlatformRef;

/**
 * Creates a fatory for a platform
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function createPlatformFactory(
    parentPlaformFactory: PlatformFactory, name: string, providers: any[] = []): PlatformFactory {
  const marker = new OpaqueToken(`Platform: ${name}`);
  return (extraProviders: any[] = []) => {
    if (!getPlatform()) {
      if (parentPlaformFactory) {
        parentPlaformFactory(
            providers.concat(extraProviders).concat({provide: marker, useValue: true}));
      } else {
        createPlatform(ReflectiveInjector.resolveAndCreate(
            providers.concat(extraProviders).concat({provide: marker, useValue: true})));
      }
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
 * @deprecated Use `destroyPlatform` instead
 */
export function disposePlatform(): void {
  destroyPlatform();
}

/**
 * Destroy the existing platform.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function destroyPlatform(): void {
  if (isPresent(_platform) && !_platform.destroyed) {
    _platform.destroy();
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
 * Shortcut for ApplicationRef.bootstrap.
 * Requires a platform to be created first.
 *
 * @deprecated Use {@link bootstrapModuleFactory} instead.
 */
export function coreBootstrap<C>(
    componentFactory: ComponentFactory<C>, injector: Injector): ComponentRef<C> {
  throw new BaseException('coreBootstrap is deprecated. Use bootstrapModuleFactory instead.');
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
  throw new BaseException('coreLoadAndBootstrap is deprecated. Use bootstrapModule instead.');
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
   * Creates an instance of an `@NgModule` for the given platform
   * for offline compilation.
   *
   * ## Simple Example
   *
   * ```typescript
   * my_module.ts:
   *
   * @NgModule({
   *   imports: [BrowserModule]
   * })
   * class MyModule {}
   *
   * main.ts:
   * import {MyModuleNgFactory} from './my_module.ngfactory';
   * import {browserPlatform} from '@angular/platform-browser';
   *
   * let moduleRef = browserPlatform().bootstrapModuleFactory(MyModuleNgFactory);
   * ```
   *
   * @experimental APIs related to application bootstrap are currently under review.
   */
  bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>): Promise<NgModuleRef<M>> {
    throw unimplemented();
  }

  /**
   * Creates an instance of an `@NgModule` for a given platform using the given runtime compiler.
   *
   * ## Simple Example
   *
   * ```typescript
   * @NgModule({
   *   imports: [BrowserModule]
   * })
   * class MyModule {}
   *
   * let moduleRef = browserPlatform().bootstrapModule(MyModule);
   * ```
   * @stable
   */
  bootstrapModule<M>(
      moduleType: ConcreteType<M>,
      compilerOptions: CompilerOptions|CompilerOptions[] = []): Promise<NgModuleRef<M>> {
    throw unimplemented();
  }

  /**
   * Register a listener to be called when the platform is disposed.
   * @deprecated Use `OnDestroy` instead
   */
  abstract registerDisposeListener(dispose: () => void): void;

  /**
   * Register a listener to be called when the platform is disposed.
   */
  abstract onDestroy(callback: () => void): void;

  /**
   * Retrieve the platform {@link Injector}, which is the parent injector for
   * every Angular application on the page and provides singleton providers.
   */
  get injector(): Injector { throw unimplemented(); };

  /**
   * Destroy the Angular platform and all Angular applications on the page.
   * @deprecated Use `destroy` instead
   */
  abstract dispose(): void;

  /**
   * Destroy the Angular platform and all Angular applications on the page.
   */
  abstract destroy(): void;

  /**
   * @deprecated Use `destroyd` instead
   */
  get disposed(): boolean { throw unimplemented(); }
  get destroyed(): boolean { throw unimplemented(); }
}

function _callAndReportToExceptionHandler(
    exceptionHandler: ExceptionHandler, callback: () => any): any {
  try {
    const result = callback();
    if (isPromise(result)) {
      return result.catch((e: any) => {
        exceptionHandler.call(e);
        // rethrow as the exception handler might not do it
        throw e;
      });
    } else {
      return result;
    }
  } catch (e) {
    exceptionHandler.call(e);
    // rethrow as the exception handler might not do it
    throw e;
  }
}

@Injectable()
export class PlatformRef_ extends PlatformRef {
  private _modules: NgModuleRef<any>[] = [];
  private _destroyListeners: Function[] = [];

  private _destroyed: boolean = false;

  constructor(private _injector: Injector) { super(); }

  /**
   * @deprecated
   */
  registerDisposeListener(dispose: () => void): void { this.onDestroy(dispose); }

  onDestroy(callback: () => void): void { this._destroyListeners.push(callback); }

  get injector(): Injector { return this._injector; }

  /**
   * @deprecated
   */
  get disposed() { return this.destroyed; }
  get destroyed() { return this._destroyed; }

  destroy() {
    if (this._destroyed) {
      throw new BaseException('The platform is already destroyed!');
    }
    ListWrapper.clone(this._modules).forEach((app) => app.destroy());
    this._destroyListeners.forEach((dispose) => dispose());
    this._destroyed = true;
  }

  /**
   * @deprecated
   */
  dispose(): void { this.destroy(); }

  bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>): Promise<NgModuleRef<M>> {
    // Note: We need to create the NgZone _before_ we instantiate the module,
    // as instantiating the module creates some providers eagerly.
    // So we create a mini parent injector that just contains the new NgZone and
    // pass that as parent to the NgModuleFactory.
    const ngZone = new NgZone({enableLongStackTrace: isDevMode()});
    // Attention: Don't use ApplicationRef.run here,
    // as we want to be sure that all possible constructor calls are inside `ngZone.run`!
    return ngZone.run(() => {
      const ngZoneInjector =
          ReflectiveInjector.resolveAndCreate([{provide: NgZone, useValue: ngZone}], this.injector);
      const moduleRef = moduleFactory.create(ngZoneInjector);
      const exceptionHandler: ExceptionHandler = moduleRef.injector.get(ExceptionHandler, null);
      if (!exceptionHandler) {
        throw new Error('No ExceptionHandler. Is platform module (BrowserModule) included?');
      }
      moduleRef.onDestroy(() => ListWrapper.remove(this._modules, moduleRef));
      ObservableWrapper.subscribe(ngZone.onError, (error: NgZoneError) => {
        exceptionHandler.call(error.error, error.stackTrace);
      });
      return _callAndReportToExceptionHandler(exceptionHandler, () => {
        const appInits = moduleRef.injector.get(APP_INITIALIZER, null);
        const asyncInitPromises: Promise<any>[] = [];
        if (isPresent(appInits)) {
          for (let i = 0; i < appInits.length; i++) {
            const initResult = appInits[i]();
            if (isPromise(initResult)) {
              asyncInitPromises.push(initResult);
            }
          }
        }
        const appRef: ApplicationRef_ = moduleRef.injector.get(ApplicationRef);
        return Promise.all(asyncInitPromises).then(() => {
          appRef.asyncInitDone();
          return moduleRef;
        });
      });
    });
  }

  bootstrapModule<M>(
      moduleType: ConcreteType<M>,
      compilerOptions: CompilerOptions|CompilerOptions[] = []): Promise<NgModuleRef<M>> {
    const compilerFactory: CompilerFactory = this.injector.get(CompilerFactory);
    const compiler = compilerFactory.createCompiler(
        compilerOptions instanceof Array ? compilerOptions : [compilerOptions]);
    return compiler.compileModuleAsync(moduleType)
        .then((moduleFactory) => this.bootstrapModuleFactory(moduleFactory));
  }
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
   *
   * @deprecated Use `ngOnDestroy` lifecycle hook or {@link NgModuleRef}.onDestroy.
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
   *
   * @deprecated Destroy the module that was created during bootstrap instead by calling
   * {@link NgModuleRef}.destroy.
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

  private _bootstrapListeners: Function[] = [];
  /**
   * @deprecated
   */
  private _disposeListeners: Function[] = [];
  private _rootComponents: ComponentRef<any>[] = [];
  private _rootComponentTypes: Type[] = [];
  private _changeDetectorRefs: ChangeDetectorRef[] = [];
  private _runningTick: boolean = false;
  private _enforceNoNewChanges: boolean = false;

  /** @internal */
  _asyncInitDonePromise: PromiseCompleter<any> = PromiseWrapper.completer();

  constructor(
      private _zone: NgZone, private _console: Console, private _injector: Injector,
      private _exceptionHandler: ExceptionHandler,
      private _componentFactoryResolver: ComponentFactoryResolver,
      @Optional() private _testabilityRegistry: TestabilityRegistry,
      @Optional() private _testability: Testability) {
    super();
    this._enforceNoNewChanges = isDevMode();
    ObservableWrapper.subscribe(
        this._zone.onMicrotaskEmpty, (_) => { this._zone.run(() => { this.tick(); }); });
  }

  registerBootstrapListener(listener: (ref: ComponentRef<any>) => void): void {
    this._bootstrapListeners.push(listener);
  }

  /**
   * @deprecated
   */
  registerDisposeListener(dispose: () => void): void { this._disposeListeners.push(dispose); }

  registerChangeDetector(changeDetector: ChangeDetectorRef): void {
    this._changeDetectorRefs.push(changeDetector);
  }

  unregisterChangeDetector(changeDetector: ChangeDetectorRef): void {
    ListWrapper.remove(this._changeDetectorRefs, changeDetector);
  }

  /**
   * @internal
   */
  asyncInitDone() { this._asyncInitDonePromise.resolve(null); }

  waitForAsyncInitializers(): Promise<any> { return this._asyncInitDonePromise.promise; }

  run(callback: Function): any {
    return this._zone.run(
        () => _callAndReportToExceptionHandler(this._exceptionHandler, <any>callback));
  }

  bootstrap<C>(componentOrFactory: ComponentFactory<C>|ConcreteType<C>): ComponentRef<C> {
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
        this._console.log(
            `Angular 2 is running in the development mode. Call enableProdMode() to enable the production mode.`);
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

  ngOnDestroy() {
    // TODO(alxhub): Dispose of the NgZone.
    ListWrapper.clone(this._rootComponents).forEach((ref) => ref.destroy());
    this._disposeListeners.forEach((dispose) => dispose());
  }

  /**
   * @deprecated
   */
  dispose(): void { this.ngOnDestroy(); }

  get componentTypes(): Type[] { return this._rootComponentTypes; }
}
