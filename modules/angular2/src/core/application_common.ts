import {Injector, bind, OpaqueToken, Binding} from 'angular2/di';
import {
  NumberWrapper,
  Type,
  isBlank,
  isPresent,
  BaseException,
  assertionsEnabled,
  print,
  stringify
} from 'angular2/src/facade/lang';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Compiler, CompilerCache} from './compiler/compiler';
import {Reflector, reflector} from 'angular2/src/reflection/reflection';
import {
  Parser,
  Lexer,
  ChangeDetection,
  DynamicChangeDetection,
  JitChangeDetection,
  PreGeneratedChangeDetection,
  Pipes,
  defaultPipes
} from 'angular2/change_detection';
import {ExceptionHandler} from './exception_handler';
import {ViewLoader} from 'angular2/src/render/dom/compiler/view_loader';
import {StyleUrlResolver} from 'angular2/src/render/dom/compiler/style_url_resolver';
import {StyleInliner} from 'angular2/src/render/dom/compiler/style_inliner';
import {ViewResolver} from './compiler/view_resolver';
import {DirectiveResolver} from './compiler/directive_resolver';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper, PromiseCompleter} from 'angular2/src/facade/async';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {ShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/shadow_dom_strategy';
import {
  EmulatedUnscopedShadowDomStrategy
} from 'angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy';
import {XHR} from 'angular2/src/render/xhr';
import {XHRImpl} from 'angular2/src/render/xhr_impl';
import {EventManager, DomEventsPlugin} from 'angular2/src/render/dom/events/event_manager';
import {KeyEventsPlugin} from 'angular2/src/render/dom/events/key_events';
import {HammerGesturesPlugin} from 'angular2/src/render/dom/events/hammer_gestures';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {AppRootUrl} from 'angular2/src/services/app_root_url';
import {AnchorBasedAppRootUrl} from 'angular2/src/services/anchor_based_app_root_url';
import {
  ComponentRef,
  DynamicComponentLoader
} from 'angular2/src/core/compiler/dynamic_component_loader';
import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';
import {AppViewPool, APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';
import {AppViewListener} from 'angular2/src/core/compiler/view_listener';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {Renderer, RenderCompiler} from 'angular2/src/render/api';
import {
  DomRenderer,
  DOCUMENT_TOKEN,
  DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES
} from 'angular2/src/render/dom/dom_renderer';
import {DefaultDomCompiler} from 'angular2/src/render/dom/compiler/compiler';
import {internalView} from 'angular2/src/core/compiler/view_ref';
import {appComponentRefPromiseToken, appComponentTypeToken} from './application_tokens';

var _rootInjector: Injector;

// Contains everything that is safe to share between applications.
var _rootBindings = [bind(Reflector).toValue(reflector), TestabilityRegistry];

function _injectorBindings(appComponentType): List<Type | Binding | List<any>> {
  var bestChangeDetection: Type = DynamicChangeDetection;
  if (PreGeneratedChangeDetection.isSupported()) {
    bestChangeDetection = PreGeneratedChangeDetection;
  } else if (JitChangeDetection.isSupported()) {
    bestChangeDetection = JitChangeDetection;
  }
  return [
    bind(DOCUMENT_TOKEN)
        .toValue(DOM.defaultDoc()),
    bind(DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES).toValue(false),
    bind(appComponentTypeToken).toValue(appComponentType),
    bind(appComponentRefPromiseToken)
        .toFactory(
            (dynamicComponentLoader, injector, testability, registry) => {
              // TODO(rado): investigate whether to support bindings on root component.
              return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector)
                  .then((componentRef) => {
                    registry.registerApplication(componentRef.location.nativeElement, testability);
                    return componentRef;
                  });
            },
            [DynamicComponentLoader, Injector, Testability, TestabilityRegistry]),

    bind(appComponentType)
        .toFactory((p: Promise<any>) => p.then(ref => ref.instance), [appComponentRefPromiseToken]),
    bind(LifeCycle).toFactory((exceptionHandler) => new LifeCycle(null, assertionsEnabled()),
                              [ExceptionHandler]),
    bind(EventManager)
        .toFactory(
            (ngZone) => {
              var plugins =
                  [new HammerGesturesPlugin(), new KeyEventsPlugin(), new DomEventsPlugin()];
              return new EventManager(plugins, ngZone);
            },
            [NgZone]),
    bind(ShadowDomStrategy)
        .toFactory((doc) => new EmulatedUnscopedShadowDomStrategy(doc.head), [DOCUMENT_TOKEN]),
    DomRenderer,
    DefaultDomCompiler,
    bind(Renderer).toAlias(DomRenderer),
    bind(RenderCompiler).toAlias(DefaultDomCompiler),
    ProtoViewFactory,
    AppViewPool,
    bind(APP_VIEW_POOL_CAPACITY).toValue(10000),
    AppViewManager,
    AppViewManagerUtils,
    AppViewListener,
    Compiler,
    CompilerCache,
    ViewResolver,
    bind(Pipes).toValue(defaultPipes),
    bind(ChangeDetection).toClass(bestChangeDetection),
    ViewLoader,
    DirectiveResolver,
    Parser,
    Lexer,
    bind(ExceptionHandler).toFactory(() => new ExceptionHandler(DOM), []),
    bind(XHR).toValue(new XHRImpl()),
    ComponentUrlMapper,
    UrlResolver,
    StyleUrlResolver,
    StyleInliner,
    DynamicComponentLoader,
    Testability,
    AnchorBasedAppRootUrl,
    bind(AppRootUrl).toAlias(AnchorBasedAppRootUrl)
  ];
}

export function createNgZone(handler: ExceptionHandler): NgZone {
  // bootstrapErrorReporter is needed because we cannot use custom exception handler
  // configured via DI until the root Injector has been created.
  var bootstrapErrorReporter = (exception, stackTrace) => handler.call(exception, stackTrace);
  var zone = new NgZone({enableLongStackTrace: assertionsEnabled()});
  zone.overrideOnErrorHandler(bootstrapErrorReporter);
  return zone;
}

/**
 * Bootstrapping for Angular applications.
 *
 * You instantiate an Angular application by explicitly specifying a component to use as the root
 * component for your
 * application via the `bootstrap()` method.
 *
 * ## Simple Example
 *
 * Assuming this `index.html`:
 *
 * ```html
 * <html>
 *   <!-- load Angular script tags here. -->
 *   <body>
 *     <my-app>loading...</my-app>
 *   </body>
 * </html>
 * ```
 *
 * An application is bootstrapped inside an existing browser DOM, typically `index.html`. Unlike
 * Angular 1, Angular 2
 * does not compile/process bindings in `index.html`. This is mainly for security reasons, as well
 * as architectural
 * changes in Angular 2. This means that `index.html` can safely be processed using server-side
 * technologies such as
 * bindings. Bindings can thus use double-curly `{{ syntax }}` without collision from Angular 2
 * component double-curly
 * `{{ syntax }}`.
 *
 * We can use this script code:
 *
 * ```
 * @Component({
 *    selector: 'my-app'
 * })
 * @View({
 *    template: 'Hello {{ name }}!'
 * })
 * class MyApp {
 *   name:string;
 *
 *   constructor() {
 *     this.name = 'World';
 *   }
 * }
 *
 * main() {
 *   return bootstrap(MyApp);
 * }
 * ```
 *
 * When the app developer invokes `bootstrap()` with the root component `MyApp` as its argument,
 * Angular performs the
 * following tasks:
 *
 *  1. It uses the component's `selector` property to locate the DOM element which needs to be
 * upgraded into
 *     the angular component.
 *  2. It creates a new child injector (from the platform injector). Optionally, you can also
 * override the injector configuration for an app by
 * invoking `bootstrap` with the `componentInjectableBindings` argument.
 *  3. It creates a new `Zone` and connects it to the angular application's change detection domain
 * instance.
 *  4. It creates a shadow DOM on the selected component's host element and loads the template into
 * it.
 *  5. It instantiates the specified component.
 *  6. Finally, Angular performs change detection to apply the initial data bindings for the
 * application.
 *
 *
 * ## Instantiating Multiple Applications on a Single Page
 *
 * There are two ways to do this.
 *
 *
 * ### Isolated Applications
 *
 * Angular creates a new application each time that the `bootstrap()` method is invoked. When
 * multiple applications
 * are created for a page, Angular treats each application as independent within an isolated change
 * detection and
 * `Zone` domain. If you need to share data between applications, use the strategy described in the
 * next
 * section, "Applications That Share Change Detection."
 *
 *
 * ### Applications That Share Change Detection
 *
 * If you need to bootstrap multiple applications that share common data, the applications must
 * share a common
 * change detection and zone. To do that, create a meta-component that lists the application
 * components in its template.
 * By only invoking the `bootstrap()` method once, with the meta-component as its argument, you
 * ensure that only a
 * single change detection zone is created and therefore data can be shared across the applications.
 *
 *
 * ## Platform Injector
 *
 * When working within a browser window, there are many singleton resources: cookies, title,
 * location, and others.
 * Angular services that represent these resources must likewise be shared across all Angular
 * applications that
 * occupy the same browser window.  For this reason, Angular creates exactly one global platform
 * injector which stores
 * all shared services, and each angular application injector has the platform injector as its
 * parent.
 *
 * Each application has its own private injector as well. When there are multiple applications on a
 * page, Angular treats
 * each application injector's services as private to that application.
 *
 *
 * # API
 * - `appComponentType`: The root component which should act as the application. This is a reference
 * to a `Type`
 *   which is annotated with `@Component(...)`.
 * - `componentInjectableBindings`: An additional set of bindings that can be added to the app
 * injector
 * to override default injection behavior.
 * - `errorReporter`: `function(exception:any, stackTrace:string)` a default error reporter for
 * unhandled exceptions.
 *
 * Returns a `Promise` of {@link ApplicationRef}.
 */
export function commonBootstrap(
    appComponentType: /*Type*/ any,
    componentInjectableBindings: List<Type | Binding | List<any>> = null): Promise<ApplicationRef> {
  BrowserDomAdapter.makeCurrent();
  var bootstrapProcess: PromiseCompleter<any> = PromiseWrapper.completer();
  var zone = createNgZone(new ExceptionHandler(DOM));
  zone.run(() => {
    // TODO(rado): prepopulate template cache, so applications with only
    // index.html and main.js are possible.

    var appInjector = _createAppInjector(appComponentType, componentInjectableBindings, zone);
    var exceptionHandler = appInjector.get(ExceptionHandler);
    zone.overrideOnErrorHandler((e, s) => exceptionHandler.call(e, s));

    var compRefToken: Promise<any> =
        PromiseWrapper.wrap(() => appInjector.get(appComponentRefPromiseToken));
    var tick = (componentRef) => {
      var appChangeDetector = internalView(componentRef.hostView).changeDetector;
      // retrieve life cycle: may have already been created if injected in root component
      var lc = appInjector.get(LifeCycle);
      lc.registerWith(zone, appChangeDetector);
      lc.tick();  // the first tick that will bootstrap the app

      bootstrapProcess.resolve(new ApplicationRef(componentRef, appComponentType, appInjector));
    };
    PromiseWrapper.then(compRefToken, tick,
                        (err, stackTrace) => bootstrapProcess.reject(err, stackTrace));
  });

  return bootstrapProcess.promise;
}

/**
 * Represents a Angular's representation of an Application.
 *
 * `ApplicationRef` represents a running application instance. Use it to retrieve the host
 * component, injector,
 * or dispose of an application.
 */
export class ApplicationRef {
  _hostComponent: ComponentRef;
  _injector: Injector;
  _hostComponentType: Type;

  /**
   * @private
   */
  constructor(hostComponent: ComponentRef, hostComponentType: Type, injector: Injector) {
    this._hostComponent = hostComponent;
    this._injector = injector;
    this._hostComponentType = hostComponentType;
  }

  /**
   * Returns the current {@link Component} type.
   */
  get hostComponentType(): Type { return this._hostComponentType; }

  /**
   * Returns the current {@link Component} instance.
   */
  get hostComponent(): any { return this._hostComponent.instance; }

  /**
   * Dispose (un-load) the application.
   */
  dispose(): void {
    // TODO: We also need to clean up the Zone, ... here!
    this._hostComponent.dispose();
  }

  /**
   * Returns the root application {@link Injector}.
   */
  get injector(): Injector { return this._injector; }
}

function _createAppInjector(appComponentType: Type, bindings: List<Type | Binding | List<any>>,
                            zone: NgZone): Injector {
  if (isBlank(_rootInjector)) _rootInjector = Injector.resolveAndCreate(_rootBindings);
  var mergedBindings: any[] =
      isPresent(bindings) ? ListWrapper.concat(_injectorBindings(appComponentType), bindings) :
                            _injectorBindings(appComponentType);
  mergedBindings.push(bind(NgZone).toValue(zone));
  return _rootInjector.resolveAndCreateChild(mergedBindings);
}
