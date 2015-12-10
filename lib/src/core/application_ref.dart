library angular2.src.core.application_ref;

import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;
import "package:angular2/src/facade/lang.dart"
    show Type, isBlank, isPresent, assertionsEnabled, print, IS_DART;
import "package:angular2/src/core/di.dart"
    show provide, Provider, Injector, OpaqueToken;
import "application_tokens.dart"
    show
        APP_COMPONENT_REF_PROMISE,
        APP_COMPONENT,
        APP_ID_RANDOM_PROVIDER,
        PLATFORM_INITIALIZER,
        APP_INITIALIZER;
import "package:angular2/src/facade/async.dart"
    show Future, PromiseWrapper, PromiseCompleter, ObservableWrapper;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/core/testability/testability.dart"
    show TestabilityRegistry, Testability;
import "package:angular2/src/core/linker/dynamic_component_loader.dart"
    show ComponentRef, DynamicComponentLoader;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException, ExceptionHandler, unimplemented;
import "package:angular2/src/core/linker/view_ref.dart" show internalView;
import "profile/profile.dart" show wtfLeave, wtfCreateScope, WtfScopeFn;
import "package:angular2/src/core/change_detection/change_detector_ref.dart"
    show ChangeDetectorRef;
import "package:angular2/src/facade/lang.dart" show lockDevMode;

/**
 * Construct providers specific to an individual root component.
 */
List<dynamic /* Type | Provider | List < dynamic > */ > _componentProviders(
    Type appComponentType) {
  return [
    provide(APP_COMPONENT, useValue: appComponentType),
    provide(APP_COMPONENT_REF_PROMISE, useFactory:
        (DynamicComponentLoader dynamicComponentLoader, ApplicationRef_ appRef,
            Injector injector) {
      // Save the ComponentRef for disposal later.
      ComponentRef ref;
      // TODO(rado): investigate whether to support providers on root component.
      return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector,
          () {
        appRef._unloadComponent(ref);
      }).then((componentRef) {
        ref = componentRef;
        if (isPresent(componentRef.location.nativeElement)) {
          injector.get(TestabilityRegistry).registerApplication(
              componentRef.location.nativeElement, injector.get(Testability));
        }
        return componentRef;
      });
    }, deps: [DynamicComponentLoader, ApplicationRef, Injector]),
    provide(appComponentType,
        useFactory: (Future<dynamic> p) => p.then((ref) => ref.instance),
        deps: [APP_COMPONENT_REF_PROMISE])
  ];
}

/**
 * Create an Angular zone.
 */
NgZone createNgZone() {
  return new NgZone(enableLongStackTrace: assertionsEnabled());
}

PlatformRef _platform;
List<dynamic> _platformProviders;
/**
 * Initialize the Angular 'platform' on the page.
 *
 * See [PlatformRef] for details on the Angular platform.
 *
 * It is also possible to specify providers to be made in the new platform. These providers
 * will be shared between all applications on the page. For example, an abstraction for
 * the browser cookie jar should be bound at the platform level, because there is only one
 * cookie jar regardless of how many applications on the page will be accessing it.
 *
 * The platform function can be called multiple times as long as the same list of providers
 * is passed into each call. If the platform function is called with a different set of
 * provides, Angular will throw an exception.
 */
PlatformRef platform(
    [List<dynamic /* Type | Provider | List < dynamic > */ > providers]) {
  lockDevMode();
  if (isPresent(_platform)) {
    if (ListWrapper.equals(_platformProviders, providers)) {
      return _platform;
    } else {
      throw new BaseException(
          "platform cannot be initialized with different sets of providers.");
    }
  } else {
    return _createPlatform(providers);
  }
}

/**
 * Dispose the existing platform.
 */
void disposePlatform() {
  if (isPresent(_platform)) {
    _platform.dispose();
    _platform = null;
  }
}

PlatformRef _createPlatform(
    [List<dynamic /* Type | Provider | List < dynamic > */ > providers]) {
  _platformProviders = providers;
  var injector = Injector.resolveAndCreate(providers);
  _platform = new PlatformRef_(injector, () {
    _platform = null;
    _platformProviders = null;
  });
  _runPlatformInitializers(injector);
  return _platform;
}

void _runPlatformInitializers(Injector injector) {
  List<Function> inits = injector.getOptional(PLATFORM_INITIALIZER);
  if (isPresent(inits)) inits.forEach((init) => init());
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
   * ### What is an application?
   *
   * Each Angular application has its own zone, change detection, compiler,
   * renderer, and other framework components. An application hosts one or more
   * root components, which can be initialized via `ApplicationRef.bootstrap()`.
   *
   * ### Application Providers
   *
   * Angular applications require numerous providers to be properly instantiated.
   * When using `application()` to create a new app on the page, these providers
   * must be provided. Fortunately, there are helper functions to configure
   * typical providers, as shown in the example below.
   *
   * ### Example
   *
   * {@example core/ts/platform/platform.ts region='longform'}
   * ### See Also
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
   * ### Usage
   *
   * `bindingFn` is a function that will be called in the new application's zone.
   * It should return a `Promise` to a list of providers to be used for the
   * new application. Once this promise resolves, the application will be
   * constructed in the same manner as a normal `application()`.
   */
  Future<ApplicationRef> asyncApplication(
      dynamic /* (zone: NgZone) => Promise<Array<Type | Provider | any[]>> */ bindingFn,
      [List<dynamic /* Type | Provider | List < dynamic > */ > providers]);
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
      dynamic /* (zone: NgZone) => Promise<Array<Type | Provider | any[]>> */ bindingFn,
      [List<
          dynamic /* Type | Provider | List < dynamic > */ > additionalProviders]) {
    var zone = createNgZone();
    var completer = PromiseWrapper.completer();
    zone.run(() {
      PromiseWrapper.then(bindingFn(zone),
          (List<dynamic /* Type | Provider | List < dynamic > */ > providers) {
        if (isPresent(additionalProviders)) {
          providers = ListWrapper.concat(providers, additionalProviders);
        }
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
      providers = ListWrapper.concat(providers, [
        provide(NgZone, useValue: zone),
        provide(ApplicationRef, useFactory: () => app, deps: [])
      ]);
      var exceptionHandler;
      try {
        injector = this.injector.resolveAndCreateChild(providers);
        exceptionHandler = injector.get(ExceptionHandler);
        zone.overrideOnErrorHandler((e, s) => exceptionHandler.call(e, s));
      } catch (e, e_stack) {
        if (isPresent(exceptionHandler)) {
          exceptionHandler.call(e, e_stack);
        } else {
          print(e.toString());
        }
      }
    });
    app = new ApplicationRef_(this, zone, injector);
    this._applications.add(app);
    _runAppInitializers(injector);
    return app;
  }

  void dispose() {
    ListWrapper.clone(this._applications).forEach((app) => app.dispose());
    this._disposeListeners.forEach((dispose) => dispose());
    this._dispose();
  }

  /** @internal */
  void _applicationDisposed(ApplicationRef app) {
    ListWrapper.remove(this._applications, app);
  }
}

void _runAppInitializers(Injector injector) {
  List<Function> inits = injector.getOptional(APP_INITIALIZER);
  if (isPresent(inits)) inits.forEach((init) => init());
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
   * ### Bootstrap process
   *
   * When bootstrapping a new root component into an application, Angular mounts the
   * specified application component onto DOM elements identified by the [componentType]'s
   * selector and kicks off automatic change detection to finish initializing the component.
   *
   * ### Optional Providers
   *
   * Providers for the given component can optionally be overridden via the `providers`
   * parameter. These providers will only apply for the root component being added and any
   * child components under it.
   *
   * ### Example
   * {@example core/ts/platform/platform.ts region='longform'}
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

  void unregisterChangeDetector(ChangeDetectorRef changeDetector) {
    ListWrapper.remove(this._changeDetectorRefs, changeDetector);
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
          this._loadComponent(componentRef);
          completer.resolve(componentRef);
        };
        var tickResult = PromiseWrapper.then(compRefToken, tick);
        // THIS MUST ONLY RUN IN DART.

        // This is required to report an error when no components with a matching selector found.

        // Otherwise the promise will never be completed.

        // Doing this in JS causes an extra error message to appear.
        if (IS_DART) {
          PromiseWrapper.then(tickResult, (_) {});
        }
        PromiseWrapper.then(tickResult, null,
            (err, stackTrace) => completer.reject(err, stackTrace));
      } catch (e, e_stack) {
        exceptionHandler.call(e, e_stack);
        completer.reject(e, e_stack);
      }
    });
    return completer.promise;
  }

  /** @internal */
  void _loadComponent(ref) {
    var appChangeDetector = internalView(ref.hostView).changeDetector;
    this._changeDetectorRefs.add(appChangeDetector.ref);
    this.tick();
    this._rootComponents.add(ref);
    this._bootstrapListeners.forEach((listener) => listener(ref));
  }

  /** @internal */
  void _unloadComponent(ref) {
    if (!ListWrapper.contains(this._rootComponents, ref)) {
      return;
    }
    this.unregisterChangeDetector(
        internalView(ref.hostView).changeDetector.ref);
    ListWrapper.remove(this._rootComponents, ref);
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
    ListWrapper.clone(this._rootComponents).forEach((ref) => ref.dispose());
    this._disposeListeners.forEach((dispose) => dispose());
    this._platform._applicationDisposed(this);
  }

  List<dynamic> get componentTypes {
    return this._rootComponentTypes;
  }
}
