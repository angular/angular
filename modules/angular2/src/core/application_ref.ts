import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {Type, isBlank, isPresent, assertionsEnabled} from 'angular2/src/core/facade/lang';
import {provide, Provider, Injector, OpaqueToken} from 'angular2/src/core/di';
import {
  APP_COMPONENT_REF_PROMISE,
  APP_COMPONENT,
  APP_ID_RANDOM_PROVIDER
} from './application_tokens';
import {Promise, PromiseWrapper, PromiseCompleter} from 'angular2/src/core/facade/async';
import {ListWrapper} from 'angular2/src/core/facade/collection';
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
} from 'angular2/src/core/facade/exceptions';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {internalView} from 'angular2/src/core/linker/view_ref';
import {LifeCycle, LifeCycle_} from 'angular2/src/core/life_cycle/life_cycle';
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
import {DEFAULT_PIPES} from 'angular2/src/core/pipes';
import {ViewResolver} from './linker/view_resolver';
import {DirectiveResolver} from './linker/directive_resolver';
import {PipeResolver} from './linker/pipe_resolver';
import {Compiler} from 'angular2/src/core/linker/compiler';
import {DynamicComponentLoader_} from "./linker/dynamic_component_loader";
import {AppViewManager_} from "./linker/view_manager";
import {Compiler_} from "./linker/compiler";

/**
 * Constructs the set of providers meant for use at the platform level.
 *
 * These are providers that should be singletons shared among all Angular applications
 * running on the page.
 */
export function platformBindings(): Array<Type | Provider | any[]> {
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
              useFactory: (dynamicComponentLoader, injector: Injector) => {
                // TODO(rado): investigate whether to support bindings on root component.
                return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector)
                    .then((componentRef) => {
                      if (isPresent(componentRef.location.nativeElement)) {
                        injector.get(TestabilityRegistry)
                            .registerApplication(componentRef.location.nativeElement,
                                                 injector.get(Testability));
                      }
                      return componentRef;
                    });
              },
              deps: [DynamicComponentLoader, Injector]
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
export function applicationCommonBindings(): Array<Type | Provider | any[]> {
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
    DEFAULT_PIPES,
    provide(IterableDiffers, {useValue: defaultIterableDiffers}),
    provide(KeyValueDiffers, {useValue: defaultKeyValueDiffers}),
    DirectiveResolver,
    PipeResolver,
    provide(DynamicComponentLoader, {useClass: DynamicComponentLoader_}),
    provide(LifeCycle,
            {
              useFactory: (exceptionHandler) => new LifeCycle_(null, assertionsEnabled()),
              deps: [ExceptionHandler]
            })
  ];
}

/**
 * Create an Angular zone.
 */
export function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: assertionsEnabled()});
}

var _platform: PlatformRef;

export function platformCommon(bindings?: Array<Type | Provider | any[]>, initializer?: () => void):
    PlatformRef {
  if (isPresent(_platform)) {
    if (isBlank(bindings)) {
      return _platform;
    }
    throw "platform() can only be called once per page";
  }

  if (isPresent(initializer)) {
    initializer();
  }

  if (isBlank(bindings)) {
    bindings = platformBindings();
  }
  _platform = new PlatformRef_(Injector.resolveAndCreate(bindings), () => { _platform = null; });
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
   * Retrieve the platform {@link Injector}, which is the parent injector for
   * every Angular application on the page and provides singleton providers.
   */
  get injector(): Injector { return unimplemented(); };

  /**
   * Instantiate a new Angular application on the page.
   *
   * # What is an application?
   *
   * Each Angular application has its own zone, change detection, compiler,
   * renderer, and other framework components. An application hosts one or more
   * root components, which can be initialized via `ApplicationRef.bootstrap()`.
   *
   * # Application Bindings
   *
   * Angular applications require numerous providers to be properly instantiated.
   * When using `application()` to create a new app on the page, these providers
   * must be provided. Fortunately, there are helper functions to configure
   * typical providers, as shown in the example below.
   *
   * # Example
   * ```
   * var myAppBindings = [MyAppService];
   *
   * platform()
   *   .application([applicationCommonBindings(), applicationDomBindings(), myAppBindings])
   *   .bootstrap(MyTopLevelComponent);
   * ```
   * # See Also
   *
   * See the {@link bootstrap} documentation for more details.
   */
  abstract application(bindings: Array<Type | Provider | any[]>): ApplicationRef;

  /**
   * Instantiate a new Angular application on the page, using providers which
   * are only available asynchronously. One such use case is to initialize an
   * application running in a web worker.
   *
   * # Usage
   *
   * `bindingFn` is a function that will be called in the new application's zone.
   * It should return a `Promise` to a list of providers to be used for the
   * new application. Once this promise resolves, the application will be
   * constructed in the same manner as a normal `application()`.
   */
  abstract asyncApplication(bindingFn: (zone: NgZone) => Promise<Array<Type | Provider | any[]>>):
      Promise<ApplicationRef>;

  /**
   * Destroy the Angular platform and all Angular applications on the page.
   */
  abstract dispose(): void;
}

export class PlatformRef_ extends PlatformRef {
  /** @internal */
  _applications: ApplicationRef[] = [];

  constructor(private _injector: Injector, private _dispose: () => void) { super(); }

  get injector(): Injector { return this._injector; }

  application(bindings: Array<Type | Provider | any[]>): ApplicationRef {
    var app = this._initApp(createNgZone(), bindings);
    return app;
  }

  asyncApplication(bindingFn: (zone: NgZone) =>
                       Promise<Array<Type | Provider | any[]>>): Promise<ApplicationRef> {
    var zone = createNgZone();
    var completer = PromiseWrapper.completer();
    zone.run(() => {
      PromiseWrapper.then(bindingFn(zone), (bindings: Array<Type | Provider | any[]>) => {
        completer.resolve(this._initApp(zone, bindings));
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
   * Bootstrap a new component at the root level of the application.
   *
   * # Bootstrap process
   *
   * When bootstrapping a new root component into an application, Angular mounts the
   * specified application component onto DOM elements identified by the [componentType]'s
   * selector and kicks off automatic change detection to finish initializing the component.
   *
   * # Optional Bindings
   *
   * Bindings for the given component can optionally be overridden via the `providers`
   * parameter. These providers will only apply for the root component being added and any
   * child components under it.
   *
   * # Example
   * ```
   * var app = platform.application([applicationCommonBindings(), applicationDomBindings()];
   * app.bootstrap(FirstRootComponent);
   * app.bootstrap(SecondRootComponent, [provide(OverrideBinding, {useClass: OverriddenBinding})]);
   * ```
   */
  abstract bootstrap(componentType: Type, bindings?: Array<Type | Provider | any[]>):
      Promise<ComponentRef>;

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
   * Get a list of component types registered to this application.
   */
  get componentTypes(): Type[] { return unimplemented(); };
}

export class ApplicationRef_ extends ApplicationRef {
  private _bootstrapListeners: Function[] = [];
  private _rootComponents: ComponentRef[] = [];
  private _rootComponentTypes: Type[] = [];

  constructor(private _platform: PlatformRef_, private _zone: NgZone, private _injector: Injector) {
    super();
  }

  registerBootstrapListener(listener: (ref: ComponentRef) => void): void {
    this._bootstrapListeners.push(listener);
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
          var appChangeDetector = internalView(componentRef.hostView).changeDetector;
          var lc = injector.get(LifeCycle);
          lc.registerWith(this._zone, appChangeDetector);
          lc.tick();
          completer.resolve(componentRef);
          this._rootComponents.push(componentRef);
          this._bootstrapListeners.forEach((listener) => listener(componentRef));
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

  get injector(): Injector { return this._injector; }

  get zone(): NgZone { return this._zone; }

  dispose(): void {
    // TODO(alxhub): Dispose of the NgZone.
    this._rootComponents.forEach((ref) => ref.dispose());
    this._platform._applicationDisposed(this);
  }

  get componentTypes(): any[] { return this._rootComponentTypes; }
}
