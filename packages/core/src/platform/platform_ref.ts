/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {compileNgModuleFactory} from '../application/application_ngmodule_factory_compiler';
import {BootstrapOptions, optionsReducer} from '../application/application_ref';
import {
  getNgZoneOptions,
  internalProvideZoneChangeDetection,
} from '../change_detection/scheduling/ng_zone_scheduling';
import {ChangeDetectionScheduler} from '../change_detection/scheduling/zoneless_scheduling';
import {ChangeDetectionSchedulerImpl} from '../change_detection/scheduling/zoneless_scheduling_impl';
import {Injectable, Injector, StaticProvider} from '../di';
import {errorHandlerEnvironmentInitializer} from '../error_handler';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {Type} from '../interface/type';
import {CompilerOptions} from '../linker';
import {NgModuleFactory, NgModuleRef} from '../linker/ng_module_factory';
import {createNgModuleRefWithProviders} from '../render3/ng_module_ref';
import {getNgZone} from '../zone/ng_zone';
import {bootstrap, setModuleBootstrapImpl} from './bootstrap';
import {PLATFORM_DESTROY_LISTENERS} from './platform_destroy_listeners';

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
  private _additionalApplicationProviders?: StaticProvider[];

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
    const scheduleInRootZone = (options as any)?.scheduleInRootZone;
    const ngZoneFactory = () =>
      getNgZone(options?.ngZone, {
        ...getNgZoneOptions({
          eventCoalescing: options?.ngZoneEventCoalescing,
          runCoalescing: options?.ngZoneRunCoalescing,
        }),
        scheduleInRootZone,
      });
    const allAppProviders = [
      internalProvideZoneChangeDetection({
        ngZoneFactory,
      }),
      {provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl},
      ...(this._additionalApplicationProviders ?? []),
      errorHandlerEnvironmentInitializer,
    ];
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
  bootstrapModule<M>(
    moduleType: Type<M>,
    compilerOptions:
      | (CompilerOptions & BootstrapOptions)
      | Array<CompilerOptions & BootstrapOptions> = [],
  ): Promise<NgModuleRef<M>> {
    const options = optionsReducer({}, compilerOptions);
    setModuleBootstrapImpl();
    return compileNgModuleFactory(this.injector, options, moduleType).then((moduleFactory) =>
      this.bootstrapModuleFactory(moduleFactory, options),
    );
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
