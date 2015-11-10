var forms_1 = require('angular2/src/common/forms');
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var browser_adapter_1 = require('angular2/src/core/dom/browser_adapter');
var browser_testability_1 = require('angular2/src/core/testability/browser_testability');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var xhr_1 = require('angular2/src/compiler/xhr');
var xhr_impl_1 = require('angular2/src/compiler/xhr_impl');
var event_manager_1 = require('angular2/src/core/render/dom/events/event_manager');
var key_events_1 = require('angular2/src/core/render/dom/events/key_events');
var hammer_gestures_1 = require('angular2/src/core/render/dom/events/hammer_gestures');
var testability_1 = require('angular2/src/core/testability/testability');
var api_1 = require('angular2/src/core/render/api');
var render_1 = require('angular2/src/core/render/render');
var shared_styles_host_1 = require('angular2/src/core/render/dom/shared_styles_host');
var platform_bindings_1 = require('./platform_bindings');
var animation_builder_1 = require('angular2/src/animate/animation_builder');
var browser_details_1 = require('angular2/src/animate/browser_details');
var wtf_init_1 = require('./profile/wtf_init');
var application_ref_1 = require('./application_ref');
/**
 * A default set of providers which apply only to an Angular application running on
 * the UI thread.
 */
function applicationDomProviders() {
    if (lang_1.isBlank(dom_adapter_1.DOM)) {
        throw "Must set a root DOM adapter first.";
    }
    return [
        di_1.provide(render_1.DOCUMENT, { useValue: dom_adapter_1.DOM.defaultDoc() }),
        event_manager_1.EventManager,
        new di_1.Provider(event_manager_1.EVENT_MANAGER_PLUGINS, { useClass: event_manager_1.DomEventsPlugin, multi: true }),
        new di_1.Provider(event_manager_1.EVENT_MANAGER_PLUGINS, { useClass: key_events_1.KeyEventsPlugin, multi: true }),
        new di_1.Provider(event_manager_1.EVENT_MANAGER_PLUGINS, { useClass: hammer_gestures_1.HammerGesturesPlugin, multi: true }),
        di_1.provide(render_1.DomRenderer, { useClass: render_1.DomRenderer_ }),
        di_1.provide(api_1.Renderer, { useExisting: render_1.DomRenderer }),
        shared_styles_host_1.DomSharedStylesHost,
        di_1.provide(shared_styles_host_1.SharedStylesHost, { useExisting: shared_styles_host_1.DomSharedStylesHost }),
        platform_bindings_1.EXCEPTION_PROVIDER,
        di_1.provide(xhr_1.XHR, { useValue: new xhr_impl_1.XHRImpl() }),
        testability_1.Testability,
        browser_details_1.BrowserDetails,
        animation_builder_1.AnimationBuilder,
        forms_1.FORM_PROVIDERS
    ];
}
exports.applicationDomProviders = applicationDomProviders;
/**
 * Initialize the Angular 'platform' on the page.
 *
 * See {@link PlatformRef} for details on the Angular platform.
 *
 *##Without specified providers
 *
 * If no providers are specified, `platform`'s behavior depends on whether an existing
 * platform exists:
 *
 * If no platform exists, a new one will be created with the default {@link platformProviders}.
 *
 * If a platform already exists, it will be returned (regardless of what providers it
 * was created with). This is a convenience feature, allowing for multiple applications
 * to be loaded into the same platform without awareness of each other.
 *
 *##With specified providers
 *
 * It is also possible to specify providers to be made in the new platform. These providers
 * will be shared between all applications on the page. For example, an abstraction for
 * the browser cookie jar should be bound at the platform level, because there is only one
 * cookie jar regardless of how many applications on the page will be accessing it.
 *
 * If providers are specified directly, `platform` will create the Angular platform with
 * them if a platform did not exist already. If it did exist, however, an error will be
 * thrown.
 *
 *##DOM Applications
 *
 * This version of `platform` initializes Angular to run in the UI thread, with direct
 * DOM access. Web-worker applications should call `platform` from
 * `src/web_workers/worker/application_common` instead.
 */
function platform(providers) {
    return application_ref_1.platformCommon(providers, function () {
        browser_adapter_1.BrowserDomAdapter.makeCurrent();
        wtf_init_1.wtfInit();
        browser_testability_1.BrowserGetTestability.init();
    });
}
exports.platform = platform;
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
 * Unlike Angular 1, Angular 2 does not compile/process providers in `index.html`. This is
 * mainly for security reasons, as well as architectural changes in Angular 2. This means
 * that `index.html` can safely be processed using server-side technologies such as
 * providers. Bindings can thus use double-curly `{{ syntax }}` without collision from
 * Angular 2 component double-curly `{{ syntax }}`.
 *
 * We can use this script code:
 *
 * ```
 * @Component({
 *    selector: 'my-app',
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
 *  4. It creates an emulated or shadow DOM on the selected component's host element and loads the
 *     template into it.
 *  5. It instantiates the specified component.
 *  6. Finally, Angular performs change detection to apply the initial data providers for the
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
 * Each application has its own private injector as well. When there are multiple
 * applications on a page, Angular treats each application injector's services as private
 * to that application.
 *
 *
 *##API
 * - `appComponentType`: The root component which should act as the application. This is
 *   a reference to a `Type` which is annotated with `@Component(...)`.
 * - `componentInjectableBindings`: An additional set of providers that can be added to the
 *   app injector to override default injection behavior.
 * - `errorReporter`: `function(exception:any, stackTrace:string)` a default error reporter
 *   for unhandled exceptions.
 *
 * Returns a `Promise` of {@link ComponentRef}.
 */
function commonBootstrap(appComponentType, appProviders) {
    if (appProviders === void 0) { appProviders = null; }
    var p = platform();
    var bindings = [application_ref_1.applicationCommonProviders(), applicationDomProviders()];
    if (lang_1.isPresent(appProviders)) {
        bindings.push(appProviders);
    }
    return p.application(bindings).bootstrap(appComponentType);
}
exports.commonBootstrap = commonBootstrap;
//# sourceMappingURL=application_common.js.map