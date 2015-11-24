export { BROWSER_PROVIDERS, ELEMENT_PROBE_BINDINGS, ELEMENT_PROBE_PROVIDERS, inspectNativeElement, BrowserDomAdapter, By, Title, DOCUMENT } from 'angular2/src/platform/browser_common';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXIudHMiXSwibmFtZXMiOlsiYm9vdHN0cmFwIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUNFLGlCQUFpQixFQUNqQixzQkFBc0IsRUFDdEIsdUJBQXVCLEVBQ3ZCLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDakIsRUFBRSxFQUNGLEtBQUssRUFDTCxRQUFRLFFBQ0gsc0NBQXNDLENBQUM7T0FFdkMsRUFBTyxTQUFTLEVBQUUsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BRTdELEVBQ0wsaUJBQWlCLEVBQ2pCLDRCQUE0QixFQUM3QixNQUFNLHNDQUFzQztPQUN0QyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sbUJBQW1CO09BQzdDLEVBQWUsUUFBUSxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWU7T0FDeEQsRUFBQyxzQkFBc0IsRUFBQyxNQUFNLHNEQUFzRDtPQUNwRixFQUFDLE9BQU8sRUFBQyxNQUFNLHdDQUF3QztPQUN2RCxFQUFDLEdBQUcsRUFBQyxNQUFNLG1CQUFtQjtPQUM5QixFQUFDLFFBQVEsRUFBQyxNQUFNLHNCQUFzQjtBQUU3Qzs7R0FFRztBQUNILGFBQWEscUJBQXFCLEdBQTJDLFVBQVUsQ0FBQztJQUN0Riw0QkFBNEI7SUFDNUIsa0JBQWtCO0lBQ2xCLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsQ0FBQztDQUN2QyxDQUFDLENBQUM7QUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtRkc7QUFDSCwwQkFDSSxnQkFBc0IsRUFDdEIsZUFBd0Q7SUFDMURBLFNBQVNBLENBQUNBLHNCQUFzQkEsR0FBR0EsSUFBSUEsc0JBQXNCQSxFQUFFQSxDQUFDQTtJQUNoRUEsSUFBSUEsWUFBWUEsR0FDWkEsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EscUJBQXFCQSxFQUFFQSxlQUFlQSxDQUFDQSxHQUFHQSxxQkFBcUJBLENBQUNBO0lBQ2xHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7QUFDM0ZBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHtcbiAgQlJPV1NFUl9QUk9WSURFUlMsXG4gIEVMRU1FTlRfUFJPQkVfQklORElOR1MsXG4gIEVMRU1FTlRfUFJPQkVfUFJPVklERVJTLFxuICBpbnNwZWN0TmF0aXZlRWxlbWVudCxcbiAgQnJvd3NlckRvbUFkYXB0ZXIsXG4gIEJ5LFxuICBUaXRsZSxcbiAgRE9DVU1FTlRcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2Jyb3dzZXJfY29tbW9uJztcblxuaW1wb3J0IHtUeXBlLCBpc1ByZXNlbnQsIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2V9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvcHJvbWlzZSc7XG5pbXBvcnQge1xuICBCUk9XU0VSX1BST1ZJREVSUyxcbiAgQlJPV1NFUl9BUFBfQ09NTU9OX1BST1ZJREVSU1xufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlcl9jb21tb24nO1xuaW1wb3J0IHtDT01QSUxFUl9QUk9WSURFUlN9IGZyb20gJ2FuZ3VsYXIyL2NvbXBpbGVyJztcbmltcG9ydCB7Q29tcG9uZW50UmVmLCBwbGF0Zm9ybSwgcmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7UmVmbGVjdGlvbkNhcGFiaWxpdGllc30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uX2NhcGFiaWxpdGllcyc7XG5pbXBvcnQge1hIUkltcGx9IGZyb20gXCJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci94aHJfaW1wbFwiO1xuaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL2NvbXBpbGVyJztcbmltcG9ydCB7UHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuLyoqXG4gKiBBbiBhcnJheSBvZiBwcm92aWRlcnMgdGhhdCBzaG91bGQgYmUgcGFzc2VkIGludG8gYGFwcGxpY2F0aW9uKClgIHdoZW4gYm9vdHN0cmFwcGluZyBhIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IEJST1dTRVJfQVBQX1BST1ZJREVSUzogQXJyYXk8YW55IC8qVHlwZSB8IFByb3ZpZGVyIHwgYW55W10qLz4gPSBDT05TVF9FWFBSKFtcbiAgQlJPV1NFUl9BUFBfQ09NTU9OX1BST1ZJREVSUyxcbiAgQ09NUElMRVJfUFJPVklERVJTLFxuICBuZXcgUHJvdmlkZXIoWEhSLCB7dXNlQ2xhc3M6IFhIUkltcGx9KSxcbl0pO1xuXG4vKipcbiAqIEJvb3RzdHJhcHBpbmcgZm9yIEFuZ3VsYXIgYXBwbGljYXRpb25zLlxuICpcbiAqIFlvdSBpbnN0YW50aWF0ZSBhbiBBbmd1bGFyIGFwcGxpY2F0aW9uIGJ5IGV4cGxpY2l0bHkgc3BlY2lmeWluZyBhIGNvbXBvbmVudCB0byB1c2VcbiAqIGFzIHRoZSByb290IGNvbXBvbmVudCBmb3IgeW91ciBhcHBsaWNhdGlvbiB2aWEgdGhlIGBib290c3RyYXAoKWAgbWV0aG9kLlxuICpcbiAqICMjIFNpbXBsZSBFeGFtcGxlXG4gKlxuICogQXNzdW1pbmcgdGhpcyBgaW5kZXguaHRtbGA6XG4gKlxuICogYGBgaHRtbFxuICogPGh0bWw+XG4gKiAgIDwhLS0gbG9hZCBBbmd1bGFyIHNjcmlwdCB0YWdzIGhlcmUuIC0tPlxuICogICA8Ym9keT5cbiAqICAgICA8bXktYXBwPmxvYWRpbmcuLi48L215LWFwcD5cbiAqICAgPC9ib2R5PlxuICogPC9odG1sPlxuICogYGBgXG4gKlxuICogQW4gYXBwbGljYXRpb24gaXMgYm9vdHN0cmFwcGVkIGluc2lkZSBhbiBleGlzdGluZyBicm93c2VyIERPTSwgdHlwaWNhbGx5IGBpbmRleC5odG1sYC5cbiAqIFVubGlrZSBBbmd1bGFyIDEsIEFuZ3VsYXIgMiBkb2VzIG5vdCBjb21waWxlL3Byb2Nlc3MgcHJvdmlkZXJzIGluIGBpbmRleC5odG1sYC4gVGhpcyBpc1xuICogbWFpbmx5IGZvciBzZWN1cml0eSByZWFzb25zLCBhcyB3ZWxsIGFzIGFyY2hpdGVjdHVyYWwgY2hhbmdlcyBpbiBBbmd1bGFyIDIuIFRoaXMgbWVhbnNcbiAqIHRoYXQgYGluZGV4Lmh0bWxgIGNhbiBzYWZlbHkgYmUgcHJvY2Vzc2VkIHVzaW5nIHNlcnZlci1zaWRlIHRlY2hub2xvZ2llcyBzdWNoIGFzXG4gKiBwcm92aWRlcnMuIEJpbmRpbmdzIGNhbiB0aHVzIHVzZSBkb3VibGUtY3VybHkgYHt7IHN5bnRheCB9fWAgd2l0aG91dCBjb2xsaXNpb24gZnJvbVxuICogQW5ndWxhciAyIGNvbXBvbmVudCBkb3VibGUtY3VybHkgYHt7IHN5bnRheCB9fWAuXG4gKlxuICogV2UgY2FuIHVzZSB0aGlzIHNjcmlwdCBjb2RlOlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgICBzZWxlY3RvcjogJ215LWFwcCcsXG4gKiAgICB0ZW1wbGF0ZTogJ0hlbGxvIHt7IG5hbWUgfX0hJ1xuICogfSlcbiAqIGNsYXNzIE15QXBwIHtcbiAqICAgbmFtZTpzdHJpbmc7XG4gKlxuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICB0aGlzLm5hbWUgPSAnV29ybGQnO1xuICogICB9XG4gKiB9XG4gKlxuICogbWFpbigpIHtcbiAqICAgcmV0dXJuIGJvb3RzdHJhcChNeUFwcCk7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBXaGVuIHRoZSBhcHAgZGV2ZWxvcGVyIGludm9rZXMgYGJvb3RzdHJhcCgpYCB3aXRoIHRoZSByb290IGNvbXBvbmVudCBgTXlBcHBgIGFzIGl0c1xuICogYXJndW1lbnQsIEFuZ3VsYXIgcGVyZm9ybXMgdGhlIGZvbGxvd2luZyB0YXNrczpcbiAqXG4gKiAgMS4gSXQgdXNlcyB0aGUgY29tcG9uZW50J3MgYHNlbGVjdG9yYCBwcm9wZXJ0eSB0byBsb2NhdGUgdGhlIERPTSBlbGVtZW50IHdoaWNoIG5lZWRzXG4gKiAgICAgdG8gYmUgdXBncmFkZWQgaW50byB0aGUgYW5ndWxhciBjb21wb25lbnQuXG4gKiAgMi4gSXQgY3JlYXRlcyBhIG5ldyBjaGlsZCBpbmplY3RvciAoZnJvbSB0aGUgcGxhdGZvcm0gaW5qZWN0b3IpLiBPcHRpb25hbGx5LCB5b3UgY2FuXG4gKiAgICAgYWxzbyBvdmVycmlkZSB0aGUgaW5qZWN0b3IgY29uZmlndXJhdGlvbiBmb3IgYW4gYXBwIGJ5IGludm9raW5nIGBib290c3RyYXBgIHdpdGggdGhlXG4gKiAgICAgYGNvbXBvbmVudEluamVjdGFibGVCaW5kaW5nc2AgYXJndW1lbnQuXG4gKiAgMy4gSXQgY3JlYXRlcyBhIG5ldyBgWm9uZWAgYW5kIGNvbm5lY3RzIGl0IHRvIHRoZSBhbmd1bGFyIGFwcGxpY2F0aW9uJ3MgY2hhbmdlIGRldGVjdGlvblxuICogICAgIGRvbWFpbiBpbnN0YW5jZS5cbiAqICA0LiBJdCBjcmVhdGVzIGFuIGVtdWxhdGVkIG9yIHNoYWRvdyBET00gb24gdGhlIHNlbGVjdGVkIGNvbXBvbmVudCdzIGhvc3QgZWxlbWVudCBhbmQgbG9hZHMgdGhlXG4gKiAgICAgdGVtcGxhdGUgaW50byBpdC5cbiAqICA1LiBJdCBpbnN0YW50aWF0ZXMgdGhlIHNwZWNpZmllZCBjb21wb25lbnQuXG4gKiAgNi4gRmluYWxseSwgQW5ndWxhciBwZXJmb3JtcyBjaGFuZ2UgZGV0ZWN0aW9uIHRvIGFwcGx5IHRoZSBpbml0aWFsIGRhdGEgcHJvdmlkZXJzIGZvciB0aGVcbiAqICAgICBhcHBsaWNhdGlvbi5cbiAqXG4gKlxuICogIyMgQm9vdHN0cmFwcGluZyBNdWx0aXBsZSBBcHBsaWNhdGlvbnNcbiAqXG4gKiBXaGVuIHdvcmtpbmcgd2l0aGluIGEgYnJvd3NlciB3aW5kb3csIHRoZXJlIGFyZSBtYW55IHNpbmdsZXRvbiByZXNvdXJjZXM6IGNvb2tpZXMsIHRpdGxlLFxuICogbG9jYXRpb24sIGFuZCBvdGhlcnMuIEFuZ3VsYXIgc2VydmljZXMgdGhhdCByZXByZXNlbnQgdGhlc2UgcmVzb3VyY2VzIG11c3QgbGlrZXdpc2UgYmVcbiAqIHNoYXJlZCBhY3Jvc3MgYWxsIEFuZ3VsYXIgYXBwbGljYXRpb25zIHRoYXQgb2NjdXB5IHRoZSBzYW1lIGJyb3dzZXIgd2luZG93LiBGb3IgdGhpc1xuICogcmVhc29uLCBBbmd1bGFyIGNyZWF0ZXMgZXhhY3RseSBvbmUgZ2xvYmFsIHBsYXRmb3JtIG9iamVjdCB3aGljaCBzdG9yZXMgYWxsIHNoYXJlZFxuICogc2VydmljZXMsIGFuZCBlYWNoIGFuZ3VsYXIgYXBwbGljYXRpb24gaW5qZWN0b3IgaGFzIHRoZSBwbGF0Zm9ybSBpbmplY3RvciBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEVhY2ggYXBwbGljYXRpb24gaGFzIGl0cyBvd24gcHJpdmF0ZSBpbmplY3RvciBhcyB3ZWxsLiBXaGVuIHRoZXJlIGFyZSBtdWx0aXBsZVxuICogYXBwbGljYXRpb25zIG9uIGEgcGFnZSwgQW5ndWxhciB0cmVhdHMgZWFjaCBhcHBsaWNhdGlvbiBpbmplY3RvcidzIHNlcnZpY2VzIGFzIHByaXZhdGVcbiAqIHRvIHRoYXQgYXBwbGljYXRpb24uXG4gKlxuICogIyMgQVBJXG4gKlxuICogLSBgYXBwQ29tcG9uZW50VHlwZWA6IFRoZSByb290IGNvbXBvbmVudCB3aGljaCBzaG91bGQgYWN0IGFzIHRoZSBhcHBsaWNhdGlvbi4gVGhpcyBpc1xuICogICBhIHJlZmVyZW5jZSB0byBhIGBUeXBlYCB3aGljaCBpcyBhbm5vdGF0ZWQgd2l0aCBgQENvbXBvbmVudCguLi4pYC5cbiAqIC0gYGN1c3RvbVByb3ZpZGVyc2A6IEFuIGFkZGl0aW9uYWwgc2V0IG9mIHByb3ZpZGVycyB0aGF0IGNhbiBiZSBhZGRlZCB0byB0aGVcbiAqICAgYXBwIGluamVjdG9yIHRvIG92ZXJyaWRlIGRlZmF1bHQgaW5qZWN0aW9uIGJlaGF2aW9yLlxuICpcbiAqIFJldHVybnMgYSBgUHJvbWlzZWAgb2Yge0BsaW5rIENvbXBvbmVudFJlZn0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBib290c3RyYXAoXG4gICAgYXBwQ29tcG9uZW50VHlwZTogVHlwZSxcbiAgICBjdXN0b21Qcm92aWRlcnM/OiBBcnJheTxhbnkgLypUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXSovPik6IFByb21pc2U8Q29tcG9uZW50UmVmPiB7XG4gIHJlZmxlY3Rvci5yZWZsZWN0aW9uQ2FwYWJpbGl0aWVzID0gbmV3IFJlZmxlY3Rpb25DYXBhYmlsaXRpZXMoKTtcbiAgbGV0IGFwcFByb3ZpZGVycyA9XG4gICAgICBpc1ByZXNlbnQoY3VzdG9tUHJvdmlkZXJzKSA/IFtCUk9XU0VSX0FQUF9QUk9WSURFUlMsIGN1c3RvbVByb3ZpZGVyc10gOiBCUk9XU0VSX0FQUF9QUk9WSURFUlM7XG4gIHJldHVybiBwbGF0Zm9ybShCUk9XU0VSX1BST1ZJREVSUykuYXBwbGljYXRpb24oYXBwUHJvdmlkZXJzKS5ib290c3RyYXAoYXBwQ29tcG9uZW50VHlwZSk7XG59Il19