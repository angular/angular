## Class and InjectionToken-based `Router` guards and resolvers

As of Angular v15.2, class-based guards and resolvers were deprecated at the `Route` definition.
This migration updates guard and resolver properties to use the helper functions to map an injectable
class to the appropriate guard or resolver function.

#### Before
```ts
import { Route } from '@angular/router';
import { LoggedInGuard } from './logged_in_guard';
import { ResolveUser } from './user_resolver';

const route: Route = {
  path: 'user/edit',
  canActivate: [LoggedInGuard],
  resolve: {
    'user': ResolveUser
  }
};
```

#### After
```ts
import { Route, mapToCanActivate, mapToResolve } from '@angular/router';
import { LoggedInGuard } from './logged_in_guard';
import { ResolveUser } from './user_resolver';

const route: Route = {
  path: 'user/edit',
  canActivate: mapToCanActivate([LoggedInGuard]),
  resolve: {
    'user': mapToResolve(ResolveUser)
  }
};
```
