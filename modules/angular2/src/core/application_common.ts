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
} from 'angular2/src/core/facade/lang';
import {BrowserDomAdapter} from 'angular2/src/core/dom/browser_adapter';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {Compiler, CompilerCache} from './compiler/compiler';
import {Reflector, reflector} from 'angular2/src/core/reflection/reflection';
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
import {DEFAULT_PIPES} from 'angular2/pipes';
import {ExceptionHandler} from './exception_handler';
import {ViewLoader} from 'angular2/src/core/render/dom/compiler/view_loader';
import {StyleUrlResolver} from 'angular2/src/core/render/dom/compiler/style_url_resolver';
import {StyleInliner} from 'angular2/src/core/render/dom/compiler/style_inliner';
import {ViewResolver} from './compiler/view_resolver';
import {DirectiveResolver} from './compiler/directive_resolver';
import {PipeResolver} from './compiler/pipe_resolver';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {Promise, PromiseWrapper, PromiseCompleter} from 'angular2/src/core/facade/async';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {XHR} from 'angular2/src/core/render/xhr';
import {XHRImpl} from 'angular2/src/core/render/xhr_impl';
import {EventManager, DomEventsPlugin} from 'angular2/src/core/render/dom/events/event_manager';
import {KeyEventsPlugin} from 'angular2/src/core/render/dom/events/key_events';
import {HammerGesturesPlugin} from 'angular2/src/core/render/dom/events/hammer_gestures';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';
import {AppRootUrl} from 'angular2/src/core/services/app_root_url';
import {AnchorBasedAppRootUrl} from 'angular2/src/core/services/anchor_based_app_root_url';
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
import {Renderer, RenderCompiler} from 'angular2/src/core/render/api';
import {
  DomRenderer,
  DOCUMENT,
  DefaultDomCompiler,
  APP_ID_RANDOM_BINDING,
  MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE,
  TemplateCloner
} from 'angular2/src/core/render/render';
import {ElementSchemaRegistry} from 'angular2/src/core/render/dom/schema/element_schema_registry';
import {
  DomElementSchemaRegistry
} from 'angular2/src/core/render/dom/schema/dom_element_schema_registry';
import {
  SharedStylesHost,
  DomSharedStylesHost
} from 'angular2/src/core/render/dom/view/shared_styles_host';
import {internalView} from 'angular2/src/core/compiler/view_ref';
import {APP_COMPONENT_REF_PROMISE, APP_COMPONENT} from './application_tokens';
import {wtfInit} from './profile/wtf_init';
import {EXCEPTION_BINDING} from './platform_bindings';
import {ApplicationRef} from './application_ref';

var _rootInjector: Injector;

// Contains everything that is safe to share between applications.
var _rootBindings = [bind(Reflector).toValue(reflector), TestabilityRegistry];

function _injectorBindings(appComponentType): Array<Type | Binding | any[]> {
  var bestChangeDetection = new DynamicChangeDetection();
  if (PreGeneratedChangeDetection.isSupported()) {
    bestChangeDetection = new PreGeneratedChangeDetection();
  } else if (JitChangeDetection.isSupported()) {
    bestChangeDetection = new JitChangeDetection();
  }
  return [
    bind(DOCUMENT)
        .toValue(DOM.defaultDoc()),
    bind(APP_COMPONENT).toValue(appComponentType),
    bind(APP_COMPONENT_REF_PROMISE)
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
        .toFactory((p: Promise<any>) => p.then(ref => ref.instance), [APP_COMPONENT_REF_PROMISE]),
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
    DomRenderer,
    bind(Renderer).toAlias(DomRenderer),
    APP_ID_RANDOM_BINDING,
    TemplateCloner,
    bind(MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE).toValue(20),
    DefaultDomCompiler,
    bind(ElementSchemaRegistry).toValue(new DomElementSchemaRegistry()),
    bind(RenderCompiler).toAlias(DefaultDomCompiler),
    DomSharedStylesHost,
    bind(SharedStylesHost).toAlias(DomSharedStylesHost),
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
    ViewLoader,
    DirectiveResolver,
    PipeResolver,
    Parser,
    Lexer,
    EXCEPTION_BINDING,
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

export function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: assertionsEnabled()});
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
export function commonBootstrap(appComponentType: /*Type*/ any,
                                componentInjectableBindings: Array<Type | Binding | any[]> = null):
    Promise<ApplicationRef> {
  BrowserDomAdapter.makeCurrent();
  wtfInit();
  var bootstrapProcess = PromiseWrapper.completer();
  var zone = createNgZone();

  zone.run(() => {
    var exceptionHandler;

    try {
      var appInjector = _createAppInjector(appComponentType, componentInjectableBindings, zone);
      exceptionHandler = appInjector.get(ExceptionHandler);
      zone.overrideOnErrorHandler((e, s) => exceptionHandler.call(e, s));

      var compRefToken: Promise<any> = appInjector.get(APP_COMPONENT_REF_PROMISE);
      var tick = (componentRef) => {
        var appChangeDetector = internalView(componentRef.hostView).changeDetector;
        // retrieve life cycle: may have already been created if injected in root component
        var lc = appInjector.get(LifeCycle);
        lc.registerWith(zone, appChangeDetector);
        lc.tick();  // the first tick that will bootstrap the app

        bootstrapProcess.resolve(new ApplicationRef(componentRef, appComponentType, appInjector));
      };

      var tickResult = PromiseWrapper.then(compRefToken, tick);

      PromiseWrapper.then(tickResult,
                          (_) => {});  // required for Dart to trigger the default error handler
      PromiseWrapper.then(tickResult, null,
                          (err, stackTrace) => { bootstrapProcess.reject(err, stackTrace); });
    } catch (e) {
      if (isPresent(exceptionHandler)) {
        exceptionHandler.call(e, e.stack);
      } else {
        // The error happened during the creation of an injector, most likely because of a bug in
        // DI.
        // We cannot use the provided exception handler, so we default to writing to the DOM.
        DOM.logError(e);
      }
      bootstrapProcess.reject(e, e.stack);
    }
  });
  return bootstrapProcess.promise;
}

function _createAppInjector(appComponentType: Type, bindings: Array<Type | Binding | any[]>,
                            zone: NgZone): Injector {
  if (isBlank(_rootInjector)) _rootInjector = Injector.resolveAndCreate(_rootBindings);
  var mergedBindings: any[] =
      isPresent(bindings) ? ListWrapper.concat(_injectorBindings(appComponentType), bindings) :
                            _injectorBindings(appComponentType);
  mergedBindings.push(bind(NgZone).toValue(zone));
  return _rootInjector.resolveAndCreateChild(mergedBindings);
}
