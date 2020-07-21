# In-app navigation: routing to views

In a single-page app, you change what the user sees by showing or hiding portions of the display that correspond to particular components, rather than going out to the server to get a new page.
As users perform application tasks, they need to move between the different [views](guide/glossary#view "Definition of view") defined by your components.

To handle navigation from one view to another, you use the Angular [Router service](api/router/RouterModule "API reference"). The Router service enables navigation by interpreting a browser URL as an instruction to change the view. A user can initiate a request for navigation interactively from the UI, or you can navigate programmatically.

To explore a sample app that demonstrates the router's primary features, see the <live-example></live-example>.

<hr />

## Prerequisites

Before creating an application capable of view navigation, you should be familiar with the following:

* [Basics of components](guide/architecture-components)
* [Basics of templates](guide/glossary#template)
* An Angular app&mdash;you can generate a basic Angular app using the [Angular CLI](cli).

For an introduction to Angular with a ready-made app, see [Getting Started](start "Try it now without setup").
For a more in-depth experience of building an Angular app, see the [Tour of Heroes](tutorial "Full tutorial") tutorial. Both guide you through using component classes and templates.

**Routing tutorials**: The [Tour of Heroes tutorial](tutorial "Full tutorial") walks you through adding navigation to the sample app.
Additional tutorials use the same domain to introduce [basic routing](guide/router-tutorial "Using Angular routes in a single-page app") and provide examples of more advanced [navigation techniques](guide/router-tutorial-toh "Taking advantage of routing features").

<hr />

## How routing works

The Angular router intercepts the browser's address bar, interpreting a new URL as an instruction to activate a specific component and show its view in the current page, rather than opening a new page.
Routing is initiated whenever the URL changes, either by entering it directly in the address bar, by the user clicking a page element with a `routerLink` directive, or in a call to a method such as `Router.navigate()` triggered by program logic.

The router selects a component by matching the new URL with a path in the route configuration.
It instantiates the component if needed, and displays the associated view in a *router outlet*.
The `[router-outlet]` directive acts as a placeholder for the new component's template within another template.

A template can have more than one router outlet, allowing the router to display secondary, or auxiliary views.
You can nest related routes, creating a hierarchy of parent and child routes to any depth.
You pass data between components using *route parameters*.

You can retrieve the current navigation state and respond to routing events to enhance the user experience with styling and animation that helps a user keep track of where they are in your application as the display changes.

You can define *route guard* functions to control access to parts of your application, and *resolver* functions to optimize your application by preloading data needed to resolve routes.

{@a route-parameters}

### Resolving route parameters

The router composes a URL for a particular view by combining a base path with a set of parameters. Parameters in a route definition can be specified as literal values, or can be tokens or expressions that the router resolves.
For example, in the following route definition, the route to `HeroDetailComponent` has an `:id` token in the path.

<code-example path="router/src/app/heroes/heroes-routing.module.1.ts" header="src/app/heroes/heroes-routing.module.ts (excerpt)" region="hero-detail-route"></code-example>

The `:id` token creates a slot in the path for a route parameter.
The router resolves the parameter to create a final URL to the component's view by inserting the value of the hero's `id` property into the route path:

<code-example format="nocode">
  localhost:4200/hero/15

</code-example>

If a user enters that URL into the browser address bar, the router displays the "Magneta" detail view.

The following example navigates to the detail view for a hero by passing a [link parameters array](#link-parameters-array "Learn more about link parameters arrays and optional parameters") to the `router.navigate()` method.

   <code-example path="router/src/app/heroes/hero-list/hero-list.component.1.html" header="src/app/heroes/hero-list/hero-list.component.html (link-parameters-array)" region="link-parameters-array"></code-example>

The link parameters array here contains two items: the routing _path_ and the required _route parameter_ that specifies the `id` of the selected hero.
The router composes the destination URL from the array: `localhost:4200/hero/15`.

{@a basics}

## Set up an application to use the routing service

The Angular router is an optional service that presents a particular component view for a given URL.
It is provided in its own library package, `@angular/router`.
Import the `RouterModule` and required elements from the package as you would from any other Angular package.

<code-example path="router/src/app/app.module.1.ts" header="src/app/app.module.ts (import)" region="import-router"></code-example>

The following command uses the Angular CLI to generate a basic Angular app that supports navigation with the router service.

<code-example language="none" class="code-shell">
  ng new routing-app --routing
</code-example>

When generating a new app, the CLI prompts you to select CSS or a CSS preprocessor.
For this example, accept the default of `CSS`.

A routed Angular application has one singleton instance of the `Router` service.
When the browser's URL changes, that router looks for a corresponding `Route` from which it can determine the component to display.

{@a app-structure}

### Structuring an application for routing

An application that supports navigation can have dedicated NgModules for the routing configuration.
When you create a new project with the CLI `--routing` option, the application includes a routing module named `AppRoutingModule` and imports it into the root module. The routing module imports `RouterModule` and `Routes`.

A dedicated routing module does not declare components, but serves to separate routing concerns from other application concerns. It provides a well-known location for routing service providers such as guards and resolvers. A routing module is also easy to replace or remove when testing the application.

<div class="alert is-helpful">

  **Manual Setup**: The examples in this guide work with a CLI-generated Angular app.
  If you are working manually, you should create your own routing module that imports `RouterModule` and `Routes`, and import it into your root module.

  The CLI also sets a *base URL* for a routing application.
  If you are working manually, set a base `<base href="/">` in the `<head>` of your `index.html` file   (assuming that the `app` folder is the application root, and uses `"/"`).

</div>

As your application grows more complex, you can generate additional feature modules with the `--routing` flag, and register them with the root module. When you do so, each additional routing module configures a parent of child routes in a [route hierarchy](#route-trees "Learn more about nested routes").

{@a lazy-loading}

<div class="callout is-helpful">

<header>Optimizing performance with lazy-loading and pre-loading</header>

In an application that supports navigation, some views are not shown at launch, and might not ever be shown at all unless the user follows a particular path to them. A module that defines such a view might not need to be part of the initial bundle.
You can configure your routes so that Angular only loads modules as needed, rather than loading all modules when the app launches. This is called [lazy loading](guide/glossary#lazy-loading "Definition of lazy loading").

You can also improve the user experience by using a [resolve guard](/guide/router-tutorial-toh#resolve-guard "See example of `ResolveGuard`") to pre-load data in the background, when you know it will be needed to resolve routes.
For more information on lazy-loading and pre-loading modules, see the dedicated guide [Lazy loading NgModules](guide/lazy-loading-ngmodules "Lazy-loading guide").

</div>

{@a example-config}
{@a basic-route}
{@a configuration}

### Configuring routes

To use navigation, you need to configure your application to use the  router service, and define at least two [routing components](guide/glossary#routing-component "Definition of routing component") so that you can navigate between their views.

The router has no routes until you configure it with route definitions.
The following example creates five route definitions, configures the router via the `RouterModule.forRoot()` method, and adds the result to the root module's `imports` array.

<code-example path="router/src/app/app.module.0.ts" header="src/app/app.module.ts (excerpt)"></code-example>

The `appRoutes` variable in this example contains an array of routes that describes how to navigate.
You pass it to the `RouterModule.forRoot()` method in the module `imports` to configure the router.
The example also shows one of the [additional configuration options](api/router/ExtraOptions "API reference for router config options") that you can pass to the router.

Each item in a `Routes` array is a [`Route`](api/router/Route "API reference") object.

* Each `Route` maps a URL `path` to a component. There are no leading slashes in the path.
   The router service parses and builds the final URL for you, which allows you to use both relative and absolute paths when navigating between application views.

* The `:id` in the second route is a token for a *route parameter*. In a URL such as `/hero/42`, "42" is the value of the `id` parameter.
   The corresponding `HeroDetailComponent` uses that value to find and present the hero whose `id` is 42.

* The `data` property in the third route is a place to store arbitrary data associated with this specific route. The data property is accessible within each activated route. Use it to store items such as page titles, breadcrumb text, and other read-only, static data.
   You can use a [resolve guard](/guide/router-tutorial-toh#resolve-guard "See example of `ResolveGuard`") to retrieve dynamic data.

The empty path in the fourth route represents the default path for the application&mdash;the place to go when the path in the URL is empty, as it typically is at the start.
This default route redirects to the route for the `/heroes` URL and, therefore, displays the `HeroesListComponent`.

{@a route-order}

## Prevent navigation failures with route ordering and special syntax

Your routing configuration, application design, and ordering of routes all affect navigation.
The order of routes in the configuration is particularly important. The router service activates the first matching route it comes to, so more specific routes should be placed above less specific routes.

List routes with a static path first, followed by an empty path route, which matches the default route.
The *wildcard* route comes last because it matches every URL and the router selects it only if no other routes match first.

You can [handle navigation errors](#404-page-how-to "Details below") by defining a "path not found" view, and avoid navigation errors caused by terminology changes by [defining route redirects](#redirects "Details below").

See more examples of routing techniques in the [Route](api/router/Route#usage-notes) reference documentation.

{@a wildcard}

### Using wildcard routes

A well-functioning application should gracefully handle when users attempt to navigate to a part of your application that does not exist.
To add this functionality to your application, you set up a wildcard route.
The Angular router selects this route any time the requested URL doesn't match any router paths.

To set up a wildcard route, add the following code to your `routes` definition.

<code-example header="AppRoutingModule (excerpt)">

{ path: '**', component: <component-name> }

</code-example>

The two asterisks, `**`, indicate to Angular that this `routes` definition is a wildcard route.
For the component property, you can define any component in your application.
Common choices include an application-specific `PageNotFoundComponent`, which you can define to [display a 404 page](#404-page-how-to) to your users; or a redirect to your application's main component.
A wildcard route is the last route because it matches any URL.
For more detail on why order matters for routes, see [Route order](#route-order).

{@a redirects}

### Defining redirects

To set up a redirect, configure a route with the `path` you want to redirect from, the `component` you want to redirect to, and a `pathMatch` value that tells the router how to match the URL.

<code-example path="router/src/app/app-routing.module.8.ts" region="redirect" header="AppRoutingModule (excerpt)">

</code-example>

In this example, the third route is a redirect so that the router defaults to the `first-component` route.
Notice that this redirect precedes the wildcard route.
Here, `path: ''` means to use the initial relative URL (the empty string `''`).

{@a pathmatch}

<div class="callout is-helpful">

  <header>Path matching</header>

  Technically, `pathMatch = 'full'` results in a route hit when the *remaining* unmatched  segments of the URL match `''`.
  If the redirect is in a top level route, the remaining URL is the same as the  *entire* URL. The other possible `pathMatch` value is `'prefix'` which tells the router to match the  redirect route when the remaining URL begins with the redirect route's prefix  path.

  You can share a route prefix between components by making them children of a [componentless route](api/router/Route#componentless-routes "Example of sharing parameters"); that is, a route that has a `path` and `children`, but no `component` value. The parent's path is used as the prefix for the child routes.

  Learn more in Victor Savkin's
  [post on redirects](http://vsavkin.tumblr.com/post/146722301646/angular-router-empty-paths-componentless-routes "Empty paths, componentless routes, and redirects").

</div>

{@a 404-page-how-to}

### Handling unfound views

To display the equivalent of a "404 Not Found" page, set up a [wildcard route](#wildcard "Details above") with the `component` property set to the component you'd like to use for your 404 page as follows.

<code-example path="router/src/app/app-routing.module.8.ts" region="routes-with-wildcard" header="AppRoutingModule (excerpt)">

</code-example>

The last route with the `path` of `**` is a wildcard route.
The router service selects this route if the requested URL doesn't match any of the paths earlier in the list and sends the user to the `PageNotFoundComponent`.

## Enabling interactive navigation

A template that enables navigation for users needs two things:

* An *outlet*, a placeholder in the page where a component's view is to be inserted.
* Links to the routing components that allow users to trigger navigation.

{@a basics-router-outlet}

### Placing a view in a template

The `RouterOutlet` is a directive from the router library that is used like a component.
It acts as a placeholder that marks the spot in the template where the router should
display the component views for that outlet.

A `<router-outlet>` element in the template for the root component tells Angular to update the application view with the component for the selected route.

<code-example language="html">
  &lt;router-outlet>&lt;/router-outlet>
  &lt;!-- Routed components go here -->

</code-example>

Given the configuration above, when the browser URL for this application becomes `/heroes`, the router matches that URL to the route path `/heroes` and displays the `HeroListComponent` as a sibling element to the `RouterOutlet` that you've placed in the host component's template.

{@a basics-router-links}
{@a router-link}

### Initiating interactive navigation

Your app can initiate navigation programmatically, or a user can trigger a request for navigation by typing a URL in the address bar or clicking a link.
To navigate as a result of a user action such as a click, include the [`RouterLink` directive](api/router/RouterLink "API reference") in the template.

For example, the following template creates a link to a routing component in a `<nav>` container by using an anchor tag with the `routerLink` attribute.

<code-example path="router/src/app/app.component.1.html" header="src/app/app.component.html"></code-example>

This code assigns the anchor tag to the element that will initiate navigation, and sets the value of that attribute to the component to show when a user clicks on that link.

The `RouterLink` directives on the anchor tags give the router control over those elements.
The navigation paths are fixed, so you can assign a path string to the `routerLink` (a "one-time" binding).

For a more dynamic navigation path, you can bind the router link to a template expression that returns a [link parameters array](guide/router#link-parameters-array "Learn more about link parameters arrays"). This array contains an object which associates a route path string with one or more required, optional, or query parameters. The router service resolves that array into a complete URL.

To initiate navigation programmatically, pass a router URL string or link parameters array to the [Router.navigate() method](api/router/Router#navigate "API reference").

{@a basics-router-state}
{@a activated-route}
{@a router-link-active}

## Tracking navigation state

When the router matches a path and displays a new view, the selected route becomes *active*.
An active route is represented by an [ActivatedRoute](api/router/ActivatedRoute "API reference") object.
After the end of each successful navigation cycle, the router builds a tree of `ActivatedRoute` objects that make up the current navigation state.
Access the navigation state through the [Router.routerState](api/router/Router#routerState "API reference") property.

Each `ActivatedRoute` in the `RouterState` provides the route path and parameters, as well as methods to traverse up and down the route tree to get information from parent, child and sibling routes.
See the API reference for the many useful properties of an [ActivatedRoute](api/router/ActivatedRoute "API reference documentation") object.

### Style views according to navigation state

You can style views according to the navigation state. For example, you might want to highlight the currently selected tab in a set of tabbed panes, to keep the user oriented.

You can use the [RouterLinkActive](api/router/RouterLinkActive "API reference") directive on an element to toggle CSS classes for active `RouterLink` bindings based on the current `RouterState`.

On each anchor tag, you see a [property binding](guide/property-binding "Learn more about property binding") to the `RouterLinkActive` directive that looks like `routerLinkActive="..."`, as in the following example.

<code-example header="src/app/app.component.html" path="router-tutorial/src/app/app.component.html" region="routeractivelink"></code-example>

You can bind the `routerLinkActive` directive to a space-delimited string of CSS classes such as `[routerLinkActive]="'active fluffy'"`, or bind it to a component property that returns such a string.
The router automatically adds these classes to the tag when the linked route is activated, and removes them when the route becomes inactive.

When you have [nested routes](#nesting-routes "Complex routing structure"), active routes cascade down through each level of the route tree, so parent and child routes can be active at the same time.
To distinguish between specific linked routes, you can modify the `RouterLinkActive` directive with the `[routerLinkActiveOptions]={ exact: true }` input binding ([see example](api/router/RouterLinkActive#description "API reference")). This reports the linked route as active only when its URL is an exact match to the current URL.

{@a router-events}

### Router event order

During each navigation, the router service emits navigation events through the `Router.events` property.
These events occur when the navigation starts and ends and many points in between.

If you need to see what events are happening during the navigation lifecycle, you can set the `enableTracing` option as part of the router's default configuration.
This outputs each router event that took place during each navigation lifecycle to the browser console.
Use `enableTracing` only for debugging purposes.
Set the `enableTracing: true` option in the object passed as the second argument to the `RouterModule.forRoot()` method.

<!-- this table is moved into API doc in another PR (TBD) - when that lands, replace it with a link -->

The following table lists the router event types in the order in which they can occur. The properties of each event are listed in the [API reference documentation](api/router/Event "Router event types").

| Router Event | Trigger |
| :----------- | :------- |
| [NavigationStart](api/router/NavigationStart) | Navigation starts. |
| [RouteConfigLoadStart](api/router/RouteConfigLoadStart) | Before the router [lazy loads](/guide/router-tutorial-toh#asynchronous-routing) a route configuration. |
| [RouteConfigLoadEnd](api/router/RouteConfigLoadEnd) | After a route has been lazy loaded. |
| [RoutesRecognized](api/router/RoutesRecognized) | When the router parses the URL and the routes are recognized. |
| [GuardsCheckStart](api/router/GuardsCheckStart) | When the router begins the *guards* phase of routing. |
| [ChildActivationStart](api/router/ChildActivationStart) | When the router begins activating a route's children. |
| [ActivationStart](api/router/ActivationStart)| When the router begins activating a route. |
| [GuardsCheckEnd](api/router/GuardsCheckEnd) | When the router finishes the *guards* phase of routing successfully. |
| [ResolveStart](api/router/ResolveStart) | When the router begins the *resolve* phase of routing. |
| [ResolveEnd](api/router/ResolveEnd) | When the router finishes the *resolve* phase of routing successfuly. |
| [ChildActivationEnd](api/router/ChildActivationEnd) | When the router finishes activating a route's children. |
| [ActivationEnd](api/router/ActivationStart) | When the router finishes activating a route. |
| [NavigationEnd](api/router/NavigationEnd) | When navigation ends successfully. |
| [NavigationCancel](api/router/NavigationCancel) | When navigation is canceled. This can happen when a [route guard](/guide/router-tutorial-toh#guards) returns false during navigation, or redirects by returning a `UrlTree`. |
| [NavigationError](api/router/NavigationError) | When navigation fails due to an unexpected error. |
| [Scroll](api/router/Scroll) | When the user scrolls. |

When you set the `enableTracing` option, Angular logs these events to the console.
For an example of filtering router navigation events, see the [router section](guide/observables-in-angular#router) of the [Observables in Angular](guide/observables-in-angular) guide.

{@a activated-route}
{@a getting-route-information}

## Passing values between components

As a user navigates your application, you need to pass route information from one component to another.
For example, consider an application that displays a shopping list of grocery items.
To edit an item, users click an Edit button, which opens an `EditGroceryItem` component.
For the new component to display the right item, it must retrieve the unique identifier of the selected item from the previously displayed shopping-list component.

To pass route parameters between your application components, use the [ActivatedRoute](api/router/ActivatedRoute "API reference") interface together with the [`ngOnInit()` lifecycle hook method](guide/lifecycle-hooks "Hooking into the component lifecycle").

To get parameter information from an active or previously active route, use the following steps.

  1. Import `ActivatedRoute` and `ParamMap` to your component.

    <code-example path="router/src/app/heroes/hero-detail/hero-detail.component.ts" region="imports-route-info" header="In the component class (excerpt)">
    </code-example>

    These `import` statements add several important elements that your component needs.
    To learn more about each, see the following API pages:

      * [`Router`](api/router)
      * [`ActivatedRoute`](api/router/ActivatedRoute)
      * [`ParamMap`](api/router/ParamMap)

  1. Inject an instance of `ActivatedRoute` by adding it to your application's constructor:

    <code-example path="router/src/app/heroes/hero-detail/hero-detail.component.ts" region="activated-route" header="In the component class (excerpt)">
    </code-example>

  1. Update the `ngOnInit()` method to access the `ActivatedRoute` and track it using an identifying parameter.
  The following example uses a variable, `name`, and assigns it the value based on the `name` parameter.

      <code-example header="In the component (excerpt)">
        ngOnInit() {
          this.route.queryParams.subscribe(params => {
            this.name = params['name'];
          });
        }
      </code-example>

{@a param-maps}

### Retrieving parameters from parameter maps

When you activate a route, the router stores the parameters that were passed to in that activation operation in a *parameter map*. Both route parameters and query parameters are stored in a `ParamMap` object.
The [ParamMap interface](api/router/ParamMap "ParamMap API reference") is based on the [URLSearchParams interface](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams "Web API standards").

The [ActivatedRoute](api/router/ActivatedRoute "ActivatedRoute API reference") methods give you access to both the route parameters (`paramMap`) and query parameters (`queryParamMap`) with which the route was activated.
A parameter map provides methods to handle parameter access.
You can check for the existence of a parameter name, retrieve the value of one or all parameters, and list all parameter names.

{@a reuse}

Notice that the `ActivatedRoute` methods return parameter maps from an `Observable`.
This is because the parameters can change during the lifetime of an activated component.
By default, the router re-uses a component instance when it re-navigates to the same component type
without visiting a different component first. The route parameters could change with each navigation operation.

Suppose, for example, a parent component navigation bar has "forward" and "back" buttons
that scroll through a list of items to retrieve details of a selected item.
Each click navigates imperatively to the component with the next or previous `id`.

It would not be efficient to remove the current item-detail instance from the DOM only to re-create it for the next `id`, which would require Angular to re-render the view.
Instead, the router re-uses the same component instance and updates the parameter.

The `ngOnInit()` method is only called once per component instantiation, so if you use that method to activate a route, the route parameters can change when the same component is reactivated through another means, such as a "back" button. You can detect when the route parameters change from _within the same instance_ using the observable `paramMap` property.

<!--Bug related to how automatic unsubscribe doesn't actually seem to work: #16261
removing this note so we aren't recommending something that causes a memory leak.

<div class="alert is-helpful">

When subscribing to an observable in a component, you almost always unsubscribe when the component is destroyed.
However, `ActivatedRoute` observables are among the exceptions because `ActivatedRoute` and its observables are insulated from the `Router` itself.
The router service is responsible for destroying a routed component when it is no longer needed along with the injected `ActivatedRoute`.

</div> -->

{@a snapshot}

### Use snapshots as an alternative to observables

You can design an application such that there is only one way to activate a route, so you know that it will create a new component instance on every activation.

In this case, when you know the instance will never be re-used, you can use `activatedRoute.snapshot` to retrieve the initial value of the route parameter map directly from a cached [ActivatedRouteSnapshot](api/router/ActivatedRouteSnapshot "ActivatedRouteSnapshot API reference") object.
The snapshot gives you direct access the initial parameters, without subscribing or adding observable operators, as in the following example.

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.2.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (ngOnInit snapshot)" region="snapshot"></code-example>


{@a nesting-routes}
{@a route-trees}
## Creating complex routing structures

As your application grows more complex, you can create routes that are relative to a component other than your root component.
In addition to the `<router-outlet>` in the root application's template, you can place `<router-outlet>` elements in the templates of other components, resulting in a nested structure of parent and child routes.
You can [use relative paths to traverse the route tree](#using-relative-paths "Details below").

The Angular router provides direct access to route path strings.
You can [access and manipulate query parameters and URL fragments](#access-params "Details below"), and [set required and optional route parameters](#link-parameters-array "Details below") for routing hierarchies of any depth.


### Create a navigation tree with nested routes

In the following example, there are two additional child components, `child-a`, and `child-b`.
Here, `FirstComponent` has its own `<nav>` and a second `<router-outlet>` in addition to the one in `AppComponent`.

<code-example path="router/src/app/app.component.8.html" region="child-routes" header="In the template">

</code-example>

You place child routes in a `children` array within the parent route. The child route itself, like any other route, needs both a `path` and a `component`.

<code-example path="router/src/app/app-routing.module.9.ts" region="child-routes" header="AppRoutingModule (excerpt)">

</code-example>

{@a using-relative-paths}

### Using relative paths to traverse the route tree

Relative paths allow you to define paths in a link parameters list that are relative to the current URL segment.
Relative route paths use standard path notation: use `../` to specify a route relative to the current level's parent, and use `./` or no leading slash to specify a route relative to the current level.

You can combine relative navigation syntax with an ancestor path.
To navigate to a sibling route, you can use the `../<sibling>` convention to go up
one level, then over and down the sibling route path.

Consider a route tree in which `FirstComponent` and `SecondComponent` are at the same level in the route tree, and the `FirstComponent` template contains a link to `SecondComponent`.
The router has to go up a level and into the second directory to find the `SecondComponent`.

The link in the `FirstComponent` template can provide an absolute path to `SecondComponent`, or it can use relative path notation to go up a level, as in the following example.

<code-example path="router/src/app/app.component.8.html" region="relative-route" header="In the template">

</code-example>

The [NavigationExtras configuration object](api/router/NavigationExtras "API reference") allows you to configure specific routing-strategy options for a navigation operation.
To specify a relative route, pass a configuration object to the `Router.navigate()` call.
The configuration object sets the `relativeTo` property to a base route.

In the following example, the `navigate()` arguments configure the router to use the current route as a base URL upon which to append `items`.

<code-example path="router/src/app/app.component.4.ts" region="relative-to" header="Set a base route"></code-example>


* The first argument is a link parameters array, which here contains `items`. The second is a configuration-options object with the `relativeTo` property set to the current `ActivatedRoute`, which is `this.route`.

* The `goToItems()` method interprets the destination URI as relative to the activated route and navigates from there to the `items` route.

Note that you can only use this configuration with the router's `navigate()` method. You must always specify the complete absolute path when calling router's `navigateByUrl()` method.

<div class="alert is-helpful">

When you initiate navigation from a `RouterLink` directive (rather than calling the `Router.navigate()` method), you use the same link parameters array, but without the configuration object.
The `ActivatedRoute` is implicit in a `RouterLink` directive.

</div>

{@a define-secondary-routes}

### Define secondary outlets and routes

The router supports only one primary, unnamed outlet per template.
However, a template can also have any number of named *secondary* outlets.
Each named outlet has its own set of routes with their own components.
Multiple outlets can display different content, determined by different routes, all at the same time.

Named outlets are the targets of  _secondary routes_.
The route configuration for a secondary route has a third property, `outlet: <target_outlet_name>`.

Secondary routes are independent of each other, but work in combination with other routes.
Using named outlets and secondary routes, you can target multiple outlets with multiple routes in the same `RouterLink` directive.

The router keeps track of separate branches in a navigation tree for each named outlet.
It generates a representation of that tree in the URL.
The URL for a secondary route uses the following syntax to specify both the primary and secondary routes at the same time:

<code-example>
  http://base-path/primary-route-path(outlet-name:route-path)

</code-example>

For an example of a named outlet and secondary route configuration, see the [Routing Techniques](guide/router-tutorial-toh#named-outlets) tutorial.

{@a secondary-route-navigation}

### Merging routes during navigation

In the tutorial example, when you navigate to the _Crisis Center_ and click "Contact".
you should see something like the following URL in the browser address bar.

<code-example>
  http://.../crisis-center(popup:compose)

</code-example>

The relevant part of the URL follows the base path, represented here by `...`.
The `crisis-center` is the route path for the view displayed in the primary outlet.
In parentheses, the secondary route consists of an outlet name (`popup`), a `colon` separator, and the secondary route path (`compose`).

Like regular outlets, secondary outlets persists until you navigate away to a new component.
Each secondary outlet has its own navigation, independent of the navigation driving the primary outlet.
Changing a current route that displays in the primary outlet has no effect on the popup outlet.

You can add more outlets and routes, at the top level and in nested levels, creating a navigation tree with many branches. The router generates the URLs to go with it.
You can tell the router to navigate an entire tree at once by filling out the `outlets` object and then pass that object inside a link parameters array to the `router.navigate` method.


### Clearing secondary routes

To navigate imperatively to one or more secondary routes, pass the `Router.navigate()` method an array of objects.
Each object associates an outlet name with a route path.

* To display a view in the outlet, set that outlet's value to the route path for that view.

* To clear the outlet, set the route path for the named outlet to the special value `null`. For example:

   <code-example path="router/src/app/compose-message/compose-message.component.ts" header="src/app/compose-message/compose-message.component.ts (clear the secondary outlet)" region="closePopup"></code-example>

---

{@a access-params}

## Access query parameters and fragments

Sometimes, a feature of your application requires accessing a part of a route, such as a query parameter or a fragment. In the Tour of Heroes sample app, for example, you can click on a hero in a list to see details. The router service depends on the value of the selected hero's `id` property to show the correct hero's details.

Passing the `id` value to the router requires that you import the following members in the component you want to navigate *from*.

<code-example header="Component imports for passing parameters">

import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

</code-example>

The component must inject the activated route service.

<code-example header="Component (inject service)">
constructor(private route: ActivatedRoute) {}
</code-example>

The following snippet configures the class with an observable `heroes$`, and a `selectedId` variable to hold the `id` number of the hero.
The `ngOnInit()` method gets the `id` of the selected hero.

<code-example header="Component 1 (retrieve Hero ID)">
heroes$: Observable<Hero[]>;
selectedId: number;
heroes = HEROES;

ngOnInit() {
  this.heroes$ = this.route.paramMap.pipe(
    switchMap(params => {
      this.selectedId = Number(params.get('id'));
      return this.service.getHeroes();
    })
  );
}

</code-example>

The component that you want to navigate *to* must import the following members.

<code-example header="Component 2 (Component imports for receiving parameters)">

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';

</code-example>

The following snippet injects `ActivatedRoute` and `Router` in the constructor of the component class so they are available to this component. The `ngOnInit()` method saves a parameter from the currently active route, and the `navigate()` call uses that stored value to activate the next route.

<code-example header="Component 2 (Retrieving a stored route parameter)">

  item$: Observable<Item>;

  constructor(
    private route: ActivatedRoute,
    private router: Router  ) {}

  ngOnInit() {
    let id = this.route.snapshot.paramMap.get('id');
    this.hero$ = this.service.getHero(id);
  }

  gotoItems(item: Item) {
    let heroId = item ? hero.id : null;
    // Pass along the item id if available
    // so that the HeroList component can select that item.
    this.router.navigate(['/heroes', { id: itemId }]);
  }

</code-example>

{@a link-parameters-array}

### Passing optional route parameters

A link parameters array holds the following ingredients for router navigation:

* The path of the route to the destination component.
* Required and optional route parameters that go into the route URL.

For interactive links, you can bind the `RouterLink` directive to such an array as in the following example:

<code-example path="router/src/app/app.component.3.ts" header="src/app/app.component.ts (Heroes link anchor)" region="h-anchor"></code-example>

When you initiate navigation programmatically, you can pass a link parameters array to the [Router.navigate() method](api/router/Router#navigate "API reference").

The following is a two-element array that specifies a required route parameter:

<code-example path="router/src/app/heroes/hero-list/hero-list.component.1.html" header="src/app/heroes/hero-list/hero-list.component.html (Hero detail link with route parameter)" region="nav-to-detail"></code-example>

The router supports navigation with *optional* parameters, as well as required route parameters.
You can include optional information in a route request by including expressions in the link parameters array.
Optional parameters aren't involved in pattern matching and afford flexibility of expression.
For example:

* Use wildcard formations to create loosely structured search criteria; for example, `name='wind*'`.

* Specify ranges or multiple values, such as `after='12/31/2015' & before='1/1/2017'` or `during='currentYear'`.

Use optional parameters to convey arbitrarily complex information during navigation, when that information doesn't fit easily in a URL path.

In general, use a required route parameter when the value is mandatory (for example, if necessary to distinguish one route path from another); and an optional parameter when the value is optional, complex, and/or multivariate.
Define optional parameters in a separate object _after_ you define the required route parameters.

You can provide optional route parameters in an object, as in `{ foo: 'foo' }`:

<code-example path="router/src/app/app.component.3.ts" header="src/app/app.component.ts (cc-query-params)" region="cc-query-params"></code-example>

These three examples cover the needs of an app with one level of routing.
The link parameters array affords the flexibility to represent any routing depth and any legal sequence of route paths, required route parameters, and optional route parameter objects.
This allows you to write applications with several levels of routing within a navigation hierarchy.

With a child router, such as in the [crisis center in the tutorial example](guide/router-tutorial-toh#relative-routing), you create new link array possibilities.
The following minimal `RouterLink` example builds upon a specified [default child route](/guide/router-tutorial-toh#crisis-child-routes) for the crisis center.

<code-example path="router/src/app/app.component.3.ts" header="src/app/app.component.ts (cc-anchor-w-default)" region="cc-anchor-w-default"></code-example>

Note the following:

* The first item in the array identifies the parent route (`/crisis-center`).
* There are no parameters for this parent route.
* There is no default for the child route so you need to pick one.
* You're navigating to the `CrisisListComponent`, whose route path is `/`, but you don't need to explicitly add the slash.

Consider the following router link that navigates from the root of the application down to the Dragon Crisis:

<code-example path="router/src/app/app.component.3.ts" header="src/app/app.component.ts (Dragon-anchor)" region="Dragon-anchor"></code-example>

* The first item in the array identifies the parent route (`/crisis-center`).
* There are no parameters for this parent route.
* The second item identifies the child route details about a particular crisis (`/:id`).
* The details child route requires an `id` route parameter.
* You added the `id` of the Dragon Crisis as the second item in the array (`1`).
* The resulting path is `/crisis-center/1`.

You could also redefine the `AppComponent` template with Crisis Center routes exclusively:

<code-example path="router/src/app/app.component.3.ts" header="src/app/app.component.ts (template)" region="template"></code-example>

### Persisting query parameters and fragments

You can preserve query parameters and fragments across navigations without having to provide them again when navigating.
You can use these persistent bits of information for things that need to be provided across pages like authentication tokens or session ids.

The [`NavigationExtras` configuration object](api/router/NavigationExtras "API reference"), which you can use to configure a navigation request, provides `queryParamsHandling` and `preserveFragment` configuration options.
For example:

``` ts
this.router.navigate([redirectUrl], {queryParamsHandling: 'preserve', preserveFragment: 'true'});
```

See an example in the [Routing techniques tutorial](guide/router-tutorial-toh#preserve-params "Preserve and share query parameters").

You can also configure a routing request to both preserve parameters and combine them with new ones (`queryParamsHandling: 'merge'`).

---
<!---  NEW PAGE?  -->

{@a route-guards}
{@a guards}
{@a preventing-unauthorized-access}

## Controlling view access with route guards

There are times when you need to to control access to different parts of your application.
For instance:

* A user is not authorized to navigate to the target component.
* The user must login (authenticate) first.
* You need to fetch some data before you display the target component.
* You need to save pending changes before leaving a component.
* You need to ask the user if it's OK to discard pending changes rather than save them.

You can add *guard functions* to the route configuration to handle these scenarios.
A guard function's return value controls the router's behavior:

* If it returns `true`, the navigation process continues.
* If it returns `false`, the navigation process stops and the user stays put.
* If it returns a `UrlTree`, the current navigation cancels and a new navigation is initiated to the `UrlTree` returned.

<div class="alert is-helpful">

A guard function can also tell the router to navigate elsewhere, effectively canceling the current navigation.
When doing so inside a guard, the guard should return `false`;

</div>

Guard functions can be asynchronous.
You can use an ansychronous function to, for example, ask the user a question, save changes to the server, or fetch fresh data.
If a guard function returns an `Observable<boolean>` or a `Promise<boolean>`, Angular waits for the observable to resolve to `true` or `false`.

<div class="alert is-important">

If a guard function returns an observable, the observable must also complete. If the observable does not complete, the navigation does not continue.

</div>

### Guard function types

Route guard functions implement the following interfaces:

* [`CanActivate`](api/router/CanActivate)
* [`CanActivateChild`](api/router/CanActivateChild)
* [`CanDeactivate`](api/router/CanDeactivate)
* [`CanLoad`](api/router/CanLoad)
* [`Resolve`](api/router/Resolve)

You can have multiple guards at every level of a navigation hierarchy.
The router checks the `CanDeactivate` and `CanActivateChild` guards first, from the deepest child route to the top.
Then it checks the `CanActivate` guards from the top down to the deepest child route.
If the feature module is loaded asynchronously, the `CanLoad` guard is checked before the module is loaded.
If _any_ guard returns false, pending guards that have not completed are canceled, and the entire navigation is canceled.

If you specify both guards and resolvers for any routes, all guards must run and succeed for a given route hierarchy before the resolvers run.
For example, consider a route configuration with route A, child of route A, route B, and child of route B.
The order of execution is: A(guards), A child(guards), A(resolvers), B(guards), B child(guards), B(resolvers).

<div class="alert is-helpful">

Consider using [componentless routes](#nesting-routes "Constructing route trees") to more easily control access to child routes.  A componentless route is a `Route` object that has a base path but no component; it serves as a container for a set of related child routes.

</div>

### Creating a guard service

Create a service for your guard:

<code-example language="none" class="code-shell">
  ng generate guard your-guard
</code-example>

In your guard class, implement the guard you want to use.
The following example uses `CanActivate` to guard the route.

<code-example header="Component (excerpt)">
export class YourGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      // your  logic goes here
  }
}
</code-example>

In your routing module, use the appropriate property in your `routes` configuration.
Here, `canActivate` tells the router to mediate navigation to this particular route.

<code-example header="Routing module (excerpt)">
{
  path: '/your-path',
  component: YourComponent,
  canActivate: [YourGuard],
}
</code-example>

For more about the various types of route guards and their usage, see these [additional route guards examples](/guide/router-tutorial-toh#guards "Route guard examples").

---

<!--- ROuTER CONFIGURATION PAGE?  -->

{@a browser-url-styles}

{@a location-strategy}

## Browser URL styles and path location strategies

When the router navigates to a new component view, it updates the browser's location and history with a URL for that view.
As this is a strictly local URL the browser does not send this URL to the server and does not reload the page.

Modern HTML5 browsers support <a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="HTML5 browser history push-state">history.pushState</a>, a technique that changes a browser's location and history without triggering a server page request.
The router service can compose a "natural" URL that is indistinguishable from one that would otherwise require a page load.

For example, the following URL uses the HTML5 "pushState" style for the Crisis Center URL:

<code-example format="nocode">
  localhost:3002/crisis-center/

</code-example>

Older browsers send page requests to the server when the location URL changes unless the change occurs after a hash mark (#).
Routers can take advantage of this exception by composing in-application route URLs with hashes.
For example, the following hash URL routes to the Crisis Center.

<code-example format="nocode">
  localhost:3002/src/#/crisis-center/

</code-example>

The `Router` service supports both styles with two `LocationStrategy` providers:

1. `PathLocationStrategy`&mdash;the default "pushState" or HTML5 URL style.
1. `HashLocationStrategy`&mdash;the "hash URL" style.

The `RouterModule.forRoot()` function sets the `LocationStrategy` to the `PathLocationStrategy`, which makes it the default strategy.
You also have the option of switching to the `HashLocationStrategy` with an override during the bootstrapping process.

<div class="alert is-helpful">

For more information on providers and the bootstrap process, see  the [Dependency Injection guide](guide/dependency-injection#bootstrap "Providers and bootstrapping").

</div>

### Choosing a location strategy

You must choose a location strategy early in the development of you project because once the application is in production, visitors to your site use and depend on application URL references.
Almost all Angular projects should use the HTML5 style, which is the default.
It produces URLs that are easier for users to understand and it preserves the option to do server-side rendering.

Rendering critical pages on the server is a technique that can greatly improve perceived responsiveness when the app first loads.
An app that would otherwise take ten or more seconds to start could be rendered on the server and delivered to the user's device in less than a second.

This option is only available if application URLs look like normal web URLs without hashes (#) in the middle.

{@a base-href}

### Setting a base location for the push-state strategy

While the router uses the <a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="Browser history push-state">HTML5 pushState</a> style by default, you must configure that strategy by setting a base location.

For `pushState` routing to work, you must add a <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base" title="base href">&lt;base href&gt; element</a> to the app's `index.html`
The browser uses the `<base href>` value to prefix relative URLs when referencing CSS files, scripts, and images.

Add the `<base>` element just after the  `<head>` tag.
If the `app` folder is the application root, as it is for this application,
set the `href` value in `index.html` as shown here.

<code-example path="router/src/index.html" header="src/index.html (base-href)" region="base-href"></code-example>

Without that tag, the browser may not be able to load resources
(images, CSS, scripts) when "deep linking" into the app.

You might not be able to add the `<base>` element if, for example, you don't have access to `<head>` or the `index.html`.
You can still use HTML5 URLs by taking the following steps:

1. Provide the router with an appropriate [APP_BASE_HREF][] value.
1. Use root URLs for all web resources: CSS, images, scripts, and template HTML files.

{@a hashlocationstrategy}

### Using the hash-URL location strategy

You can use `HashLocationStrategy` by providing the `useHash: true` in an object as the second argument of the `RouterModule.forRoot()` in the `AppModule`.

<code-example path="router/src/app/app.module.6.ts" header="src/app/app.module.ts (hash URL strategy)"></code-example>


## Router API summary

The following table lists and defines key API elements provided by the Angular router service.

| Router term | Meaning |
| :---------- | :------- |
| [`RouterModule`](api/router/RouterModule) | A separate NgModule that provides the necessary service providers and directives for navigating through application views. |
| [`Router`](api/router/Router) | The service class that manages navigation from one component to the next and displays the application component for the active URL. |
| [`Routes`](api/router/Routes) | An array of `Route` objects, each mapping a URL path to a component. |
| [`Route`](api/router/Route) | An object that defines how the router should navigate to a component based on a URL pattern. Most routes consist of a *path* and a *component* type. |
| [`RouterOutlet`](api/router/RouterOutlet) | A directive (<code>&lt;router-outlet></code>) that marks where the router displays a view. A component whose template contains a `routerOutlet` directive is a [routing component](guide/glossary#routing-component "Definition of routing component"). |
| [`RouterLink`](api/router/RouterLink) | A directive that binds a clickable HTML element to a route. A user triggers navigation by clicking an element with a <code>[routerLink]</code> directive that is bound to a simple route path string, or a [link parameters array](#link-parameters-array "Definition"). You can also initiate navigation programmatically by passing a link parameters array to the [Router.navigate()](api/router/Router#navigate) method. |
| [`RouterLinkActive`](api/router/RouterLinkActive) | A directive for adding or removing CSS classes on an HTML element when the route for an associated `routerLink` contained on or inside the element becomes active or inactive. |
| [`ActivatedRoute`](api/router/ActivatedRoute) | A service that is provided to each route component, which contains route-specific information such as route parameters, static data, resolve data, global query parameters, and the global fragment. |
| [`RouterState`](api/router/RouterState) | Represents the current state of the router, including a tree of the currently activated routes together with convenience methods for traversing the route tree. |
| [`NavigationExtras`](api/router/NavigationExtras) | A configuration options object that you can pass to a `Router.navigate()` call to control how the URL is constructed for that operation. |
