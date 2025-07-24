# Control route access with guards

CRITICAL: Never rely on client-side guards as the sole source of access control. All JavaScript that runs in a web browser can be modified by the user running the browser. Always enforce user authorization server-side, in addition to any client-side guards.

Route guards are functions that control whether a user can navigate to or leave a particular route. They are like checkpoints that manage whether a user can access specific routes. Common examples of using route guards include authentication and access control.

## Creating a route guard

You can generate a route guard using the Angular CLI:

```bash
ng generate guard CUSTOM_NAME
```

This will prompt you to select which [type of route guard](#types-of-route-guards) to use and then create the corresponding `CUSTOM_NAME-guard.ts` file.

TIP: You can also create a route guard manually by creating a separate TypeScript file in your Angular project. Developers typically add a suffix of `-guard.ts` in the filename to distinguish it from other files.

## Route guard return types

All route guards share the same possible return types. This gives you flexibility in how you control navigation:

| Return types                    | Description                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `boolean`                       | `true` allows navigation, `false` blocks it (see note for `CanMatch` route guard) |
| `UrlTree` or `RedirectCommand`  | Redirects to another route instead of blocking                                    |
| `Promise<T>` or `Observable<T>` | Router uses the first emitted value and then unsubscribes                         |

Note: `CanMatch` behaves differently— when it returns `false`, Angular tries other matching routes instead of completely blocking navigation.

## Types of route guards

Angular provides four types of route guards, each serving different purposes:

<docs-pill-row>
  <docs-pill href="#canactivate" title="CanActivate"/>
  <docs-pill href="#canactivatechild" title="CanActivateChild"/>
  <docs-pill href="#candeactivate" title="CanDeactivate"/>
  <docs-pill href="#canmatch" title="CanMatch"/>
</docs-pill-row>

### CanActivate

The `CanActivate` guard determines whether a user can access a route. It is most commonly used for authentication and authorization.

It has access to the following default arguments:

- `route: ActivatedRouteSnapshot` - Contains information about the route being activated
- `state: RouterStateSnapshot` - Contains the router's current state

It can return the [standard return guard types](#route-guard-return-types).

```ts
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
```

Tip: If you need to redirect the user, return a [`URLTree`](api/router/UrlTree) or [`RedirectCommand`](api/router/RedirectCommand). Do **not** return `false` and then programmatically `navigate` the user.

For more information, check out the [API docs for CanActivateFn](api/router/CanActivateFn).

### CanActivateChild

The `CanActivateChild` guard determines whether a user can access child routes of a particular parent route. This is useful when you want to protect an entire section of nested routes. In other words, `canActivateChild` runs for _all_ children. If there is a child component with another child component underneath of it, `canActivateChild` will run once for both components.

It has access to the following default arguments:

- `childRoute: ActivatedRouteSnapshot` - Contains information about the "future" snapshot (i.e., state the router is attempting to navigate to) of the child route being activated
- `state: RouterStateSnapshot` - Contains the router's current state

It can return the [standard return guard types](#route-guard-return-types).

```ts
export const adminChildGuard: CanActivateChildFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  return authService.hasRole('admin');
};
```

For more information, check out the [API docs for CanActivateChildFn](api/router/CanActivateChildFn).

### CanDeactivate

The `CanDeactivate` guard determines whether a user can leave a route. A common scenario is preventing navigation away from unsaved forms.

It has access to the following default arguments:

- `component: T` - The component instance being deactivated
- `currentRoute: ActivatedRouteSnapshot` - Contains information about the current route
- `currentState: RouterStateSnapshot` - Contains the current router state
- `nextState: RouterStateSnapshot` - Contains the next router state being navigated to

It can return the [standard return guard types](#route-guard-return-types).

```ts
export const unsavedChangesGuard: CanDeactivateFn<FormComponent> = (component: FormComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot) => {
  return component.hasUnsavedChanges()
    ? confirm('You have unsaved changes. Are you sure you want to leave?')
    : true;
};
```

For more information, check out the [API docs for CanDeactivateFn](api/router/CanDeactivateFn).

### CanMatch

The `CanMatch` guard determines whether a route can be matched during path matching. Unlike other guards, rejection falls through to try other matching routes instead of blocking navigation entirely. This can be useful for feature flags, A/B testing, or conditional route loading.

It has access to the following default arguments:

- `route: Route` - The route configuration being evaluated
- `segments: UrlSegment[]` - The URL segments that have not been consumed by previous parent route evaluations

It can return the [standard return guard types](#route-guard-return-types), but when it returns `false`, Angular tries other matching routes instead of completely blocking navigation.

```ts
export const featureToggleGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const featureService = inject(FeatureService);
  return featureService.isFeatureEnabled('newDashboard');
};
```

It can also allow you to use different components for the same path.

```ts
// 📄 routes.ts
const routes: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboard,
    canMatch: [adminGuard]
  },
  {
    path: 'dashboard',
    component: UserDashboard,
    canMatch: [userGuard]
  }
]
```

In this example, when the user visits `/dashboard`, the first one that matches the correct guard will be used.

For more information, check out the [API docs for CanMatchFn](api/router/CanMatchFn).

## Applying guards to routes

Once you've created your route guards, you need to configure them in your route definitions.

Guards are specified as arrays in the route configuration in order to allow you to apply multiple guards to a single route. They are executed in the order they appear in the array.

```ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { canDeactivateGuard } from './guards/can-deactivate.guard';
import { featureToggleGuard } from './guards/feature-toggle.guard';

const routes: Routes = [
  // Basic CanActivate - requires authentication
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  // Multiple CanActivate guards - requires authentication AND admin role
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard]
  },

  // CanActivate + CanDeactivate - protected route with unsaved changes check
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    canDeactivate: [canDeactivateGuard]
  },

  // CanActivateChild - protects all child routes
  {
    path: 'users', // /user - NOT protected
    canActivateChild: [authGuard],
    children: [
      // /users/list - PROTECTED
      { path: 'list', component: UserListComponent },
      // /useres/detail/:id - PROTECTED
      { path: 'detail/:id', component: UserDetailComponent }
    ]
  },

  // CanMatch - conditionally matches route based on feature flag
  {
    path: 'beta-feature',
    component: BetaFeatureComponent,
    canMatch: [featureToggleGuard]
  },

  // Fallback route if beta feature is disabled
  {
    path: 'beta-feature',
    component: ComingSoonComponent
  }
];
```
