# Data resolvers

Data resolvers allow you to fetch data before navigating to a route, ensuring that your components receive the data they need before rendering. This can help prevent the need for loading states and improve the user experience by pre-loading essential data.

## What are data resolvers?

A data resolver is a service that implements the [`Resolve`](api/router/Resolve) interface. It runs before a route activates and can fetch data from APIs, databases, or other sources. The resolved data becomes available to the component through the [`ActivatedRoute`](api/router/ActivatedRoute).

## Why use data resolvers?

Data resolvers solve common routing challenges:

- **Prevent empty states**: Components receive data immediately upon loading
- **Better user experience**: No loading spinners for critical data
- **Error handling**: Handle data fetching errors before navigation
- **Data consistency**: Ensure required data is available before rendering

## Creating a resolver

You create a resolver by writing a function with the [`ResolveFn`](api/router/ResolveFn) type.

It receives the [`ActivatedRouteSnapshot`](api/router/ActivatedRouteSnapshot) and [`RouterStateSnapshot`](api/router/RouterStateSnapshot) as default parameters.

Here is a resolver that gets the user information before rendering a route using the [`inject`](api/core/inject) function:

```ts
import { inject } from '@angular/core';
import { UserService, SettingsService } from './user-service';
import type { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import type { User, Settings } from './types';

export const userResolver: ResolveFn<User> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const userService = inject(UserService);
  const userId = route.paramMap.get('id')!;
  return userService.getUser(userId);
};

export const settingsResolver: ResolveFn<Settings> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const settingsService = inject(SettingsService);
  const userId = route.paramMap.get('id')!;
  return settingsService.getUserSettings(userId);
};
```

## Configuring routes with resolvers

When you want to add one or more data resolvers to a route, you can add it under the `resolve` key in the route configuration. The [`Routes`](api/router/Routes) type defines the structure for route configurations:

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'user/:id',
    component: UserDetailComponent,
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
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { User, Settings } from './types';

@Component({
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
    <div>Theme: {{ settings().theme }}</div>
  `
})
export class UserDetailComponent {
  private route = inject(ActivatedRoute);
  user = signal<User>(this.route.snapshot.data['user']);
  settings = signal<Settings>(this.route.snapshot.data['settings']);
}
```

### Using withComponentInput

A different approach to accessing the resolved data is to use [`withComponentInputBinding()`](api/router/withComponentInputBinding) when configuring your router with [`provideRouter`](api/router/provideRouter). This allows resolved data to be passed directly as component inputs:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

bootstrapApplication(AppComponent, {
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
export class UserDetailComponent {
  user = input.required<User>();
  settings = input<Settings>();
}
```

This approach provides better type safety and eliminates the need to inject `ActivatedRoute` just to access resolved data.

## Error handling in resolvers

In the event of navigation failures, it is important to handle errors gracefully in your data resolvers.

Here's an updated example of the `userResolver` that logs the error and navigates back to the generic `/users` page using the [`Router`](api/router/Router) service:

```ts
import { inject } from '@angular/core';
import { Router, ResolveFn } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';

export const userResolver: ResolveFn<User> = (route) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const userId = route.paramMap.get('id')!;

  return userService.getUser(userId).pipe(
    catchError(error => {
      console.error('Failed to load user:', error);
      router.navigate(['/users']);
      return EMPTY;
    })
  );
};
```

## Navigation loading considerations

While data resolvers prevent loading states within components, they introduce a different UX consideration: navigation is blocked while resolvers execute. Users may experience delays between clicking a link and seeing the new route, especially with slow network requests.

### Providing navigation feedback

To improve user experience during resolver execution, you can listen to router events and show loading indicators:

```ts
import { Component, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <div class="loading-bar" *ngIf="isNavigating">Loading...</div>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  private router = inject(Router);
  isNavigating = false;

  constructor() {
    this.router.events.pipe(
      filter(event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
    ).subscribe(event => {
      this.isNavigating = event instanceof NavigationStart;
    });
  }
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
