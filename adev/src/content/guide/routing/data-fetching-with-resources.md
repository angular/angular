# Data fetching with resources

The Angular Router integrates with Angular Signals through the `resources` route configuration. This allows you to fetch data reactively using `Resource` APIs.

## Why use route resources?

Route resources integrate the Angular Router directly with Angular Signals and `Resource` APIs, offering significant advantages over traditional [data resolvers](/guide/routing/data-resolvers):

- **Parallel execution without waterfalls**: Resources across all matched routes execute concurrently. Even when child routes depend on data from parent routes, reactive coordination eliminates traditional sequential network waterfalls.
- **Automatic, fine-grained change tracking**: Resources subscribe directly to the exact signal properties they read (such as `ctx.params()['id']` or `ctx.queryParams()['tab']`). Navigating between URLs only re-evaluates resources whose specific dependencies changed, with zero manual dependency arrays or cache invalidation keys.
- **Non-blocking data loading**: Unlike resolvers which strictly block navigation, you can wrap resources with `nonBlocking()` to activate the route immediately and render loading skeletons or progressive UI states.
- **Reload without renavigation**: Call `.reload()` on individual resources or update signal dependencies to refresh data without triggering full route navigations, running route guards, or re-matching routes.

## Enabling route resources

To enable route resources, provide `withRouterResources()` to your router configuration:

```ts
import {provideRouter, withComponentInputBinding, withRouterResources} from '@angular/router';

bootstrapApplication(App, {
  providers: [provideRouter(routes, withComponentInputBinding(), withRouterResources())],
});
```

TIP: Enable `withComponentInputBinding()` so the router can bind resolved resources directly to component inputs.

## Defining route resources

You define resources on a route using the `resources` function. The function runs in an injection context, allowing you to use `inject()` to access services, API clients, or stores directly inside the route definition.

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

### The ResourceContext

The `resources` function receives a `ResourceContext` providing:

- Route signals: `params`, `queryParams`, `fragment`, and `data`.
- `resources`: A `Signal<ResourceResult>` containing resources defined on or inherited by the route.
- `routeConfig`: The matched route configuration object (`Route | null`).

### Supported resource implementations

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

## Fine-grained change tracking with signals

Route resources leverage Angular Signals to track dependencies automatically at the property level.

When you access a route parameter or query parameter within a resource's `params` computation, Angular establishes a fine-grained reactive dependency:

```ts
resources: (ctx) => ({
  products: resource({
    // Only subscribes to the 'category' query parameter
    params: () => ctx.queryParams()['category'],
    loader: ({params: category}) => fetchProducts(category),
  }),
}),
```

Because `ctx.queryParams()['category']` reads only the `'category'` property:

- If a navigation updates an unrelated query parameter (such as `?sort=desc` or `?page=2`), the `'category'` property remains unchanged.
- The resource automatically recognizes that its dependency did not change and does not refetch.

You do not need to maintain manual dependency arrays, configure query keys, or write custom cache-invalidation logic. Angular's reactive graph automatically tracks the exact data dependencies.

TIP: Always read specific properties directly (such as `ctx.params()['id']` or `ctx.queryParams()['category']`) rather than returning the entire parameters object (such as `ctx.params()`). If you return the entire object, the router creates a new object reference on every navigation, which triggers a refetch even if individual parameter values did not change.

## Parallel execution without waterfalls

Traditional data resolvers execute sequentially from parent routes to child routes. If a parent route resolver takes 200ms and a child route resolver takes 300ms, the navigation is blocked for 500ms total.

In contrast, route resources across the entire matched route hierarchy execute concurrently during navigation. In that same scenario, navigation completes in 300ms (the time of the slowest resource), eliminating network waterfalls.

### Reactive coordination for dependent resources

Nested routes frequently require data from a parent route before loading child data. In traditional routing architectures, this forces a sequential waterfall: the child loader cannot even be called until the parent loader finishes.

With route resources, all setup functions and independent loaders across all route levels initialize concurrently. When a child resource depends on a parent resource, it coordinates reactively through Signals:

```ts
const routes: Routes = [
  {
    path: 'user/:id',
    resources: (ctx) => ({
      user: resource({
        params: () => ctx.params()['id'],
        loader: ({params: id}) => fetchUser(id),
      }),
    }),
    children: [
      {
        path: 'details',
        component: UserDetails,
        resources: (ctx) => ({
          details: resource({
            // Retains the loading state while the parent resource resolves
            params: ({chain}) => chain(ctx.resources()['user']).role,
            loader: ({params: role}) => fetchRoleDetails(role),
          }),
        }),
      },
    ],
  },
];
```

In this architecture:

1. Both the parent route and child route run their `resources` setup functions concurrently.
2. The parent `user` resource immediately begins fetching user data.
3. The child `details` resource chains off the parent resource with `chain(ctx.resources()['user'])`, keeping the child in a `loading` state while the parent is in flight.
4. The instant the parent `user` resource emits its resolved value, the child's `params` computation receives the result and triggers `fetchRoleDetails(role)`.

This reactive coordination gives you the best of both worlds: independent resources load concurrently without waiting, and dependent resources start fetching as soon as their prerequisite data is available, with zero manual orchestration.

TIP: Within the same route, you can also compose requests inside a single resource's loader or use [`chain()`](/guide/signals/resource#chaining-resources).

## Resource inheritance

Resources defined on ancestor routes are always inherited down the route tree to all descendant routes.

Child routes and components can access inherited ancestor resources through:

- In route configuration, child resources can read ancestor resources via `ctx.resources()`.
- With `withComponentInputBinding()`, child components receive inherited resources directly as inputs.
- Through `ActivatedRoute` or `ActivatedRouteSnapshot`, you can inspect ancestor resources using `route.resources`.

For example, consider a nested project management view:

```angular-ts
const routes: Routes = [
  {
    path: 'projects/:projectId',
    resources: (ctx) => ({
      project: resource({
        params: () => ctx.params()['projectId'],
        loader: ({params: id}) => fetchProject(id),
      }),
    }),
    children: [
      {
        path: 'tasks/:taskId',
        component: TaskDetail,
        resources: (ctx) => ({
          task: resource({
            params: () => ctx.params()['taskId'],
            loader: ({params: id}) => fetchTask(id),
          }),
        }),
      },
    ],
  },
];

@Component({
  template: `
    <h1>Project: {{ project().name }}</h1>
    <h2>Task: {{ task().title }}</h2>
  `,
})
export class TaskDetail {
  // Inherited from the parent 'projects/:projectId' route
  project = input.required<Project>();

  // Bound from the route's own resource
  task = input.required<Task>();
}
```

The `TaskDetail` component receives both the parent `project` resource and its own `task` resource directly as inputs.

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

## Transitional states during pending navigations

When moving between views (or reloading the same view with new parameters), switching abruptly to a loading skeleton can create a jarring UI flash.

The router automatically masks intermediate `loading` and `reloading` states of resolved resources while a navigation is pending.

If you navigate from `/user/1` to `/user/2`, `UserProfile` stays mounted and continues rendering data from `/user/1` (frozen in its exact state) until `/user/2` resolves. Once `/user/2` settles, the router unfreezes the UI, transitioning directly to the new data with no loading flash.

NOTE: Route resources returned to the router are read-only. Manual `.reload()` calls attempted during an active navigation transition or rollback recovery return `false` to avoid interrupting router transition tracking.

### Rollback recovery on cancellation

If a navigation is cancelled (for example, by a guard), the router reverts the state tree to the previous state. This reversion can cause the resource's signal dependencies (such as route parameters) to revert to their previous values.

Because the parameters changed back, the resource might automatically trigger a new load to fetch data for the old parameters. To prevent flashing a loading state for data that was already visible, the router retains the previous resource snapshot in the UI until the resource has settled in the reverted state.

TIP: Forward the `abortSignal` provided by the resource loader to your asynchronous calls (like `fetch`). When the router rolls back parameters or supersedes navigations, the pending request is cleanly aborted: `loader: ({params: id, abortSignal}) => fetchUser(id, {signal: abortSignal})`.
