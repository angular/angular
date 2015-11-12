import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {Type, isBlank, isPresent, assertionsEnabled} from 'angular2/src/facade/lang';
import {provide, Provider, Injector, OpaqueToken} from 'angular2/src/core/di';
import {
  APP_COMPONENT_REF_PROMISE,
  APP_COMPONENT,
  APP_ID_RANDOM_PROVIDER
} from './application_tokens';
import {
  Promise,
  PromiseWrapper,
  PromiseCompleter,
  ObservableWrapper
} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';
import {Reflector, reflector} from 'angular2/src/core/reflection/reflection';
import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';
import {
  ComponentRef,
  DynamicComponentLoader
} from 'angular2/src/core/linker/dynamic_component_loader';
import {
  BaseException,
  WrappedException,
  ExceptionHandler,
  unimplemented
} from 'angular2/src/facade/exceptions';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {internalView} from 'angular2/src/core/linker/view_ref';
import {
  IterableDiffers,
  defaultIterableDiffers,
  KeyValueDiffers,
  defaultKeyValueDiffers
} from 'angular2/src/core/change_detection/change_detection';
import {AppViewPool, APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/linker/view_pool';
import {AppViewManager} from 'angular2/src/core/linker/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/linker/view_manager_utils';
import {AppViewListener} from 'angular2/src/core/linker/view_listener';
import {ProtoViewFactory} from './linker/proto_view_factory';
import {ViewResolver} from './linker/view_resolver';
import {DirectiveResolver} from './linker/directive_resolver';
import {PipeResolver} from './linker/pipe_resolver';
import {Compiler} from 'angular2/src/core/linker/compiler';
import {DynamicComponentLoader_} from "./linker/dynamic_component_loader";
import {AppViewManager_} from "./linker/view_manager";
import {Compiler_} from "./linker/compiler";
import {wtfLeave, wtfCreateScope, WtfScopeFn} from './profile/profile';
import {ChangeDetectorRef} from 'angular2/src/core/change_detection/change_detector_ref';
import {PLATFORM_DIRECTIVES, PLATFORM_PIPES} from "angular2/src/core/platform_directives_and_pipes";
import {lockDevMode} from 'angular2/src/facade/lang';
import {COMMON_DIRECTIVES, COMMON_PIPES} from "angular2/common";

/**
 * Constructs the set of providers meant for use at the platform level.
 *
 * These are providers that should be singletons shared among all Angular applications
 * running on the page.
 */
export function platformProviders(): Array<Type | Provider | any[]> {
  return [provide(Reflector, {useValue: reflector}), TestabilityRegistry];
}

/**
 * Construct providers specific to an individual root component.
 */
function _componentProviders(appComponentType: Type): Array<Type | Provider | any[]> {
  return [
    provide(APP_COMPONENT, {useValue: appComponentType}),
    provide(APP_COMPONENT_REF_PROMISE,
            {
              useFactory: (dynamicComponentLoader: DynamicComponentLoader, appRef: ApplicationRef_,
                           injector: Injector) => {
                // Save the ComponentRef for disposal later.
                var ref: ComponentRef;
                // TODO(rado): investigate whether to support providers on root component.
                return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector,
                                                         () => { appRef._unloadComponent(ref); })
                    .then((componentRef) => {
                      ref = componentRef;
                      if (isPresent(componentRef.location.nativeElement)) {
                        injector.get(TestabilityRegistry)
                            .registerApplication(componentRef.location.nativeElement,
                                                 injector.get(Testability));
                      }
                      return componentRef;
                    });
              },
              deps: [DynamicComponentLoader, ApplicationRef, Injector]
            }),
    provide(appComponentType,
            {
              useFactory: (p: Promise<any>) => p.then(ref => ref.instance),
              deps: [APP_COMPONENT_REF_PROMISE]
            }),
  ];
}

/**
 * Construct a default set of providers which should be included in any Angular
 * application, regardless of whether it runs on the UI thread or in a web worker.
 */
export function applicationCommonProviders(): Array<Type | Provider | any[]> {
  return [
    provide(Compiler, {useClass: Compiler_}),
    APP_ID_RANDOM_PROVIDER,
    AppViewPool,
    provide(APP_VIEW_POOL_CAPACITY, {useValue: 10000}),
    provide(AppViewManager, {useClass: AppViewManager_}),
    AppViewManagerUtils,
    AppViewListener,
    ProtoViewFactory,
    ViewResolver,
    provide(IterableDiffers, {useValue: defaultIterableDiffers}),
    provide(KeyValueDiffers, {useValue: defaultKeyValueDiffers}),
    DirectiveResolver,
    PipeResolver,
    provide(PLATFORM_PIPES, {useValue: COMMON_PIPES, multi: true}),
    provide(PLATFORM_DIRECTIVES, {useValue: COMMON_DIRECTIVES, multi: true}),
    provide(DynamicComponentLoader, {useClass: DynamicComponentLoader_})
  ];
}

/**
 * Create an Angular zone.
 */
export function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: assertionsEnabled()});
}

var _platform: PlatformRef;

export function platformCommon(providers?: Array<Type | Provider | any[]>,
                               initializer?: () => void): PlatformRef {
  lockDevMode();
  if (isPresent(_platform)) {
    if (isBlank(providers)) {
      return _platform;
    }
    throw "platform() can only be called once per page";
  }

  if (isPresent(initializer)) {
    initializer();
  }

  if (isBlank(providers)) {
    providers = platformProviders();
  }
  _platform = new PlatformRef_(Injector.resolveAndCreate(providers), () => { _platform = null; });
  return _platform;
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
  get injector(): Injector { return unimplemented(); };

  /**
   * Instantiate a new Angular application on the page.
   *
   *##What is an application?
   *
   * Each Angular application has its own zone, change detection, compiler,
   * renderer, and other framework components. An application hosts one or more
   * root components, which can be initialized via `ApplicationRef.bootstrap()`.
   *
   *##Application Providers
   *
   * Angular applications require numerous providers to be properly instantiated.
   * When using `application()` to create a new app on the page, these providers
   * must be provided. Fortunately, there are helper functions to configure
   * typical providers, as shown in the example below.
   *
   * ### Example
   * ```
   * var myAppProviders = [MyAppService];
   *
   * platform()
   *   .application([applicationCommonProviders(), applicationDomProviders(), myAppProviders])
   *   .bootstrap(MyTopLevelComponent);
   * ```
   *##See Also
   *
   * See the {@link bootstrap} documentation for more details.
   */
  abstract application(providers: Array<Type | Provider | any[]>): ApplicationRef;

  /**
   * Instantiate a new Angular application on the page, using providers which
   * are only available asynchronously. One such use case is to initialize an
   * application running in a web worker.
   *
   *##Usage
   *
   * `bindingFn` is a function that will be called in the new application's zone.
   * It should return a `Promise` to a list of providers to be used for the
   * new application. Once this promise resolves, the application will be
   * constructed in the same manner as a normal `application()`.
   */
  abstract asyncApplication(bindingFn: (zone: NgZone) =>
                                Promise<Array<Type | Provider | any[]>>): Promise<ApplicationRef>;

  /**
   * Destroy the Angular platform and all Angular applications on the page.
   */
  abstract dispose(): void;
}

export class PlatformRef_ extends PlatformRef {
  /** @internal */
  _applications: ApplicationRef[] = [];
  /** @internal */
  _disposeListeners: Function[] = [];

  constructor(private _injector: Injector, private _dispose: () => void) { super(); }

  registerDisposeListener(dispose: () => void): void { this._disposeListeners.push(dispose); }

  get injector(): Injector { return this._injector; }

  application(providers: Array<Type | Provider | any[]>): ApplicationRef {
    var app = this._initApp(createNgZone(), providers);
    return app;
  }

  asyncApplication(bindingFn: (zone: NgZone) => Promise<Array<Type | Provider | any[]>>):
      Promise<ApplicationRef> {
    var zone = createNgZone();
    var completer = PromiseWrapper.completer();
    zone.run(() => {
      PromiseWrapper.then(bindingFn(zone), (providers: Array<Type | Provider | any[]>) => {
        completer.resolve(this._initApp(zone, providers));
      });
    });
    return completer.promise;
  }

  private _initApp(zone: NgZone, providers: Array<Type | Provider | any[]>): ApplicationRef {
    var injector: Injector;
    var app: ApplicationRef;
    zone.run(() => {
      providers.push(provide(NgZone, {useValue: zone}));
      providers.push(provide(ApplicationRef, {useFactory: (): ApplicationRef => app, deps: []}));

      var exceptionHandler;
      try {
        injector = this.injector.resolveAndCreateChild(providers);
        exceptionHandler = injector.get(ExceptionHandler);
        zone.overrideOnErrorHandler((e, s) => exceptionHandler.call(e, s));
      } catch (e) {
        if (isPresent(exceptionHandler)) {
          exceptionHandler.call(e, e.stack);
        } else {
          DOM.logError(e);
        }
      }
    });
    app = new ApplicationRef_(this, zone, injector);
    this._applications.push(app);
    return app;
  }

  dispose(): void {
    this._applications.forEach((app) => app.dispose());
    this._disposeListeners.forEach((dispose) => dispose());
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
   *##Bootstrap process
   *
   * When bootstrapping a new root component into an application, Angular mounts the
   * specified application component onto DOM elements identified by the [componentType]'s
   * selector and kicks off automatic change detection to finish initializing the component.
   *
   *##Optional Providers
   *
   * Providers for the given component can optionally be overridden via the `providers`
   * parameter. These providers will only apply for the root component being added and any
   * child components under it.
   *
   * ### Example
   * ```
   * var app = platform.application([applicationCommonProviders(), applicationDomProviders()];
   * app.bootstrap(FirstRootComponent);
   * app.bootstrap(SecondRootComponent, [provide(OverrideBinding, {useClass: OverriddenBinding})]);
   * ```
   */
  abstract bootstrap(componentType: Type,
                     providers?: Array<Type | Provider | any[]>): Promise<ComponentRef>;

  /**
   * Retrieve the application {@link Injector}.
   */
  get injector(): Injector { return unimplemented(); };

  /**
   * Retrieve the application {@link NgZone}.
   */
  get zone(): NgZone { return unimplemented(); };

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
  get componentTypes(): Type[] { return unimplemented(); };
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
      ObservableWrapper.subscribe(this._zone.onTurnDone,
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

  bootstrap(componentType: Type,
            providers?: Array<Type | Provider | any[]>): Promise<ComponentRef> {
    var completer = PromiseWrapper.completer();
    this._zone.run(() => {
      var componentProviders = _componentProviders(componentType);
      if (isPresent(providers)) {
        componentProviders.push(providers);
      }
      var exceptionHandler = this._injector.get(ExceptionHandler);
      this._rootComponentTypes.push(componentType);
      try {
        var injector: Injector = this._injector.resolveAndCreateChild(componentProviders);
        var compRefToken: Promise<ComponentRef> = injector.get(APP_COMPONENT_REF_PROMISE);
        var tick = (componentRef) => {
          this._loadComponent(componentRef);
          completer.resolve(componentRef);
        };

        var tickResult = PromiseWrapper.then(compRefToken, tick);

        PromiseWrapper.then(tickResult, (_) => {});
        PromiseWrapper.then(tickResult, null,
                            (err, stackTrace) => completer.reject(err, stackTrace));
      } catch (e) {
        exceptionHandler.call(e, e.stack);
        completer.reject(e, e.stack);
      }
    });
    return completer.promise;
  }

  /** @internal */
  _loadComponent(ref): void {
    var appChangeDetector = internalView(ref.hostView).changeDetector;
    this._changeDetectorRefs.push(appChangeDetector.ref);
    this.tick();
    this._rootComponents.push(ref);
    this._bootstrapListeners.forEach((listener) => listener(ref));
  }

  /** @internal */
  _unloadComponent(ref): void {
    if (!ListWrapper.contains(this._rootComponents, ref)) {
      return;
    }
    this.unregisterChangeDetector(internalView(ref.hostView).changeDetector.ref);
    ListWrapper.remove(this._rootComponents, ref);
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
    this._rootComponents.forEach((ref) => ref.dispose());
    this._disposeListeners.forEach((dispose) => dispose());
    this._platform._applicationDisposed(this);
  }

  get componentTypes(): any[] { return this._rootComponentTypes; }
}
