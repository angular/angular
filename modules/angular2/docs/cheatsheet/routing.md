@cheatsheetSection
Routing and navigation
@cheatsheetIndex 10
@description
{@target js ts}`import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, ...} from 'angular2/router';`{@endtarget}
{@target dart}`import 'package:angular2/router.dart';`{@endtarget}


@cheatsheetItem
syntax(js ts):
`@RouteConfig([
  { path: '/:myParam', component: MyComponent, as: 'MyCmp' },
  { path: '/staticPath', component: ..., as: ...},
  { path: '/*wildCardParam', component: ..., as: ...}
])
class MyComponent() {}`|`@RouteConfig`
syntax(dart):
`@RouteConfig(const [
  const Route(path: '/:myParam', component: MyComponent, name: 'MyCmp' ),
])`|`@RouteConfig`
description:
Configures routes for the decorated component. Supports static, parameterized, and wildcard routes.


@cheatsheetItem
syntax:
`<router-outlet></router-outlet>`|`router-outlet`
description:
Marks the location to load the component of the active route.


@cheatsheetItem
syntax:
`<a [routerLink]="[ '/MyCmp', {myParam: 'value' } ]">`|`[routerLink]`
description:
Creates a link to a different view based on a route instruction consisting of a route name and optional parameters. The route name matches the as property of a configured route. Add the '/' prefix to navigate to a root route; add the './' prefix for a child route.


@cheatsheetItem
syntax(js ts):
`@CanActivate(() => { ... })class MyComponent() {}`|`@CanActivate`
syntax(dart):
`@CanActivate(() => ...)class MyComponent() {}`|`@CanActivate`
description:
A component decorator defining a function that the router should call first to determine if it should activate this component. Should return a boolean or a {@target js ts}promise{@endtarget}{@target dart}future{@endtarget}.


@cheatsheetItem
syntax:
`routerOnActivate(nextInstruction, prevInstruction) { ... }`|`routerOnActivate`
description:
After navigating to a component, the router calls the component's routerOnActivate method (if defined).


@cheatsheetItem
syntax:
`routerCanReuse(nextInstruction, prevInstruction) { ... }`|`routerCanReuse`
description:
The router calls a component's routerCanReuse method (if defined) to determine whether to reuse the instance or destroy it and create a new instance. Should return a boolean or a {@target js ts}promise{@endtarget}{@target dart}future{@endtarget}.


@cheatsheetItem
syntax:
`routerOnReuse(nextInstruction, prevInstruction) { ... }`|`routerOnReuse`
description:
The router calls the component's routerOnReuse method (if defined) when it re-uses a component instance.


@cheatsheetItem
syntax:
`routerCanDeactivate(nextInstruction, prevInstruction) { ... }`|`routerCanDeactivate`
description:
The router calls the routerCanDeactivate methods (if defined) of every component that would be removed after a navigation. The navigation proceeds if and only if all such methods return true or a {@target js ts}promise that is resolved{@endtarget}{@target dart}future that completes successfully{@endtarget}.


@cheatsheetItem
syntax:
`routerOnDeactivate(nextInstruction, prevInstruction) { ... }`|`routerOnDeactivate`
description:
Called before the directive is removed as the result of a route change. May return a {@target js ts}promise{@endtarget}{@target dart}future{@endtarget} that pauses removing the directive until the {@target js ts}promise resolves{@endtarget}{@target dart}future completes{@endtarget}.
