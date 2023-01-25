/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './util/ng_jit_mode';

import {merge, Observable, Observer, Subscription} from 'rxjs';
import {share} from 'rxjs/operators';

import {ApplicationInitStatus} from './application_init';
import {APP_BOOTSTRAP_LISTENER, PLATFORM_INITIALIZER} from './application_tokens';
import {getCompilerFacade, JitCompilerUsage} from './compiler/compiler_facade';
import {Console} from './console';
import {Injectable} from './di/injectable';
import {InjectionToken} from './di/injection_token';
import {Injector} from './di/injector';
import {EnvironmentProviders, Provider, StaticProvider} from './di/interface/provider';
import {EnvironmentInjector} from './di/r3_injector';
import {INJECTOR_SCOPE} from './di/scope';
import {ErrorHandler} from './error_handler';
import {formatRuntimeError, RuntimeError, RuntimeErrorCode} from './errors';
import {DEFAULT_LOCALE_ID} from './i18n/localization';
import {LOCALE_ID} from './i18n/tokens';
import {Type} from './interface/type';
import {COMPILER_OPTIONS, CompilerOptions} from './linker/compiler';
import {ComponentFactory, ComponentRef} from './linker/component_factory';
import {ComponentFactoryResolver} from './linker/component_factory_resolver';
import {InternalNgModuleRef, NgModuleFactory, NgModuleRef} from './linker/ng_module_factory';
import {InternalViewRef, ViewRef} from './linker/view_ref';
import {isComponentResourceResolutionQueueEmpty, resolveComponentResources} from './metadata/resource_loading';
import {assertNgModuleType} from './render3/assert';
import {ComponentFactory as R3ComponentFactory} from './render3/component_ref';
import {isStandalone} from './render3/definition';
import {assertStandaloneComponentType} from './render3/errors';
import {setLocaleId} from './render3/i18n/i18n_locale_id';
import {setJitOptions} from './render3/jit/jit_options';
import {createEnvironmentInjector, NgModuleFactory as R3NgModuleFactory} from './render3/ng_module_ref';
import {publishDefaultGlobalUtils as _publishDefaultGlobalUtils} from './render3/util/global_utils';
import {TESTABILITY} from './testability/testability';
import {isPromise} from './util/lang';
import {scheduleMicroTask} from './util/microtask';
import {stringify} from './util/stringify';
import {NgZone, NoopNgZone} from './zone/ng_zone';

let _platformInjector: Injector|null = null;

/**
 * Internal token to indicate whether having multiple bootstrapped platform should be allowed (only
 * one bootstrapped platform is allowed by default). This token helps to support SSR scenarios.
 */
export const ALLOW_MULTIPLE_PLATFORMS = new InjectionToken<boolean>('AllowMultipleToken');

/**
 * Internal token that allows to register extra callbacks that should be invoked during the
 * `PlatformRef.destroy` operation. This token is needed to avoid a direct reference to the
 * `PlatformRef` class (i.e. register the callback via `PlatformRef.onDestroy`), thus making the
 * entire class tree-shakeable.
 */
const PLATFORM_DESTROY_LISTENERS =
    new InjectionToken<Set<VoidFunction>>('PlatformDestroyListeners');

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

export function compileNgModuleFactory<M>(
    injector: Injector, options: CompilerOptions,
    moduleType: Type<M>): Promise<NgModuleFactory<M>> {
  ngDevMode && assertNgModuleType(moduleType);

  const moduleFactory = new R3NgModuleFactory(moduleType);

  // All of the logic below is irrelevant for AOT-compiled code.
  if (typeof ngJitMode !== 'undefined' && !ngJitMode) {
    return Promise.resolve(moduleFactory);
  }

  const compilerOptions = injector.get(COMPILER_OPTIONS, []).concat(options);

  // Configure the compiler to use the provided options. This call may fail when multiple modules
  // are bootstrapped with incompatible options, as a component can only be compiled according to
  // a single set of options.
  setJitOptions({
    defaultEncapsulation: _lastDefined(compilerOptions.map(opts => opts.defaultEncapsulation)),
    preserveWhitespaces: _lastDefined(compilerOptions.map(opts => opts.preserveWhitespaces)),
  });

  if (isComponentResourceResolutionQueueEmpty()) {
    return Promise.resolve(moduleFactory);
  }

  const compilerProviders = _mergeArrays(compilerOptions.map(o => o.providers!));

  // In case there are no compiler providers, we just return the module factory as
  // there won't be any resource loader. This can happen with Ivy, because AOT compiled
  // modules can be still passed through "bootstrapModule". In that case we shouldn't
  // unnecessarily require the JIT compiler.
  if (compilerProviders.length === 0) {
    return Promise.resolve(moduleFactory);
  }

  const compiler = getCompilerFacade({
    usage: JitCompilerUsage.Decorator,
    kind: 'NgModule',
    type: moduleType,
  });
  const compilerInjector = Injector.create({providers: compilerProviders});
  const resourceLoader = compilerInjector.get(compiler.ResourceLoader);
  // The resource loader can also return a string while the "resolveComponentResources"
  // always expects a promise. Therefore we need to wrap the returned value in a promise.
  return resolveComponentResources(url => Promise.resolve(resourceLoader.get(url)))
      .then(() => moduleFactory);
}

export function publishDefaultGlobalUtils() {
  ngDevMode && _publishDefaultGlobalUtils();
}

export function isBoundToModule<C>(cf: ComponentFactory<C>): boolean {
  return (cf as R3ComponentFactory<C>).isBoundToModule;
}

/**
 * A token for third-party components that can register themselves with NgProbe.
 *
 * @publicApi
 */
export class NgProbeToken {
  constructor(public name: string, public token: any) {}
}

/**
 * Creates a platform.
 * Platforms must be created on launch using this function.
 *
 * @publicApi
 */
export function createPlatform(injector: Injector): PlatformRef {
  if (_platformInjector && !_platformInjector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
    throw new RuntimeError(
        RuntimeErrorCode.MULTIPLE_PLATFORMS,
        ngDevMode &&
            'There can be only one platform. Destroy the previous one to create a new one.');
  }
  publishDefaultGlobalUtils();
  _platformInjector = injector;
  const platform = injector.get(PlatformRef);
  runPlatformInitializers(injector);
  return platform;
}

/**
 * The goal of this function is to bootstrap a platform injector,
 * but avoid referencing `PlatformRef` class.
 * This function is needed for bootstrapping a Standalone Component.
 */
export function createOrReusePlatformInjector(providers: StaticProvider[] = []): Injector {
  // If a platform injector already exists, it means that the platform
  // is already bootstrapped and no additional actions are required.
  if (_platformInjector) return _platformInjector;

  // Otherwise, setup a new platform injector and run platform initializers.
  const injector = createPlatformInjector(providers);
  _platformInjector = injector;
  publishDefaultGlobalUtils();
  runPlatformInitializers(injector);
  return injector;
}

export function runPlatformInitializers(injector: Injector): void {
  const inits = injector.get(PLATFORM_INITIALIZER, null);
  if (inits) {
    inits.forEach((init: any) => init());
  }
}

/**
 * Internal create application API that implements the core application creation logic and optional
 * bootstrap logic.
 *
 * Platforms (such as `platform-browser`) may require different set of application and platform
 * providers for an application to function correctly. As a result, platforms may use this function
 * internally and supply the necessary providers during the bootstrap, while exposing
 * platform-specific APIs as a part of their public API.
 *
 * @returns A promise that returns an `ApplicationRef` instance once resolved.
 */
export function internalCreateApplication(config: {
  rootComponent?: Type<unknown>,
  appProviders?: Array<Provider|EnvironmentProviders>,
  platformProviders?: Provider[],
}): Promise<ApplicationRef> {
  const {rootComponent, appProviders, platformProviders} = config;

  if (NG_DEV_MODE && rootComponent !== undefined) {
    assertStandaloneComponentType(rootComponent);
  }

  const platformInjector = createOrReusePlatformInjector(platformProviders as StaticProvider[]);

  const ngZone = getNgZone('zone.js', getNgZoneOptions());

  return ngZone.run(() => {
    // Create root application injector based on a set of providers configured at the platform
    // bootstrap level as well as providers passed to the bootstrap call by a user.
    const allAppProviders = [
      {provide: NgZone, useValue: ngZone},  //
      ...(appProviders || []),              //
    ];

    const envInjector = createEnvironmentInjector(
        allAppProviders, platformInjector as EnvironmentInjector, 'Environment Injector');

    const exceptionHandler: ErrorHandler|null = envInjector.get(ErrorHandler, null);
    if (NG_DEV_MODE && !exceptionHandler) {
      throw new RuntimeError(
          RuntimeErrorCode.ERROR_HANDLER_NOT_FOUND,
          'No `ErrorHandler` found in the Dependency Injection tree.');
    }

    let onErrorSubscription: Subscription;
    ngZone.runOutsideAngular(() => {
      onErrorSubscription = ngZone.onError.subscribe({
        next: (error: any) => {
          exceptionHandler!.handleError(error);
        }
      });
    });

    // If the whole platform is destroyed, invoke the `destroy` method
    // for all bootstrapped applications as well.
    const destroyListener = () => envInjector.destroy();
    const onPlatformDestroyListeners = platformInjector.get(PLATFORM_DESTROY_LISTENERS);
    onPlatformDestroyListeners.add(destroyListener);

    envInjector.onDestroy(() => {
      onErrorSubscription.unsubscribe();
      onPlatformDestroyListeners.delete(destroyListener);
    });

    return _callAndReportToErrorHandler(exceptionHandler!, ngZone, () => {
      const initStatus = envInjector.get(ApplicationInitStatus);
      initStatus.runInitializers();

      return initStatus.donePromise.then(() => {
        const localeId = envInjector.get(LOCALE_ID, DEFAULT_LOCALE_ID);
        setLocaleId(localeId || DEFAULT_LOCALE_ID);

        const appRef = envInjector.get(ApplicationRef);
        if (rootComponent !== undefined) {
          appRef.bootstrap(rootComponent);
        }
        return appRef;
      });
    });
  });
}

/**
 * Creates a factory for a platform. Can be used to provide or override `Providers` specific to
 * your application's runtime needs, such as `PLATFORM_INITIALIZER` and `PLATFORM_ID`.
 * @param parentPlatformFactory Another platform factory to modify. Allows you to compose factories
 * to build up configurations that might be required by different libraries or parts of the
 * application.
 * @param name Identifies the new platform factory.
 * @param providers A set of dependency providers for platforms created with the new factory.
 *
 * @publicApi
 */
export function createPlatformFactory(
    parentPlatformFactory: ((extraProviders?: StaticProvider[]) => PlatformRef)|null, name: string,
    providers: StaticProvider[] = []): (extraProviders?: StaticProvider[]) => PlatformRef {
  const desc = `Platform: ${name}`;
  const marker = new InjectionToken(desc);
  return (extraProviders: StaticProvider[] = []) => {
    let platform = getPlatform();
    if (!platform || platform.injector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
      const platformProviders: StaticProvider[] = [
        ...providers,       //
        ...extraProviders,  //
        {provide: marker, useValue: true}
      ];
      if (parentPlatformFactory) {
        parentPlatformFactory(platformProviders);
      } else {
        createPlatform(createPlatformInjector(platformProviders, desc));
      }
    }
    return assertPlatform(marker);
  };
}

/**
 * Checks that there is currently a platform that contains the given token as a provider.
 *
 * @publicApi
 */
export function assertPlatform(requiredToken: any): PlatformRef {
  const platform = getPlatform();

  if (!platform) {
    throw new RuntimeError(RuntimeErrorCode.PLATFORM_NOT_FOUND, ngDevMode && 'No platform exists!');
  }

  if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
      !platform.injector.get(requiredToken, null)) {
    throw new RuntimeError(
        RuntimeErrorCode.MULTIPLE_PLATFORMS,
        'A platform with a different configuration has been created. Please destroy it first.');
  }

  return platform;
}

/**
 * Helper function to create an instance of a platform injector (that maintains the 'platform'
 * scope).
 */
export function createPlatformInjector(providers: StaticProvider[] = [], name?: string): Injector {
  return Injector.create({
    name,
    providers: [
      {provide: INJECTOR_SCOPE, useValue: 'platform'},
      {provide: PLATFORM_DESTROY_LISTENERS, useValue: new Set([() => _platformInjector = null])},
      ...providers
    ],
  });
}

/**
 * Destroys the current Angular platform and all Angular applications on the page.
 * Destroys all modules and listeners registered with the platform.
 *
 * @publicApi
 */
export function destroyPlatform(): void {
  getPlatform()?.destroy();
}

/**
 * Returns the current platform.
 *
 * @publicApi
 */
export function getPlatform(): PlatformRef|null {
  return _platformInjector?.get(PlatformRef) ?? null;
}

/**
 * Provides additional options to the bootstrapping process.
 *
 * @publicApi
 */
export interface BootstrapOptions {
  /**
   * Optionally specify which `NgZone` should be used.
   *
   * - Provide your own `NgZone` instance.
   * - `zone.js` - Use default `NgZone` which requires `Zone.js`.
   * - `noop` - Use `NoopNgZone` which does nothing.
   */
  ngZone?: NgZone|'zone.js'|'noop';

  /**
   * Optionally specify coalescing event change detections or not.
   * Consider the following case.
   *
   * ```
   * <div (click)="doSomething()">
   *   <button (click)="doSomethingElse()"></button>
   * </div>
   * ```
   *
   * When button is clicked, because of the event bubbling, both
   * event handlers will be called and 2 change detections will be
   * triggered. We can coalesce such kind of events to only trigger
   * change detection only once.
   *
   * By default, this option will be false. So the events will not be
   * coalesced and the change detection will be triggered multiple times.
   * And if this option be set to true, the change detection will be
   * triggered async by scheduling a animation frame. So in the case above,
   * the change detection will only be triggered once.
   */
  ngZoneEventCoalescing?: boolean;

  /**
   * Optionally specify if `NgZone#run()` method invocations should be coalesced
   * into a single change detection.
   *
   * Consider the following case.
   * ```
   * for (let i = 0; i < 10; i ++) {
   *   ngZone.run(() => {
   *     // do something
   *   });
   * }
   * ```
   *
   * This case triggers the change detection multiple times.
   * With ngZoneRunCoalescing options, all change detections in an event loop trigger only once.
   * In addition, the change detection executes in requestAnimation.
   *
   */
  ngZoneRunCoalescing?: boolean;
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
  bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>, options?: BootstrapOptions):
      Promise<NgModuleRef<M>> {
    // Note: We need to create the NgZone _before_ we instantiate the module,
    // as instantiating the module creates some providers eagerly.
    // So we create a mini parent injector that just contains the new NgZone and
    // pass that as parent to the NgModuleFactory.
    const ngZone = getNgZone(options?.ngZone, getNgZoneOptions(options));
    const providers: StaticProvider[] = [{provide: NgZone, useValue: ngZone}];
    // Note: Create ngZoneInjector within ngZone.run so that all of the instantiated services are
    // created within the Angular zone
    // Do not try to replace ngZone.run with ApplicationRef#run because ApplicationRef would then be
    // created outside of the Angular zone.
    return ngZone.run(() => {
      const ngZoneInjector = Injector.create(
          {providers: providers, parent: this.injector, name: moduleFactory.moduleType.name});
      const moduleRef = <InternalNgModuleRef<M>>moduleFactory.create(ngZoneInjector);
      const exceptionHandler: ErrorHandler|null = moduleRef.injector.get(ErrorHandler, null);
      if (!exceptionHandler) {
        throw new RuntimeError(
            RuntimeErrorCode.ERROR_HANDLER_NOT_FOUND,
            ngDevMode && 'No ErrorHandler. Is platform module (BrowserModule) included?');
      }
      ngZone!.runOutsideAngular(() => {
        const subscription = ngZone!.onError.subscribe({
          next: (error: any) => {
            exceptionHandler.handleError(error);
          }
        });
        moduleRef.onDestroy(() => {
          remove(this._modules, moduleRef);
          subscription.unsubscribe();
        });
      });
      return _callAndReportToErrorHandler(exceptionHandler, ngZone!, () => {
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
      compilerOptions: (CompilerOptions&BootstrapOptions)|
      Array<CompilerOptions&BootstrapOptions> = []): Promise<NgModuleRef<M>> {
    const options = optionsReducer({}, compilerOptions);
    return compileNgModuleFactory(this.injector, options, moduleType)
        .then(moduleFactory => this.bootstrapModuleFactory(moduleFactory, options));
  }

  private _moduleDoBootstrap(moduleRef: InternalNgModuleRef<any>): void {
    const appRef = moduleRef.injector.get(ApplicationRef);
    if (moduleRef._bootstrapComponents.length > 0) {
      moduleRef._bootstrapComponents.forEach(f => appRef.bootstrap(f));
    } else if (moduleRef.instance.ngDoBootstrap) {
      moduleRef.instance.ngDoBootstrap(appRef);
    } else {
      throw new RuntimeError(
          RuntimeErrorCode.BOOTSTRAP_COMPONENTS_NOT_FOUND,
          ngDevMode &&
              `The module ${stringify(moduleRef.instance.constructor)} was bootstrapped, ` +
                  `but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. ` +
                  `Please define one of these.`);
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
          ngDevMode && 'The platform has already been destroyed!');
    }
    this._modules.slice().forEach(module => module.destroy());
    this._destroyListeners.forEach(listener => listener());

    const destroyListeners = this._injector.get(PLATFORM_DESTROY_LISTENERS, null);
    if (destroyListeners) {
      destroyListeners.forEach(listener => listener());
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

// Set of options recognized by the NgZone.
interface NgZoneOptions {
  enableLongStackTrace: boolean;
  shouldCoalesceEventChangeDetection: boolean;
  shouldCoalesceRunChangeDetection: boolean;
}

// Transforms a set of `BootstrapOptions` (supported by the NgModule-based bootstrap APIs) ->
// `NgZoneOptions` that are recognized by the NgZone constructor. Passing no options will result in
// a set of default options returned.
function getNgZoneOptions(options?: BootstrapOptions): NgZoneOptions {
  return {
    enableLongStackTrace: typeof ngDevMode === 'undefined' ? false : !!ngDevMode,
    shouldCoalesceEventChangeDetection: !!(options && options.ngZoneEventCoalescing) || false,
    shouldCoalesceRunChangeDetection: !!(options && options.ngZoneRunCoalescing) || false,
  };
}

function getNgZone(ngZoneToUse: NgZone|'zone.js'|'noop'|undefined, options: NgZoneOptions): NgZone {
  let ngZone: NgZone;

  if (ngZoneToUse === 'noop') {
    ngZone = new NoopNgZone();
  } else {
    ngZone = (ngZoneToUse === 'zone.js' ? undefined : ngZoneToUse) || new NgZone(options);
  }
  return ngZone;
}

function _callAndReportToErrorHandler(
    errorHandler: ErrorHandler, ngZone: NgZone, callback: () => any): any {
  try {
    const result = callback();
    if (isPromise(result)) {
      return result.catch((e: any) => {
        ngZone.runOutsideAngular(() => errorHandler.handleError(e));
        // rethrow as the exception handler might not do it
        throw e;
      });
    }

    return result;
  } catch (e) {
    ngZone.runOutsideAngular(() => errorHandler.handleError(e));
    // rethrow as the exception handler might not do it
    throw e;
  }
}

function optionsReducer<T extends Object>(dst: any, objs: T|T[]): T {
  if (Array.isArray(objs)) {
    dst = objs.reduce(optionsReducer, dst);
  } else {
    dst = {...dst, ...(objs as any)};
  }
  return dst;
}

/**
 * A reference to an Angular application running on a page.
 *
 * @usageNotes
 *
 * {@a is-stable-examples}
 * ### isStable examples and caveats
 *
 * Note two important points about `isStable`, demonstrated in the examples below:
 * - the application will never be stable if you start any kind
 * of recurrent asynchronous task when the application starts
 * (for example for a polling process, started with a `setInterval`, a `setTimeout`
 * or using RxJS operators like `interval`);
 * - the `isStable` Observable runs outside of the Angular zone.
 *
 * Let's imagine that you start a recurrent task
 * (here incrementing a counter, using RxJS `interval`),
 * and at the same time subscribe to `isStable`.
 *
 * ```
 * constructor(appRef: ApplicationRef) {
 *   appRef.isStable.pipe(
 *      filter(stable => stable)
 *   ).subscribe(() => console.log('App is stable now');
 *   interval(1000).subscribe(counter => console.log(counter));
 * }
 * ```
 * In this example, `isStable` will never emit `true`,
 * and the trace "App is stable now" will never get logged.
 *
 * If you want to execute something when the app is stable,
 * you have to wait for the application to be stable
 * before starting your polling process.
 *
 * ```
 * constructor(appRef: ApplicationRef) {
 *   appRef.isStable.pipe(
 *     first(stable => stable),
 *     tap(stable => console.log('App is stable now')),
 *     switchMap(() => interval(1000))
 *   ).subscribe(counter => console.log(counter));
 * }
 * ```
 * In this example, the trace "App is stable now" will be logged
 * and then the counter starts incrementing every second.
 *
 * Note also that this Observable runs outside of the Angular zone,
 * which means that the code in the subscription
 * to this Observable will not trigger the change detection.
 *
 * Let's imagine that instead of logging the counter value,
 * you update a field of your component
 * and display it in its template.
 *
 * ```
 * constructor(appRef: ApplicationRef) {
 *   appRef.isStable.pipe(
 *     first(stable => stable),
 *     switchMap(() => interval(1000))
 *   ).subscribe(counter => this.value = counter);
 * }
 * ```
 * As the `isStable` Observable runs outside the zone,
 * the `value` field will be updated properly,
 * but the template will not be refreshed!
 *
 * You'll have to manually trigger the change detection to update the template.
 *
 * ```
 * constructor(appRef: ApplicationRef, cd: ChangeDetectorRef) {
 *   appRef.isStable.pipe(
 *     first(stable => stable),
 *     switchMap(() => interval(1000))
 *   ).subscribe(counter => {
 *     this.value = counter;
 *     cd.detectChanges();
 *   });
 * }
 * ```
 *
 * Or make the subscription callback run inside the zone.
 *
 * ```
 * constructor(appRef: ApplicationRef, zone: NgZone) {
 *   appRef.isStable.pipe(
 *     first(stable => stable),
 *     switchMap(() => interval(1000))
 *   ).subscribe(counter => zone.run(() => this.value = counter));
 * }
 * ```
 *
 * @publicApi
 */
@Injectable({providedIn: 'root'})
export class ApplicationRef {
  /** @internal */
  private _bootstrapListeners: ((compRef: ComponentRef<any>) => void)[] = [];
  private _views: InternalViewRef[] = [];
  private _runningTick: boolean = false;
  private _stable = true;
  private _onMicrotaskEmptySubscription: Subscription;
  private _destroyed = false;
  private _destroyListeners: Array<() => void> = [];

  /**
   * Indicates whether this instance was destroyed.
   */
  get destroyed() {
    return this._destroyed;
  }

  /**
   * Get a list of component types registered to this application.
   * This list is populated even before the component is created.
   */
  public readonly componentTypes: Type<any>[] = [];

  /**
   * Get a list of components registered to this application.
   */
  public readonly components: ComponentRef<any>[] = [];

  /**
   * Returns an Observable that indicates when the application is stable or unstable.
   *
   * @see  [Usage notes](#is-stable-examples) for examples and caveats when using this API.
   */
  // TODO(issue/24571): remove '!'.
  public readonly isStable!: Observable<boolean>;

  /**
   * The `EnvironmentInjector` used to create this application.
   */
  get injector(): EnvironmentInjector {
    return this._injector;
  }

  /** @internal */
  constructor(
      private _zone: NgZone,
      private _injector: EnvironmentInjector,
      private _exceptionHandler: ErrorHandler,
  ) {
    this._onMicrotaskEmptySubscription = this._zone.onMicrotaskEmpty.subscribe({
      next: () => {
        this._zone.run(() => {
          this.tick();
        });
      }
    });

    const isCurrentlyStable = new Observable<boolean>((observer: Observer<boolean>) => {
      this._stable = this._zone.isStable && !this._zone.hasPendingMacrotasks &&
          !this._zone.hasPendingMicrotasks;
      this._zone.runOutsideAngular(() => {
        observer.next(this._stable);
        observer.complete();
      });
    });

    const isStable = new Observable<boolean>((observer: Observer<boolean>) => {
      // Create the subscription to onStable outside the Angular Zone so that
      // the callback is run outside the Angular Zone.
      let stableSub: Subscription;
      this._zone.runOutsideAngular(() => {
        stableSub = this._zone.onStable.subscribe(() => {
          NgZone.assertNotInAngularZone();

          // Check whether there are no pending macro/micro tasks in the next tick
          // to allow for NgZone to update the state.
          scheduleMicroTask(() => {
            if (!this._stable && !this._zone.hasPendingMacrotasks &&
                !this._zone.hasPendingMicrotasks) {
              this._stable = true;
              observer.next(true);
            }
          });
        });
      });

      const unstableSub: Subscription = this._zone.onUnstable.subscribe(() => {
        NgZone.assertInAngularZone();
        if (this._stable) {
          this._stable = false;
          this._zone.runOutsideAngular(() => {
            observer.next(false);
          });
        }
      });

      return () => {
        stableSub.unsubscribe();
        unstableSub.unsubscribe();
      };
    });

    (this as {isStable: Observable<boolean>}).isStable =
        merge(isCurrentlyStable, isStable.pipe(share()));
  }

  /**
   * Bootstrap a component onto the element identified by its selector or, optionally, to a
   * specified element.
   *
   * @usageNotes
   * ### Bootstrap process
   *
   * When bootstrapping a component, Angular mounts it onto a target DOM element
   * and kicks off automatic change detection. The target DOM element can be
   * provided using the `rootSelectorOrNode` argument.
   *
   * If the target DOM element is not provided, Angular tries to find one on a page
   * using the `selector` of the component that is being bootstrapped
   * (first matched element is used).
   *
   * ### Example
   *
   * Generally, we define the component to bootstrap in the `bootstrap` array of `NgModule`,
   * but it requires us to know the component while writing the application code.
   *
   * Imagine a situation where we have to wait for an API call to decide about the component to
   * bootstrap. We can use the `ngDoBootstrap` hook of the `NgModule` and call this method to
   * dynamically bootstrap a component.
   *
   * {@example core/ts/platform/platform.ts region='componentSelector'}
   *
   * Optionally, a component can be mounted onto a DOM element that does not match the
   * selector of the bootstrapped component.
   *
   * In the following example, we are providing a CSS selector to match the target element.
   *
   * {@example core/ts/platform/platform.ts region='cssSelector'}
   *
   * While in this example, we are providing reference to a DOM node.
   *
   * {@example core/ts/platform/platform.ts region='domNode'}
   */
  bootstrap<C>(component: Type<C>, rootSelectorOrNode?: string|any): ComponentRef<C>;

  /**
   * Bootstrap a component onto the element identified by its selector or, optionally, to a
   * specified element.
   *
   * @usageNotes
   * ### Bootstrap process
   *
   * When bootstrapping a component, Angular mounts it onto a target DOM element
   * and kicks off automatic change detection. The target DOM element can be
   * provided using the `rootSelectorOrNode` argument.
   *
   * If the target DOM element is not provided, Angular tries to find one on a page
   * using the `selector` of the component that is being bootstrapped
   * (first matched element is used).
   *
   * ### Example
   *
   * Generally, we define the component to bootstrap in the `bootstrap` array of `NgModule`,
   * but it requires us to know the component while writing the application code.
   *
   * Imagine a situation where we have to wait for an API call to decide about the component to
   * bootstrap. We can use the `ngDoBootstrap` hook of the `NgModule` and call this method to
   * dynamically bootstrap a component.
   *
   * {@example core/ts/platform/platform.ts region='componentSelector'}
   *
   * Optionally, a component can be mounted onto a DOM element that does not match the
   * selector of the bootstrapped component.
   *
   * In the following example, we are providing a CSS selector to match the target element.
   *
   * {@example core/ts/platform/platform.ts region='cssSelector'}
   *
   * While in this example, we are providing reference to a DOM node.
   *
   * {@example core/ts/platform/platform.ts region='domNode'}
   *
   * @deprecated Passing Component factories as the `Application.bootstrap` function argument is
   *     deprecated. Pass Component Types instead.
   */
  bootstrap<C>(componentFactory: ComponentFactory<C>, rootSelectorOrNode?: string|any):
      ComponentRef<C>;

  /**
   * Bootstrap a component onto the element identified by its selector or, optionally, to a
   * specified element.
   *
   * @usageNotes
   * ### Bootstrap process
   *
   * When bootstrapping a component, Angular mounts it onto a target DOM element
   * and kicks off automatic change detection. The target DOM element can be
   * provided using the `rootSelectorOrNode` argument.
   *
   * If the target DOM element is not provided, Angular tries to find one on a page
   * using the `selector` of the component that is being bootstrapped
   * (first matched element is used).
   *
   * ### Example
   *
   * Generally, we define the component to bootstrap in the `bootstrap` array of `NgModule`,
   * but it requires us to know the component while writing the application code.
   *
   * Imagine a situation where we have to wait for an API call to decide about the component to
   * bootstrap. We can use the `ngDoBootstrap` hook of the `NgModule` and call this method to
   * dynamically bootstrap a component.
   *
   * {@example core/ts/platform/platform.ts region='componentSelector'}
   *
   * Optionally, a component can be mounted onto a DOM element that does not match the
   * selector of the bootstrapped component.
   *
   * In the following example, we are providing a CSS selector to match the target element.
   *
   * {@example core/ts/platform/platform.ts region='cssSelector'}
   *
   * While in this example, we are providing reference to a DOM node.
   *
   * {@example core/ts/platform/platform.ts region='domNode'}
   */
  bootstrap<C>(componentOrFactory: ComponentFactory<C>|Type<C>, rootSelectorOrNode?: string|any):
      ComponentRef<C> {
    NG_DEV_MODE && this.warnIfDestroyed();
    const isComponentFactory = componentOrFactory instanceof ComponentFactory;
    const initStatus = this._injector.get(ApplicationInitStatus);

    if (!initStatus.done) {
      const standalone = !isComponentFactory && isStandalone(componentOrFactory);
      const errorMessage =
          'Cannot bootstrap as there are still asynchronous initializers running.' +
          (standalone ? '' :
                        ' Bootstrap components in the `ngDoBootstrap` method of the root module.');
      throw new RuntimeError(
          RuntimeErrorCode.ASYNC_INITIALIZERS_STILL_RUNNING, NG_DEV_MODE && errorMessage);
    }

    let componentFactory: ComponentFactory<C>;
    if (isComponentFactory) {
      componentFactory = componentOrFactory;
    } else {
      const resolver = this._injector.get(ComponentFactoryResolver);
      componentFactory = resolver.resolveComponentFactory(componentOrFactory)!;
    }
    this.componentTypes.push(componentFactory.componentType);

    // Create a factory associated with the current module if it's not bound to some other
    const ngModule =
        isBoundToModule(componentFactory) ? undefined : this._injector.get(NgModuleRef);
    const selectorOrNode = rootSelectorOrNode || componentFactory.selector;
    const compRef = componentFactory.create(Injector.NULL, [], selectorOrNode, ngModule);
    const nativeElement = compRef.location.nativeElement;
    const testability = compRef.injector.get(TESTABILITY, null);
    testability?.registerApplication(nativeElement);

    compRef.onDestroy(() => {
      this.detachView(compRef.hostView);
      remove(this.components, compRef);
      testability?.unregisterApplication(nativeElement);
    });

    this._loadComponent(compRef);
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      const _console = this._injector.get(Console);
      _console.log(
          `Angular is running in development mode. Call enableProdMode() to enable production mode.`);
    }
    return compRef;
  }

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
  tick(): void {
    NG_DEV_MODE && this.warnIfDestroyed();
    if (this._runningTick) {
      throw new RuntimeError(
          RuntimeErrorCode.RECURSIVE_APPLICATION_REF_TICK,
          ngDevMode && 'ApplicationRef.tick is called recursively');
    }

    try {
      this._runningTick = true;
      for (let view of this._views) {
        view.detectChanges();
      }
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        for (let view of this._views) {
          view.checkNoChanges();
        }
      }
    } catch (e) {
      // Attention: Don't rethrow as it could cancel subscriptions to Observables!
      this._zone.runOutsideAngular(() => this._exceptionHandler.handleError(e));
    } finally {
      this._runningTick = false;
    }
  }

  /**
   * Attaches a view so that it will be dirty checked.
   * The view will be automatically detached when it is destroyed.
   * This will throw if the view is already attached to a ViewContainer.
   */
  attachView(viewRef: ViewRef): void {
    NG_DEV_MODE && this.warnIfDestroyed();
    const view = (viewRef as InternalViewRef);
    this._views.push(view);
    view.attachToAppRef(this);
  }

  /**
   * Detaches a view from dirty checking again.
   */
  detachView(viewRef: ViewRef): void {
    NG_DEV_MODE && this.warnIfDestroyed();
    const view = (viewRef as InternalViewRef);
    remove(this._views, view);
    view.detachFromAppRef();
  }

  private _loadComponent(componentRef: ComponentRef<any>): void {
    this.attachView(componentRef.hostView);
    this.tick();
    this.components.push(componentRef);
    // Get the listeners lazily to prevent DI cycles.
    const listeners = this._injector.get(APP_BOOTSTRAP_LISTENER, []);
    if (ngDevMode && !Array.isArray(listeners)) {
      throw new RuntimeError(
          RuntimeErrorCode.INVALID_MULTI_PROVIDER,
          'Unexpected type of the `APP_BOOTSTRAP_LISTENER` token value ' +
              `(expected an array, but got ${typeof listeners}). ` +
              'Please check that the `APP_BOOTSTRAP_LISTENER` token is configured as a ' +
              '`multi: true` provider.');
    }
    listeners.push(...this._bootstrapListeners);
    listeners.forEach((listener) => listener(componentRef));
  }

  /** @internal */
  ngOnDestroy() {
    if (this._destroyed) return;

    try {
      // Call all the lifecycle hooks.
      this._destroyListeners.forEach(listener => listener());

      // Destroy all registered views.
      this._views.slice().forEach((view) => view.destroy());
      this._onMicrotaskEmptySubscription.unsubscribe();
    } finally {
      // Indicate that this instance is destroyed.
      this._destroyed = true;

      // Release all references.
      this._views = [];
      this._bootstrapListeners = [];
      this._destroyListeners = [];
    }
  }

  /**
   * Registers a listener to be called when an instance is destroyed.
   *
   * @param callback A callback function to add as a listener.
   * @returns A function which unregisters a listener.
   *
   * @internal
   */
  onDestroy(callback: () => void): VoidFunction {
    NG_DEV_MODE && this.warnIfDestroyed();
    this._destroyListeners.push(callback);
    return () => remove(this._destroyListeners, callback);
  }

  /**
   * Destroys an Angular application represented by this `ApplicationRef`. Calling this function
   * will destroy the associated environment injectors as well as all the bootstrapped components
   * with their views.
   */
  destroy(): void {
    if (this._destroyed) {
      throw new RuntimeError(
          RuntimeErrorCode.APPLICATION_REF_ALREADY_DESTROYED,
          ngDevMode && 'This instance of the `ApplicationRef` has already been destroyed.');
    }

    // This is a temporary type to represent an instance of an R3Injector, which can be destroyed.
    // The type will be replaced with a different one once destroyable injector type is available.
    type DestroyableInjector = Injector&{destroy?: Function, destroyed?: boolean};

    const injector = this._injector as DestroyableInjector;

    // Check that this injector instance supports destroy operation.
    if (injector.destroy && !injector.destroyed) {
      // Destroying an underlying injector will trigger the `ngOnDestroy` lifecycle
      // hook, which invokes the remaining cleanup actions.
      injector.destroy();
    }
  }

  /**
   * Returns the number of attached views.
   */
  get viewCount() {
    return this._views.length;
  }

  private warnIfDestroyed() {
    if (NG_DEV_MODE && this._destroyed) {
      console.warn(formatRuntimeError(
          RuntimeErrorCode.APPLICATION_REF_ALREADY_DESTROYED,
          'This instance of the `ApplicationRef` has already been destroyed.'));
    }
  }
}

function remove<T>(list: T[], el: T): void {
  const index = list.indexOf(el);
  if (index > -1) {
    list.splice(index, 1);
  }
}

function _lastDefined<T>(args: T[]): T|undefined {
  for (let i = args.length - 1; i >= 0; i--) {
    if (args[i] !== undefined) {
      return args[i];
    }
  }
  return undefined;
}

function _mergeArrays(parts: any[][]): any[] {
  const result: any[] = [];
  parts.forEach((part) => part && result.push(...part));
  return result;
}
