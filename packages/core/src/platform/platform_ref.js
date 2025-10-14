/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {compileNgModuleFactory} from '../application/application_ngmodule_factory_compiler';
import {optionsReducer} from '../application/application_ref';
import {validAppIdInitializer} from '../application/application_tokens';
import {provideZonelessChangeDetectionInternal} from '../change_detection/scheduling/zoneless_scheduling_impl';
import {Injectable} from '../di';
import {errorHandlerEnvironmentInitializer} from '../error_handler';
import {RuntimeError} from '../errors';
import {createNgModuleRefWithProviders} from '../render3/ng_module_ref';
import {bootstrap, setModuleBootstrapImpl} from './bootstrap';
import {PLATFORM_DESTROY_LISTENERS} from './platform_destroy_listeners';
import {
  getNgZoneOptions,
  internalProvideZoneChangeDetection,
} from '../change_detection/scheduling/ng_zone_scheduling';
import {getNgZone} from '../zone/ng_zone';
const ZONELESS_BY_DEFAULT = true;
// Holds the set of providers to be used for the *next* application to be bootstrapped.
// Used only for providing the zone related providers by default with `downgradeModule`.
let _additionalApplicationProviders = undefined;
export function setZoneProvidersForNextBootstrap() {
  _additionalApplicationProviders = internalProvideZoneChangeDetection({});
}
/**
 * The Angular platform is the entry point for Angular on a web page.
 * Each page has exactly one platform. Services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 * A page's platform is initialized implicitly when a platform is created using a platform
 * factory such as `PlatformBrowser`, or explicitly by calling the `createPlatform()` function.
 *
 * @publicApi
 */
let PlatformRef = class PlatformRef {
  /** @internal */
  constructor(_injector) {
    this._injector = _injector;
    this._modules = [];
    this._destroyListeners = [];
    this._destroyed = false;
  }
  /**
   * Creates an instance of an `@NgModule` for the given platform.
   *
   * @deprecated Passing NgModule factories as the `PlatformRef.bootstrapModuleFactory` function
   *     argument is deprecated. Use the `PlatformRef.bootstrapModule` API instead.
   */
  bootstrapModuleFactory(moduleFactory, options) {
    const defaultZoneCdProviders = [];
    if (!ZONELESS_BY_DEFAULT) {
      const ngZoneFactory = () =>
        getNgZone(options?.ngZone, {
          ...getNgZoneOptions({
            eventCoalescing: options?.ngZoneEventCoalescing,
            runCoalescing: options?.ngZoneRunCoalescing,
          }),
        });
      defaultZoneCdProviders.push(internalProvideZoneChangeDetection({ngZoneFactory}));
    }
    const allAppProviders = [
      provideZonelessChangeDetectionInternal(),
      ...defaultZoneCdProviders,
      ...(_additionalApplicationProviders ?? []),
      errorHandlerEnvironmentInitializer,
      ...(ngDevMode ? [validAppIdInitializer] : []),
    ];
    _additionalApplicationProviders = undefined;
    const moduleRef = createNgModuleRefWithProviders(
      moduleFactory.moduleType,
      this.injector,
      allAppProviders,
    );
    setModuleBootstrapImpl();
    return bootstrap({
      moduleRef,
      allPlatformModules: this._modules,
      platformInjector: this.injector,
    });
  }
  /**
   * Creates an instance of an `@NgModule` for a given platform.
   *
   * @usageNotes
   * ### Simple Example
   *
   * ```ts
   * @NgModule({
   *   imports: [BrowserModule]
   * })
   * class MyModule {}
   *
   * let moduleRef = platformBrowser().bootstrapModule(MyModule);
   * ```
   *
   */
  bootstrapModule(moduleType, compilerOptions = []) {
    const options = optionsReducer({}, compilerOptions);
    setModuleBootstrapImpl();
    return compileNgModuleFactory(this.injector, options, moduleType).then((moduleFactory) =>
      this.bootstrapModuleFactory(moduleFactory, options),
    );
  }
  /**
   * Registers a listener to be called when the platform is destroyed.
   */
  onDestroy(callback) {
    this._destroyListeners.push(callback);
  }
  /**
   * Retrieves the platform {@link Injector}, which is the parent injector for
   * every Angular application on the page and provides singleton providers.
   */
  get injector() {
    return this._injector;
  }
  /**
   * Destroys the current Angular platform and all Angular applications on the page.
   * Destroys all modules and listeners registered with the platform.
   */
  destroy() {
    if (this._destroyed) {
      throw new RuntimeError(
        404 /* RuntimeErrorCode.PLATFORM_ALREADY_DESTROYED */,
        ngDevMode && 'The platform has already been destroyed!',
      );
    }
    this._modules.slice().forEach((module) => module.destroy());
    this._destroyListeners.forEach((listener) => listener());
    const destroyListeners = this._injector.get(PLATFORM_DESTROY_LISTENERS, null);
    if (destroyListeners) {
      destroyListeners.forEach((listener) => listener());
      destroyListeners.clear();
    }
    this._destroyed = true;
  }
  /**
   * Indicates whether this instance was destroyed.
   */
  get destroyed() {
    return this._destroyed;
  }
};
PlatformRef = __decorate([Injectable({providedIn: 'platform'})], PlatformRef);
export {PlatformRef};
//# sourceMappingURL=platform_ref.js.map
