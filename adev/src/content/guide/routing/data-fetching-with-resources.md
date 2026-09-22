# Data fetching with resources

The Angular Router integrates with Angular signals through the `resources` route configuration. This allows you to fetch data reactively using `Resource` APIs.

## Why use route resources?

Route resources offer several advantages over traditional [data resolvers](/guide/routing/data-resolvers):

- **Parallel execution**: Route resources across all matched routes load concurrently instead of one route at a time.
- **Non-blocking data loading**: Use `nonBlocking()` to activate the route immediately and render loading skeletons or UI states while data loads in the background.
- **Reload without renavigation**: Call `.reload()` on individual resources or update signal parameters to refresh data without rerunning guards or rematching routes.
- **Reactive data fetching**: Resources integrate directly with Angular signals, automatically re-evaluating when signal dependencies change and exposing reactive status signals like `isLoading()` and `error()`.

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

You define resources on a route with the `resources` function. The function runs in an injection context, so you can use `inject()` to access services, API clients, or stores directly inside the route definition.

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
  // The router binds only the value for blocking resources.
  user = input.required<User>();
}
```

### The `ResourceContext` object

The `resources` function receives a `ResourceContext` that provides:

- Route signals: `params`, `queryParams`, `fragment`, and `data`.
- `resources`: a signal of the resources inherited from ancestor routes. See [Resource inheritance](#resource-inheritance).

### Supported resource implementations

The `resources` function can return any Angular `Resource` implementation, such as `resource()`, `rxResource()`, or a custom resource.

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

A resource tracks the signals that its `params` function reads. Read the exact value you need so that the resource refetches only when that value changes:

```ts
resources: (ctx) => ({
  products: resource({
    // Tracks only the 'category' query parameter
    params: () => ctx.queryParams()['category'],
    loader: ({params: category}) => fetchProducts(category),
  }),
}),
```

A navigation that changes an unrelated query parameter, such as `?sort=desc` or `?page=2`, leaves `category` unchanged, so the resource does not refetch.

TIP: Read specific properties, such as `ctx.params()['id']`, instead of returning an entire parameters object, such as `ctx.params()`. The router creates a new object on every navigation, so returning the whole object refetches the resource even when the individual values are unchanged.

## Parallel execution

Data resolvers execute sequentially from parent route to child route. If a parent route resolver takes 200ms and a child route resolver takes 300ms, the navigation is blocked for 500ms.

Route resources across the matched route hierarchy run concurrently, so the same navigation completes in 300ms, the time of the slowest resource. Resources that depend on data from an ancestor route also set up immediately instead of waiting; see [Chaining a resource off an ancestor resource](#chaining-a-resource-off-an-ancestor-resource).

## Resource inheritance

Every route inherits the resources of its ancestor routes. Angular exposes those inherited resources in two forms:

| API                                                               | Contains                                         | Behavior                                                                                        | Use it to                                                          |
| :---------------------------------------------------------------- | :----------------------------------------------- | :---------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `ctx.resources()` inside a `resources` function                   | Ancestor resources only                          | The raw resources returned by ancestor `resources` functions. Their state is always live.       | Chain a resource off an ancestor resource                          |
| `ActivatedRoute.resources` and `ActivatedRouteSnapshot.resources` | The route's own resources and ancestor resources | Read-only resources managed by the router. Their state is frozen while a navigation is pending. | Read data or call `reload()` from a component, directive, or guard |

If a route defines a resource with the same name as an ancestor resource, the route's own resource shadows the inherited one.

NOTE: Inherited resources are tied to the lifetime of the ancestor route that defines them. If a custom `RouteReuseStrategy` detaches a child route while its ancestor route is deactivated, the ancestor's resources are destroyed and will not be available or re-linked if the child route is later reattached under a new ancestor instance.

### Binding inherited resources to component inputs

With `withComponentInputBinding()`, the router binds both inherited resources and the route's own resources to matching component inputs:

```angular-ts
import {Component, input, resource} from '@angular/core';
import {Routes} from '@angular/router';

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
}

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

NOTE: When the router binds route state to component inputs, resource names take precedence over route `data` (including resolved values), path parameters, and query parameters.

### Chaining a resource off an ancestor resource

A child route frequently needs data from an ancestor route before it can load its own data. Instead of waiting for the ancestor route to finish loading, chain the child's `params` function off the ancestor resource with [`chain()`](/guide/signals/resource#chaining-resources). Angular passes a context object that contains `chain` to every `params` function:

```ts
import {Resource, resource} from '@angular/core';
import {Routes} from '@angular/router';

interface User {
  id: string;
  role: string;
}

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
            // Retains the loading state until the inherited 'user' resource resolves
            params: ({chain}) => chain(ctx.resources()['user'] as Resource<User>).role,
            loader: ({params: role}) => fetchRoleDetails(role),
          }),
        }),
      },
    ],
  },
];
```

Both `resources` functions run concurrently: the parent route starts fetching the user while the child route sets up its own resources. As soon as `user` resolves, the child's `params` function reruns with the user value and `fetchRoleDetails` starts.

NOTE: Read `ctx.resources()` inside a reactive context such as a resource's `params` function rather than synchronously in the top-level `resources` function body, as ancestor `resources` functions may still be initializing asynchronously. Because `ctx.resources()` is typed as a record of `Resource<unknown>`, cast the inherited resource to its value type when reading it.

`chain()` also propagates the state of the ancestor resource. If the ancestor errors, the chained resource errors with a `ResourceDependencyError`, and the router cancels the navigation when that chained resource is blocking. If the ancestor is `idle`, the chained resource becomes `idle`.

## Blocking and non-blocking resources

By default, every resource returned from `resources` is blocking: the router waits until the data is fully loaded before it activates the route and the component.

For a blocking resource, the router binds the resolved value to the component input, so the input type is `T` instead of `Resource<T>`. The component never observes a `loading` state because the router blocks navigation until the resource loads, and it never observes an `error` state because the router cancels the navigation when the resource errors.

To handle loading states in the UI instead, wrap the resource in `nonBlocking()`. The router activates the component immediately and binds the full `Resource<T>` object to the component input, which gives you access to `isLoading()`, `error()`, and the other resource signals.

```angular-ts
import {Component, input, Resource, resource} from '@angular/core';
import {Routes, nonBlocking} from '@angular/router';

const routes: Routes = [
  {
    path: 'reports',
    component: Reports,
    resources: () => ({
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

NOTE: If a blocking resource errors, the router cancels the navigation and emits a `NavigationError` event. A resource wrapped in `nonBlocking()` completes the navigation and exposes the failure through its `error()` signal.

### Redirecting from a resource

If a blocking resource needs to redirect the user (for example, if an item is not found), throw a `RedirectCommand` inside the resource loader. The router cancels the current navigation and redirects to the specified URL:

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

With data resolvers, refetching data requires a route navigation (for example, navigating with `onSameUrlNavigation: 'reload'`), which rematches routes and reruns guards and resolvers.

Route resources support two ways to refresh data in place:

1. **Programmatic reload**: Call `.reload()` on the `Resource` instance.
2. **Reactive reload**: Update a signal that the resource's `params` function reads, such as an application filter or state signal, which reruns the loader.

Because the router binds only the value of a blocking resource to a component input, read the `Resource` instance from `ActivatedRoute` or `ActivatedRouteSnapshot` when you need to call `.reload()` or inspect status signals:

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

While a navigation is pending, the router freezes the resources that it exposes on `ActivatedRoute`, which masks intermediate `loading` and `reloading` states.

If you navigate from `/user/1` to `/user/2` and the router reuses the `UserProfile` component, the component keeps rendering the data from `/user/1` until `/user/2` resolves. The router then unfreezes the resources and the UI transitions directly to the new data with no loading flash.

The router exposes these resources as read-only, even when the `resources` function returns a writable resource such as `resource()`. You can read the resource signals and call `reload()`, but not `set()` or `update()`. A `reload()` call during an active navigation or during rollback recovery returns `false` so that it cannot interrupt the router's transition tracking.

NOTE: Freezing applies only to the resources that the router exposes on `ActivatedRoute`. The raw resources available through `ctx.resources()` always report their live state, which is what allows a chained resource to react to an ancestor resource during a navigation.

### Rollback recovery on cancellation

If a navigation is cancelled (for example, by a guard), the router reverts the state tree to the previous state. This reversion can cause the resource's signal dependencies, such as route parameters, to revert to their previous values.

Because the parameters changed back, the resource might automatically trigger a new load to fetch data for the old parameters. To prevent flashing a loading state for data that was already visible, the router retains the previous resource snapshot in the UI until the resource has settled in the reverted state.

TIP: Forward the `abortSignal` provided by the resource loader to your asynchronous calls (like `fetch`). When the router rolls back parameters or supersedes navigations, the pending request is cleanly aborted: `loader: ({params: id, abortSignal}) => fetchUser(id, {signal: abortSignal})`.
