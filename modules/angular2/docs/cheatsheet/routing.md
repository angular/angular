@cheatsheetSection
Routing and navigation
@cheatsheetIndex 10
@description
`import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, ...} from 'angular2/router';`


@cheatsheetItem
`@RouteConfig([
  { path: '/:myParam', component: MyComponent, as: 'MyCmp' },
  { path: '/staticPath', component: ..., as: ...},
  { path: '/*wildCardParam', component: ..., as: ...}
])
class MyComponent() {}`|`@RouteConfig`
Configures routes for the decorated component. Supports static, parameterized and wildcard routes.


@cheatsheetItem
`<router-outlet></router-outlet>`|`router-outlet`
Marks the location to load the component of the active route.


@cheatsheetItem
`<a [router-link]="[ '/MyCmp', {myParam: 'value' } ]">`|`[router-link]`
Creates a link to a different view based on a route instruction consisting of a route name and optional parameters. The route name matches the as property of a configured route. Add the '/' prefix to navigate to a root route; add the './' prefix for a child route.


@cheatsheetItem
`@CanActivate(() => { ... })class MyComponent() {}`|`@CanActivate`
A component decorator defining a function that the router should call first to determine if it should activate this component. Should return a boolean or a promise.


@cheatsheetItem
`onActivate(nextInstruction, prevInstruction) { ... }`|`onActivate`
After navigating to a component, the router calls component's onActivate method (if defined).


@cheatsheetItem
`canReuse(nextInstruction, prevInstruction) { ... }`|`canReuse`
The router calls a component's canReuse method (if defined) to determine whether to reuse the instance or destroy it and create a new instance. Should return a boolean or a promise.


@cheatsheetItem
`onReuse(nextInstruction, prevInstruction) { ... }`|`onReuse`
The router calls the component's onReuse method (if defined) when it re-uses a component instance.


@cheatsheetItem
`canDeactivate(nextInstruction, prevInstruction) { ... }`|`canDeactivate`
The router calls the canDeactivate methods (if defined) of every component that would be removed after a navigation. The navigation proceeds if and only if all such methods return true or a promise that is resolved.


@cheatsheetItem
`onDeactivate(nextInstruction, prevInstruction) { ... }`|`onDeactivate`
Called before the directive is removed as the result of a route change. May return a promise that pauses removing the directive until the promise resolves.