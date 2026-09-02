# Design Doc: Router Error Boundaries & Redirect Handling

**Author**: Atscott
**Date**: September 2026
**Status**: In Review

## 1. Introduction & Motivation

With the introduction of Angular's template error boundary primitive (`@boundary` / `@error`), components can isolate and gracefully recover from runtime errors occurring in their subtrees without crashing the entire application.

In single-page applications, routes represent natural boundary demarcations:
- When a route-level component, resource loader, or template throws an error, the user should see an error state specifically for that route outlet while keeping the rest of the application shell intact.
- When an authentication check, data loader, or guard within a routed component or resource determines that redirection is required, it should be able to trigger a clean navigation (e.g. `throw new RedirectCommand('/login')`) without complex imperative boilerplate.

This document details the architecture and design decisions for integrating error boundaries into the Angular Router.

---

## 2. Goals and Non-Goals

### Goals
- **Opt-in & Tree-shakable**: Provide an opt-in router feature (`withErrorBoundaries`) for configuring global defaults and error hooks.
- **Route-Level Error Boundaries**: Allow individual routes to declare an `errorComponent` to render in place of a failed component.
- **View-Layer Error Scoping**: Isolate and catch view-level errors occurring during routed component creation (constructor, DI) and updates (lifecycle hooks, template bindings, resource loaders, view effects).
- **Single Canonical Recovery (`retry`)**: Provide an optional `retry?(): void` method on `RouterOutletContract` and `RouterOutlet`, callable via standard Dependency Injection (`outlet = inject(RouterOutlet, { optional: true }); outlet?.retry?.()`).
- **Route Data & Param Binding with Precedence**: Ensure `errorComponent` receives bound route parameters and data via `withComponentInputBinding()`, while guaranteeing that the caught runtime `Error` always takes precedence over any route params, data, query params, or resolvers named `'error'`.
- **First-Class RedirectCommand Support**: Seamlessly navigate when a `RedirectCommand` is thrown from a routed component or route resource.
- **Fail-Safe Fallbacks**: Catch and bubble any exceptions that occur inside the `errorComponent` itself up to parent template boundaries or the global `ErrorHandler`.
- **Clean Telemetry Extension**: Provide a global `onError` callback in `withErrorBoundaries` for telemetry/monitoring (e.g. Sentry, Datadog) without polluting `Router.events`.

### Non-Goals
- Router error boundaries do not replace root `ErrorHandler` for unhandled global exceptions outside of router outlets.
- We do not add new `Router.events` for error boundaries to avoid breaking changes and event stream clutter.
- Error boundaries operate at the view layer (`RouterOutlet`); they do not catch pre-activation navigation pipeline failures (e.g. `canActivate` guards or route `resolve` functions), which continue to be handled via `withNavigationErrorHandler`.

---

## 3. Architecture & Key Design Decisions

### 3.1. Route Configuration & Component Inputs

A route can specify an `errorComponent`:

```ts
export interface Route {
  // ...
  errorComponent?: Type<any>;
}
```

When an error occurs, the `RouterOutlet` instantiates the `errorComponent`, binds the `error` input, and provides itself via DI for recovery.

#### Canonical Error Component Contract

1. **Error Data (Input)**:
   The caught error is passed directly via component input (`readonly error = input<Error>()` or `@Input() error: Error`).

2. **Retry Action (DI Method)**:
   The `RouterOutlet` is available in the element injector hierarchy and implements `RouterOutletContract.retry?(): void`:
   ```ts
   @Component({
     template: `
       <div class="error-view">
         <h2>Failed to load: {{ error()?.message }}</h2>
         @if (outlet?.retry) {
           <button (click)="outlet?.retry?.()">Retry</button>
         }
       </div>
     `,
   })
   export class ErrorFallbackComponent {
     readonly error = input<Error>();
     protected outlet = inject(RouterOutlet, { optional: true });
   }
   ```

*Design Note*: We deliberately avoid magical reflection on output properties (e.g. subscribing to `output()` instances behind the scenes) and callback closure inputs (`input<() => void>()`), keeping the API direct, standard, and fully type-safe.

#### Route Input Binding & Parameter Precedence
When `withComponentInputBinding()` is configured:
- `errorComponent` receives route parameters, query parameters, and route data.
- **Precedence Guarantee**: The caught runtime `Error` instance **always overrides** any route data, path params, query params, or resolvers named `'error'`. The `RoutedComponentInputBinder` protects the `'error'` input from being overwritten by route data or reset to `undefined`.

---

### 3.2. Creation Pass vs. Update Pass Error Handling

Errors can occur at two distinct phases of component lifecycle:

1. **Creation Pass Errors** (Synchronous):
   - Thrown inside component `constructor()`, field `inject()` initializers, or initial template creation (`RenderFlags.Create`).
   - In standard `ViewContainerRef.createComponent()`, these errors throw synchronously before the view's `ON_ERROR` handler is attached.
   - **Router Behavior**: `RouterOutlet.activateWith()` wraps `location.createComponent()` in a `try...catch`. If creation fails and an `errorComponent` (or default) is configured, the outlet catches the error, mounts the `errorComponent`, and allows the navigation transition to complete successfully (`NavigationEnd`). If no error component is configured, it rethrows, resulting in a standard `NavigationError`.

2. **Update Pass Errors** (Asynchronous / Change Detection):
   - Thrown in `ngOnInit()`, template bindings, signals, resource loader effects (`createResourceOutletBindingEffects`), or event listeners.
   - Caught by `_lView[ON_ERROR]` during `refreshView()` change detection.
   - **Router Behavior**: Dispatched to `RouterOutlet`'s `onError` callback, which emits `deactivateEvents` for the failed component, destroys it, and mounts the `errorComponent`.

This ensures consistent behavior: **any failure in the route renders the error component**, regardless of whether it failed during constructor injection or during runtime data fetching.

---

### 3.3. View-Layer Scope vs. Navigation Pipeline

Router Error Boundaries operate strictly at the **View Layer** (`RouterOutlet` + `ViewContainerRef`):
- **Inside the Boundary**: Component constructors, dependency injection, lifecycle hooks, template expressions, event handlers, and component `resource()` loaders.
- **Outside the Boundary**: Pre-activation route guards (`canMatch`, `canActivate`, `canActivateChild`) and route data resolvers (`resolve`). These run as part of the Router navigation transition. If a guard or resolver throws, the navigation fails before reaching any outlet, triggering `NavigationError` (handled by `withNavigationErrorHandler`).

#### Retry Semantics
Calling `outlet?.retry?.()` performs view remounting:
```ts
this.deactivate();
this.activateWith(activatedRoute, environmentInjector);
```
This cleanly resets all outlet state, child outlet contexts, input binders, and re-executes component constructors, lifecycle hooks, and component resources. For full pipeline re-evaluation (re-running guards and resolvers), developers can trigger a router navigation via `router.navigateByUrl(router.url, { onSameUrlNavigation: 'reload' })`.

---

### 3.4. Fail-Safe Error Component Instantiation

If the configured `errorComponent` itself fails during construction, injection, or initial rendering:
- `RouterOutlet` passes `onError: (err) => { throw err; }` to `location.createComponent(errorComponent, ...)`.
- The exception immediately bubbles out of the `RouterOutlet` to an enclosing template error boundary (e.g. `@boundary { <router-outlet /> } @error (let err) { ... }`) or to the root `ErrorHandler`.
- This prevents recursive error loops and unhandled silent crashes.

---

### 3.5. `RedirectCommand` Semantics

`RedirectCommand` is a dedicated Angular Router primitive whose sole purpose is to instruct the router to navigate.

#### The Rule: `RedirectCommand` Always Navigates
When any component, resource, or lifecycle method throws a `RedirectCommand`:
1. `RouterOutlet` unwraps the error (even if wrapped as an `Error.cause`).
2. The router immediately dispatches navigation: `router.navigateByUrl(redirect.redirectTo, redirect.navigationBehaviorOptions)`.
3. If an `errorComponent` is configured, it mounts and receives the `RedirectCommand` in its `error` input.
4. If no `errorComponent` is configured, the error bubbles up.

#### Deduplication Across Boundaries
If a `RedirectCommand` bubbles through multiple nested outlets or template `@boundary` blocks, it is tagged with an internal symbol (`[REDIRECT_DISPATCHED] = true`). This guarantees that only the first boundary dispatches the navigation, preventing duplicate navigations.

#### Custom Errors for Custom Behavior
We intentionally do **not** add boolean flags like `handleRedirectCommands: false` or magical return values in `onError` to suppress redirects:
- If a developer throws a `RedirectCommand`, they explicitly want the router to navigate.
- If a developer wants custom error handling without automatic navigation (e.g. displaying a modal, prompting for credentials, or conditional routing), they throw standard custom error classes (e.g. `throw new UnauthorizedError()`) and handle them via `withNavigationErrorHandler`, `errorComponent`, or global `onError`.

---

### 3.6. Global Configuration via `withErrorBoundaries`

The feature is enabled and configured via `provideRouter`:

```ts
export interface ErrorBoundaryOptions {
  /**
   * Default component to render when an error occurs in a route that does not specify its own `errorComponent`.
   */
  defaultErrorComponent?: Type<any>;

  /**
   * Optional global callback invoked when any route-level error is caught by the router error boundaries.
   */
  onError?: (error: Error, details?: ErrorDetails) => void;
}

export function withErrorBoundaries(options?: ErrorBoundaryOptions): ErrorBoundariesFeature;
```

#### Example Usage
```ts
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withErrorBoundaries({
        defaultErrorComponent: GlobalRouteErrorComponent,
        onError: (error, details) => {
          inject(TelemetryService).logException(error, details);
        },
      }),
    ),
  ],
});
```

---

## 4. Alternatives Considered

### 1. New `Router.events` (e.g. `RouteErrorEvent`)
- **Rejected**: Adding new events to `Router.events` increases bundle size for non-boundary users, adds breaking changes for consumers filtering events exhaustively, and scatters error handling away from component boundaries. Telemetry is better served via `withErrorBoundaries({ onError })`.

### 2. Output Event Reflection (`readonly retry = output()`)
- **Rejected**: Having `RouterOutlet` inspect component output properties dynamically and call `.subscribe()` behind the scenes is roundabout, magical, and violates standard Angular component contracts.

### 3. Callback Closure Inputs (`input<() => void>()`)
- **Rejected**: Passing executable callbacks via component inputs results in awkward template syntax (`(click)="retry()()"`) and runs counter to Angular's architecture. DI injection (`outlet?.retry?.()`) provides a clean, standard pattern.

### 4. Suppressing `errorComponent` or `onError` during `RedirectCommand`
- **Rejected**: Hardcoding special-case exceptions (e.g. skipping `onError` or deactivating without mounting `errorComponent`) creates an inconsistent mental model. `onError` should have complete visibility over all errors, and `errorComponent` should consistently render whenever configured.
