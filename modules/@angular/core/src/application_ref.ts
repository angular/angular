/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorHandler} from '../src/error_handler';
import {ListWrapper} from '../src/facade/collection';
import {unimplemented} from '../src/facade/errors';
import {stringify} from '../src/facade/lang';
import {isPromise} from '../src/util/lang';

import {ApplicationInitStatus} from './application_init';
import {APP_BOOTSTRAP_LISTENER, PLATFORM_INITIALIZER} from './application_tokens';
import {ChangeDetectorRef} from './change_detection/change_detector_ref';
import {Console} from './console';
import {Injectable, Injector, OpaqueToken, Optional, Provider, ReflectiveInjector} from './di';
import {CompilerFactory, CompilerOptions} from './linker/compiler';
import {ComponentFactory, ComponentRef} from './linker/component_factory';
import {ComponentFactoryResolver} from './linker/component_factory_resolver';
import {NgModuleFactory, NgModuleInjector, NgModuleRef} from './linker/ng_module_factory';
import {WtfScopeFn, wtfCreateScope, wtfLeave} from './profile/profile';
import {Testability, TestabilityRegistry} from './testability/testability';
import {Type} from './type';
import {NgZone} from './zone/ng_zone';

let _devMode: boolean = true;
let _runModeLocked: boolean = false;
let _platform: PlatformRef;

/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 *
 * @stable
 */
export function enableProdMode(): void {
  if (_runModeLocked) {
    throw new Error('Cannot enable prod mode after platform setup.');
  }
  _devMode = false;
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
  if (_platform && !_platform.destroyed) {
    throw new Error(
        'There can be only one platform. Destroy the previous one to create a new one.');
  }
  _platform = injector.get(PlatformRef);
  const inits: Function[] = <Function[]>injector.get(PLATFORM_INITIALIZER, null);
  if (inits) inits.forEach(init => init());
  return _platform;
}

/**
 * Creates a factory for a platform
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function createPlatformFactory(
    parentPlaformFactory: (extraProviders?: Provider[]) => PlatformRef, name: string,
    providers: Provider[] = []): (extraProviders?: Provider[]) => PlatformRef {
  const marker = new OpaqueToken(`Platform: ${name}`);
  return (extraProviders: Provider[] = []) => {
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
  const platform = getPlatform();

  if (!platform) {
    throw new Error('No platform exists!');
  }

  if (!platform.injector.get(requiredToken, null)) {
    throw new Error(
        'A platform with a different configuration has been created. Please destroy it first.');
  }

  return platform;
}

/**
 * Destroy the existing platform.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function destroyPlatform(): void {
  if (_platform && !_platform.destroyed) {
    _platform.destroy();
  }
}

/**
 * Returns the current platform.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function getPlatform(): PlatformRef {
  return _platform && !_platform.destroyed ? _platform : null;
}

/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
 * explicitly by calling {@link createPlatform}().
 *
 * @stable
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
   * import {platformBrowser} from '@angular/platform-browser';
   *
   * let moduleRef = platformBrowser().bootstrapModuleFactory(MyModuleNgFactory);
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
   * let moduleRef = platformBrowser().bootstrapModule(MyModule);
   * ```
   * @stable
   */
  bootstrapModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions|CompilerOptions[] = []):
      Promise<NgModuleRef<M>> {
    throw unimplemented();
  }

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
   */
  abstract destroy(): void;

  get destroyed(): boolean { throw unimplemented(); }
}

function _callAndReportToErrorHandler(errorHandler: ErrorHandler, callback: () => any): any {
  try {
    const result = callback();
    if (isPromise(result)) {
      return result.catch((e: any) => {
        errorHandler.handleError(e);
        // rethrow as the exception handler might not do it
        throw e;
      });
    }

    return result;
  } catch (e) {
    errorHandler.handleError(e);
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

  onDestroy(callback: () => void): void { this._destroyListeners.push(callback); }

  get injector(): Injector { return this._injector; }

  get destroyed() { return this._destroyed; }

  destroy() {
    if (this._destroyed) {
      throw new Error('The platform has already been destroyed!');
    }
    this._modules.slice().forEach(module => module.destroy());
    this._destroyListeners.forEach(listener => listener());
    this._destroyed = true;
  }

  bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>): Promise<NgModuleRef<M>> {
    return this._bootstrapModuleFactoryWithZone(moduleFactory, null);
  }

  private _bootstrapModuleFactoryWithZone<M>(moduleFactory: NgModuleFactory<M>, ngZone: NgZone):
      Promise<NgModuleRef<M>> {
    // Note: We need to create the NgZone _before_ we instantiate the module,
    // as instantiating the module creates some providers eagerly.
    // So we create a mini parent injector that just contains the new NgZone and
    // pass that as parent to the NgModuleFactory.
    if (!ngZone) ngZone = new NgZone({enableLongStackTrace: isDevMode()});
    // Attention: Don't use ApplicationRef.run here,
    // as we want to be sure that all possible constructor calls are inside `ngZone.run`!
    return ngZone.run(() => {
      const ngZoneInjector =
          ReflectiveInjector.resolveAndCreate([{provide: NgZone, useValue: ngZone}], this.injector);
      const moduleRef = <NgModuleInjector<M>>moduleFactory.create(ngZoneInjector);
      const exceptionHandler: ErrorHandler = moduleRef.injector.get(ErrorHandler, null);
      if (!exceptionHandler) {
        throw new Error('No ErrorHandler. Is platform module (BrowserModule) included?');
      }
      moduleRef.onDestroy(() => ListWrapper.remove(this._modules, moduleRef));
      ngZone.onError.subscribe({next: (error: any) => { exceptionHandler.handleError(error); }});
      return _callAndReportToErrorHandler(exceptionHandler, () => {
        const initStatus: ApplicationInitStatus = moduleRef.injector.get(ApplicationInitStatus);
        return initStatus.donePromise.then(() => {
          this._moduleDoBootstrap(moduleRef);
          return moduleRef;
        });
      });
    });
  }

  bootstrapModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions|CompilerOptions[] = []):
      Promise<NgModuleRef<M>> {
    return this._bootstrapModuleWithZone(moduleType, compilerOptions, null);
  }

  private _bootstrapModuleWithZone<M>(
      moduleType: Type<M>, compilerOptions: CompilerOptions|CompilerOptions[] = [], ngZone: NgZone,
      componentFactoryCallback?: any): Promise<NgModuleRef<M>> {
    const compilerFactory: CompilerFactory = this.injector.get(CompilerFactory);
    const compiler = compilerFactory.createCompiler(
        Array.isArray(compilerOptions) ? compilerOptions : [compilerOptions]);

    // ugly internal api hack: generate host component factories for all declared components and
    // pass the factories into the callback - this is used by UpdateAdapter to get hold of all
    // factories.
    if (componentFactoryCallback) {
      return compiler.compileModuleAndAllComponentsAsync(moduleType)
          .then(({ngModuleFactory, componentFactories}) => {
            componentFactoryCallback(componentFactories);
            return this._bootstrapModuleFactoryWithZone(ngModuleFactory, ngZone);
          });
    }

    return compiler.compileModuleAsync(moduleType)
        .then((moduleFactory) => this._bootstrapModuleFactoryWithZone(moduleFactory, ngZone));
  }

  private _moduleDoBootstrap(moduleRef: NgModuleInjector<any>) {
    const appRef = moduleRef.injector.get(ApplicationRef);
    if (moduleRef.bootstrapFactories.length > 0) {
      moduleRef.bootstrapFactories.forEach((compFactory) => appRef.bootstrap(compFactory));
    } else if (moduleRef.instance.ngDoBootstrap) {
      moduleRef.instance.ngDoBootstrap(appRef);
    } else {
      throw new Error(
          `The module ${stringify(moduleRef.instance.constructor)} was bootstrapped, but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. ` +
          `Please define one of these.`);
    }
  }
}

/**
 * A reference to an Angular application running on a page.
 *
 * For more about Angular applications, see the documentation for {@link bootstrap}.
 *
 * @stable
 */
export abstract class ApplicationRef {
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
  abstract bootstrap<C>(componentFactory: ComponentFactory<C>|Type<C>): ComponentRef<C>;

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
   * This list is populated even before the component is created.
   */
  get componentTypes(): Type<any>[] { return <Type<any>[]>unimplemented(); };

  /**
   * Get a list of components registered to this application.
   */
  get components(): ComponentRef<any>[] { return <ComponentRef<any>[]>unimplemented(); };
}

@Injectable()
export class ApplicationRef_ extends ApplicationRef {
  /** @internal */
  static _tickScope: WtfScopeFn = wtfCreateScope('ApplicationRef#tick()');

  private _bootstrapListeners: Function[] = [];
  private _rootComponents: ComponentRef<any>[] = [];
  private _rootComponentTypes: Type<any>[] = [];
  private _changeDetectorRefs: ChangeDetectorRef[] = [];
  private _runningTick: boolean = false;
  private _enforceNoNewChanges: boolean = false;

  constructor(
      private _zone: NgZone, private _console: Console, private _injector: Injector,
      private _exceptionHandler: ErrorHandler,
      private _componentFactoryResolver: ComponentFactoryResolver,
      private _initStatus: ApplicationInitStatus,
      @Optional() private _testabilityRegistry: TestabilityRegistry,
      @Optional() private _testability: Testability) {
    super();
    this._enforceNoNewChanges = isDevMode();

    this._zone.onMicrotaskEmpty.subscribe(
        {next: () => { this._zone.run(() => { this.tick(); }); }});
  }

  registerChangeDetector(changeDetector: ChangeDetectorRef): void {
    this._changeDetectorRefs.push(changeDetector);
  }

  unregisterChangeDetector(changeDetector: ChangeDetectorRef): void {
    ListWrapper.remove(this._changeDetectorRefs, changeDetector);
  }

  bootstrap<C>(componentOrFactory: ComponentFactory<C>|Type<C>): ComponentRef<C> {
    if (!this._initStatus.done) {
      throw new Error(
          'Cannot bootstrap as there are still asynchronous initializers running. Bootstrap components in the `ngDoBootstrap` method of the root module.');
    }
    let componentFactory: ComponentFactory<C>;
    if (componentOrFactory instanceof ComponentFactory) {
      componentFactory = componentOrFactory;
    } else {
      componentFactory = this._componentFactoryResolver.resolveComponentFactory(componentOrFactory);
    }
    this._rootComponentTypes.push(componentFactory.componentType);
    const compRef = componentFactory.create(this._injector, [], componentFactory.selector);
    compRef.onDestroy(() => { this._unloadComponent(compRef); });
    const testability = compRef.injector.get(Testability, null);
    if (testability) {
      compRef.injector.get(TestabilityRegistry)
          .registerApplication(compRef.location.nativeElement, testability);
    }

    this._loadComponent(compRef);
    if (isDevMode()) {
      this._console.log(
          `Angular 2 is running in the development mode. Call enableProdMode() to enable the production mode.`);
    }
    return compRef;
  }

  /** @internal */
  _loadComponent(componentRef: ComponentRef<any>): void {
    this._changeDetectorRefs.push(componentRef.changeDetectorRef);
    this.tick();
    this._rootComponents.push(componentRef);
    // Get the listeners lazily to prevent DI cycles.
    const listeners =
        <((compRef: ComponentRef<any>) => void)[]>this._injector.get(APP_BOOTSTRAP_LISTENER, [])
            .concat(this._bootstrapListeners);
    listeners.forEach((listener) => listener(componentRef));
  }

  /** @internal */
  _unloadComponent(componentRef: ComponentRef<any>): void {
    if (this._rootComponents.indexOf(componentRef) == -1) {
      return;
    }
    this.unregisterChangeDetector(componentRef.changeDetectorRef);
    ListWrapper.remove(this._rootComponents, componentRef);
  }

  tick(): void {
    if (this._runningTick) {
      throw new Error('ApplicationRef.tick is called recursively');
    }

    const scope = ApplicationRef_._tickScope();
    try {
      this._runningTick = true;
      this._changeDetectorRefs.forEach((detector) => detector.detectChanges());
      if (this._enforceNoNewChanges) {
        this._changeDetectorRefs.forEach((detector) => detector.checkNoChanges());
      }
    } finally {
      this._runningTick = false;
      wtfLeave(scope);
    }
  }

  ngOnDestroy() {
    // TODO(alxhub): Dispose of the NgZone.
    this._rootComponents.slice().forEach((component) => component.destroy());
  }

  get componentTypes(): Type<any>[] { return this._rootComponentTypes; }

  get components(): ComponentRef<any>[] { return this._rootComponents; }
}
