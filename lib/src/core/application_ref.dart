library angular2.src.core.application_ref;

import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;
import "package:angular2/src/facade/lang.dart"
    show Type, isBlank, isPresent, assertionsEnabled;
import "package:angular2/src/core/di.dart"
    show provide, Provider, Injector, OpaqueToken;
import "application_tokens.dart"
    show APP_COMPONENT_REF_PROMISE, APP_COMPONENT, APP_ID_RANDOM_PROVIDER;
import "package:angular2/src/facade/async.dart"
    show Future, PromiseWrapper, PromiseCompleter, ObservableWrapper;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/core/reflection/reflection.dart"
    show Reflector, reflector;
import "package:angular2/src/core/testability/testability.dart"
    show TestabilityRegistry, Testability;
import "package:angular2/src/core/linker/dynamic_component_loader.dart"
    show ComponentRef, DynamicComponentLoader;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException, ExceptionHandler, unimplemented;
import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/core/linker/view_ref.dart" show internalView;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show
        IterableDiffers,
        defaultIterableDiffers,
        KeyValueDiffers,
        defaultKeyValueDiffers;
import "package:angular2/src/core/linker/view_pool.dart"
    show AppViewPool, APP_VIEW_POOL_CAPACITY;
import "package:angular2/src/core/linker/view_manager.dart" show AppViewManager;
import "package:angular2/src/core/linker/view_manager_utils.dart"
    show AppViewManagerUtils;
import "package:angular2/src/core/linker/view_listener.dart"
    show AppViewListener;
import "linker/proto_view_factory.dart" show ProtoViewFactory;
import "linker/view_resolver.dart" show ViewResolver;
import "linker/directive_resolver.dart" show DirectiveResolver;
import "linker/pipe_resolver.dart" show PipeResolver;
import "package:angular2/src/core/linker/compiler.dart" show Compiler;
import "linker/dynamic_component_loader.dart" show DynamicComponentLoader_;
import "linker/view_manager.dart" show AppViewManager_;
import "linker/compiler.dart" show Compiler_;
import "profile/profile.dart" show wtfLeave, wtfCreateScope, WtfScopeFn;
import "package:angular2/src/core/change_detection/change_detector_ref.dart"
    show ChangeDetectorRef;
import "package:angular2/src/core/ambient.dart"
    show AMBIENT_DIRECTIVES, AMBIENT_PIPES;
import "package:angular2/src/facade/lang.dart" show lockDevMode;
import "package:angular2/common.dart" show COMMON_DIRECTIVES, COMMON_PIPES;

/**
 * Constructs the set of providers meant for use at the platform level.
 *
 * These are providers that should be singletons shared among all Angular applications
 * running on the page.
 */
List<dynamic /* Type | Provider | List < dynamic > */ > platformProviders() {
  return [provide(Reflector, useValue: reflector), TestabilityRegistry];
}

/**
 * Construct providers specific to an individual root component.
 */
List<dynamic /* Type | Provider | List < dynamic > */ > _componentProviders(
    Type appComponentType) {
  return [
    provide(APP_COMPONENT, useValue: appComponentType),
    provide(APP_COMPONENT_REF_PROMISE,
        useFactory: (dynamicComponentLoader, Injector injector) {
      // TODO(rado): investigate whether to support providers on root component.
      return dynamicComponentLoader
          .loadAsRoot(appComponentType, null, injector)
          .then((componentRef) {
        if (isPresent(componentRef.location.nativeElement)) {
          injector.get(TestabilityRegistry).registerApplication(
              componentRef.location.nativeElement, injector.get(Testability));
        }
        return componentRef;
      });
    }, deps: [DynamicComponentLoader, Injector]),
    provide(appComponentType,
        useFactory: (Future<dynamic> p) => p.then((ref) => ref.instance),
        deps: [APP_COMPONENT_REF_PROMISE])
  ];
}

/**
 * Construct a default set of providers which should be included in any Angular
 * application, regardless of whether it runs on the UI thread or in a web worker.
 */
List<
    dynamic /* Type | Provider | List < dynamic > */ > applicationCommonProviders() {
  return [
    provide(Compiler, useClass: Compiler_),
    APP_ID_RANDOM_PROVIDER,
    AppViewPool,
    provide(APP_VIEW_POOL_CAPACITY, useValue: 10000),
    provide(AppViewManager, useClass: AppViewManager_),
    AppViewManagerUtils,
    AppViewListener,
    ProtoViewFactory,
    ViewResolver,
    provide(IterableDiffers, useValue: defaultIterableDiffers),
    provide(KeyValueDiffers, useValue: defaultKeyValueDiffers),
    DirectiveResolver,
    PipeResolver,
    provide(AMBIENT_PIPES, useValue: COMMON_PIPES, multi: true),
    provide(AMBIENT_DIRECTIVES, useValue: COMMON_DIRECTIVES, multi: true),
    provide(DynamicComponentLoader, useClass: DynamicComponentLoader_)
  ];
}

/**
 * Create an Angular zone.
 */
NgZone createNgZone() {
  return new NgZone(enableLongStackTrace: assertionsEnabled());
}

PlatformRef _platform;
PlatformRef platformCommon(
    [List<dynamic /* Type | Provider | List < dynamic > */ > providers,
    dynamic /* () => void */ initializer]) {
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
  _platform = new PlatformRef_(Injector.resolveAndCreate(providers), () {
    _platform = null;
  });
  return _platform;
}

/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when [bootstrap]() is called, or
 * explicitly by calling [platform]().
 */
abstract class PlatformRef {
  /**
   * Register a listener to be called when the platform is disposed.
   */
  void registerDisposeListener(dynamic /* () => void */ dispose);
  /**
   * Retrieve the platform [Injector], which is the parent injector for
   * every Angular application on the page and provides singleton providers.
   */
  Injector get injector {
    return unimplemented();
  }

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
   * See the [bootstrap] documentation for more details.
   */
  ApplicationRef application(
      List<dynamic /* Type | Provider | List < dynamic > */ > providers);
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
  Future<ApplicationRef> asyncApplication(
      dynamic /* (zone: NgZone) =>
                                Promise<Array<Type | Provider | any[]>> */
      bindingFn);
  /**
   * Destroy the Angular platform and all Angular applications on the page.
   */
  void dispose();
}

class PlatformRef_ extends PlatformRef {
  Injector _injector;
  dynamic /* () => void */ _dispose;
  /** @internal */
  List<ApplicationRef> _applications = [];
  /** @internal */
  List<Function> _disposeListeners = [];
  PlatformRef_(this._injector, this._dispose) : super() {
    /* super call moved to initializer */;
  }
  void registerDisposeListener(dynamic /* () => void */ dispose) {
    this._disposeListeners.add(dispose);
  }

  Injector get injector {
    return this._injector;
  }

  ApplicationRef application(
      List<dynamic /* Type | Provider | List < dynamic > */ > providers) {
    var app = this._initApp(createNgZone(), providers);
    return app;
  }

  Future<ApplicationRef> asyncApplication(
      dynamic /* (zone: NgZone) => Promise<Array<Type | Provider | any[]>> */ bindingFn) {
    var zone = createNgZone();
    var completer = PromiseWrapper.completer();
    zone.run(() {
      PromiseWrapper.then(bindingFn(zone),
          (List<dynamic /* Type | Provider | List < dynamic > */ > providers) {
        completer.resolve(this._initApp(zone, providers));
      });
    });
    return completer.promise;
  }

  ApplicationRef _initApp(NgZone zone,
      List<dynamic /* Type | Provider | List < dynamic > */ > providers) {
    Injector injector;
    ApplicationRef app;
    zone.run(() {
      providers.add(provide(NgZone, useValue: zone));
      providers.add(provide(ApplicationRef, useFactory: () => app, deps: []));
      var exceptionHandler;
      try {
        injector = this.injector.resolveAndCreateChild(providers);
        exceptionHandler = injector.get(ExceptionHandler);
        zone.overrideOnErrorHandler((e, s) => exceptionHandler.call(e, s));
      } catch (e, e_stack) {
        if (isPresent(exceptionHandler)) {
          exceptionHandler.call(e, e_stack);
        } else {
          DOM.logError(e);
        }
      }
    });
    app = new ApplicationRef_(this, zone, injector);
    this._applications.add(app);
    return app;
  }

  void dispose() {
    this._applications.forEach((app) => app.dispose());
    this._disposeListeners.forEach((dispose) => dispose());
    this._dispose();
  }

  /** @internal */
  void _applicationDisposed(ApplicationRef app) {
    ListWrapper.remove(this._applications, app);
  }
}

/**
 * A reference to an Angular application running on a page.
 *
 * For more about Angular applications, see the documentation for [bootstrap].
 */
abstract class ApplicationRef {
  /**
   * Register a listener to be called each time `bootstrap()` is called to bootstrap
   * a new root component.
   */
  void registerBootstrapListener(
      dynamic /* (ref: ComponentRef) => void */ listener);
  /**
   * Register a listener to be called when the application is disposed.
   */
  void registerDisposeListener(dynamic /* () => void */ dispose);
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
  Future<ComponentRef> bootstrap(Type componentType,
      [List<dynamic /* Type | Provider | List < dynamic > */ > providers]);
  /**
   * Retrieve the application [Injector].
   */
  Injector get injector {
    return unimplemented();
  }

  /**
   * Retrieve the application [NgZone].
   */
  NgZone get zone {
    return unimplemented();
  }

  /**
   * Dispose of this application and all of its components.
   */
  void dispose();
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
  void tick();
  /**
   * Get a list of component types registered to this application.
   */
  List<Type> get componentTypes {
    return unimplemented();
  }
}

class ApplicationRef_ extends ApplicationRef {
  PlatformRef_ _platform;
  NgZone _zone;
  Injector _injector;
  /** @internal */
  static WtfScopeFn _tickScope = wtfCreateScope("ApplicationRef#tick()");
  /** @internal */
  List<Function> _bootstrapListeners = [];
  /** @internal */
  List<Function> _disposeListeners = [];
  /** @internal */
  List<ComponentRef> _rootComponents = [];
  /** @internal */
  List<Type> _rootComponentTypes = [];
  /** @internal */
  List<ChangeDetectorRef> _changeDetectorRefs = [];
  /** @internal */
  bool _runningTick = false;
  /** @internal */
  bool _enforceNoNewChanges = false;
  ApplicationRef_(this._platform, this._zone, this._injector) : super() {
    /* super call moved to initializer */;
    if (isPresent(this._zone)) {
      ObservableWrapper.subscribe(this._zone.onTurnDone, (_) {
        this._zone.run(() {
          this.tick();
        });
      });
    }
    this._enforceNoNewChanges = assertionsEnabled();
  }
  void registerBootstrapListener(
      dynamic /* (ref: ComponentRef) => void */ listener) {
    this._bootstrapListeners.add(listener);
  }

  void registerDisposeListener(dynamic /* () => void */ dispose) {
    this._disposeListeners.add(dispose);
  }

  void registerChangeDetector(ChangeDetectorRef changeDetector) {
    this._changeDetectorRefs.add(changeDetector);
  }

  Future<ComponentRef> bootstrap(Type componentType,
      [List<dynamic /* Type | Provider | List < dynamic > */ > providers]) {
    var completer = PromiseWrapper.completer();
    this._zone.run(() {
      var componentProviders = _componentProviders(componentType);
      if (isPresent(providers)) {
        componentProviders.add(providers);
      }
      var exceptionHandler = this._injector.get(ExceptionHandler);
      this._rootComponentTypes.add(componentType);
      try {
        Injector injector =
            this._injector.resolveAndCreateChild(componentProviders);
        Future<ComponentRef> compRefToken =
            injector.get(APP_COMPONENT_REF_PROMISE);
        var tick = (componentRef) {
          var appChangeDetector =
              internalView(componentRef.hostView).changeDetector;
          this._changeDetectorRefs.add(appChangeDetector.ref);
          this.tick();
          completer.resolve(componentRef);
          this._rootComponents.add(componentRef);
          this
              ._bootstrapListeners
              .forEach((listener) => listener(componentRef));
        };
        var tickResult = PromiseWrapper.then(compRefToken, tick);
        PromiseWrapper.then(tickResult, (_) {});
        PromiseWrapper.then(tickResult, null,
            (err, stackTrace) => completer.reject(err, stackTrace));
      } catch (e, e_stack) {
        exceptionHandler.call(e, e_stack);
        completer.reject(e, e_stack);
      }
    });
    return completer.promise;
  }

  Injector get injector {
    return this._injector;
  }

  NgZone get zone {
    return this._zone;
  }

  void tick() {
    if (this._runningTick) {
      throw new BaseException("ApplicationRef.tick is called recursively");
    }
    var s = ApplicationRef_._tickScope();
    try {
      this._runningTick = true;
      this._changeDetectorRefs.forEach((detector) => detector.detectChanges());
      if (this._enforceNoNewChanges) {
        this
            ._changeDetectorRefs
            .forEach((detector) => detector.checkNoChanges());
      }
    } finally {
      this._runningTick = false;
      wtfLeave(s);
    }
  }

  void dispose() {
    // TODO(alxhub): Dispose of the NgZone.
    this._rootComponents.forEach((ref) => ref.dispose());
    this._disposeListeners.forEach((dispose) => dispose());
    this._platform._applicationDisposed(this);
  }

  List<dynamic> get componentTypes {
    return this._rootComponentTypes;
  }
}
