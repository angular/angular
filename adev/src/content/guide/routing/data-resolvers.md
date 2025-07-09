# Data resolvers

Data resolvers allow you to fetch data before navigating to a route, ensuring that your components receive the data they need before rendering. This can help prevent the need for loading states and improve the user experience by pre-loading essential data.

## What are data resolvers?

A data resolver is a service that implements the [`ResolveFn`](api/router/ResolveFn) function. It runs before a route activates and can fetch data from APIs, databases, or other sources. The resolved data becomes available to the component through the [`ActivatedRoute`](api/router/ActivatedRoute).

## Why use data resolvers?

Data resolvers solve common routing challenges:

- **Prevent empty states**: Components receive data immediately upon loading
- **Better user experience**: No loading spinners for critical data
- **Error handling**: Handle data fetching errors before navigation
- **Data consistency**: Ensure required data is available before rendering which is important for SSR

## Creating a resolver

You create a resolver by writing a function with the [`ResolveFn`](api/router/ResolveFn) type.

It receives the [`ActivatedRouteSnapshot`](api/router/ActivatedRouteSnapshot) and [`RouterStateSnapshot`](api/router/RouterStateSnapshot) as parameters.

Here is a resolver that gets the user information before rendering a route using the [`inject`](api/core/inject) function:

```ts
import { inject } from '@angular/core';
import { UserStore, SettingsStore } from './user-store';
import type { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import type { User, Settings } from './types';

export const userResolver: ResolveFn<User> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const userStore = inject(UserStore);
  const userId = route.paramMap.get('id')!;
  return userStore.getUser(userId);
};

export const settingsResolver: ResolveFn<Settings> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const settingsStore = inject(SettingsStore);
  const userId = route.paramMap.get('id')!;
  return settingsStore.getUserSettings(userId);
};
```

## Configuring routes with resolvers

When you want to add one or more data resolvers to a route, you can add it under the `resolve` key in the route configuration. The [`Routes`](api/router/Routes) type defines the structure for route configurations:

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'user/:id',
    component: UserDetail,
    resolve: {
      user: userResolver,
      settings: settingsResolver
    }
  }
];
```

You can learn more about the [`resolve` configuration in the API docs](api/router/Route#resolve).

## Accessing resolved data in components

### Using ActivatedRoute

You can access the resolved data in a component by accessing the snapshot data from the [`ActivatedRoute`](api/router/ActivatedRoute) using the [`signal`](api/core/signal) function:

```angular-ts
import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import type { User, Settings } from './types';

@Component({
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
    <div>Theme: {{ settings().theme }}</div>
  `
})
export class UserDetail {
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data);
  user = computed(() => this.data().user as User);
  settings = computed(() => this.data().settings as Settings);
}
```

### Using withComponentInputBinding

A different approach to accessing the resolved data is to use [`withComponentInputBinding()`](api/router/withComponentInputBinding) when configuring your router with [`provideRouter`](api/router/provideRouter). This allows resolved data to be passed directly as component inputs:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withComponentInputBinding())
  ]
});
```

With this configuration, you can define inputs in your component that match the resolver keys using the [`input`](api/core/input) function and [`input.required`](api/core/input#required) for required inputs:

```angular-ts
import { Component, input } from '@angular/core';
import type { User, Settings } from './types';

@Component({
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
    <div>Theme: {{ settings().theme }}</div>
  `
})
export class UserDetail {
  user = input.required<User>();
  settings = input.required<Settings>();
}
```

This approach provides better type safety and eliminates the need to inject `ActivatedRoute` just to access resolved data.

## Error handling in resolvers

In the event of navigation failures, it is important to handle errors gracefully in your data resolvers.

Here's an updated example of the `userResolver` that logs the error and navigates back to the generic `/users` page using the [`Router`](api/router/Router) service:

```ts
import { inject } from '@angular/core';
import { ResolveFn, RedirectCommand, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { UserStore } from './user-store';
import type { User } from './types';

export const userResolver: ResolveFn<User | RedirectCommand> = (route) => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  const userId = route.paramMap.get('id')!;

  return userService.getUser(userId).pipe(
    catchError(error => {
      console.error('Failed to load user:', error);
      return [new RedirectCommand(router.parseUrl('/users'))];
    })
  );
};
```

## Navigation loading considerations

While data resolvers prevent loading states within components, they introduce a different UX consideration: navigation is blocked while resolvers execute. Users may experience delays between clicking a link and seeing the new route, especially with slow network requests.

### Providing navigation feedback

To improve user experience during resolver execution, you can listen to router events and show loading indicators:

```angular-ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    @if (isNavigating()) {
      <div class="loading-bar">Loading...</div>
    }
    <router-outlet />
  `
})
export class App {
  private router = inject(Router);
  isNavigating = toSignal(this.router.events.pipe(
    map(() => !!this.router.getCurrentNavigation())
  ));
}
```

This approach ensures users receive visual feedback that navigation is in progress while resolvers fetch data.

## Best practices

- **Keep resolvers lightweight**: Resolvers should fetch essential data only and not everything the page could possibly need
- **Handle errors**: Always include error handling to prevent navigation failures
- **Use caching**: Consider caching resolved data to improve performance
- **Consider navigation UX**: Implement loading indicators for resolver execution since navigation is blocked during data fetching
- **Set reasonable timeouts**: Avoid resolvers that could hang indefinitely and block navigation
- **Type safety**: Use TypeScript interfaces for resolved data
