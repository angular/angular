
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
} from 'angular2/src/core/compiler/dynamic_component_loader';
import {
  BaseException,
  WrappedException,
  ExceptionHandler
} from 'angular2/src/core/facade/exceptions';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {internalView} from 'angular2/src/core/compiler/view_ref';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {
  Parser,
  Lexer,
  ChangeDetection,
  DynamicChangeDetection,
  JitChangeDetection,
  PreGeneratedChangeDetection,
  IterableDiffers,
  defaultIterableDiffers,
  KeyValueDiffers,
  defaultKeyValueDiffers
} from 'angular2/src/core/change_detection/change_detection';
import {AppViewPool, APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';
import {AppViewListener} from 'angular2/src/core/compiler/view_listener';
import {Compiler, CompilerCache} from './compiler/compiler';
import {DEFAULT_PIPES} from 'angular2/src/core/pipes';
import {ViewResolver} from './compiler/view_resolver';
import {DirectiveResolver} from './compiler/directive_resolver';
import {PipeResolver} from './compiler/pipe_resolver';
import {StyleUrlResolver} from 'angular2/src/core/render/dom/compiler/style_url_resolver';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';


/**
 * Contains everything that is safe to share between applications.
 */
export function rootBindings(): Array<Type | Binding | any[]> {
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
  var bestChangeDetection = new DynamicChangeDetection();
  if (PreGeneratedChangeDetection.isSupported()) {
    bestChangeDetection = new PreGeneratedChangeDetection();
  } else if (JitChangeDetection.isSupported()) {
    bestChangeDetection = new JitChangeDetection();
  }
  return [
    ProtoViewFactory,
    AppViewPool,
    bind(APP_VIEW_POOL_CAPACITY).toValue(10000),
    AppViewManager,
    AppViewManagerUtils,
    AppViewListener,
    Compiler,
    CompilerCache,
    ViewResolver,
    DEFAULT_PIPES,
    bind(IterableDiffers).toValue(defaultIterableDiffers),
    bind(KeyValueDiffers).toValue(defaultKeyValueDiffers),
    bind(ChangeDetection).toValue(bestChangeDetection),
    DirectiveResolver,
    UrlResolver,
    StyleUrlResolver,
    PipeResolver,
    ComponentUrlMapper,
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
    bindings = rootBindings();
  }
  _platform = new PlatformRef(Injector.resolveAndCreate(bindings), () => { _platform = null; });
  return _platform;
}

/**
 * Represent the Angular context on a page, and is a true singleton.
 *
 * The platform {@link Injector} injects dependencies which are also
 * truly singletons in the context of a page (such as the browser's
 * cookie jar).
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
   * Get the platform {@link Injector}.
   */
  get injector(): Injector { return this._injector; }

  /**
   * Build a new Angular application with the given bindings. The `ApplicationRef`
   * returned can be used to bootstrap one or more root components within the
   * application.
   */
  application(bindings: Array<Type | Binding | any[]>): ApplicationRef {
    var app = this._initApp(createNgZone(), bindings);
    return app;
  }

  /**
   * Build a new Angular application from asynchronously provided bindings.
   *
   * Runs the `AsyncLoader` callback in the application `Zone` and constructs
   * a new Application from the bindings provided by the `Promise` it returns.
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
 * Represents an Angular application.
 *
 * Use to retrieve the application {@link Injector} or to bootstrap new
 * components at the root of the application. Can also be used to dispose
 * of the entire application and all its loaded components.
 */
export class ApplicationRef {
  private _bootstrapListeners: Function[] = [];
  private _rootComponents: ComponentRef[] = [];

  /**
   * @private
   */
  constructor(private _platform: PlatformRef, private _zone: NgZone, private _injector: Injector) {}

  /**
   * Register a listener to be called each time a new root component type is bootstrapped.
   */
  registerBootstrapListener(listener: (ref: ComponentRef) => void): void {
    this._bootstrapListeners.push(listener);
  }

  /**
   * Bootstrap a new component at the root level of the application, optionally with
   * component specific bindings.
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
   * Retrieve the application {@link Zone}.
   */
  get zone(): NgZone { return this._zone; }

  dispose(): void {
    // TODO(alxhub): Dispose of the NgZone.
    this._rootComponents.forEach((ref) => ref.dispose());
    this._platform._applicationDisposed(this);
  }
}
