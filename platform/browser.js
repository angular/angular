'use strict';var angular_entrypoint_1 = require('angular2/src/core/angular_entrypoint');
exports.AngularEntrypoint = angular_entrypoint_1.AngularEntrypoint;
var browser_common_1 = require('angular2/src/platform/browser_common');
exports.BROWSER_PROVIDERS = browser_common_1.BROWSER_PROVIDERS;
exports.ELEMENT_PROBE_BINDINGS = browser_common_1.ELEMENT_PROBE_BINDINGS;
exports.ELEMENT_PROBE_PROVIDERS = browser_common_1.ELEMENT_PROBE_PROVIDERS;
exports.inspectNativeElement = browser_common_1.inspectNativeElement;
exports.BrowserDomAdapter = browser_common_1.BrowserDomAdapter;
exports.By = browser_common_1.By;
exports.Title = browser_common_1.Title;
exports.DOCUMENT = browser_common_1.DOCUMENT;
exports.enableDebugTools = browser_common_1.enableDebugTools;
exports.disableDebugTools = browser_common_1.disableDebugTools;
var lang_1 = require('angular2/src/facade/lang');
var browser_common_2 = require('angular2/src/platform/browser_common');
var compiler_1 = require('angular2/compiler');
var core_1 = require('angular2/core');
var reflection_capabilities_1 = require('angular2/src/core/reflection/reflection_capabilities');
var xhr_impl_1 = require("angular2/src/platform/browser/xhr_impl");
var compiler_2 = require('angular2/compiler');
var di_1 = require('angular2/src/core/di');
/**
 * An array of providers that should be passed into `application()` when bootstrapping a component.
 */
exports.BROWSER_APP_PROVIDERS = lang_1.CONST_EXPR([
    browser_common_2.BROWSER_APP_COMMON_PROVIDERS,
    compiler_1.COMPILER_PROVIDERS,
    new di_1.Provider(compiler_2.XHR, { useClass: xhr_impl_1.XHRImpl }),
]);
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
function bootstrap(appComponentType, customProviders) {
    core_1.reflector.reflectionCapabilities = new reflection_capabilities_1.ReflectionCapabilities();
    var appProviders = lang_1.isPresent(customProviders) ? [exports.BROWSER_APP_PROVIDERS, customProviders] : exports.BROWSER_APP_PROVIDERS;
    return core_1.platform(browser_common_2.BROWSER_PROVIDERS).application(appProviders).bootstrap(appComponentType);
}
exports.bootstrap = bootstrap;
//# sourceMappingURL=browser.js.map