import {
  PLATFORM_INITIALIZER,
  PLATFORM_DIRECTIVES,
  PLATFORM_PIPES,
  ExceptionHandler,
  RootRenderer,
  APPLICATION_COMMON_PROVIDERS,
  PLATFORM_COMMON_PROVIDERS,
  OpaqueToken,
  Testability,
  PlatformRef,
  getPlatform,
  createPlatform,
  assertPlatform,
  ReflectiveInjector,
  reflector,
  coreLoadAndBootstrap,
  Type,
  ComponentRef
} from "@angular/core";
import {isBlank, isPresent} from "./facade/lang";
import {wtfInit, SanitizationService, ReflectionCapabilities, AnimationDriver, NoOpAnimationDriver} from '../core_private';
import {WebAnimationsDriver} from '../src/dom/web_animations_driver';
import {COMMON_DIRECTIVES, COMMON_PIPES, FORM_PROVIDERS, PlatformLocation} from "@angular/common";
import {DomSanitizationService, DomSanitizationServiceImpl} from "./security/dom_sanitization_service";
import {BrowserDomAdapter} from "./browser/browser_adapter";
import {BrowserGetTestability} from "./browser/testability";
import {getDOM} from "./dom/dom_adapter";
import {DOCUMENT} from "./dom/dom_tokens";
import {EVENT_MANAGER_PLUGINS, EventManager} from "./dom/events/event_manager";
import {DomRootRenderer, DomRootRenderer_} from "./dom/dom_renderer";
import {SharedStylesHost, DomSharedStylesHost} from "./dom/shared_styles_host";
import {KeyEventsPlugin} from "./dom/events/key_events";
import {ELEMENT_PROBE_PROVIDERS} from "./dom/debug/ng_probe";
import {DomEventsPlugin} from "./dom/events/dom_events";
import {HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerGesturesPlugin} from "./dom/events/hammer_gestures";
import {BrowserPlatformLocation} from "./browser/location/browser_platform_location";
import {COMPILER_PROVIDERS, XHR} from "@angular/compiler";
import {CachedXHR} from "./xhr/xhr_cache";
import {XHRImpl} from "./xhr/xhr_impl";

export const CACHED_TEMPLATE_PROVIDER: Array<any /*Type | Provider | any[]*/> =
  [{provide: XHR, useClass: CachedXHR}];

const BROWSER_PLATFORM_MARKER = new OpaqueToken('BrowserPlatformMarker');

/**
 * A set of providers to initialize the Angular platform in a web browser.
 *
 * Used automatically by `bootstrap`, or can be passed to {@link platform}.
 */
export const BROWSER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  {provide: BROWSER_PLATFORM_MARKER, useValue: true},
  PLATFORM_COMMON_PROVIDERS,
  {provide: PLATFORM_INITIALIZER, useValue: initDomAdapter, multi: true},
  {provide: PlatformLocation, useClass: BrowserPlatformLocation}
];

export const BROWSER_SANITIZATION_PROVIDERS: Array<any> = [
  {provide: SanitizationService, useExisting: DomSanitizationService},
  {provide: DomSanitizationService, useClass: DomSanitizationServiceImpl},
];

/**
 * A set of providers to initialize an Angular application in a web browser.
 *
 * Used automatically by `bootstrap`, or can be passed to {@link PlatformRef.application}.
 */
export const BROWSER_APP_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    [
      APPLICATION_COMMON_PROVIDERS,
      FORM_PROVIDERS,
      BROWSER_SANITIZATION_PROVIDERS,
      {provide: PLATFORM_PIPES, useValue: COMMON_PIPES, multi: true},
      {provide: PLATFORM_DIRECTIVES, useValue: COMMON_DIRECTIVES, multi: true},
      {provide: ExceptionHandler, useFactory: _exceptionHandler, deps: []},
      {provide: DOCUMENT, useFactory: _document, deps: []},
      {provide: EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true},
      {provide: EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true},
      {provide: EVENT_MANAGER_PLUGINS, useClass: HammerGesturesPlugin, multi: true},
      {provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig},
      {provide: DomRootRenderer, useClass: DomRootRenderer_},
      {provide: RootRenderer, useExisting: DomRootRenderer},
      {provide: SharedStylesHost, useExisting: DomSharedStylesHost},
      {provide: AnimationDriver, useFactory: _resolveDefaultAnimationDriver},
      DomSharedStylesHost,
      Testability,
      EventManager,
      ELEMENT_PROBE_PROVIDERS
    ];

export const BROWSER_APP_COMPILER_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
  [
    COMPILER_PROVIDERS,
    {provide: XHR, useClass: XHRImpl},
  ];

export function browserPlatform(): PlatformRef {
  if (isBlank(getPlatform())) {
    createPlatform(ReflectiveInjector.resolveAndCreate(BROWSER_PLATFORM_PROVIDERS));
  }
  return assertPlatform(BROWSER_PLATFORM_MARKER);
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
 * {@example core/ts/bootstrap/bootstrap.ts region='bootstrap'}
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
 * ## Bootstrapping Multiple Applications
 *
 * When working within a browser window, there are many singleton resources: cookies, title,
 * location, and others. Angular services that represent these resources must likewise be
 * shared across all Angular applications that occupy the same browser window. For this
 * reason, Angular creates exactly one global platform object which stores all shared
 * services, and each angular application injector has the platform injector as its parent.
 *
 * Each application has its own private injector as well. When there are multiple
 * applications on a page, Angular treats each application injector's services as private
 * to that application.
 *
 * ## API
 *
 * - `appComponentType`: The root component which should act as the application. This is
 *   a reference to a `Type` which is annotated with `@Component(...)`.
 * - `customProviders`: An additional set of providers that can be added to the
 *   app injector to override default injection behavior.
 *
 * Returns a `Promise` of {@link ComponentRef}.
 */
export function bootstrap(
  appComponentType: Type,
  customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ComponentRef<any>> {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  let providers = [
    BROWSER_APP_PROVIDERS,
    BROWSER_APP_COMPILER_PROVIDERS,
    isPresent(customProviders) ? customProviders : []
  ];
  var appInjector = ReflectiveInjector.resolveAndCreate(providers, browserPlatform().injector);
  return coreLoadAndBootstrap(appComponentType, appInjector);
}

function initDomAdapter() {
  BrowserDomAdapter.makeCurrent();
  wtfInit();
  BrowserGetTestability.init();
}

function _exceptionHandler(): ExceptionHandler {
  return new ExceptionHandler(getDOM());
}

function _document(): any {
  return getDOM().defaultDoc();
}

function _resolveDefaultAnimationDriver(): AnimationDriver {
  if (getDOM().supportsWebAnimation()) {
    return new WebAnimationsDriver();
  }
  return new NoOpAnimationDriver();
}
