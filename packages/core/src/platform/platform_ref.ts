/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationInitStatus} from '../application/application_init';
import {compileNgModuleFactory} from '../application/application_ngmodule_factory_compiler';
import {
  _callAndReportToErrorHandler,
  ApplicationRef,
  BootstrapOptions,
  optionsReducer,
  remove,
} from '../application/application_ref';
import {
  getNgZoneOptions,
  internalProvideZoneChangeDetection,
  PROVIDED_NG_ZONE,
} from '../change_detection/scheduling/ng_zone_scheduling';
import {ZONELESS_ENABLED} from '../change_detection/scheduling/zoneless_scheduling';
import {Injectable, InjectionToken, Injector} from '../di';
import {ErrorHandler} from '../error_handler';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {DEFAULT_LOCALE_ID} from '../i18n/localization';
import {LOCALE_ID} from '../i18n/tokens';
import {Type} from '../interface/type';
import {CompilerOptions} from '../linker';
import {InternalNgModuleRef, NgModuleFactory, NgModuleRef} from '../linker/ng_module_factory';
import {setLocaleId} from '../render3';
import {createNgModuleRefWithProviders} from '../render3/ng_module_ref';
import {stringify} from '../util/stringify';
import {getNgZone} from '../zone/ng_zone';

/**
 * Internal token that allows to register extra callbacks that should be invoked during the
 * `PlatformRef.destroy` operation. This token is needed to avoid a direct reference to the
 * `PlatformRef` class (i.e. register the callback via `PlatformRef.onDestroy`), thus making the
 * entire class tree-shakeable.
 */
export const PLATFORM_DESTROY_LISTENERS = new InjectionToken<Set<VoidFunction>>(
  ngDevMode ? 'PlatformDestroyListeners' : '',
);

/**
 * The Angular platform is the entry point for Angular on a web page.
 * Each page has exactly one platform. Services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 * A page's platform is initialized implicitly when a platform is created using a platform
 * factory such as `PlatformBrowser`, or explicitly by calling the `createPlatform()` function.
 *
 * @publicApi
 */
@Injectable({providedIn: 'platform'})
export class PlatformRef {
  private _modules: NgModuleRef<any>[] = [];
  private _destroyListeners: Array<() => void> = [];
  private _destroyed: boolean = false;

  /** @internal */
  constructor(private _injector: Injector) {}

  /**
   * Creates an instance of an `@NgModule` for the given platform.
   *
   * @deprecated Passing NgModule factories as the `PlatformRef.bootstrapModuleFactory` function
   *     argument is deprecated. Use the `PlatformRef.bootstrapModule` API instead.
   */
  bootstrapModuleFactory<M>(
    moduleFactory: NgModuleFactory<M>,
    options?: BootstrapOptions,
  ): Promise<NgModuleRef<M>> {
    // Note: We need to create the NgZone _before_ we instantiate the module,
    // as instantiating the module creates some providers eagerly.
    // So we create a mini parent injector that just contains the new NgZone and
    // pass that as parent to the NgModuleFactory.
    const ngZone = getNgZone(
      options?.ngZone,
      getNgZoneOptions({
        eventCoalescing: options?.ngZoneEventCoalescing,
        runCoalescing: options?.ngZoneRunCoalescing,
      }),
    );
    // Note: Create ngZoneInjector within ngZone.run so that all of the instantiated services are
    // created within the Angular zone
    // Do not try to replace ngZone.run with ApplicationRef#run because ApplicationRef would then be
    // created outside of the Angular zone.
    return ngZone.run(() => {
      const ignoreChangesOutsideZone = options?.ignoreChangesOutsideZone;
      const moduleRef = createNgModuleRefWithProviders(
        moduleFactory.moduleType,
        this.injector,
        internalProvideZoneChangeDetection({ngZoneFactory: () => ngZone, ignoreChangesOutsideZone}),
      );

      if (
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
        moduleRef.injector.get(PROVIDED_NG_ZONE, null) !== null
      ) {
        throw new RuntimeError(
          RuntimeErrorCode.PROVIDER_IN_WRONG_CONTEXT,
          '`bootstrapModule` does not support `provideZoneChangeDetection`. Use `BootstrapOptions` instead.',
        );
      }
      if (
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
        moduleRef.injector.get(ZONELESS_ENABLED, null) &&
        options?.ngZone !== 'noop'
      ) {
        throw new RuntimeError(
          RuntimeErrorCode.PROVIDED_BOTH_ZONE_AND_ZONELESS,
          'Invalid change detection configuration: ' +
            "`ngZone: 'noop'` must be set in `BootstrapOptions` with provideExperimentalZonelessChangeDetection.",
        );
      }

      const exceptionHandler = moduleRef.injector.get(ErrorHandler, null);
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && exceptionHandler === null) {
        throw new RuntimeError(
          RuntimeErrorCode.MISSING_REQUIRED_INJECTABLE_IN_BOOTSTRAP,
          'No ErrorHandler. Is platform module (BrowserModule) included?',
        );
      }
      ngZone.runOutsideAngular(() => {
        const subscription = ngZone.onError.subscribe({
          next: (error: any) => {
            exceptionHandler!.handleError(error);
          },
        });
        moduleRef.onDestroy(() => {
          remove(this._modules, moduleRef);
          subscription.unsubscribe();
        });
      });
      return _callAndReportToErrorHandler(exceptionHandler!, ngZone, () => {
        const initStatus: ApplicationInitStatus = moduleRef.injector.get(ApplicationInitStatus);
        initStatus.runInitializers();
        return initStatus.donePromise.then(() => {
          // If the `LOCALE_ID` provider is defined at bootstrap then we set the value for ivy
          const localeId = moduleRef.injector.get(LOCALE_ID, DEFAULT_LOCALE_ID);
          setLocaleId(localeId || DEFAULT_LOCALE_ID);
          this._moduleDoBootstrap(moduleRef);
          return moduleRef;
        });
      });
    });
  }

  /**
   * Creates an instance of an `@NgModule` for a given platform.
   *
   * @usageNotes
   * ### Simple Example
   *
   * ```typescript
   * @NgModule({
   *   imports: [BrowserModule]
   * })
   * class MyModule {}
   *
   * let moduleRef = platformBrowser().bootstrapModule(MyModule);
   * ```
   *
   */
  bootstrapModule<M>(
    moduleType: Type<M>,
    compilerOptions:
      | (CompilerOptions & BootstrapOptions)
      | Array<CompilerOptions & BootstrapOptions> = [],
  ): Promise<NgModuleRef<M>> {
    const options = optionsReducer({}, compilerOptions);
    return compileNgModuleFactory(this.injector, options, moduleType).then((moduleFactory) =>
      this.bootstrapModuleFactory(moduleFactory, options),
    );
  }

  private _moduleDoBootstrap(moduleRef: InternalNgModuleRef<any>): void {
    const appRef = moduleRef.injector.get(ApplicationRef);
    if (moduleRef._bootstrapComponents.length > 0) {
      moduleRef._bootstrapComponents.forEach((f) => appRef.bootstrap(f));
    } else if (moduleRef.instance.ngDoBootstrap) {
      moduleRef.instance.ngDoBootstrap(appRef);
    } else {
      throw new RuntimeError(
        RuntimeErrorCode.BOOTSTRAP_COMPONENTS_NOT_FOUND,
        ngDevMode &&
          `The module ${stringify(moduleRef.instance.constructor)} was bootstrapped, ` +
            `but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. ` +
            `Please define one of these.`,
      );
    }
    this._modules.push(moduleRef);
  }

  /**
   * Registers a listener to be called when the platform is destroyed.
   */
  onDestroy(callback: () => void): void {
    this._destroyListeners.push(callback);
  }

  /**
   * Retrieves the platform {@link Injector}, which is the parent injector for
   * every Angular application on the page and provides singleton providers.
   */
  get injector(): Injector {
    return this._injector;
  }

  /**
   * Destroys the current Angular platform and all Angular applications on the page.
   * Destroys all modules and listeners registered with the platform.
   */
  destroy() {
    if (this._destroyed) {
      throw new RuntimeError(
        RuntimeErrorCode.PLATFORM_ALREADY_DESTROYED,
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
}
