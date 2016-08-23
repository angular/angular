@cheatsheetSection
Routing and navigation
@cheatsheetIndex 11
@description
{@target ts}`import { Routes, RouterModule, ... } from '@angular/router';`{@endtarget}
{@target js}Available from the `ng.router` namespace{@endtarget}
{@target dart}`import 'package:angular2/router.dart';`{@endtarget}


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
syntax(dart):
`@RouteConfig(const [
  const Route(path: '', component: HomeComponent, name: 'Home'),
  const Route(path: ':routeParam', component: MyComponent, name: 'MyCmp'),
  const Route(path: 'staticPath', component: ..., name: 'StaticCmp'),
  const Route(path: '**', component: ..., name: 'WildcardCmp'),
  const Route(path: '/oldPath', redirectTo: ['/StaticCmp']),
  const Route(path: ..., component: ..., data: { message: 'Custom' })
])class MyComponent() {}`|`@RouteConfig`
description:
Configures routes for the application. Supports static, parameterized, redirect and wildcard routes. Also supports custom route data{@target ts js} and resolve{@endtarget}.


@cheatsheetItem
syntax:
`
<router-outlet></router-outlet>
<router-outlet name="aux"></router-outlet>
`|`router-outlet`
description:
Marks the location to load the component of the active route.


@cheatsheetItem
syntax(ts js):
`
<a routerLink="/path">
<a [routerLink]="[ '/path', routeParam ]">
<a [routerLink]="[ '/path', { matrixParam: 'value' } ]">
<a [routerLink]="[ '/path' ]" [queryParams]="{ page: 1 }">
<a [routerLink]="[ '/path' ]" fragment="anchor">
`|`[routerLink]`
syntax(dart):
`
<a [routerLink]="[ '/MyCmp', { routeParam: 'value' } ]">
<a [routerLink]="[ '/MyCmp', { matrixParam: 'value' } ]">
`|`[routerLink]`
description:
Creates a link to a different view based on a route instruction consisting of a route path, required and optional parameters, query parameters and a fragment. Add the '/' prefix to navigate to a root route; add the './' prefix for a child route; add the '../sibling' prefix for a sibling or parent route.

@cheatsheetItem
syntax(ts js):
`<a [routerLink]="[ '/path' ]" routerLinkActive="active">`
syntax(dart):
`<a [routerLink]="[ '/MyCmp', { myParam: 'value' } ]">`|`routerLink`
description:
The provided class(es) will be added to the element when the routerLink becomes the current active route.

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
syntax(dart):
`@CanActivate(() => ...)class MyComponent() {}`|`@CanActivate`
description:
{@target js ts}An interface for defining a class that the router should call first to determine if it should activate this component. Should return an Observable/Promise that resolves a boolean or a boolean{@endtarget}
{@target dart}A component decorator defining a function that the router should call first to determine if it should activate this component. Should return a boolean or a future.{@endtarget}

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
syntax(dart):
`routerCanDeactivate(nextInstruction, prevInstruction) { ... }`|`routerCanDeactivate`
description:
{@target js ts}An interface for defining a class that the router should call first to determine if it should deactivate this component after a navigation. Should return an Observable/Promise that resolves a boolean or a boolean{@endtarget}
{@target dart}
The router calls the routerCanDeactivate methods (if defined) of every component that would be removed after a navigation. The navigation proceeds if and only if all such methods return true or a future that completes successfully{@endtarget}.

@cheatsheetItem
syntax(ts):
`class CanActivateChildGuard implements CanActivateChild {
    canActivateChild(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<boolean>|Promise<boolean>|boolean { ... }
}

{ path: ..., canActivateChild: [CanActivateGuard], children: ... }`|`CanActivateChild`
syntax(js):
`var CanActivateChildGuard = ng.core.Class({
  canActivateChild: function(route, state) {
    // return Observable/Promise boolean or boolean
  }
});

{ path: ..., canActivateChild: [CanActivateChildGuard], children: ... }`|`CanActivateChild`
description:
{@target js ts}An interface for defining a class that the router should call first to determine if it should activate the child route. Should return an Observable/Promise that resolves a boolean or a boolean{@endtarget}

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
{@target js ts}An interface for defining a class that the router should call first to resolve route data before rendering the route. Should return an Observable/Promise that resolves a value or a value{@endtarget}

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
{@target js ts}An interface for defining a class that the router should call first to check if the lazy loaded module should be loaded. Should return an Observable/Promise that resolves a boolean or a boolean{@endtarget}

@cheatsheetItem
syntax(dart):
`routerOnActivate(nextInstruction, prevInstruction) { ... }`|`routerOnActivate`
description:
{@target dart}After navigating to a component, the router calls the component's routerOnActivate method (if defined).{@endtarget}


@cheatsheetItem
syntax(dart):
`routerCanReuse(nextInstruction, prevInstruction) { ... }`|`routerCanReuse`
description:
{@target dart}The router calls a component's routerCanReuse method (if defined) to determine whether to reuse the instance or destroy it and create a new instance. Should return a boolean or a future{@endtarget}.


@cheatsheetItem
syntax(dart):
`routerOnReuse(nextInstruction, prevInstruction) { ... }`|`routerOnReuse`
description:
{@target dart}The router calls the component's routerOnReuse method (if defined) when it re-uses a component instance.{@endtarget}


@cheatsheetItem
syntax(dart):
`routerCanDeactivate(nextInstruction, prevInstruction) { ... }`|`routerCanDeactivate`
description:
{@target dart}The router calls the routerCanDeactivate methods (if defined) of every component that would be removed after a navigation. The navigation proceeds if and only if all such methods return true or a future that completes successfully.{@endtarget}


@cheatsheetItem
syntax(dart):
`routerOnDeactivate(nextInstruction, prevInstruction) { ... }`|`routerOnDeactivate`
description:
{@target dart}Called before the directive is removed as the result of a route change. May return a future that pauses removing the directive until the future completes.{@endtarget}
