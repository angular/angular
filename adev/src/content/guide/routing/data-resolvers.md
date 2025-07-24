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

In the event of navigation failures, it is important to handle errors gracefully in your data resolvers. Otherwise, a `NavigationError` will occur and the navigation to the current route will fail which will lead to a poor experience for your users.

There are three primary ways to handle errors with data resolvers:

1. [Centralizing error handling in `withNavigationErrorHandler`](#centralize-error-handling-in-withnavigationerrorhandler)
2. [Managing errors through a subscription to router events](#managing-errors-through-a-subscription-to-router-events)
3. [Handling errors directly in the resolver](#handling-errors-directly-in-the-resolver)

### Centralize error handling in `withNavigationErrorHandler`

The [`withNavigationErrorHandler`](api/router/withNavigationErrorHandler) feature provides a centralized way to handle all navigation errors, including those from failed data resolvers. This approach keeps error handling logic in one place and prevents duplicate error handling code across resolvers.

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from './app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withNavigationErrorHandler((error) => {
      const router = inject(Router);

      if (error?.message) {
        console.error('Navigation error occurred:', error.message)
      }

      router.navigate(['/error']);
    }))
  ]
});
```

With this configuration, your resolvers can focus on data fetching while letting the centralized handler manage error scenarios:

```ts
export const userResolver: ResolveFn<User> = (route) => {
  const userStore = inject(UserStore);
  const userId = route.paramMap.get('id')!;
  // No need for explicit error handling - let it bubble up
  return userStore.getUser(userId);
};
```

### Managing errors through a subscription to router events

You can also handle resolver errors by subscribing to router events and listening for [`NavigationError`](api/router/NavigationError) events. This approach gives you more granular control over error handling and allows you to implement custom error recovery logic.

```angular-ts
import { Component, inject, signal } from '@angular/core';
import { Router, NavigationError } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    @if (errorMessage()) {
      <div class="error-banner">
        {{ errorMessage() }}
        <button (click)="retryNavigation()">Retry</button>
      </div>
    }
    <router-outlet />
  `
})
export class App {
  private router = inject(Router);
  private lastFailedUrl = signal('');

  private navigationErrors = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationError => event instanceof NavigationError),
      map(event => {
        this.lastFailedUrl.set(event.url);

        if (event.error) {
          console.error('Navigation error', event.error)
        }

        return 'Navigation failed. Please try again.';
      })
    ),
    { initialValue: '' }
  );

  errorMessage = this.navigationErrors;

  retryNavigation() {
    if (this.lastFailedUrl()) {
      this.router.navigateByUrl(this.lastFailedUrl());
    }
  }
}
```

This approach is particularly useful when you need to:

- Implement custom retry logic for failed navigation
- Show specific error messages based on the type of failure
- Track navigation failures for analytics purposes

### Handling errors directly in the resolver

Here's an updated example of the `userResolver` that logs the error and navigates back to the generic `/users` page using the [`Router`](api/router/Router) service:

```ts
import { inject } from '@angular/core';
import { ResolveFn, RedirectCommand, Router } from '@angular/router';
import { catchError, of, EMPTY } from 'rxjs';
import { UserStore } from './user-store';
import type { User } from './types';

export const userResolver: ResolveFn<User | RedirectCommand> = (route) => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  const userId = route.paramMap.get('id')!;

  return userStore.getUser(userId).pipe(
    catchError(error => {
      console.error('Failed to load user:', error);
      return of(new RedirectCommand(router.parseUrl('/users')));
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
- **Handle errors**: Always remember to handle errors gracefully to provide the best experience possible to users
- **Use caching**: Consider caching resolved data to improve performance
- **Consider navigation UX**: Implement loading indicators for resolver execution since navigation is blocked during data fetching
- **Set reasonable timeouts**: Avoid resolvers that could hang indefinitely and block navigation
- **Type safety**: Use TypeScript interfaces for resolved data
