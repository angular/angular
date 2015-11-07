import {FORM_PROVIDERS} from 'angular2/src/common/forms';
import {provide, Provider} from 'angular2/src/core/di';
import {Type, isBlank, isPresent, stringify} from 'angular2/src/facade/lang';
import {BrowserDomAdapter} from 'angular2/src/core/dom/browser_adapter';
import {BrowserGetTestability} from 'angular2/src/core/testability/browser_testability';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {Promise} from 'angular2/src/facade/async';
import {XHR} from 'angular2/src/compiler/xhr';
import {XHRImpl} from 'angular2/src/compiler/xhr_impl';

import {
  EventManager,
  DomEventsPlugin,
  EVENT_MANAGER_PLUGINS
} from 'angular2/src/core/render/dom/events/event_manager';
import {KeyEventsPlugin} from 'angular2/src/core/render/dom/events/key_events';
import {HammerGesturesPlugin} from 'angular2/src/core/render/dom/events/hammer_gestures';
import {ComponentRef} from 'angular2/src/core/linker/dynamic_component_loader';
import {Testability} from 'angular2/src/core/testability/testability';
import {Renderer} from 'angular2/src/core/render/api';
import {DomRenderer, DomRenderer_, DOCUMENT} from 'angular2/src/core/render/render';
import {
  SharedStylesHost,
  DomSharedStylesHost
} from 'angular2/src/core/render/dom/shared_styles_host';
import {EXCEPTION_PROVIDER} from './platform_bindings';
import {AnimationBuilder} from 'angular2/src/animate/animation_builder';
import {BrowserDetails} from 'angular2/src/animate/browser_details';
import {wtfInit} from './profile/wtf_init';
import {platformCommon, PlatformRef, applicationCommonProviders} from './application_ref';

/**
 * A default set of providers which apply only to an Angular application running on
 * the UI thread.
 */
export function applicationDomProviders(): Array<Type | Provider | any[]> {
  if (isBlank(DOM)) {
    throw "Must set a root DOM adapter first.";
  }
  return [
    provide(DOCUMENT, {useValue: DOM.defaultDoc()}),
    EventManager,
    new Provider(EVENT_MANAGER_PLUGINS, {useClass: DomEventsPlugin, multi: true}),
    new Provider(EVENT_MANAGER_PLUGINS, {useClass: KeyEventsPlugin, multi: true}),
    new Provider(EVENT_MANAGER_PLUGINS, {useClass: HammerGesturesPlugin, multi: true}),
    provide(DomRenderer, {useClass: DomRenderer_}),
    provide(Renderer, {useExisting: DomRenderer}),
    DomSharedStylesHost,
    provide(SharedStylesHost, {useExisting: DomSharedStylesHost}),
    EXCEPTION_PROVIDER,
    provide(XHR, {useValue: new XHRImpl()}),
    Testability,
    BrowserDetails,
    AnimationBuilder,
    FORM_PROVIDERS
  ];
}

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
export function platform(providers?: Array<Type | Provider | any[]>): PlatformRef {
  return platformCommon(providers, () => {
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
export function commonBootstrap(
    appComponentType: /*Type*/ any,
    appProviders: Array<Type | Provider | any[]> = null): Promise<ComponentRef> {
  var p = platform();
  var bindings = [applicationCommonProviders(), applicationDomProviders()];
  if (isPresent(appProviders)) {
    bindings.push(appProviders);
  }
  return p.application(bindings).bootstrap(appComponentType);
}
