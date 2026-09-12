# Data fetching with resources

The Angular Router integrates with Angular Signals through the `resources` route configuration. This allows you to fetch data reactively using `Resource` APIs.

## Why use route resources?

Route resources offer several advantages over traditional [data resolvers](/guide/routing/data-resolvers):

- **Parallel execution**: Route resources run concurrently across all matched routes, eliminating the sequential waterfall delays of resolvers.
- **Non-blocking data loading**: Use `nonBlocking()` to activate the route immediately and render loading skeletons or UI states while data loads in the background.
- **Reload without renavigation**: Call `.reload()` on individual resources or update signal parameters to refresh data without triggering a full route navigation, rerun guards, or re-match routes.
- **Reactive data fetching**: Resources integrate directly with Angular Signals, automatically re-evaluating when signal dependencies change and exposing reactive status signals like `isLoading()` and `error()`.

## Setup

To enable this feature, provide `withRouterResources()` to your router configuration:

```ts
import {provideRouter, withComponentInputBinding, withRouterResources} from '@angular/router';

bootstrapApplication(App, {
  providers: [provideRouter(routes, withComponentInputBinding(), withRouterResources())],
});
```

You can then define resources in your `Route` definitions and access them directly as component inputs.

The `resources` function runs in an injection context, allowing you to use `inject()` to access services, API clients, or stores directly inside the route definition.

```angular-ts
import {Component, inject, input, resource} from '@angular/core';
import {Routes} from '@angular/router';
import {UserService} from './user.service';

const routes: Routes = [
  {
    path: 'user/:id',
    component: UserProfile,
    resources: (ctx) => {
      const userService = inject(UserService);
      return {
        user: resource({
          params: () => ctx.params()['id'],
          loader: ({params: id}) => userService.getUser(id),
        }),
      };
    },
  },
];

@Component({
  template: `<p>User: {{ user().name }}</p>`,
})
export class UserProfile {
  // The router automatically binds only the value for blocking resources.
  user = input.required<User>();
}
```

TIP: Notice we map the exact primitive ID we need in `params: () => ctx.params()['id']`. Passing the entire parameters object (e.g. `params: () => ctx.params()`) can cause unnecessary resource reloads during navigations. Because the router generates a new object identity for the parameters on navigation, the resource will trigger a refetch even if the specific `id` value you care about hasn't changed.

### Parallel execution (avoiding waterfalls)

Traditional data resolvers execute sequentially from parent routes to child routes. If a parent route resolver takes 200ms and a child route resolver takes 300ms, the navigation is blocked for 500ms total.

In contrast, all route resources across the entire matched route hierarchy execute concurrently during navigation. In the same scenario, navigation completes in 300ms (the time of the slowest resource), eliminating network waterfalls.

TIP: If a resource depends on data from another resource, you can compose the requests within a single resource's loader function, or chain dependent resources using [`chain()`](/guide/signals/resource#chaining-resources).

### ResourceContext

The `resources` function receives a `ResourceContext` providing access to route signals (such as `params`, `queryParams`, and `data`) as well as the static `snapshot`.

### Resource implementations and async configuration

The `resources` map supports any Angular `Resource` implementation (such as `resource()`, `rxResource()`, or custom resources).

```ts
import {Routes} from '@angular/router';
import {rxResource} from '@angular/core/rxjs-interop';

const routes: Routes = [
  {
    path: 'user/:id',
    component: UserProfile,
    resources: (ctx) => ({
      user: rxResource({
        params: () => ctx.params()['id'],
        stream: ({params: id}) => fetchUserObservable(id),
      }),
    }),
  },
];
```

NOTE: `rxResource` uses the `stream` property instead of `loader` to accept a function that returns an Observable.

The `resources` function can also be `async` and return a `Promise` if you need to perform asynchronous setup or dynamic imports before configuring resources:

```ts
resources: async (ctx) => {
  const {fetchUserData} = await import('./user-api');
  return {
    user: resource({
      params: () => ctx.params()['id'],
      loader: ({params: id}) => fetchUserData(id),
    }),
  };
},
```

## Reloading resources without renavigation

With traditional data resolvers, refetching data requires triggering a route navigation (such as navigating with `onSameUrlNavigation: 'reload'`), which re-evaluates all route guards, resolvers, and route matching logic.

With route resources, you can reload data without renavigating:

1. **Programmatic reload**: Call `.reload()` directly on the `Resource` instance.
2. **Reactive reload**: If a resource's `params` computation reads signals (such as an application filter or state signal), updating those signals automatically re-triggers the resource loader.

When using `withComponentInputBinding()`, blocking resources bind only their unwrapped value directly to component inputs. If you need to interact with the underlying `Resource` instance (for example, to trigger a manual `.reload()` or inspect status signals), access it through `ActivatedRoute` or `ActivatedRouteSnapshot`:

```angular-ts
import {Component, inject, input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  template: `
    <p>User: {{ user().name }}</p>
    <button (click)="refreshUser()">Refresh</button>
  `,
})
export class UserProfile {
  user = input.required<User>();
  private userResource = inject(ActivatedRoute).resources?.['user'];

  refreshUser() {
    // Reloads only this specific resource without renavigating the route
    this.userResource?.reload();
  }
}
```

## Blocking and non-blocking resources

By default, all resources returned from `resources` are **blocking**. The router waits until the data is fully loaded before activating the route and component.

**For blocking resources, the router binds only the resolved value to the component input.** The input type in your component is `T` instead of `Resource<T>`.

This simplifies your component because it does not need to handle loading or error states. Because the router blocks navigation until the resource is loaded, the component never observes a `loading` state. If the resource throws an error, the router cancels the navigation, so the component never observes an `error` state.

If you prefer to handle loading states in the UI, use the `nonBlocking()` wrapper utility. Non-blocking resources do not halt navigation. The router activates the component immediately, allowing the UI to handle loading or skeleton states.

**For non-blocking resources, the router binds the full `Resource<T>` object to the component input.** This allows you to access `.isLoading()`, `.error()`, and other resource signals in your component.

```angular-ts
import {Component, input, Resource, resource} from '@angular/core';
import {Routes, nonBlocking} from '@angular/router';

const routes: Routes = [
  {
    path: 'reports',
    component: Reports,
    resources: (ctx) => ({
      reportData: nonBlocking(
        resource({
          loader: () => fetchHeavyReportData(),
        }),
      ),
    }),
  },
];

@Component({
  template: `
    @if (reportData().isLoading()) {
      <p>Loading...</p>
    } @else if (reportData().error()) {
      <p>Error loading report.</p>
    } @else if (reportData().hasValue()) {
      <report-view [data]="reportData().value()" />
    }
  `,
})
export class Reports {
  reportData = input.required<Resource<ReportData>>();
}
```

NOTE: If a blocking resource throws an error, the router cancels the navigation and emits a `NavigationError` event. Resources wrapped in `nonBlocking()` that error will complete navigation and expose the error via the `resource.error()` signal.

### Redirecting from a resource

If a blocking resource needs to redirect the user (for example, if an item is not found), throw a `RedirectCommand` inside the resource loader. The router will cancel the current navigation and redirect to the specified URL:

```ts
import {inject, resource} from '@angular/core';
import {RedirectCommand, Router, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: 'user/:id',
    component: UserProfile,
    resources: (ctx) => {
      const router = inject(Router);

      return {
        user: resource({
          params: () => ctx.params()['id'],
          loader: async ({params: id}) => {
            const user = await fetchUser(id);
            if (!user) {
              throw new RedirectCommand(router.parseUrl('/not-found'));
            }
            return user;
          },
        }),
      };
    },
  },
];
```

## Transitional states during pending navigations

When moving between views (or reloading the same view with new parameters), switching abruptly to a loading skeleton can create a jarring UI flash.

The router automatically masks intermediate `loading` and `reloading` states of resolved resources while a navigation is pending.

If you navigate from `/user/1` to `/user/2`, `UserProfile` stays mounted and continues rendering data from `/user/1` (frozen in its exact state) until `/user/2` resolves. Once `/user/2` settles, the router unfreezes the UI, transitioning directly to the new data with no loading flash.

NOTE: Route resources returned to the router are read-only. Manual `.reload()` calls attempted during an active navigation transition or rollback recovery return `false` to avoid interrupting router transition tracking.

### Rollback recovery on cancellation

If a navigation is cancelled (for example, by a guard), the router reverts the state tree to the previous state. This reversion can cause the resource's signal dependencies (such as route parameters) to revert to their previous values.

Because the parameters changed back, the resource might automatically trigger a new load to fetch data for the old parameters. To prevent flashing a loading state for data that was already visible, the router retains the previous resource snapshot in the UI until the resource has settled in the reverted state.

TIP: Forward the `abortSignal` provided by the resource loader to your asynchronous calls (like `fetch`). When the router rolls back parameters or supersedes navigations, the pending request is cleanly aborted: `loader: ({params: id, abortSignal}) => fetchUser(id, {signal: abortSignal})`.
