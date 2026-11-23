# Design Doc: Router Injector and Detached Route Cleanup

**Author**: Atscott
**Date**: November 21, 2025
**Status**: In Review

## 1. Introduction & Motivation

This document outlines the solution to two distinct but related issues concerning memory retention in the Router.

1.  **Undisposed Route Injectors**: When `providers` are defined on a `Route`, Angular creates a dedicated `EnvironmentInjector` for that route. This also happens when lazy loading routes through an `NgModule` and `RouterModule.forChild`. Prior to this proposed change, these injectors were never destroyed, even after the user navigated away from the route permanently. This meant that these injectors and their provided services would remain in memory for the application's lifetime, even when the routes were no longer active. This is tracked in [issue #37095](https://github.com/angular/angular/issues/37095).
    - Additionally, because these injectors were never destroyed, developers could not reliably use APIs that depend on injector destruction, such as `takeUntilDestroyed`, `toSignal`, or `toObservable`, within guards and resolvers ([#51290](https://github.com/angular/angular/issues/51290)). By ensuring injectors are destroyed when the route is deactivated, this change enables streaming observables in resolvers that remain subscribed for the lifetime of the activated route.

2.  **Undisposed DetachedRouteHandles**: A custom `RouteReuseStrategy` can store `DetachedRouteHandle` objects for later reuse. These handles contain the component instance and its DOM subtree. When a custom `RouteReuseStrategy` discards a `DetachedRouteHandle` from its internal store (e.g., due to cache limits or specific reuse logic), there was no public API to explicitly destroy the associated component. This could lead to retained component instances and subscriptions. This is tracked in [issue #27290](https://github.com/angular/angular/issues/27290).

This document details a solution that provides both an automatic, opt-in mechanism for cleaning up route injectors and a manual utility function for destroying detached route components.

## 2. Goals and Non-Goals

### Goals

- Provide an automatic mechanism to clean up `EnvironmentInjector`s for routes that are no longer active or stored for reuse.
- Ensure the cleanup mechanism is opt-in to prevent breaking changes for applications with existing custom `RouteReuseStrategy` implementations.
- Provide a public, manual API for developers to destroy the components associated with a `DetachedRouteHandle` when it's no longer needed.
- The solution must handle lazy loaded routes correctly.

### Non-Goals

- The Router will not automatically manage the cache of `DetachedRouteHandle`s. The responsibility for when to `store` and when to discard a handle remains with the custom `RouteReuseStrategy`.

## 3. Proposed Solution

The solution is divided into two main parts: an automatic cleanup system for route injectors and a manual cleanup function for detached routes.

### 3.1. Automatic Route Injector Cleanup

This is an opt-in feature that automatically finds and destroys injectors associated with routes that are no longer in use.

#### Enabling the Feature

The feature is enabled by calling `withAutoCleanupInjectors()` in the `provideRouter` function:

```ts
provideRouter(routes, withAutoCleanupInjectors());
```

#### Cleanup Trigger and Process

When enabled, a cleanup process runs after every successful navigation completes (i.e., after the `NavigationEnd` event). This ensures that the router is in a stable and predictable state before any injectors are destroyed.

Cleanup was also considered for `NavigationCancel` and `NavigationError` events, but this approach was determined to be unsafe for the following reasons:

- **`NavigationCancel`**: When a navigation is canceled, the router attempts to roll back its state to the previously successful one. Running a cleanup process during this transitional phase is risky, as it could accidentally destroy injectors from the very state the router is trying to restore.
- **`NavigationError`**: An error can occur at any point during the activation process. This means that if an error is thrown midway through, the router's internal state can be left partially modified. Attempting to determine which routes are "active" versus "inactive" in this indeterminate state is unreliable and could lead to the erroneous destruction of injectors that are still in use.

By restricting the cleanup to `NavigationEnd`, we guarantee that we are only ever operating on a stable, consistent, and fully resolved router state.

The process is as follows:

1.  **Identify Active Routes**: The router first identifies all "active" `Route` configurations. A route is considered active if:
    - It is part of the current router state (i.e., it's in the current activated route tree). The router collects these by traversing the descendant tree from the root of the current `RouterState` snapshot.
    - It is part of a `DetachedRouteHandle` currently stored in the `RouteReuseStrategy`. For these, the router collects all routes in their `pathFromRoot` array, ensuring all ancestors of stored routes are also marked as active.

2.  **Consult the RouteReuseStrategy**: To get the list of stored routes, the router calls a new optional method on `RouteReuseStrategy`:
    - `retrieveStoredRouteHandles?(): DetachedRouteHandle[]`
      This method should return an array of all handles the strategy is currently storing.

3.  **Traverse and Destroy**: The router then traverses the entire static route configuration tree. For each `Route`, it checks if it was marked as "active" in step 1.
    - If a route is **not** active, the router consults another new optional method on `RouteReuseStrategy`:
      - `shouldDestroyInjector?(route: Route): boolean`
    - If this method returns `true`, the router will destroy the route's injector (`_injector` for providers and `_loadedInjector` for lazy-loaded module/component providers).
    - **Note**: The default `BaseRouteReuseStrategy` (and thus the default router behavior) implements `shouldDestroyInjector` to always return `true`. This means that by default, when the feature is enabled, all inactive injectors will be destroyed unless a custom strategy overrides this behavior.
    - **Crucially, if a parent route's injector is destroyed, the injectors of all its descendant routes will also be destroyed, regardless of the value returned by `shouldDestroyInjector?` for those descendants. This ensures the integrity of the injector hierarchy.**

This design gives the `RouteReuseStrategy` full control over which injectors get destroyed, allowing for complex caching or pooling strategies while preventing common memory leaks.

## 4. Alternatives Considered

### Child-First (Post-Order) Traversal

An alternative design was considered where the cleanup traversal would happen in a post-order (child-first) manner. In this model, the cleanup logic would first check if any of a route's children were being preserved. A parent route would be automatically kept alive if any of its children were preserved, regardless of the `shouldDestroyInjector` return value for the parent itself.

- **Pros**: This approach offers a superior developer experience. To preserve a deeply nested inactive route, a developer would only need to return `false` from `shouldDestroyInjector` for that specific route, and the framework would automatically infer that all of its ancestors must also be preserved.
- **Cons**: This implementation is more complex. It requires the recursive traversal function to return a boolean (`wasAnythingPreserved`) back up the call stack. This complicates the logic and can be less performant than a simple one-way traversal. It also makes the `shouldDestroyInjector` method's role less clear, as its return value for one route would implicitly affect the behavior of its parents.

The current parent-first (pre-order) traversal was chosen for its implementation simplicity, single-pass performance, and explicitness. It enforces the injector hierarchy robustly: if a developer wishes to preserve a child route, they must also explicitly ensure all of its parents are preserved. While more verbose for the developer, this is an acceptable trade-off for a clearer and safer implementation within the framework.

### Destruction During Activation Traversal

Another alternative considered was performing the destruction of injectors during route deactivation in `ActivateRoutes` (similar to how components and `_localInjector` are destroyed).

- **Pros**: Would eliminate the need for an additional post-navigation traversal pass.
- **Cons**: This approach is not viable for injectors attached to static `Route` configurations:
  1. **Re-activation of the Same Route Config**: When navigating between parameter changes where the route is not reused (e.g., `/detail/1` to `/detail/2` with `shouldReuseRoute` returning `false`), `/detail/2` binds to `detailRoute._injector` during recognition. If deactivating `/detail/1` destroyed `detailRoute._injector`, it would destroy the injector that `/detail/2` has already captured and is about to activate with.
  2. **Cross-Navigation Detached Handles**: While deactivation within a single transition is bottom-up (children are deactivated before parents), a child route could have been detached and stored in `RouteReuseStrategy` in an earlier navigation. If the parent route is deactivated in a subsequent navigation, destroying the parent's injector would break the DI hierarchy of the stored child handle. A local deactivation pass cannot detect this dependency without inspecting the entire reuse cache.
  3. **Handling Discarded Handles and Preloading**: Injectors created during route preloading, or injectors left behind when a handle is evicted from `RouteReuseStrategy`, never undergo deactivation. A post-navigation sweep is the only mechanism that can reconcile these unreferenced injectors.

### Fundamental Differences from `ActivatedRoute._localInjector`

With the introduction of route-level resources, the router created a local `EnvironmentInjector` on `ActivatedRoute` instances (`route._localInjector`). A natural question is why `Route._injector` (and `Route._loadedInjector`) cannot share the exact same destruction timing and lifecycle as `ActivatedRoute._localInjector`:

- `_localInjector` is destroyed immediately during deactivation in `ActivateRoutes` (`deactivateRouteAndOutlet`).
- `_localInjector` is rolled back on `NavigationCancel` or `NavigationError` in `rollbackState`.
- `_localInjector` is destroyed on handle eviction via `destroyDetachedRouteHandle(handle)`.

The reasons these two injector types cannot share the same destruction logic are fundamental to where they live and their role in the DI hierarchy:

1. **Storage Target & Cardinality (Static Definition vs. Activation Instance)**:
   - `Route._injector` is attached directly to the **static `Route` definition**. When navigating between parameter changes of the same route config where the route is not reused (e.g., `/detail/1` to `/detail/2` with `shouldReuseRoute` returning `false`), both activations share the same static `Route` definition. During URL recognition, the incoming `/detail/2` snapshot captures the existing `detailRoute._injector`. If deactivation of `/detail/1` destroyed `detailRoute._injector`, it would destroy the injector that `/detail/2` has already captured and is about to activate its component with.
   - `_localInjector` is an instance property on `ActivatedRoute`. `/detail/1` and `/detail/2` have completely distinct `ActivatedRoute` instances (`activatedRoute1._localInjector` vs. `activatedRoute2._localInjector`). Destroying instance 1 during deactivation has no impact on instance 2.

2. **DI Hierarchy Position (Ancestor vs. Leaf)**:
   - `Route._injector` is an **ancestor injector** for all child routes and their component hierarchies. If a child route was detached and stored in `RouteReuseStrategy` in an earlier navigation, destroying a deactivated parent's `Route._injector` severs the DI hierarchy for that stored child handle. When the child is later reattached, any dependency lookups ascending to the parent injector will fail. A local deactivation step cannot detect this dependency without inspecting the entire reuse cache.
   - `_localInjector` is strictly a **leaf injector** containing only route-level resources for that specific route. Descendant routes do not inherit from a parent route's `_localInjector` (they inherit from `parentSnapshot._environmentInjector`, which points to `Route._injector`). Therefore, destroying a deactivated parent's `_localInjector` never corrupts a child's DI chain.

3. **Creation Timing & Non-Activation Lifecycles**:
   - `Route._injector` is created during URL recognition (`canMatch`) or preloading (`RouterPreloader`), well before activation. A preloaded route may never be activated, so it can never be deactivated; only a post-navigation sweep can reclaim it.
   - `_localInjector` is created strictly during preactivation (`setupAndRunResources`) for a specific `ActivatedRoute`, so its lifecycle is 1:1 with that route's activation and deactivation.

4. **Detached Handle Disposal**:
   - `destroyDetachedRouteHandle(handle)` can safely destroy `handle.route.value._localInjector` because that injector belongs exclusively to that handle's `ActivatedRoute` instance.
   - It cannot destroy `handle.route.value.routeConfig._injector`, because that static `Route` config might currently be active in another outlet or shared by another cached handle.

### 3.2. Manual DetachedRouteHandle Cleanup

To address the issue of undisposed components in discarded `DetachedRouteHandle`s, a new standalone utility function is introduced:

- `destroyDetachedRouteHandle(handle: DetachedRouteHandle): void`

A custom `RouteReuseStrategy` can call this function when it evicts a handle from its storage. The function accesses the internal `ComponentRef` on the handle and calls its `destroy()` method, properly cleaning up the component and its associated DOM elements.

This function is also designed to support future features like route-level "resources". Such resources would have their own injector tied to the `ActivatedRoute` instance. While the injector for a resource on a non-stored route would be destroyed automatically upon deactivation, if the route is stored in a `DetachedRouteHandle`, the developer would be responsible for calling `destroyDetachedRouteHandle` to also clean up the resource's injector.

Example usage in a custom strategy:

```ts
class MyStrategy extends BaseRouteReuseStrategy {
  private cache = new Map<Route, DetachedRouteHandle>();

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    if (this.cache.size > 10) {
      // Evict oldest handle and destroy it
      const oldestRoute = this.cache.keys().next().value;
      const handleToDestroy = this.cache.get(oldestRoute);
      if (handleToDestroy) {
        destroyDetachedRouteHandle(handleToDestroy); // Clean up the component
        this.cache.delete(oldestRoute);
      }
    }
    this.cache.set(route.routeConfig, handle);
  }

  // ... other methods
}
```

#### Potential Risks of a Standalone Function

One potential limitation of `destroyDetachedRouteHandle` being a standalone function is its isolation from the Dependency Injection (DI) system. It cannot have services injected into it, which could be a constraint if future cleanup logic requires access to other parts of the framework.

However, this risk is mitigated because the internal structure of the `DetachedRouteHandle` contains a reference to the `ActivatedRoute`. The `ActivatedRoute`, in turn, holds a reference to its injector. This provides an indirect but effective way for the function to access the DI system if more complex destruction logic is ever needed, without requiring the function itself to be an injectable service.

## 4. Design Considerations

### The Lazy Loading Sticking Point

A notable complexity in this design relates to lazy-loaded modules. When a lazy module is loaded, its routes are provided from within its own `EnvironmentInjector`. The Router then attaches these routes (as `_loadedRoutes`) to the parent `Route` config object.

This creates a dilemma when the injector for the lazy-loaded configuration (`_loadedInjector`) is destroyed. What should happen to the `_loadedRoutes` that were attached to the parent `Route`?

1.  **Option A: Remove `_loadedRoutes`**. When the injector is destroyed, we could also remove the `_loadedRoutes` from the parent `Route` object. This would keep the runtime configuration perfectly in sync with the live injectors. However, this approach mutates the static route configuration object, which can be very surprising and lead to subtle bugs. It breaks the developer's mental model that the route configuration is static after being defined.

2.  **Option B: Keep `_loadedRoutes`**. Alternatively, we can destroy the injector but leave the `_loadedRoutes` array on the parent `Route`. This means the configuration object remains structurally intact, even though the injector that provided those routes is gone and when the injector is recreated, its provided routes will be effectively ignored.

The chosen solution is **Option B**. While it creates a temporary state where `_loadedRoutes` exist without a corresponding `_loadedInjector`. When a future navigation targets these routes again, the router will see that the `_loadedInjector` is missing (or destroyed) and will recreate it with the stored module factory.

### Handling Destroyed Injectors During Preloading

A related consideration is how the `RouterPreloader` interacts with injector destruction. The preloader optimistically loads route configurations and their associated injectors. However, it's possible for an injector that was created for a preloading operation (e.g., for a lazy-loaded route or its providers) to be destroyed before the preloading callback fully completes.

In such cases, the `RouterPreloader` accounts for this by making the affected preloading operation a no-op if the injector is already destroyed. The `preloadConfig` method in `RouterPreloader` explicitly checks `if (injector.destroyed)` and returns `of(null)` if true.

This design ensures robustness: if an injector is destroyed due to a navigation event or cleanup, the ongoing preloading task for that specific injector will gracefully terminate without errors. The next time a navigation occurs, the router will re-traverse the configuration, establish a new `EnvironmentInjector` if needed, and hand out new callbacks with fresh injectors, allowing the preloading to proceed correctly with the updated state.

## 5. API Changes

### New Provider Function

- `withAutoCleanupInjectors()`: A `RouterFeature` to be used with `provideRouter` to enable automatic injector cleanup.

### New Standalone Function

- `destroyDetachedRouteHandle(handle: DetachedRouteHandle): void`: Destroys the component associated with a `DetachedRouteHandle`. This is a standalone function rather than a method on the handle itself to avoid breaking changes for developers who mock `DetachedRouteHandle` in tests.

### `RouteReuseStrategy` Interface Changes

The `RouteReuseStrategy` abstract class is extended with two new optional methods:

- `retrieveStoredRouteHandles?(): DetachedRouteHandle[]`: Called by the router to get a list of all currently stored `DetachedRouteHandle`s.
- `shouldDestroyInjector?(route: Route): boolean`: Called by the router for each inactive route to determine if its injector should be destroyed.

## 6. Developer Experience

- **Opt-In**: The injector cleanup is opt-in via `withAutoCleanupInjectors()` to maintain backward compatibility. Existing applications will not be affected.
