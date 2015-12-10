export { AngularEntrypoint } from 'angular2/src/core/angular_entrypoint';
export { BROWSER_PROVIDERS, ELEMENT_PROBE_BINDINGS, ELEMENT_PROBE_PROVIDERS, inspectNativeElement, BrowserDomAdapter, By, Title, DOCUMENT, enableDebugTools, disableDebugTools } from 'angular2/src/platform/browser_common';
import { isPresent, CONST_EXPR } from 'angular2/src/facade/lang';
import { BROWSER_PROVIDERS, BROWSER_APP_COMMON_PROVIDERS } from 'angular2/src/platform/browser_common';
import { COMPILER_PROVIDERS } from 'angular2/compiler';
import { platform, reflector } from 'angular2/core';
import { ReflectionCapabilities } from 'angular2/src/core/reflection/reflection_capabilities';
import { XHRImpl } from "angular2/src/platform/browser/xhr_impl";
import { XHR } from 'angular2/compiler';
import { Provider } from 'angular2/src/core/di';
/**
 * An array of providers that should be passed into `application()` when bootstrapping a component.
 */
export const BROWSER_APP_PROVIDERS = CONST_EXPR([
    BROWSER_APP_COMMON_PROVIDERS,
    COMPILER_PROVIDERS,
    new Provider(XHR, { useClass: XHRImpl }),
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
export function bootstrap(appComponentType, customProviders) {
    reflector.reflectionCapabilities = new ReflectionCapabilities();
    let appProviders = isPresent(customProviders) ? [BROWSER_APP_PROVIDERS, customProviders] : BROWSER_APP_PROVIDERS;
    return platform(BROWSER_PROVIDERS).application(appProviders).bootstrap(appComponentType);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXIudHMiXSwibmFtZXMiOlsiYm9vdHN0cmFwIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFRLGlCQUFpQixRQUFPLHNDQUFzQyxDQUFDO0FBQ3ZFLFNBQ0UsaUJBQWlCLEVBQ2pCLHNCQUFzQixFQUN0Qix1QkFBdUIsRUFDdkIsb0JBQW9CLEVBQ3BCLGlCQUFpQixFQUNqQixFQUFFLEVBQ0YsS0FBSyxFQUNMLFFBQVEsRUFDUixnQkFBZ0IsRUFDaEIsaUJBQWlCLFFBQ1osc0NBQXNDLENBQUM7T0FFdkMsRUFBTyxTQUFTLEVBQUUsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BRTdELEVBQ0wsaUJBQWlCLEVBQ2pCLDRCQUE0QixFQUM3QixNQUFNLHNDQUFzQztPQUN0QyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sbUJBQW1CO09BQzdDLEVBQWUsUUFBUSxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWU7T0FDeEQsRUFBQyxzQkFBc0IsRUFBQyxNQUFNLHNEQUFzRDtPQUNwRixFQUFDLE9BQU8sRUFBQyxNQUFNLHdDQUF3QztPQUN2RCxFQUFDLEdBQUcsRUFBQyxNQUFNLG1CQUFtQjtPQUM5QixFQUFDLFFBQVEsRUFBQyxNQUFNLHNCQUFzQjtBQUU3Qzs7R0FFRztBQUNILGFBQWEscUJBQXFCLEdBQTJDLFVBQVUsQ0FBQztJQUN0Riw0QkFBNEI7SUFDNUIsa0JBQWtCO0lBQ2xCLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsQ0FBQztDQUN2QyxDQUFDLENBQUM7QUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtRkc7QUFDSCwwQkFDSSxnQkFBc0IsRUFDdEIsZUFBd0Q7SUFDMURBLFNBQVNBLENBQUNBLHNCQUFzQkEsR0FBR0EsSUFBSUEsc0JBQXNCQSxFQUFFQSxDQUFDQTtJQUNoRUEsSUFBSUEsWUFBWUEsR0FDWkEsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EscUJBQXFCQSxFQUFFQSxlQUFlQSxDQUFDQSxHQUFHQSxxQkFBcUJBLENBQUNBO0lBQ2xHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7QUFDM0ZBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHtBbmd1bGFyRW50cnlwb2ludH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvYW5ndWxhcl9lbnRyeXBvaW50JztcbmV4cG9ydCB7XG4gIEJST1dTRVJfUFJPVklERVJTLFxuICBFTEVNRU5UX1BST0JFX0JJTkRJTkdTLFxuICBFTEVNRU5UX1BST0JFX1BST1ZJREVSUyxcbiAgaW5zcGVjdE5hdGl2ZUVsZW1lbnQsXG4gIEJyb3dzZXJEb21BZGFwdGVyLFxuICBCeSxcbiAgVGl0bGUsXG4gIERPQ1VNRU5ULFxuICBlbmFibGVEZWJ1Z1Rvb2xzLFxuICBkaXNhYmxlRGVidWdUb29sc1xufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlcl9jb21tb24nO1xuXG5pbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UHJvbWlzZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9wcm9taXNlJztcbmltcG9ydCB7XG4gIEJST1dTRVJfUFJPVklERVJTLFxuICBCUk9XU0VSX0FQUF9DT01NT05fUFJPVklERVJTXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9icm93c2VyX2NvbW1vbic7XG5pbXBvcnQge0NPTVBJTEVSX1BST1ZJREVSU30gZnJvbSAnYW5ndWxhcjIvY29tcGlsZXInO1xuaW1wb3J0IHtDb21wb25lbnRSZWYsIHBsYXRmb3JtLCByZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtSZWZsZWN0aW9uQ2FwYWJpbGl0aWVzfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb25fY2FwYWJpbGl0aWVzJztcbmltcG9ydCB7WEhSSW1wbH0gZnJvbSBcImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9icm93c2VyL3hocl9pbXBsXCI7XG5pbXBvcnQge1hIUn0gZnJvbSAnYW5ndWxhcjIvY29tcGlsZXInO1xuaW1wb3J0IHtQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG4vKipcbiAqIEFuIGFycmF5IG9mIHByb3ZpZGVycyB0aGF0IHNob3VsZCBiZSBwYXNzZWQgaW50byBgYXBwbGljYXRpb24oKWAgd2hlbiBib290c3RyYXBwaW5nIGEgY29tcG9uZW50LlxuICovXG5leHBvcnQgY29uc3QgQlJPV1NFUl9BUFBfUFJPVklERVJTOiBBcnJheTxhbnkgLypUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXSovPiA9IENPTlNUX0VYUFIoW1xuICBCUk9XU0VSX0FQUF9DT01NT05fUFJPVklERVJTLFxuICBDT01QSUxFUl9QUk9WSURFUlMsXG4gIG5ldyBQcm92aWRlcihYSFIsIHt1c2VDbGFzczogWEhSSW1wbH0pLFxuXSk7XG5cbi8qKlxuICogQm9vdHN0cmFwcGluZyBmb3IgQW5ndWxhciBhcHBsaWNhdGlvbnMuXG4gKlxuICogWW91IGluc3RhbnRpYXRlIGFuIEFuZ3VsYXIgYXBwbGljYXRpb24gYnkgZXhwbGljaXRseSBzcGVjaWZ5aW5nIGEgY29tcG9uZW50IHRvIHVzZVxuICogYXMgdGhlIHJvb3QgY29tcG9uZW50IGZvciB5b3VyIGFwcGxpY2F0aW9uIHZpYSB0aGUgYGJvb3RzdHJhcCgpYCBtZXRob2QuXG4gKlxuICogIyMgU2ltcGxlIEV4YW1wbGVcbiAqXG4gKiBBc3N1bWluZyB0aGlzIGBpbmRleC5odG1sYDpcbiAqXG4gKiBgYGBodG1sXG4gKiA8aHRtbD5cbiAqICAgPCEtLSBsb2FkIEFuZ3VsYXIgc2NyaXB0IHRhZ3MgaGVyZS4gLS0+XG4gKiAgIDxib2R5PlxuICogICAgIDxteS1hcHA+bG9hZGluZy4uLjwvbXktYXBwPlxuICogICA8L2JvZHk+XG4gKiA8L2h0bWw+XG4gKiBgYGBcbiAqXG4gKiBBbiBhcHBsaWNhdGlvbiBpcyBib290c3RyYXBwZWQgaW5zaWRlIGFuIGV4aXN0aW5nIGJyb3dzZXIgRE9NLCB0eXBpY2FsbHkgYGluZGV4Lmh0bWxgLlxuICogVW5saWtlIEFuZ3VsYXIgMSwgQW5ndWxhciAyIGRvZXMgbm90IGNvbXBpbGUvcHJvY2VzcyBwcm92aWRlcnMgaW4gYGluZGV4Lmh0bWxgLiBUaGlzIGlzXG4gKiBtYWlubHkgZm9yIHNlY3VyaXR5IHJlYXNvbnMsIGFzIHdlbGwgYXMgYXJjaGl0ZWN0dXJhbCBjaGFuZ2VzIGluIEFuZ3VsYXIgMi4gVGhpcyBtZWFuc1xuICogdGhhdCBgaW5kZXguaHRtbGAgY2FuIHNhZmVseSBiZSBwcm9jZXNzZWQgdXNpbmcgc2VydmVyLXNpZGUgdGVjaG5vbG9naWVzIHN1Y2ggYXNcbiAqIHByb3ZpZGVycy4gQmluZGluZ3MgY2FuIHRodXMgdXNlIGRvdWJsZS1jdXJseSBge3sgc3ludGF4IH19YCB3aXRob3V0IGNvbGxpc2lvbiBmcm9tXG4gKiBBbmd1bGFyIDIgY29tcG9uZW50IGRvdWJsZS1jdXJseSBge3sgc3ludGF4IH19YC5cbiAqXG4gKiBXZSBjYW4gdXNlIHRoaXMgc2NyaXB0IGNvZGU6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgIHNlbGVjdG9yOiAnbXktYXBwJyxcbiAqICAgIHRlbXBsYXRlOiAnSGVsbG8ge3sgbmFtZSB9fSEnXG4gKiB9KVxuICogY2xhc3MgTXlBcHAge1xuICogICBuYW1lOnN0cmluZztcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHRoaXMubmFtZSA9ICdXb3JsZCc7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBtYWluKCkge1xuICogICByZXR1cm4gYm9vdHN0cmFwKE15QXBwKTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdoZW4gdGhlIGFwcCBkZXZlbG9wZXIgaW52b2tlcyBgYm9vdHN0cmFwKClgIHdpdGggdGhlIHJvb3QgY29tcG9uZW50IGBNeUFwcGAgYXMgaXRzXG4gKiBhcmd1bWVudCwgQW5ndWxhciBwZXJmb3JtcyB0aGUgZm9sbG93aW5nIHRhc2tzOlxuICpcbiAqICAxLiBJdCB1c2VzIHRoZSBjb21wb25lbnQncyBgc2VsZWN0b3JgIHByb3BlcnR5IHRvIGxvY2F0ZSB0aGUgRE9NIGVsZW1lbnQgd2hpY2ggbmVlZHNcbiAqICAgICB0byBiZSB1cGdyYWRlZCBpbnRvIHRoZSBhbmd1bGFyIGNvbXBvbmVudC5cbiAqICAyLiBJdCBjcmVhdGVzIGEgbmV3IGNoaWxkIGluamVjdG9yIChmcm9tIHRoZSBwbGF0Zm9ybSBpbmplY3RvcikuIE9wdGlvbmFsbHksIHlvdSBjYW5cbiAqICAgICBhbHNvIG92ZXJyaWRlIHRoZSBpbmplY3RvciBjb25maWd1cmF0aW9uIGZvciBhbiBhcHAgYnkgaW52b2tpbmcgYGJvb3RzdHJhcGAgd2l0aCB0aGVcbiAqICAgICBgY29tcG9uZW50SW5qZWN0YWJsZUJpbmRpbmdzYCBhcmd1bWVudC5cbiAqICAzLiBJdCBjcmVhdGVzIGEgbmV3IGBab25lYCBhbmQgY29ubmVjdHMgaXQgdG8gdGhlIGFuZ3VsYXIgYXBwbGljYXRpb24ncyBjaGFuZ2UgZGV0ZWN0aW9uXG4gKiAgICAgZG9tYWluIGluc3RhbmNlLlxuICogIDQuIEl0IGNyZWF0ZXMgYW4gZW11bGF0ZWQgb3Igc2hhZG93IERPTSBvbiB0aGUgc2VsZWN0ZWQgY29tcG9uZW50J3MgaG9zdCBlbGVtZW50IGFuZCBsb2FkcyB0aGVcbiAqICAgICB0ZW1wbGF0ZSBpbnRvIGl0LlxuICogIDUuIEl0IGluc3RhbnRpYXRlcyB0aGUgc3BlY2lmaWVkIGNvbXBvbmVudC5cbiAqICA2LiBGaW5hbGx5LCBBbmd1bGFyIHBlcmZvcm1zIGNoYW5nZSBkZXRlY3Rpb24gdG8gYXBwbHkgdGhlIGluaXRpYWwgZGF0YSBwcm92aWRlcnMgZm9yIHRoZVxuICogICAgIGFwcGxpY2F0aW9uLlxuICpcbiAqXG4gKiAjIyBCb290c3RyYXBwaW5nIE11bHRpcGxlIEFwcGxpY2F0aW9uc1xuICpcbiAqIFdoZW4gd29ya2luZyB3aXRoaW4gYSBicm93c2VyIHdpbmRvdywgdGhlcmUgYXJlIG1hbnkgc2luZ2xldG9uIHJlc291cmNlczogY29va2llcywgdGl0bGUsXG4gKiBsb2NhdGlvbiwgYW5kIG90aGVycy4gQW5ndWxhciBzZXJ2aWNlcyB0aGF0IHJlcHJlc2VudCB0aGVzZSByZXNvdXJjZXMgbXVzdCBsaWtld2lzZSBiZVxuICogc2hhcmVkIGFjcm9zcyBhbGwgQW5ndWxhciBhcHBsaWNhdGlvbnMgdGhhdCBvY2N1cHkgdGhlIHNhbWUgYnJvd3NlciB3aW5kb3cuIEZvciB0aGlzXG4gKiByZWFzb24sIEFuZ3VsYXIgY3JlYXRlcyBleGFjdGx5IG9uZSBnbG9iYWwgcGxhdGZvcm0gb2JqZWN0IHdoaWNoIHN0b3JlcyBhbGwgc2hhcmVkXG4gKiBzZXJ2aWNlcywgYW5kIGVhY2ggYW5ndWxhciBhcHBsaWNhdGlvbiBpbmplY3RvciBoYXMgdGhlIHBsYXRmb3JtIGluamVjdG9yIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogRWFjaCBhcHBsaWNhdGlvbiBoYXMgaXRzIG93biBwcml2YXRlIGluamVjdG9yIGFzIHdlbGwuIFdoZW4gdGhlcmUgYXJlIG11bHRpcGxlXG4gKiBhcHBsaWNhdGlvbnMgb24gYSBwYWdlLCBBbmd1bGFyIHRyZWF0cyBlYWNoIGFwcGxpY2F0aW9uIGluamVjdG9yJ3Mgc2VydmljZXMgYXMgcHJpdmF0ZVxuICogdG8gdGhhdCBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyBBUElcbiAqXG4gKiAtIGBhcHBDb21wb25lbnRUeXBlYDogVGhlIHJvb3QgY29tcG9uZW50IHdoaWNoIHNob3VsZCBhY3QgYXMgdGhlIGFwcGxpY2F0aW9uLiBUaGlzIGlzXG4gKiAgIGEgcmVmZXJlbmNlIHRvIGEgYFR5cGVgIHdoaWNoIGlzIGFubm90YXRlZCB3aXRoIGBAQ29tcG9uZW50KC4uLilgLlxuICogLSBgY3VzdG9tUHJvdmlkZXJzYDogQW4gYWRkaXRpb25hbCBzZXQgb2YgcHJvdmlkZXJzIHRoYXQgY2FuIGJlIGFkZGVkIHRvIHRoZVxuICogICBhcHAgaW5qZWN0b3IgdG8gb3ZlcnJpZGUgZGVmYXVsdCBpbmplY3Rpb24gYmVoYXZpb3IuXG4gKlxuICogUmV0dXJucyBhIGBQcm9taXNlYCBvZiB7QGxpbmsgQ29tcG9uZW50UmVmfS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJvb3RzdHJhcChcbiAgICBhcHBDb21wb25lbnRUeXBlOiBUeXBlLFxuICAgIGN1c3RvbVByb3ZpZGVycz86IEFycmF5PGFueSAvKlR5cGUgfCBQcm92aWRlciB8IGFueVtdKi8+KTogUHJvbWlzZTxDb21wb25lbnRSZWY+IHtcbiAgcmVmbGVjdG9yLnJlZmxlY3Rpb25DYXBhYmlsaXRpZXMgPSBuZXcgUmVmbGVjdGlvbkNhcGFiaWxpdGllcygpO1xuICBsZXQgYXBwUHJvdmlkZXJzID1cbiAgICAgIGlzUHJlc2VudChjdXN0b21Qcm92aWRlcnMpID8gW0JST1dTRVJfQVBQX1BST1ZJREVSUywgY3VzdG9tUHJvdmlkZXJzXSA6IEJST1dTRVJfQVBQX1BST1ZJREVSUztcbiAgcmV0dXJuIHBsYXRmb3JtKEJST1dTRVJfUFJPVklERVJTKS5hcHBsaWNhdGlvbihhcHBQcm92aWRlcnMpLmJvb3RzdHJhcChhcHBDb21wb25lbnRUeXBlKTtcbn1cbiJdfQ==