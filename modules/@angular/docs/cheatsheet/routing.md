@cheatsheetSection
Routing and navigation
@cheatsheetIndex 11
@description
{@target ts}`import { Routes, RouterModule, ... } from '@angular/router';`{@endtarget}
{@target js}Available from the `ng.router` namespace{@endtarget}


@cheatsheetItem
syntax(ts):
`const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'path/:routeParam', component: MyComponent },
  { path: 'staticPath', component: ... },
  { path: '**', component: ... },
  { path: 'oldPath', redirectTo: '/staticPath' },
  { path: ..., component: ..., data: { message: 'Custom' } }
]);

const routing = RouterModule.forRoot(routes);`|`Routes`
syntax(js):
`var routes = [
  { path: '', component: HomeComponent },
  { path: ':routeParam', component: MyComponent },
  { path: 'staticPath', component: ... },
  { path: '**', component: ... },
  { path: 'oldPath', redirectTo: '/staticPath' },
  { path: ..., component: ..., data: { message: 'Custom' } }
]);

var routing = ng.router.RouterModule.forRoot(routes);`|`ng.router.Routes`
description:
Configures routes for the application. Supports static, parameterized, redirect, and wildcard routes. Also supports custom route data and resolve.


@cheatsheetItem
syntax:
`
<router-outlet></router-outlet>
<router-outlet name="aux"></router-outlet>
`|`router-outlet`
description:
Marks the location to load the component of the active route.


@cheatsheetItem
syntax:
`
<a routerLink="/path">
<a [routerLink]="[ '/path', routeParam ]">
<a [routerLink]="[ '/path', { matrixParam: 'value' } ]">
<a [routerLink]="[ '/path' ]" [queryParams]="{ page: 1 }">
<a [routerLink]="[ '/path' ]" fragment="anchor">
`|`[routerLink]`
description:
Creates a link to a different view based on a route instruction consisting of a route path, required and optional parameters, query parameters, and a fragment. To navigate to a root route, use the `/` prefix; for a child route, use the `./`prefix; for a sibling or parent, use the `../` prefix.

@cheatsheetItem
syntax:
`<a [routerLink]="[ '/path' ]" routerLinkActive="active">`
description:
The provided classes are added to the element when the `routerLink` becomes the current active route.

@cheatsheetItem
syntax(ts):
`class CanActivateGuard implements CanActivate {
    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<boolean>|Promise<boolean>|boolean { ... }
}

{ path: ..., canActivate: [CanActivateGuard] }`|`CanActivate`
syntax(js):
`var CanActivateGuard = ng.core.Class({
  canActivate: function(route, state) {
    // return Observable/Promise boolean or boolean
  }
});

{ path: ..., canActivate: [CanActivateGuard] }`|`CanActivate`
description:
An interface for defining a class that the router should call first to determine if it should activate this component. Should return a boolean or an Observable/Promise that resolves to a boolean.

@cheatsheetItem
syntax(ts):
`class CanDeactivateGuard implements CanDeactivate<T> {
    canDeactivate(
      component: T,
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<boolean>|Promise<boolean>|boolean { ... }
}

{ path: ..., canDeactivate: [CanDeactivateGuard] }`|`CanDeactivate`
syntax(js):
`var CanDeactivateGuard = ng.core.Class({
  canDeactivate: function(component, route, state) {
    // return Observable/Promise boolean or boolean
  }
});

{ path: ..., canDeactivate: [CanDeactivateGuard] }`|`CanDeactivate`
description:
An interface for defining a class that the router should call first to determine if it should deactivate this component after a navigation. Should return a boolean or an Observable/Promise that resolves to a boolean.

@cheatsheetItem
syntax(ts):
`class CanActivateChildGuard implements CanActivateChild {
    canActivateChild(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<boolean>|Promise<boolean>|boolean { ... }
}

{ path: ..., canActivateChild: [CanActivateGuard],
    children: ... }`|`CanActivateChild`
syntax(js):
`var CanActivateChildGuard = ng.core.Class({
  canActivateChild: function(route, state) {
    // return Observable/Promise boolean or boolean
  }
});

{ path: ..., canActivateChild: [CanActivateChildGuard],
    children: ... }`|`CanActivateChild`
description:
An interface for defining a class that the router should call first to determine if it should activate the child route. Should return a boolean or an Observable/Promise that resolves to a boolean.

@cheatsheetItem
syntax(ts):
`class ResolveGuard implements Resolve<T> {
    resolve(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<any>|Promise<any>|any { ... }
}

{ path: ..., resolve: [ResolveGuard] }`|`Resolve`
syntax(js):
`var ResolveGuard = ng.core.Class({
  resolve: function(route, state) {
    // return Observable/Promise value or value
  }
});

{ path: ..., resolve: [ResolveGuard] }`|`Resolve`
description:
An interface for defining a class that the router should call first to resolve route data before rendering the route. Should return a value or an Observable/Promise that resolves to a value.

@cheatsheetItem
syntax(ts):
`class CanLoadGuard implements CanLoad {
    canLoad(
      route: Route
    ): Observable<boolean>|Promise<boolean>|boolean { ... }
}

{ path: ..., canLoad: [CanLoadGuard], loadChildren: ... }`|`CanLoad`
syntax(js):
`var CanLoadGuard = ng.core.Class({
  canLoad: function(route) {
    // return Observable/Promise boolean or boolean
  }
});

{ path: ..., canLoad: [CanLoadGuard], loadChildren: ... }`|`CanLoad`
description:
An interface for defining a class that the router should call first to check if the lazy loaded module should be loaded. Should return a boolean or an Observable/Promise that resolves to a boolean.

