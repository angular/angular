# Router Reference

The following sections highlight some core router concepts.

{@a basics-router-imports}

### Router imports

The Angular Router is an optional service that presents a particular component view for a given URL.
It is not part of the Angular core and thus is in its own library package, `@angular/router`.

Import what you need from it as you would from any other Angular package.

<code-example path="router/src/app/app.module.1.ts" header="src/app/app.module.ts (import)" region="import-router"></code-example>


<div class="alert is-helpful">

For more on browser URL styles, see [`LocationStrategy` and browser URL styles](guide/router#browser-url-styles).

</div>

{@a basics-config}

### Configuration

A routed Angular application has one singleton instance of the `Router` service.
When the browser's URL changes, that router looks for a corresponding `Route` from which it can determine the component to display.

A router has no routes until you configure it.
The following example creates five route definitions, configures the router via the `RouterModule.forRoot()` method, and adds the result to the `AppModule`'s `imports` array.

<code-example path="router/src/app/app.module.0.ts" header="src/app/app.module.ts (excerpt)"></code-example>

{@a example-config}

The `appRoutes` array of routes describes how to navigate.
Pass it to the `RouterModule.forRoot()` method in the module `imports` to configure the router.

Each `Route` maps a URL `path` to a component.
There are no leading slashes in the path.
The router parses and builds the final URL for you, which allows you to use both relative and absolute paths when navigating between application views.

The `:id` in the second route is a token for a route parameter.
In a URL such as `/hero/42`, "42" is the value of the `id` parameter.
The corresponding `HeroDetailComponent` uses that value to find and present the hero whose `id` is 42.

The `data` property in the third route is a place to store arbitrary data associated with
this specific route.
The data property is accessible within each activated route. Use it to store items such as page titles, breadcrumb text, and other read-only, static data.
You can use the [resolve guard](guide/router-tutorial-toh#resolve-guard) to retrieve dynamic data.

The empty path in the fourth route represents the default path for the application&mdash;the place to go when the path in the URL is empty, as it typically is at the start.
This default route redirects to the route for the `/heroes` URL and, therefore, displays the `HeroesListComponent`.

If you need to see what events are happening during the navigation lifecycle, there is the `enableTracing` option as part of the router's default configuration.
This outputs each router event that took place during each navigation lifecycle to the browser console.
Use `enableTracing` only for debugging purposes.
You set the `enableTracing: true` option in the object passed as the second argument to the `RouterModule.forRoot()` method.

{@a basics-router-outlet}

### Router outlet

The `RouterOutlet` is a directive from the router library that is used like a component.
It acts as a placeholder that marks the spot in the template where the router should
display the components for that outlet.

<code-example language="html">
  &lt;router-outlet>&lt;/router-outlet>
  &lt;!-- Routed components go here -->

</code-example>

Given the configuration above, when the browser URL for this application becomes `/heroes`, the router matches that URL to the route path `/heroes` and displays the `HeroListComponent` as a sibling element to the `RouterOutlet` that you've placed in the host component's template.

{@a basics-router-links}

{@a router-link}

### Router links

To navigate as a result of some user action such as the click of an anchor tag, use `RouterLink`.

Consider the following template:

<code-example path="router/src/app/app.component.1.html" header="src/app/app.component.html"></code-example>

The `RouterLink` directives on the anchor tags give the router control over those elements.
The navigation paths are fixed, so you can assign a string to the `routerLink` (a "one-time" binding).

Had the navigation path been more dynamic, you could have bound to a template expression that returned an array of route link parameters; that is, the [link parameters array](guide/router#link-parameters-array).
The router resolves that array into a complete URL.

{@a router-link-active}

### Active router links

The `RouterLinkActive` directive toggles CSS classes for active `RouterLink` bindings based on the current `RouterState`.

On each anchor tag, you see a [property binding](guide/property-binding) to the `RouterLinkActive` directive that looks like `routerLinkActive="..."`.

The template expression to the right of the equal sign, `=`, contains a space-delimited string of CSS classes that the Router adds when this link is active (and removes when the link is inactive).
You set the `RouterLinkActive` directive to a string of classes such as `[routerLinkActive]="'active fluffy'"` or bind it to a component property that returns such a string.

Active route links cascade down through each level of the route tree, so parent and child router links can be active at the same time.
To override this behavior, you can bind to the `[routerLinkActiveOptions]` input binding with the `{ exact: true }` expression. By using `{ exact: true }`, a given `RouterLink` will only be active if its URL is an exact match to the current URL.

{@a basics-router-state}

### Router state

After the end of each successful navigation lifecycle, the router builds a tree of `ActivatedRoute` objects that make up the current state of the router. You can access the current `RouterState` from anywhere in the application using the `Router` service and the `routerState` property.

Each `ActivatedRoute` in the `RouterState` provides methods to traverse up and down the route tree to get information from parent, child, and sibling routes.

{@a activated-route}

### Activated route

The route path and parameters are available through an injected router service called the [ActivatedRoute](api/router/ActivatedRoute).
It has a great deal of useful information including:

<table>
  <tr>
    <th>
      Property
    </th>

    <th>
      Description
    </th>
  </tr>

  <tr>
    <td>
      <code>url</code>
    </td>
    <td>

    An `Observable` of the route path(s), represented as an array of strings for each part of the route path.

    </td>
  </tr>

  <tr>
    <td>
      <code>data</code>
    </td>
    <td>

    An `Observable` that contains the `data` object provided for the route.
    Also contains any resolved values from the [resolve guard](guide/router-tutorial-toh#resolve-guard).

    </td>
  </tr>

  <tr>
    <td>
      <code>paramMap</code>
    </td>
    <td>

    An `Observable` that contains a [map](api/router/ParamMap) of the required and [optional parameters](guide/router-tutorial-toh#optional-route-parameters) specific to the route.
    The map supports retrieving single and multiple values from the same parameter.

    </td>
  </tr>

  <tr>
    <td>
      <code>queryParamMap</code>
    </td>
    <td>

    An `Observable` that contains a [map](api/router/ParamMap) of the [query parameters](guide/router-tutorial-toh#query-parameters) available to all routes.
    The map supports retrieving single and multiple values from the query parameter.

    </td>
  </tr>

  <tr>
    <td>
      <code>fragment</code>
    </td>
    <td>

    An `Observable` of the URL [fragment](guide/router-tutorial-toh#fragment) available to all routes.

    </td>
  </tr>

  <tr>
    <td>
      <code>outlet</code>
    </td>
    <td>

    The name of the `RouterOutlet` used to render the route.
    For an unnamed outlet, the outlet name is primary.

    </td>
  </tr>

  <tr>
    <td>
      <code>routeConfig</code>
    </td>
    <td>

    The route configuration used for the route that contains the origin path.

    </td>
  </tr>

    <tr>
    <td>
      <code>parent</code>
    </td>
    <td>

    The route's parent `ActivatedRoute` when this route is a [child route](guide/router-tutorial-toh#child-routing-component).

    </td>
  </tr>

  <tr>
    <td>
      <code>firstChild</code>
    </td>
    <td>

    Contains the first `ActivatedRoute` in the list of this route's child routes.

    </td>
  </tr>

  <tr>
    <td>
      <code>children</code>
    </td>
    <td>

    Contains all the [child routes](guide/router-tutorial-toh#child-routing-component) activated under the current route.

    </td>
  </tr>
</table>

<div class="alert is-helpful">

Two older properties are still available; however, their replacements are preferable as they may be deprecated in a future Angular version.

* `params`: An `Observable` that contains the required and [optional parameters](guide/router-tutorial-toh#optional-route-parameters) specific to the route. Use `paramMap` instead.

* `queryParams`: An `Observable` that contains the [query parameters](guide/router-tutorial-toh#query-parameters) available to all routes.
Use `queryParamMap` instead.

</div>

### Router events

During each navigation, the `Router` emits navigation events through the `Router.events` property.
These events range from when the navigation starts and ends to many points in between. The full list of navigation events is displayed in the table below.

<table>
  <tr>
    <th>
      Router Event
    </th>

    <th>
      Description
    </th>
  </tr>

  <tr>
    <td>
      <code>NavigationStart</code>
    </td>
    <td>

      An [event](api/router/NavigationStart) triggered when navigation starts.

    </td>
  </tr>

  <tr>
    <td>
      <code>RouteConfigLoadStart</code>
    </td>
    <td>

      An [event](api/router/RouteConfigLoadStart) triggered before the `Router`
      [lazy loads](guide/router-tutorial-toh#asynchronous-routing) a route configuration.

    </td>
  </tr>

  <tr>
    <td>
      <code>RouteConfigLoadEnd</code>
    </td>
    <td>

      An [event](api/router/RouteConfigLoadEnd) triggered after a route has been lazy loaded.

    </td>
  </tr>

  <tr>
    <td>
      <code>RoutesRecognized</code>
    </td>
    <td>

      An [event](api/router/RoutesRecognized) triggered when the Router parses the URL and the routes are recognized.

    </td>
  </tr>

  <tr>
    <td>
      <code>GuardsCheckStart</code>
    </td>
    <td>

      An [event](api/router/GuardsCheckStart) triggered when the Router begins the Guards phase of routing.

    </td>
  </tr>

  <tr>
    <td>
      <code>ChildActivationStart</code>
    </td>
    <td>

      An [event](api/router/ChildActivationStart) triggered when the Router begins activating a route's children.

    </td>
  </tr>

  <tr>
    <td>
      <code>ActivationStart</code>
    </td>
    <td>

      An [event](api/router/ActivationStart) triggered when the Router begins activating a route.

    </td>
  </tr>

  <tr>
    <td>
      <code>GuardsCheckEnd</code>
    </td>
    <td>

      An [event](api/router/GuardsCheckEnd) triggered when the Router finishes the Guards phase of routing successfully.

    </td>
  </tr>

  <tr>
    <td>
      <code>ResolveStart</code>
    </td>
    <td>

      An [event](api/router/ResolveStart) triggered when the Router begins the Resolve phase of routing.

    </td>
  </tr>

  <tr>
    <td>
      <code>ResolveEnd</code>
    </td>
    <td>

      An [event](api/router/ResolveEnd) triggered when the Router finishes the Resolve phase of routing successfuly.

    </td>
  </tr>

  <tr>
    <td>
      <code>ChildActivationEnd</code>
    </td>
    <td>

      An [event](api/router/ChildActivationEnd) triggered when the Router finishes activating a route's children.

    </td>
  </tr>

  <tr>
    <td>
      <code>ActivationEnd</code>
    </td>
    <td>

      An [event](api/router/ActivationEnd) triggered when the Router finishes activating a route.

    </td>
  </tr>

  <tr>
    <td>
      <code>NavigationEnd</code>
    </td>
    <td>

      An [event](api/router/NavigationEnd) triggered when navigation ends successfully.

    </td>
  </tr>

  <tr>
    <td>
      <code>NavigationCancel</code>
    </td>
    <td>

      An [event](api/router/NavigationCancel) triggered when navigation is canceled.
      This can happen when a [Route Guard](guide/router-tutorial-toh#guards) returns false during navigation,
      or redirects by returning a `UrlTree`.

    </td>
  </tr>

  <tr>
    <td>
      <code>NavigationError</code>
    </td>
    <td>

      An [event](api/router/NavigationError) triggered when navigation fails due to an unexpected error.

    </td>
  </tr>

  <tr>
    <td>
      <code>Scroll</code>
    </td>
    <td>

      An [event](api/router/Scroll) that represents a scrolling event.

    </td>
  </tr>
</table>

When you enable the `enableTracing` option, Angular logs these events to the console.
For an example of filtering router navigation events, see the [router section](guide/observables-in-angular#router) of the [Observables in Angular](guide/observables-in-angular) guide.

### Router terminology

Here are the key `Router` terms and their meanings:

<table>

  <tr>

    <th>
      Router Part
    </th>

    <th>
      Meaning
    </th>

  </tr>

  <tr>

    <td>
      <code>Router</code>
    </td>

    <td>
      Displays the application component for the active URL.
      Manages navigation from one component to the next.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterModule</code>
    </td>

    <td>
      A separate NgModule that provides the necessary service providers
      and directives for navigating through application views.
    </td>

  </tr>

  <tr>

    <td>
      <code>Routes</code>
    </td>

    <td>
      Defines an array of Routes, each mapping a URL path to a component.
    </td>

  </tr>

  <tr>

    <td>
      <code>Route</code>
    </td>

    <td>
      Defines how the router should navigate to a component based on a URL pattern.
      Most routes consist of a path and a component type.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterOutlet</code>
    </td>

    <td>
      The directive (<code>&lt;router-outlet></code>) that marks where the router displays a view.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterLink</code>
    </td>

    <td>
      The directive for binding a clickable HTML element to a route. Clicking an element with a <code>routerLink</code> directive that is bound to a <i>string</i> or a <i>link parameters array</i> triggers a navigation.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterLinkActive</code>
    </td>

    <td>
      The directive for adding/removing classes from an HTML element when an associated <code>routerLink</code> contained on or inside the element becomes active/inactive.
    </td>

  </tr>

  <tr>

    <td>
      <code>ActivatedRoute</code>
    </td>

    <td>
      A service that is provided to each route component that contains route specific information such as route parameters, static data, resolve data, global query params, and the global fragment.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterState</code>
    </td>

    <td>
      The current state of the router including a tree of the currently activated routes together with convenience methods for traversing the route tree.
    </td>

  </tr>

  <tr>

    <td>
      <b><i>Link parameters array</i></b>
    </td>

    <td>
      An array that the router interprets as a routing instruction.
      You can bind that array to a <code>RouterLink</code> or pass the array as an argument to the <code>Router.navigate</code> method.
    </td>

  </tr>

  <tr>

    <td>
      <b><i>Routing component</i></b>
    </td>

    <td>
      An Angular component with a <code>RouterOutlet</code> that displays views based on router navigations.
    </td>

  </tr>

</table>