# Data Resolvers

Data resolvers fetch data before a route activates, ensuring components have the necessary data upon rendering.

## Creating a Resolver

Implement the `ResolveFn` type.

```ts
export const userResolver: ResolveFn<User> = (route, state) => {
  const userService = inject(UserService);
  const id = route.paramMap.get('id')!;
  return userService.getUser(id);
};
```

## Configuring the Route

Add the resolver under the `resolve` key.

```ts
{
  path: 'user/:id',
  component: UserProfile,
  resolve: {
    user: userResolver
  }
}
```

## Accessing Resolved Data

### 1. Via `ActivatedRoute` (Traditional)

```ts
private readonly route = inject(ActivatedRoute);
protected readonly data = toSignal(this.route.data, {requireSync: true});
protected readonly user = computed(() => this.data().user);
```

### 2. Via Component Inputs (Modern)

Enable `withComponentInputBinding()` in `provideRouter` to pass resolved data directly to `@Input` or `input()`.

```ts
// app.config.ts
provideRouter(routes, withComponentInputBinding());

// component.ts
user = input.required<User>();
```

## Error Handling

Navigation is blocked if a resolver fails.

- Use `withNavigationErrorHandler` for global handling.
- Use `catchError` within the resolver to return a `RedirectCommand` or fallback data.

```ts
return userService
  .get(id)
  .pipe(catchError(() => of(new RedirectCommand(router.parseUrl('/error')))));
```

## Router Resources: A `resource()`-Based Alternative

IMPORTANT: `withRouterResources`, `ResourceContext`, and `nonBlocking` require Angular v22.2 or
newer.

Where `resolve` gives a one-shot value, a route's `resources` property gives a map of
signal-backed `resource()`s, keyed by name, each independently re-fetchable as route state changes.
Enable `withComponentInputBinding()` alongside `withRouterResources()` so the router can bind
resolved resources directly to component inputs:

```ts
import {provideRouter, withComponentInputBinding, withRouterResources} from '@angular/router';

// app.config.ts
providers: [provideRouter(routes, withComponentInputBinding(), withRouterResources())];
```

Define resources inline as a function on the route. It runs in an injection context, so `inject()`
works directly inside it:

```ts
import { inject, resource } from '@angular/core';

{
  path: 'user/:id',
  component: UserProfile,
  resources: (ctx) => {
    const userService = inject(UserService);
    return {
      user: resource({
        params: () => ctx.params()['id'],
        loader: ({ params: id }) => userService.getUser(id),
      }),
    };
  },
}
```

By default a resource is **blocking**: the router waits for it to resolve before activating the
route, then binds only the resolved value to the matching component input:

```ts
export class UserProfile {
  // The router binds only the value for blocking resources.
  user = input.required<User>();
}
```

Wrap a resource in `nonBlocking()` to activate the route immediately instead of waiting for it.
The router then binds the full `Resource<T>` object to the input, giving access to `isLoading()`,
`error()`, and `value()`:

```ts
import { nonBlocking } from '@angular/router';

resources: () => ({
  reportData: nonBlocking(resource({ loader: () => fetchHeavyReportData() })),
}),
```

```ts
export class Reports {
  reportData = input.required<Resource<ReportData>>();
}
```

```angular-html
@if (reportData().isLoading()) {
  <p>Loading...</p>
} @else if (reportData().error()) {
  <p>Error loading report.</p>
} @else if (reportData().hasValue()) {
  <report-view [data]="reportData().value()" />
}
```

- `ResourceContext` exposes `params`, `queryParams`, `fragment`, and `data` as signals, not
  snapshots — a resource re-fetches automatically when a signal it reads changes, so navigating
  between routes that reuse the same component re-runs the resource instead of requiring a manual
  refresh.
- If a blocking resource errors, the router cancels the navigation and emits a `NavigationError`;
  a `nonBlocking()` resource instead completes the navigation and surfaces the failure through its
  own `error()` signal.
- The component input only carries the resolved value for a blocking resource, not the `Resource`
  instance — read it from `ActivatedRoute` when you need to call `.reload()`:

```ts
export class UserProfile {
  user = input.required<User>();
  private userResource = inject(ActivatedRoute).resources?.['user'];

  refreshUser() {
    this.userResource?.reload();
  }
}
```

## Best Practices

- **Keep it lightweight**: Fetch only critical data.
- **Provide feedback**: Listen to router events to show a global loading bar during navigation, as the UI stays on the old page until the resolver finishes.
