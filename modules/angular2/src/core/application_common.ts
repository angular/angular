import {FORM_BINDINGS} from 'angular2/src/core/forms';
import {bind, Binding, Injector, OpaqueToken} from 'angular2/src/core/di';
import {
  NumberWrapper,
  Type,
  isBlank,
  isPresent,
  assertionsEnabled,
  print,
  stringify
} from 'angular2/src/core/facade/lang';
import {BrowserDomAdapter} from 'angular2/src/core/dom/browser_adapter';
import {BrowserGetTestability} from 'angular2/src/core/testability/browser_testability';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {ViewLoader} from 'angular2/src/core/render/dom/compiler/view_loader';
import {StyleInliner} from 'angular2/src/core/render/dom/compiler/style_inliner';
import {Promise, PromiseWrapper, PromiseCompleter} from 'angular2/src/core/facade/async';
import {XHR} from 'angular2/src/core/render/xhr';
import {XHRImpl} from 'angular2/src/core/render/xhr_impl';
import {
  EventManager,
  DomEventsPlugin,
  EVENT_MANAGER_PLUGINS
} from 'angular2/src/core/render/dom/events/event_manager';
import {KeyEventsPlugin} from 'angular2/src/core/render/dom/events/key_events';
import {HammerGesturesPlugin} from 'angular2/src/core/render/dom/events/hammer_gestures';
import {AppRootUrl} from 'angular2/src/core/services/app_root_url';
import {AnchorBasedAppRootUrl} from 'angular2/src/core/services/anchor_based_app_root_url';
import {
  ComponentRef,
  DynamicComponentLoader
} from 'angular2/src/core/compiler/dynamic_component_loader';
import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';
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
import {EXCEPTION_BINDING} from './platform_bindings';
import {AnimationBuilder} from 'angular2/src/animate/animation_builder';
import {BrowserDetails} from 'angular2/src/animate/browser_details';
import {wtfInit} from './profile/wtf_init';
import {platformCommon, PlatformRef, applicationCommonBindings} from './application_ref';

/**
 * A default set of bindings which apply only to an Angular application running on
 * the UI thread.
 */
export function applicationDomBindings(): Array<Type | Binding | any[]> {
  if (isBlank(DOM)) {
    throw "Must set a root DOM adapter first.";
  }
  return [
    bind(DOCUMENT)
        .toValue(DOM.defaultDoc()),
    EventManager,
    new Binding(EVENT_MANAGER_PLUGINS, {toClass: DomEventsPlugin, multi: true}),
    new Binding(EVENT_MANAGER_PLUGINS, {toClass: KeyEventsPlugin, multi: true}),
    new Binding(EVENT_MANAGER_PLUGINS, {toClass: HammerGesturesPlugin, multi: true}),
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
    ViewLoader,
    EXCEPTION_BINDING,
    bind(XHR).toValue(new XHRImpl()),
    StyleInliner,
    Testability,
    AnchorBasedAppRootUrl,
    bind(AppRootUrl).toAlias(AnchorBasedAppRootUrl),
    BrowserDetails,
    AnimationBuilder,
    FORM_BINDINGS
  ];
}



/**
 * Initialize the Angular context on the page.
 *
 * If no bindings are provided, calling {@link platform}() is idempotent,
 * and will use the default platform bindings (which can be obtained from
 * {@link ApplicationRef/rootBindings}).
 */
export function platform(bindings?: Array<Type | Binding | any[]>): PlatformRef {
  return platformCommon(bindings, () => {
    BrowserDomAdapter.makeCurrent();
    wtfInit();
    BrowserGetTestability.init();
  });
}

/**
 * Bootstrapping for Angular applications.
 *
 * You instantiate an Angular application by explicitly specifying a component to use
 * as the root component for your application via the `bootstrap()` method.
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
 * An application is bootstrapped inside an existing browser DOM, typically `index.html`.
 * Unlike Angular 1, Angular 2 does not compile/process bindings in `index.html`. This is
 * mainly for security reasons, as well as architectural changes in Angular 2. This means
 * that `index.html` can safely be processed using server-side technologies such as
 * bindings. Bindings can thus use double-curly `{{ syntax }}` without collision from
 * Angular 2 component double-curly `{{ syntax }}`.
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
 * When the app developer invokes `bootstrap()` with the root component `MyApp` as its
 * argument, Angular performs the following tasks:
 *
 *  1. It uses the component's `selector` property to locate the DOM element which needs
 *     to be upgraded into the angular component.
 *  2. It creates a new child injector (from the platform injector). Optionally, you can
 *     also override the injector configuration for an app by invoking `bootstrap` with the
 *     `componentInjectableBindings` argument.
 *  3. It creates a new `Zone` and connects it to the angular application's change detection
 *     domain instance.
 *  4. It creates a shadow DOM on the selected component's host element and loads the
 *     template into it.
 *  5. It instantiates the specified component.
 *  6. Finally, Angular performs change detection to apply the initial data bindings for the
 *     application.
 *
 *
 * ## Instantiating Multiple Applications on a Single Page
 *
 * There are two ways to do this.
 *
 * ### Isolated Applications
 *
 * Angular creates a new application each time that the `bootstrap()` method is invoked.
 * When multiple applications are created for a page, Angular treats each application as
 * independent within an isolated change detection and `Zone` domain. If you need to share
 * data between applications, use the strategy described in the next section, "Applications
 * That Share Change Detection."
 *
 *
 * ### Applications That Share Change Detection
 *
 * If you need to bootstrap multiple applications that share common data, the applications
 * must share a common change detection and zone. To do that, create a meta-component that
 * lists the application components in its template.
 *
 * By only invoking the `bootstrap()` method once, with the meta-component as its argument,
 * you ensure that only a single change detection zone is created and therefore data can be
 * shared across the applications.
 *
 *
 * ## Platform Injector
 *
 * When working within a browser window, there are many singleton resources: cookies, title,
 * location, and others. Angular services that represent these resources must likewise be
 * shared across all Angular applications that occupy the same browser window. For this
 * reason, Angular creates exactly one global platform injector which stores all shared
 * services, and each angular application injector has the platform injector as its parent.
 *
 * Each application has its own private injector as well. When there are multipl
 * applications on a page, Angular treats each application injector's services as private
 * to that application.
 *
 *
 * # API
 * - `appComponentType`: The root component which should act as the application. This is
 *   a reference to a `Type` which is annotated with `@Component(...)`.
 * - `componentInjectableBindings`: An additional set of bindings that can be added to the
 *   app injector to override default injection behavior.
 * - `errorReporter`: `function(exception:any, stackTrace:string)` a default error reporter
 *   for unhandled exceptions.
 *
 * Returns a `Promise` of {@link ComponentRef}.
 */
export function commonBootstrap(appComponentType: /*Type*/ any,
                                appBindings: Array<Type | Binding | any[]> = null):
    Promise<ComponentRef> {
  var p = platform();
  var bindings = [applicationCommonBindings(), applicationDomBindings()];
  if (isPresent(appBindings)) {
    bindings.push(appBindings);
  }
  return p.application(bindings).bootstrap(appComponentType);
}
