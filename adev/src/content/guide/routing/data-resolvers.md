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

Here is a resolver that gets the user information before rendering a route:

```ts
import { inject } from '@angular/core';
import { UserService } from './user-service';
import type { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import type { User } from './types'

export const userResolver: ResolveFn<User> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const userService = inject(UserService);
  const userId = route.paramMap.get('id')!;
  return userService.getUser(userId);
};
```

## Configuring routes with resolvers

Add the resolver to your route configuration:

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'user/:id',
    component: UserDetailComponent,
    resolve: {
      user: userResolver
    }
  }
];
```

### Multiple resolvers

You can also use multiple resolvers for a single route:

```ts
export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    resolve: {
      user: userResolver,
      notifications: notificationResolver,
      settings: settingsResolver
    }
  }
];
```

## Accessing resolved data in components

Access the resolved data using modern standalone component syntax:

```ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
  `
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  user = signal<User | null>(null);

  ngOnInit() {
    this.user.set(this.route.snapshot.data['user']);
  }
}
```

## Error handling in resolvers

Handle errors gracefully in your resolvers:

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

## Best practices

- **Keep resolvers lightweight**: Resolvers should fetch essential data only and not everything the page could possibly need
- **Handle errors**: Always include error handling to prevent navigation failures
- **Use caching**: Consider caching resolved data to improve performance
- **Avoid over-resolving**: Only resolve critical data; lazy-load secondary data in components
- **Type safety**: Use TypeScript interfaces for resolved data
