import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {Type, isBlank, isPresent, assertionsEnabled} from 'angular2/src/core/facade/lang';
import {bind, Binding, Injector, OpaqueToken} from 'angular2/src/core/di';
import {APP_COMPONENT_REF_PROMISE, APP_COMPONENT} from './application_tokens';
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
  ExceptionHandler
} from 'angular2/src/core/facade/exceptions';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {internalView} from 'angular2/src/core/linker/view_ref';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {
  Parser,
  Lexer,
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
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';
import {
  APP_ID_RANDOM_BINDING,
} from 'angular2/src/core/render/render';
import {Compiler} from 'angular2/src/core/linker/compiler';

/**
 * Constructs the set of bindings meant for use at the platform level.
 *
 * These are bindings that should be singletons shared among all Angular applications
 * running on the page.
 */
export function platformBindings(): Array<Type | Binding | any[]> {
  return [bind(Reflector).toValue(reflector), TestabilityRegistry];
}

/**
 * Construct bindings specific to an individual root component.
 */
function _componentBindings(appComponentType: Type): Array<Type | Binding | any[]> {
  return [
    bind(APP_COMPONENT)
        .toValue(appComponentType),
    bind(APP_COMPONENT_REF_PROMISE)
        .toFactory(
            (dynamicComponentLoader, injector: Injector) => {
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
            [DynamicComponentLoader, Injector]),

    bind(appComponentType)
        .toFactory((p: Promise<any>) => p.then(ref => ref.instance), [APP_COMPONENT_REF_PROMISE]),
  ];
}

/**
 * Construct a default set of bindings which should be included in any Angular
 * application, regardless of whether it runs on the UI thread or in a web worker.
 */
export function applicationCommonBindings(): Array<Type | Binding | any[]> {
  return [
    Compiler,
    APP_ID_RANDOM_BINDING,
    AppViewPool,
    bind(APP_VIEW_POOL_CAPACITY).toValue(10000),
    AppViewManager,
    AppViewManagerUtils,
    AppViewListener,
    ProtoViewFactory,
    ViewResolver,
    DEFAULT_PIPES,
    bind(IterableDiffers).toValue(defaultIterableDiffers),
    bind(KeyValueDiffers).toValue(defaultKeyValueDiffers),
    DirectiveResolver,
    UrlResolver,
    PipeResolver,
    Parser,
    Lexer,
    DynamicComponentLoader,
    bind(LifeCycle).toFactory((exceptionHandler) => new LifeCycle(null, assertionsEnabled()),
                              [ExceptionHandler]),
  ];
}

/**
 * Create an Angular zone.
 */
export function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: assertionsEnabled()});
}

var _platform: PlatformRef;

/**
 * @private
 */
export function platformCommon(bindings?: Array<Type | Binding | any[]>, initializer?: () => void):
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
  _platform = new PlatformRef(Injector.resolveAndCreate(bindings), () => { _platform = null; });
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
export class PlatformRef {
  /**
   * @private
   */
  _applications: ApplicationRef[] = [];

  /**
   * @private
   */
  constructor(private _injector: Injector, private _dispose: () => void) {}

  /**
   * Retrieve the platform {@link Injector}, which is the parent injector for
   * every Angular application on the page and provides singleton bindings.
   */
  get injector(): Injector { return this._injector; }

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
   * Angular applications require numerous bindings to be properly instantiated.
   * When using `application()` to create a new app on the page, these bindings
   * must be provided. Fortunately, there are helper functions to configure
   * typical bindings, as shown in the example below.
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
  application(bindings: Array<Type | Binding | any[]>): ApplicationRef {
    var app = this._initApp(createNgZone(), bindings);
    return app;
  }

  /**
   * Instantiate a new Angular application on the page, using bindings which
   * are only available asynchronously. One such use case is to initialize an
   * application running in a web worker.
   *
   * # Usage
   *
   * `bindingFn` is a function that will be called in the new application's zone.
   * It should return a {@link Promise} to a list of bindings to be used for the
   * new application. Once this promise resolves, the application will be
   * constructed in the same manner as a normal `application()`.
   */
  asyncApplication(bindingFn: (zone: NgZone) =>
                       Promise<Array<Type | Binding | any[]>>): Promise<ApplicationRef> {
    var zone = createNgZone();
    var completer = PromiseWrapper.completer();
    zone.run(() => {
      PromiseWrapper.then(bindingFn(zone), (bindings: Array<Type | Binding | any[]>) => {
        completer.resolve(this._initApp(zone, bindings));
      });
    });
    return completer.promise;
  }

  private _initApp(zone: NgZone, bindings: Array<Type | Binding | any[]>): ApplicationRef {
    var injector: Injector;
    zone.run(() => {
      bindings.push(bind(NgZone).toValue(zone));
      bindings.push(bind(ApplicationRef).toValue(this));

      var exceptionHandler;
      try {
        injector = this.injector.resolveAndCreateChild(bindings);
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
    var app = new ApplicationRef(this, zone, injector);
    this._applications.push(app);
    return app;
  }


  /**
   * Destroy the Angular platform and all Angular applications on the page.
   */
  dispose(): void {
    this._applications.forEach((app) => app.dispose());
    this._dispose();
  }

  /**
   * @private
   */
  _applicationDisposed(app: ApplicationRef): void { ListWrapper.remove(this._applications, app); }
}

/**
 * A reference to an Angular application running on a page.
 *
 * For more about Angular applications, see the documentation for {@link bootstrap}.
 */
export class ApplicationRef {
  private _bootstrapListeners: Function[] = [];
  private _rootComponents: ComponentRef[] = [];

  /**
   * @private
   */
  constructor(private _platform: PlatformRef, private _zone: NgZone, private _injector: Injector) {}

  /**
   * Register a listener to be called each time `bootstrap()` is called to bootstrap
   * a new root component.
   */
  registerBootstrapListener(listener: (ref: ComponentRef) => void): void {
    this._bootstrapListeners.push(listener);
  }

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
   * Bindings for the given component can optionally be overridden via the `bindings`
   * parameter. These bindings will only apply for the root component being added and any
   * child components under it.
   *
   * # Example
   * ```
   * var app = platform.application([applicationCommonBindings(), applicationDomBindings()];
   * app.bootstrap(FirstRootComponent);
   * app.bootstrap(SecondRootComponent, [bind(OverrideBinding).toClass(OverriddenBinding)]);
   * ```
   */
  bootstrap(componentType: Type, bindings?: Array<Type | Binding | any[]>): Promise<ComponentRef> {
    var completer = PromiseWrapper.completer();
    this._zone.run(() => {
      var componentBindings = _componentBindings(componentType);
      if (isPresent(bindings)) {
        componentBindings.push(bindings);
      }
      var exceptionHandler = this._injector.get(ExceptionHandler);
      try {
        var injector: Injector = this._injector.resolveAndCreateChild(componentBindings);
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

  /**
   * Retrieve the application {@link Injector}.
   */
  get injector(): Injector { return this._injector; }

  /**
   * Retrieve the application {@link NgZone}.
   */
  get zone(): NgZone { return this._zone; }

  /**
   * Dispose of this application and all of its components.
   */
  dispose(): void {
    // TODO(alxhub): Dispose of the NgZone.
    this._rootComponents.forEach((ref) => ref.dispose());
    this._platform._applicationDisposed(this);
  }
}
