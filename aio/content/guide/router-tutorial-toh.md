{@a router-tutorial}

# Router tutorial: tour of heroes

This tutorial provides an extensive overview of the Angular router.
In this tutorial, you will build upon a basic router configuration to explore features such as child routes, route parameters, lazy load NgModules, guard routes, and preloading data to improve the user experience.

For a working example of the final version of the app, see the <live-example name="router"></live-example>.

{@a router-tutorial-objectives}

## Objectives

This guide describes development of a multi-page routed sample application.
Along the way, it highlights key features of the router such as:

* Organizing the application features into modules.
* Navigating to a component (*Heroes* link to "Heroes List").
* Including a route parameter (passing the Hero `id` while routing to the "Hero Detail").
* Child routes (the *Crisis Center* has its own routes).
* The `CanActivate` guard (checking route access).
* The `CanActivateChild` guard (checking child route access).
* The `CanDeactivate` guard (ask permission to discard unsaved changes).
* The `Resolve` guard (pre-fetching route data).
* Lazy loading an `NgModule`.
* The `CanLoad` guard (check before loading feature module assets).

This guide proceeds as a sequence of milestones as if you were building the app step-by-step, but assumes you are familiar with basic [Angular concepts](guide/architecture).
For a general introduction to angular, see the [Getting Started](start). For a more in-depth overview, see the [Tour of Heroes](tutorial) tutorial.

## Prerequisites

To complete this tutorial, you should have a basic understanding of the following concepts:

* JavaScript
* HTML
* CSS
* [Angular CLI](/cli)

You might find the [Tour of Heroes tutorial](/tutorial) helpful, but it is not required.


## The sample application in action

The sample application for this tutorial helps the Hero Employment Agency find crises for heroes to solve.

The application has three main feature areas:

1. A *Crisis Center* for maintaining the list of crises for assignment to heroes.
1. A *Heroes* area for maintaining the list of heroes employed by the agency.
1. An *Admin* area to manage the list of crises and heroes.

Try it by clicking on this <live-example name="router" title="Hero Employment Agency Live Example">live example link</live-example>.

The app renders with a row of navigation buttons and the *Heroes* view with its list of heroes.


<div class="lightbox">
  <img src='generated/images/guide/router/hero-list.png' alt="Hero List">
</div>



Select one hero and the app takes you to a hero editing screen.

<div class="lightbox">
  <img src='generated/images/guide/router/hero-detail.png' alt="Crisis Center Detail">
</div>



Alter the name.
Click the "Back" button and the app returns to the heroes list which displays the changed hero name.
Notice that the name change took effect immediately.

Had you clicked the browser's back button instead of the app's "Back" button, the app would have returned you to the heroes list as well.
Angular app navigation updates the browser history as normal web navigation does.

Now click the *Crisis Center* link for a list of ongoing crises.


<div class="lightbox">
  <img src='generated/images/guide/router/crisis-center-list.png' alt="Crisis Center List">
</div>

Select a crisis and the application takes you to a crisis editing screen.
The _Crisis Detail_ appears in a child component on the same page, beneath the list.

Alter the name of a crisis.
Notice that the corresponding name in the crisis list does _not_ change.


<div class="lightbox">
  <img src='generated/images/guide/router/crisis-center-detail.png' alt="Crisis Center Detail">
</div>


Unlike *Hero Detail*, which updates as you type, *Crisis Detail* changes are temporary until you either save or discard them by pressing the "Save" or "Cancel" buttons.
Both buttons navigate back to the *Crisis Center* and its list of crises.

Click the browser back button or the "Heroes" link to activate a dialog.


<div class="lightbox">
  <img src='generated/images/guide/router/confirm-dialog.png' alt="Confirm Dialog">
</div>



You can say "OK" and lose your changes or click "Cancel" and continue editing.

Behind this behavior is the router's `CanDeactivate` guard.
The guard gives you a chance to clean-up or ask the user's permission before navigating away from the current view.

The `Admin` and `Login` buttons illustrate other router capabilities covered later in the guide.


{@a getting-started}

## Milestone 1: Getting started

Begin with a basic version of the app that navigates between two empty views.


<div class="lightbox">
  <img src='generated/images/guide/router/router-1-anim.gif' alt="App in action">
</div>

{@a import}

Generate a sample application with the Angular CLI.

<code-example language="none" class="code-shell">
  ng new angular-router-sample
</code-example>

### Define Routes

A router must be configured with a list of route definitions.

Each definition translates to a [Route](api/router/Route) object which has two things: a `path`, the URL path segment for this route; and a `component`, the component associated with this route.

The router draws upon its registry of definitions when the browser URL changes or when application code tells the router to navigate along a route path.

The first route does the following:

* When the browser's location URL changes to match the path segment `/crisis-center`, then the router activates an instance of the `CrisisListComponent` and displays its view.

* When the application requests navigation to the path `/crisis-center`, the router activates an instance of `CrisisListComponent`, displays its view, and updates the browser's address location and history with the URL for that path.

The first configuration defines an array of two routes with minimal paths leading to the `CrisisListComponent` and `HeroListComponent`.

Generate the `CrisisList` and `HeroList` components so that the router has something to render.

<code-example language="none" class="code-shell">
  ng generate component crisis-list
</code-example>

<code-example language="none" class="code-shell">
  ng generate component hero-list
</code-example>

Replace the contents of each component with the sample HTML below.

<code-tabs>

  <code-pane header="src/app/crisis-list/crisis-list.component.html" path="router/src/app/crisis-list/crisis-list.component.1.html">

  </code-pane>

  <code-pane header="src/app/hero-list/hero-list.component.html" path="router/src/app/hero-list/hero-list.component.1.html" region="template">

  </code-pane>

</code-tabs>

### Register `Router` and `Routes`

In order to use the `Router`, you must first register the `RouterModule` from the `@angular/router` package.
Define an array of routes, `appRoutes`, and pass them to the `RouterModule.forRoot()` method.
The `RouterModule.forRoot()` method returns a module that contains the configured `Router` service provider, plus other providers that the routing library requires.
Once the application is bootstrapped, the `Router` performs the initial navigation based on the current browser URL.

<div class="alert is-important">

  **Note:** The `RouterModule.forRoot()` method is a pattern used to register application-wide providers. Read more about application-wide providers in the [Singleton services](guide/singleton-services#forRoot-router) guide.

</div>

<code-example path="router/src/app/app.module.1.ts" header="src/app/app.module.ts (first-config)" region="first-config"></code-example>

<div class="alert is-helpful">

Adding the configured `RouterModule` to the `AppModule` is sufficient for minimal route configurations.
However, as the application grows, [refactor the routing configuration](#refactor-the-routing-configuration-into-a-routing-module) into a separate file and create a [Routing Module](#routing-module).
A routing module is a special type of `Service Module` dedicated to routing.

</div>

Registering the `RouterModule.forRoot()` in the `AppModule` `imports` array makes the `Router` service available everywhere in the application.

{@a shell}

### Add the Router Outlet

The root `AppComponent` is the application shell. It has a title, a navigation bar with two links, and a router outlet where the router renders components.

<div class="lightbox">
  <img src='generated/images/guide/router/shell-and-outlet.png' alt="Shell">
</div>

The router outlet serves as a placeholder where the routed components are rendered.

{@a shell-template}

The corresponding component template looks like this:

<code-example path="router/src/app/app.component.1.html" header="src/app/app.component.html"></code-example>

{@a wildcard}

### Define a Wildcard route

You've created two routes in the app so far, one to `/crisis-center` and the other to `/heroes`.
Any other URL causes the router to throw an error and crash the app.

Add a wildcard route to intercept invalid URLs and handle them gracefully.
A wildcard route has a path consisting of two asterisks.
It matches every URL.
Thus, the router selects this wildcard route if it can't match a route earlier in the configuration.
A wildcard route can navigate to a custom "404 Not Found" component or [redirect](#redirect) to an existing route.


<div class="alert is-helpful">

The router selects the route with a [_first match wins_](/guide/router#example-config) strategy.
Because a wildcard route is the least specific route, place it last in the route configuration.

</div>

To test this feature, add a button with a `RouterLink` to the `HeroListComponent` template and set the link to a non-existant route called `"/sidekicks"`.

<code-example path="router/src/app/hero-list/hero-list.component.1.html" header="src/app/hero-list/hero-list.component.html (excerpt)"></code-example>

The application fails if the user clicks that button because you haven't defined a `"/sidekicks"` route yet.

Instead of adding the `"/sidekicks"` route, define a `wildcard` route and have it navigate to a `PageNotFoundComponent`.

<code-example path="router/src/app/app.module.1.ts" header="src/app/app.module.ts (wildcard)" region="wildcard"></code-example>

Create the `PageNotFoundComponent` to display when users visit invalid URLs.

<code-example language="none" class="code-shell">
  ng generate component page-not-found
</code-example>

<code-example path="router/src/app/page-not-found/page-not-found.component.html" header="src/app/page-not-found.component.html (404 component)"></code-example>

Now when the user visits `/sidekicks`, or any other invalid URL, the browser displays "Page not found".
The browser address bar continues to point to the invalid URL.

{@a redirect}

### Set up redirects

When the application launches, the initial URL in the browser bar is by default:

<code-example>
  localhost:4200
</code-example>

That doesn't match any of the hard-coded routes which means the router falls through to the wildcard route and displays the `PageNotFoundComponent`.

The application needs a default route to a valid page.
The default page for this app is the list of heroes.
The app should navigate there as if the user clicked the "Heroes" link or pasted `localhost:4200/heroes` into the address bar.

Add a `redirect` route that translates the initial relative URL (`''`) to the desired default path (`/heroes`).

Add the default route somewhere _above_ the wildcard route.
It's just above the wildcard route in the following excerpt showing the complete `appRoutes` for this milestone.


<code-example path="router/src/app/app-routing.module.1.ts" header="src/app/app-routing.module.ts (appRoutes)" region="appRoutes"></code-example>

The browser address bar shows `.../heroes` as if you'd navigated there directly.

A redirect route requires a `pathMatch` property to tell the router how to match a URL to the path of a route.
In this app, the router should select the route to the `HeroListComponent` only when the *entire URL* matches `''`, so set the `pathMatch` value to `'full'`.

{@a pathmatch}

<div class="callout is-helpful">

  <header>Spotlight on pathMatch</header>

  Technically, `pathMatch = 'full'` results in a route hit when the *remaining*, unmatched  segments of the URL match `''`.
  In this example, the redirect is in a top level route so the *remaining* URL and the  *entire* URL are the same thing.

  The other possible `pathMatch` value is `'prefix'` which tells the router to match the  redirect route when the remaining URL begins with the redirect route's prefix  path.
  This doesn't apply to this sample app because if the `pathMatch` value were `'prefix'`,   every URL would match `''`.

  Try setting it to `'prefix'` and clicking the `Go to sidekicks` button.
  Since that's a bad URL, you should see the "Page not found" page.
  Instead, you're still on the "Heroes" page.
  Enter a bad URL in the browser address bar.
  You're instantly re-routed to `/heroes`.
  Every URL, good or bad, that falls through to this route definition is a match.

  The default route should redirect to the `HeroListComponent` only when the entire url is    `''`.
  Remember to restore the redirect to `pathMatch = 'full'`.

  Learn more in Victor Savkin's
  [post on redirects](https://vsavkin.tumblr.com/post/146722301646/angular-router-empty-paths-componentless-routes).

</div>

### Milestone 1 wrap up

Your sample app can switch between two views when the user clicks a link.

Milestone 1 has covered how to do the following:

* Load the router library.
* Add a nav bar to the shell template with anchor tags, `routerLink`  and `routerLinkActive` directives.
* Add a `router-outlet` to the shell template where views are displayed.
* Configure the router module with `RouterModule.forRoot()`.
* Set the router to compose HTML5 browser URLs.
* Handle invalid routes with a `wildcard` route.
* Navigate to the default route when the app launches with an empty path.

The starter app's structure looks like this:

<div class='filetree'>

  <div class='file'>
    angular-router-sample
  </div>

  <div class='children'>

    <div class='file'>
      src
    </div>

    <div class='children'>

      <div class='file'>
        app
      </div>

      <div class='children'>

        <div class='file'>
          crisis-list
        </div>

        <div class='children'>

          <div class='file'>

            crisis-list.component.css

          </div>

          <div class='file'>

            crisis-list.component.html

          </div>

          <div class='file'>

            crisis-list.component.ts

          </div>

        </div>

        <div class='file'>
          hero-list
        </div>

        <div class='children'>

          <div class='file'>

            hero-list.component.css

          </div>

          <div class='file'>

            hero-list.component.html

          </div>

          <div class='file'>

            hero-list.component.ts

          </div>

        </div>

        <div class='file'>
          page-not-found
        </div>

        <div class='children'>

          <div class='file'>

            page-not-found.component.css

          </div>

          <div class='file'>

            page-not-found.component.html

          </div>

          <div class='file'>

            page-not-found.component.ts

          </div>

        </div>

        <div class='file'>
          app.component.css
        </div>

        <div class='file'>
          app.component.html
        </div>

        <div class='file'>
          app.component.ts
        </div>

        <div class='file'>
          app.module.ts
        </div>

      </div>

      <div class='file'>
        main.ts
      </div>

      <div class='file'>
        index.html
      </div>

      <div class='file'>
        styles.css
      </div>

      <div class='file'>
        tsconfig.json
      </div>

    </div>

    <div class='file'>
      node_modules ...
    </div>

    <div class='file'>
      package.json
    </div>

  </div>

</div>



Here are the files in this milestone.


<code-tabs>

  <code-pane header="app.component.html" path="router/src/app/app.component.1.html">

  </code-pane>

  <code-pane header="app.module.ts" path="router/src/app/app.module.1.ts">

  </code-pane>

  <code-pane header="hero-list/hero-list.component.html" path="router/src/app/hero-list/hero-list.component.1.html">

  </code-pane>

  <code-pane header="crisis-list/crisis-list.component.html" path="router/src/app/crisis-list/crisis-list.component.1.html">

  </code-pane>

  <code-pane header="page-not-found/page-not-found.component.html" path="router/src/app/page-not-found/page-not-found.component.html">

  </code-pane>

  <code-pane header="index.html" path="router/src/index.html">

  </code-pane>

</code-tabs>


{@a routing-module}

## Milestone 2: *Routing module*

This milestone shows you how to configure a special-purpose module called a *Routing Module*, which holds your app's routing configuration.

The Routing Module has several characteristics:

* Separates routing concerns from other application concerns.
* Provides a module to replace or remove when testing the application.
* Provides a well-known location for routing service providers such as guards and resolvers.
* Does not declare components.

{@a integrate-routing}

### Integrate routing with your app

The sample routing application does not include routing by default.
When you use the [Angular CLI](cli) to create a project that does use routing, set the `--routing` option for the project or app, and for each NgModule.
When you create or initialize a new project (using the CLI [`ng new`](cli/new) command) or a new app (using the [`ng generate app`](cli/generate) command), specify the `--routing` option.
This tells the CLI to include the `@angular/router` npm package and create a file named `app-routing.module.ts`.
You can then use routing in any NgModule that you add to the project or app.

For example, the following command generates an NgModule that can use routing.

```sh
ng generate module my-module --routing
```

This creates a separate file named `my-module-routing.module.ts` to store the NgModule's routes.
The file includes an empty `Routes` object that you can fill with routes to different components and NgModules.

{@a routing-refactor}


### Refactor the routing configuration into a routing module

Create an `AppRouting` module in the `/app` folder to contain the routing configuration.

<code-example language="none" class="code-shell">
  ng generate module app-routing --module app --flat
</code-example>

Import the `CrisisListComponent`, `HeroListComponent`, and `PageNotFoundComponent` symbols
just like you did in the `app.module.ts`.
Then move the `Router` imports and routing configuration, including `RouterModule.forRoot()`, into this routing module.

Re-export the Angular `RouterModule` by adding it to the module `exports` array.
By re-exporting the `RouterModule` here, the components declared in `AppModule` have access to router directives such as `RouterLink` and `RouterOutlet`.

After these steps, the file should look like this.

<code-example path="router/src/app/app-routing.module.1.ts" header="src/app/app-routing.module.ts"></code-example>

Next, update the `app.module.ts` file by removing `RouterModule.forRoot` in the `imports` array.

<code-example path="router/src/app/app.module.2.ts" header="src/app/app.module.ts"></code-example>

<div class="alert is-helpful">

Later, this guide shows you how to create [multiple routing modules](#heroes-functionality) and import those routing modules [in the correct order](#routing-module-order).

</div>

The application continues to work just the same, and you can use `AppRoutingModule` as the central place to maintain future routing configuration.

{@a why-routing-module}

### Benefits of a routing module

The routing module, often called the `AppRoutingModule`, replaces the routing configuration in the root or feature module.

The routing module is helpful as your app grows and when the configuration includes specialized guard and resolver services.

Some developers skip the routing module when the configuration is minimal and merge the routing configuration directly into the companion module (for example, `AppModule`).

Most apps should implement a routing module for consistency.
It keeps the code clean when configuration becomes complex.
It makes testing the feature module easier.
Its existence calls attention to the fact that a module is routed.
It is where developers expect to find and expand routing configuration.

{@a heroes-feature}

## Milestone 3: Heroes feature

This milestone covers the following:

* Organizing the app and routes into feature areas using modules.
* Navigating imperatively from one component to another.
* Passing required and optional information in route parameters.

This sample app recreates the heroes feature in the "Services" section of the [Tour of Heroes tutorial](tutorial/toh-pt4 "Tour of Heroes: Services"), and reuses much of the code from the <live-example name="toh-pt4" title="Tour of Heroes: Services example code"></live-example>.

<!-- KW - this gif isn't ideal for accessibility. Would like to remove it.-->
<!-- Here's how the user will experience this version of the app:


<div class="lightbox">
  <img src='generated/images/guide/router/router-2-anim.gif' alt="App in action">
</div> -->

A typical application has multiple feature areas, each dedicated to a particular business purpose with its own folder.

This section shows you how refactor the app into different feature modules, import them into the main module and navigate among them.


{@a heroes-functionality}

### Add heroes functionality

Follow these steps:

* To manage the heroes, create a `HeroesModule` with routing in the heroes folder and register it with the root `AppModule`.

<code-example language="none" class="code-shell">
  ng generate module heroes/heroes --module app --flat --routing
</code-example>

* Move the placeholder `hero-list` folder that's in the `app` folder into the `heroes` folder.
* Copy the contents of the `heroes/heroes.component.html` from
  the <live-example name="toh-pt4" title="Tour of Heroes: Services example code">"Services" tutorial</live-example> into the `hero-list.component.html` template.

  * Re-label the `<h2>` to `<h2>HEROES</h2>`.
  * Delete the `<app-hero-detail>` component at the bottom of the template.

* Copy the contents of the `heroes/heroes.component.css` from the live example into the `hero-list.component.css` file.
* Copy the contents of the `heroes/heroes.component.ts` from the live example into the `hero-list.component.ts` file.

  * Change the component class name to `HeroListComponent`.
  * Change the `selector` to `app-hero-list`.

<div class="alert is-helpful">

   Selectors are not required for routed components because components are dynamically inserted when the page is rendered. However, they are useful for identifying and targeting them in your HTML element tree.

</div>

* Copy the `hero-detail` folder, the `hero.ts`, `hero.service.ts`,  and `mock-heroes.ts` files into the `heroes` subfolder.
* Copy the `message.service.ts` into the `src/app` folder.
* Update the relative path import to the `message.service` in the `hero.service.ts` file.

Next, update the `HeroesModule` metadata.

  * Import and add the `HeroDetailComponent` and `HeroListComponent` to the `declarations` array in the `HeroesModule`.

<code-example path="router/src/app/heroes/heroes.module.ts" header="src/app/heroes/heroes.module.ts"></code-example>

The hero management file structure is as follows:

<div class='filetree'>

  <div class='file'>
    src/app/heroes
  </div>

  <div class='children'>

    <div class='file'>
      hero-detail
    </div>

      <div class='children'>

        <div class='file'>
          hero-detail.component.css
        </div>

        <div class='file'>
          hero-detail.component.html
        </div>

        <div class='file'>
          hero-detail.component.ts
        </div>

      </div>

    <div class='file'>
      hero-list
    </div>

      <div class='children'>

        <div class='file'>
          hero-list.component.css
        </div>

        <div class='file'>
          hero-list.component.html
        </div>

        <div class='file'>
          hero-list.component.ts
        </div>

      </div>

    <div class='file'>
      hero.service.ts
    </div>

    <div class='file'>
      hero.ts
    </div>

    <div class='file'>
      heroes-routing.module.ts
    </div>

    <div class='file'>
      heroes.module.ts
    </div>

    <div class='file'>
      mock-heroes.ts
    </div>

    </div>

  </div>

</div>

{@a hero-routing-requirements}

#### Hero feature routing requirements

The heroes feature has two interacting components, the hero list and the hero detail.
When you navigate to list view, it gets a list of heroes and displays them.
When you click on a hero, the detail view has to display that particular hero.

You tell the detail view which hero to display by including the selected hero's id in the route URL.

Import the hero components from their new locations in the `src/app/heroes/` folder and define the two hero routes.

Now that you have routes for the `Heroes` module, register them with the `Router` via the `RouterModule` as you did in the `AppRoutingModule`, with an important difference.

In the `AppRoutingModule`, you used the static `RouterModule.forRoot()` method to register the routes and application level service providers.
In a feature module you use the static `forChild()` method.


<div class="alert is-helpful">

Only call `RouterModule.forRoot()` in the root `AppRoutingModule`
(or the `AppModule` if that's where you register top level application routes).
In any other module, you must call the `RouterModule.forChild()` method to register additional routes.

</div>

The updated `HeroesRoutingModule` looks like this:


<code-example path="router/src/app/heroes/heroes-routing.module.1.ts" header="src/app/heroes/heroes-routing.module.ts"></code-example>


<div class="alert is-helpful">

Consider giving each feature module its own route configuration file.
Though the feature routes are currently minimal, routes have a tendency to grow more complex even in small apps.

</div>


{@a remove-duplicate-hero-routes}


#### Remove duplicate hero routes

The hero routes are currently defined in two places: in the `HeroesRoutingModule`,
by way of the `HeroesModule`, and in the `AppRoutingModule`.

Routes provided by feature modules are combined together into their imported module's routes by the router.
This allows you to continue defining the feature module routes without modifying the main route configuration.

Remove the `HeroListComponent` import and the `/heroes` route from the `app-routing.module.ts`.

Leave the default and the wildcard routes as these are still in use at the top level of the application.

<code-example path="router/src/app/app-routing.module.2.ts" header="src/app/app-routing.module.ts (v2)"></code-example>

{@a merge-hero-routes}

#### Remove heroes declarations

Because the `HeroesModule` now provides the `HeroListComponent`, remove it from the `AppModule`'s `declarations` array.
Now that you have a separate `HeroesModule`, you can evolve the hero feature with more components and different routes.

After these steps, the `AppModule` should look like this:

<code-example path="router/src/app/app.module.3.ts" header="src/app/app.module.ts" region="remove-heroes"></code-example>

{@a routing-module-order}

### Module import order

Notice that in the module `imports` array, the `AppRoutingModule` is last and comes _after_ the `HeroesModule`.

<code-example path="router/src/app/app.module.3.ts" region="module-imports" header="src/app/app.module.ts (module-imports)"></code-example>


The order of route configuration is important because the router accepts the first route that matches a navigation request path.

When all routes were in one `AppRoutingModule`, you put the default and [wildcard](#wildcard) routes last, after the `/heroes` route, so that the router had a chance to match a URL to the `/heroes` route _before_ hitting the wildcard route and navigating to "Page not found".

Each routing module augments the route configuration in the order of import.
If you listed `AppRoutingModule` first, the wildcard route would be registered _before_ the hero routes.
The wildcard route&mdash;which matches _every_ URL&mdash;would intercept the attempt to navigate to a hero route.


<div class="alert is-helpful">

Reverse the routing modules to see a click of the heroes link resulting in "Page not found".
Learn about inspecting the runtime router configuration [below](#inspect-config "Inspect the router config").

</div>

### Route Parameters

{@a route-def-with-parameter}

#### Route definition with a parameter

Return to the `HeroesRoutingModule` and look at the route definitions again.
The route to `HeroDetailComponent` has an `:id` token in the path.

<code-example path="router/src/app/heroes/heroes-routing.module.1.ts" header="src/app/heroes/heroes-routing.module.ts (excerpt)" region="hero-detail-route"></code-example>

The `:id` token creates a slot in the path for a Route Parameter.
In this case,  this configuration causes the router to insert the `id` of a hero into that slot.

If you tell the router to navigate to the detail component and display "Magneta", you expect a hero id to appear in the browser URL like this:


<code-example format="nocode">
  localhost:4200/hero/15

</code-example>



If a user enters that URL into the browser address bar, the router should recognize the pattern and go to the same "Magneta" detail view.


<div class="callout is-helpful">

<header>
  Route parameter: Required or optional?
</header>

Embedding the route parameter token, `:id`, in the route definition path is a good choice for this scenario because the `id` is *required* by the `HeroDetailComponent` and because the value `15` in the path clearly distinguishes the route to "Magneta" from a route for some other hero.

</div>


{@a route-parameters}

#### Setting the route parameters in the list view

After navigating to the `HeroDetailComponent`, you expect to see the details of the selected hero.
You need two pieces of information: the routing path to the component and the hero's `id`.

Accordingly, the _link parameters array_ has two items: the routing _path_ and a _route parameter_ that specifies the
`id` of the selected hero.

<code-example path="router/src/app/heroes/hero-list/hero-list.component.1.html" header="src/app/heroes/hero-list/hero-list.component.html (link-parameters-array)" region="link-parameters-array"></code-example>

The router composes the destination URL from the array like this: `localhost:4200/hero/15`.

The router extracts the route parameter (`id:15`) from the URL and supplies it to
the `HeroDetailComponent` via the `ActivatedRoute` service.


{@a activated-route-in-action}

### `Activated Route` in action

Import the `Router`, `ActivatedRoute`, and `ParamMap` tokens from the router package.

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.1.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (activated route)" region="imports"></code-example>

Import the `switchMap` operator because you need it later to process the `Observable` route parameters.

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (switchMap operator import)" region="rxjs-operator-import"></code-example>

{@a hero-detail-ctor}

Add the services as private variables to the constructor so that Angular injects them (makes them visible to the component).

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (constructor)" region="ctor"></code-example>

In the `ngOnInit()` method, use the `ActivatedRoute` service to retrieve the parameters for the route, pull the hero `id` from the parameters, and retrieve the hero to display.


<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (ngOnInit)" region="ngOnInit"></code-example>

When the map changes, `paramMap` gets the `id` parameter from the changed parameters.

Then you tell the `HeroService` to fetch the hero with that `id` and return the result of the `HeroService` request.

The `switchMap` operator does two things. It flattens the `Observable<Hero>` that `HeroService` returns and cancels previous pending requests.
If the user re-navigates to this route with a new `id` while the `HeroService` is still retrieving the old `id`, `switchMap` discards that old request and returns the hero for the new `id`.

`AsyncPipe` handles the observable subscription and the component's `hero` property will be (re)set with the retrieved hero.

#### _ParamMap_ API

The `ParamMap` API is inspired by the [URLSearchParams interface](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).
It provides methods to handle parameter access for both route parameters (`paramMap`) and query parameters (`queryParamMap`).

<table>
  <tr>
    <th>
      Member
    </th>

    <th>
      Description
    </th>
  </tr>

  <tr>
    <td>
      <code>has(name)</code>
    </td>
    <td>

    Returns `true` if the parameter name is in the map of parameters.

    </td>
  </tr>

  <tr>
    <td>
      <code>get(name)</code>
    </td>
    <td>

    Returns the parameter name value (a `string`) if present, or `null` if the parameter name is not in the map. Returns the _first_ element if the parameter value is actually an array of values.

    </td>
  </tr>

  <tr>
    <td>
      <code>getAll(name)</code>
    </td>
    <td>

    Returns a `string array` of the parameter name value if found, or an empty `array` if the parameter name value is not in the map. Use `getAll` when a single parameter could have multiple values.

    </td>
  </tr>

  <tr>
    <td>
      <code>keys</code>
    </td>
    <td>

    Returns a `string array` of all parameter names in the map.

    </td>
  </tr>
</table>

{@a reuse}

#### Observable <i>paramMap</i> and component reuse

In this example, you retrieve the route parameter map from an `Observable`.
That implies that the route parameter map can change during the lifetime of this component.

By default, the router re-uses a component instance when it re-navigates to the same component type
without visiting a different component first. The route parameters could change each time.

Suppose a parent component navigation bar had "forward" and "back" buttons
that scrolled through the list of heroes.
Each click navigated imperatively to the `HeroDetailComponent` with the next or previous `id`.

You wouldn't want the router to remove the current `HeroDetailComponent` instance from the DOM only to re-create it for the next `id` as this would re-render the view.
For better UX, the router re-uses the same component instance and updates the parameter.

Since `ngOnInit()` is only called once per component instantiation, you can detect when the route parameters change from _within the same instance_ using the observable `paramMap` property.


<div class="alert is-helpful">

When subscribing to an observable in a component, you almost always unsubscribe when the component is destroyed.

However, `ActivatedRoute` observables are among the exceptions because `ActivatedRoute` and its observables are insulated from the `Router` itself.
The `Router` destroys a routed component when it is no longer needed along with the injected `ActivatedRoute`.

</div>

{@a snapshot}

#### `snapshot`: the no-observable alternative

This application won't re-use the `HeroDetailComponent`.
The user always returns to the hero list to select another hero to view.
There's no way to navigate from one hero detail to another hero detail without visiting the list component in between.
Therefore, the router creates a new `HeroDetailComponent` instance every time.

When you know for certain that a `HeroDetailComponent` instance will never be re-used, you can use `snapshot`.

`route.snapshot` provides the initial value of the route parameter map.
You can access the parameters directly without subscribing or adding observable operators as in the following:

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.2.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (ngOnInit snapshot)" region="snapshot"></code-example>

<div class="alert is-helpful">

`snapshot` only gets the initial value of the parameter map with this technique.
Use the observable `paramMap` approach if there's a possibility that the router could re-use the component.
This tutorial sample app uses with the observable `paramMap`.

</div>

{@a nav-to-list}

### Navigating back to the list component

The `HeroDetailComponent` "Back" button uses the `gotoHeroes()` method that navigates imperatively back to the `HeroListComponent`.

The router `navigate()` method takes the same one-item _link parameters array_ that you can bind to a `[routerLink]` directive.
It holds the path to the `HeroListComponent`:


<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.1.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (excerpt)" region="gotoHeroes"></code-example>


{@a optional-route-parameters}

#### Route Parameters: Required or optional?

Use [route parameters](#route-parameters) to specify a required parameter value within the route URL
as you do when navigating to the `HeroDetailComponent` in order to view the hero with `id` 15:


<code-example format="nocode">
  localhost:4200/hero/15

</code-example>



You can also add optional information to a route request.
For example, when returning to the `hero-detail.component.ts` list from the hero detail view, it would be nice if the viewed hero were preselected in the list.

<div class="lightbox">
  <img src='generated/images/guide/router/selected-hero.png' alt="Selected hero">
</div>

You implement this feature by including the viewed hero's `id` in the URL as an optional parameter when returning from the `HeroDetailComponent`.

Optional information can also include other forms such as:

* Loosely structured search criteria; for example, `name='wind*'`.
* Multiple values;  for example, `after='12/31/2015' & before='1/1/2017'`&mdash;in no
particular order&mdash;`before='1/1/2017' & after='12/31/2015'`&mdash; in a
variety of formats&mdash;`during='currentYear'`.

As these kinds of parameters don't fit easily in a URL path, you can use optional parameters for conveying arbitrarily complex information during navigation.
Optional parameters aren't involved in pattern matching and afford flexibility of expression.

The router supports navigation with optional parameters as well as required route parameters.
Define optional parameters in a separate object _after_ you define the required route parameters.

In general, use a required route parameter when the value is mandatory (for example, if necessary to distinguish one route path from another); and an optional parameter when the value is optional, complex, and/or multivariate.

{@a optionally-selecting}

#### Heroes list: optionally selecting a hero

When navigating to the `HeroDetailComponent` you specified the required `id` of the hero-to-edit in the
route parameter and made it the second item of the [_link parameters array_](#link-parameters-array).

<code-example path="router/src/app/heroes/hero-list/hero-list.component.1.html" header="src/app/heroes/hero-list/hero-list.component.html (link-parameters-array)" region="link-parameters-array"></code-example>

The router embedded the `id` value in the navigation URL because you had defined it as a route parameter with an `:id` placeholder token in the route `path`:

<code-example path="router/src/app/heroes/heroes-routing.module.1.ts" header="src/app/heroes/heroes-routing.module.ts (hero-detail-route)" region="hero-detail-route"></code-example>

When the user clicks the back button, the `HeroDetailComponent` constructs another _link parameters array_
which it uses to navigate back to the `HeroListComponent`.

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.1.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (gotoHeroes)" region="gotoHeroes"></code-example>

This array lacks a route parameter because previously you didn't need to send information to the `HeroListComponent`.

Now, send the `id` of the current hero with the navigation request so that the
`HeroListComponent` can highlight that hero in its list.

Send the `id` with an object that contains an optional `id` parameter.
For demonstration purposes, there's an extra junk parameter (`foo`) in the object that the `HeroListComponent` should ignore.
Here's the revised navigation statement:

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (go to heroes)" region="gotoHeroes"></code-example>

The application still works. Clicking "back" returns to the hero list view.

Look at the browser address bar.

It should look something like this, depending on where you run it:

<code-example language="bash">
  localhost:4200/heroes;id=15;foo=foo

</code-example>

The `id` value appears in the URL as (`;id=15;foo=foo`), not in the URL path.
The path for the "Heroes" route doesn't have an `:id` token.

The optional route parameters are not separated by "?" and "&" as they would be in the URL query string.
They are separated by semicolons ";".
This is matrix URL notation.

<div class="alert is-helpful">

Matrix URL notation is an idea first introduced in a [1996 proposal](https://www.w3.org/DesignIssues/MatrixURIs.html) by the founder of the web, Tim Berners-Lee.

Although matrix notation never made it into the HTML standard, it is legal and it became popular among browser routing systems as a way to isolate parameters belonging to parent and child routes.
As such, the Router provides support for the matrix notation across browsers.

</div>

{@a route-parameters-activated-route}

### Route parameters in the `ActivatedRoute` service

In its current state of development, the list of heroes is unchanged.
No hero row is highlighted.

The `HeroListComponent` needs code that expects parameters.

Previously, when navigating from the `HeroListComponent` to the `HeroDetailComponent`,
you subscribed to the route parameter map `Observable` and made it available to the `HeroDetailComponent`
in the `ActivatedRoute` service.
You injected that service in the constructor of the `HeroDetailComponent`.

This time you'll be navigating in the opposite direction, from the `HeroDetailComponent` to the `HeroListComponent`.

First, extend the router import statement to include the `ActivatedRoute` service symbol:

<code-example path="router/src/app/heroes/hero-list/hero-list.component.ts" header="src/app/heroes/hero-list/hero-list.component.ts (import)" region="import-router"></code-example>

Import the `switchMap` operator to perform an operation on the `Observable` of route parameter map.

<code-example path="router/src/app/heroes/hero-list/hero-list.component.ts" header="src/app/heroes/hero-list/hero-list.component.ts (rxjs imports)" region="rxjs-imports"></code-example>

Inject the `ActivatedRoute` in the `HeroListComponent` constructor.

<code-example path="router/src/app/heroes/hero-list/hero-list.component.ts" header="src/app/heroes/hero-list/hero-list.component.ts (constructor and ngOnInit)" region="ctor"></code-example>

The `ActivatedRoute.paramMap` property is an `Observable` map of route parameters.
The `paramMap` emits a new map of values that includes `id` when the user navigates to the component.
In `ngOnInit()` you subscribe to those values, set the `selectedId`, and get the heroes.

Update the template with a [class binding](guide/attribute-binding#class-binding).
The binding adds the `selected` CSS class when the comparison returns `true` and removes it when `false`.
Look for it within the repeated `<li>` tag as shown here:

<code-example path="router/src/app/heroes/hero-list/hero-list.component.html" header="src/app/heroes/hero-list/hero-list.component.html"></code-example>

Add some styles to apply when the list item is selected.

<code-example path="router/src/app/heroes/hero-list/hero-list.component.css" region="selected" header="src/app/heroes/hero-list/hero-list.component.css"></code-example>

When the user navigates from the heroes list to the "Magneta" hero and back, "Magneta" appears selected:

<div class="lightbox">
  <img src='generated/images/guide/router/selected-hero.png' alt="Selected List">
</div>

The optional `foo` route parameter is harmless and the router continues to ignore it.

{@a route-animation}

### Adding routable animations

This section shows you how to add some [animations](guide/animations) to the `HeroDetailComponent`.

First, import the `BrowserAnimationsModule` and add it to the `imports` array:

<code-example path="router/src/app/app.module.ts" header="src/app/app.module.ts (animations-module)" region="animations-module"></code-example>

Next, add a `data` object to the routes for `HeroListComponent` and `HeroDetailComponent`.
Transitions are based on `states` and you use the `animation` data from the route to provide a named animation `state` for the transitions.

<code-example path="router/src/app/heroes/heroes-routing.module.2.ts" header="src/app/heroes/heroes-routing.module.ts (animation data)"></code-example>

Create an `animations.ts` file in the root `src/app/` folder. The contents look like this:

<code-example path="router/src/app/animations.ts" header="src/app/animations.ts (excerpt)"></code-example>

This file does the following:

* Imports the animation symbols that build the animation triggers, control state, and manage transitions between states.

* Exports a constant named `slideInAnimation` set to an animation trigger named `routeAnimation`.

* Defines one transition when switching back and forth from the `heroes` and `hero` routes to ease the component in from the left of the screen as it enters the application view (`:enter`), the other to animate the component to the right as it leaves the application view (`:leave`).

Back in the `AppComponent`, import the `RouterOutlet` token from the `@angular/router` package and the `slideInAnimation` from `'./animations.ts`.

Add an `animations` array to the `@Component` metadata that contains the `slideInAnimation`.

<code-example path="router/src/app/app.component.2.ts" header="src/app/app.component.ts (animations)" region="animation-imports"></code-example>

In order to use the routable animations, wrap the `RouterOutlet` inside an element, use the `@routeAnimation` trigger, and bind it to the element.

For the `@routeAnimation` transitions to key off states, provide it with the `data` from the `ActivatedRoute`.
The `RouterOutlet` is exposed as an `outlet` template variable, so you bind a reference to the router outlet.
This example uses a variable of `routerOutlet`.

<code-example path="router/src/app/app.component.2.html" header="src/app/app.component.html (router outlet)"></code-example>

The `@routeAnimation` property is bound to the `getAnimationData()` with the provided `routerOutlet` reference, so the next step is to define that function in the `AppComponent`.
The `getAnimationData()` function returns the animation property from the `data` provided through the `ActivatedRoute`. The `animation` property matches the `transition` names you used in the `slideInAnimation` defined in `animations.ts`.

<code-example path="router/src/app/app.component.2.ts" header="src/app/app.component.ts (router outlet)" region="function-binding"></code-example>

When switching between the two routes, the `HeroDetailComponent` and `HeroListComponent` now ease in from the left when routed to and will slide to the right when navigating away.

{@a milestone-3-wrap-up}

### Milestone 3 wrap up

This section has covered the following:

* Organizing the app into feature areas.
* Navigating imperatively from one component to another.
* Passing information along in route parameters and subscribe to them in the component.
* Importing the feature area NgModule into the `AppModule`.
* Applying routable animations based on the page.

After these changes, the folder structure is as follows:

<div class='filetree'>

  <div class='file'>
    angular-router-sample
  </div>

  <div class='children'>

    <div class='file'>
      src
    </div>

    <div class='children'>

      <div class='file'>
        app
      </div>

      <div class='children'>

        <div class='file'>
          crisis-list
        </div>

          <div class='children'>

            <div class='file'>
              crisis-list.component.css
            </div>

            <div class='file'>
              crisis-list.component.html
            </div>

            <div class='file'>
              crisis-list.component.ts
            </div>

          </div>

        <div class='file'>
          heroes
        </div>

        <div class='children'>

          <div class='file'>
            hero-detail
          </div>

            <div class='children'>

              <div class='file'>
                hero-detail.component.css
              </div>

              <div class='file'>
                hero-detail.component.html
              </div>

              <div class='file'>
                hero-detail.component.ts
              </div>

            </div>

          <div class='file'>
            hero-list
          </div>

            <div class='children'>

              <div class='file'>
                hero-list.component.css
              </div>

              <div class='file'>
                hero-list.component.html
              </div>

              <div class='file'>
                hero-list.component.ts
              </div>

            </div>

          <div class='file'>
            hero.service.ts
          </div>

          <div class='file'>
            hero.ts
          </div>

          <div class='file'>
            heroes-routing.module.ts
          </div>

          <div class='file'>
            heroes.module.ts
          </div>

          <div class='file'>
            mock-heroes.ts
          </div>

        </div>

        <div class='file'>
          page-not-found
        </div>

        <div class='children'>

          <div class='file'>

            page-not-found.component.css

          </div>

          <div class='file'>

            page-not-found.component.html

          </div>

          <div class='file'>

            page-not-found.component.ts

          </div>

        </div>

      </div>

      <div class='file'>
        animations.ts
      </div>

      <div class='file'>
        app.component.css
      </div>

      <div class='file'>
        app.component.html
      </div>

      <div class='file'>
        app.component.ts
      </div>

      <div class='file'>
        app.module.ts
      </div>

      <div class='file'>
        app-routing.module.ts
      </div>

      <div class='file'>
        main.ts
      </div>

      <div class='file'>
        message.service.ts
      </div>

      <div class='file'>
        index.html
      </div>

      <div class='file'>
        styles.css
      </div>

      <div class='file'>
        tsconfig.json
      </div>

    </div>

    <div class='file'>
      node_modules ...
    </div>

    <div class='file'>
      package.json
    </div>

  </div>

</div>

Here are the relevant files for this version of the sample application.

<code-tabs>

  <code-pane header="animations.ts" path="router/src/app/animations.ts">

  </code-pane>

  <code-pane header="app.component.html" path="router/src/app/app.component.2.html">

  </code-pane>

  <code-pane header="app.component.ts" path="router/src/app/app.component.2.ts">

  </code-pane>

  <code-pane header="app.module.ts" path="router/src/app/app.module.3.ts">

  </code-pane>

  <code-pane header="app-routing.module.ts" path="router/src/app/app-routing.module.2.ts" region="milestone3">

  </code-pane>

  <code-pane header="hero-list.component.css" path="router/src/app/heroes/hero-list/hero-list.component.css">

  </code-pane>

  <code-pane header="hero-list.component.html" path="router/src/app/heroes/hero-list/hero-list.component.html">

  </code-pane>

  <code-pane header="hero-list.component.ts" path="router/src/app/heroes/hero-list/hero-list.component.ts">

  </code-pane>

  <code-pane header="hero-detail.component.html" path="router/src/app/heroes/hero-detail/hero-detail.component.html">

  </code-pane>

  <code-pane header="hero-detail.component.ts" path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts">

  </code-pane>

  <code-pane header="hero.service.ts" path="router/src/app/heroes/hero.service.ts">

  </code-pane>

  <code-pane header="heroes.module.ts" path="router/src/app/heroes/heroes.module.ts">

  </code-pane>

  <code-pane header="heroes-routing.module.ts" path="router/src/app/heroes/heroes-routing.module.2.ts">

  </code-pane>

  <code-pane header="message.service.ts" path="router/src/app/message.service.ts">

  </code-pane>

</code-tabs>



{@a milestone-4}



## Milestone 4: Crisis center feature

This section shows you how to add child routes and use relative routing in your app.

To add more features to the app's current crisis center, take similar steps as for the heroes feature:

* Create a `crisis-center` subfolder in the `src/app` folder.
* Copy the files and folders from `app/heroes` into the new `crisis-center` folder.
* In the new files, change every mention of "hero" to "crisis", and "heroes" to "crises".
* Rename the NgModule files to `crisis-center.module.ts` and `crisis-center-routing.module.ts`.

Use mock crises instead of mock heroes:

<code-example path="router/src/app/crisis-center/mock-crises.ts" header="src/app/crisis-center/mock-crises.ts"></code-example>

The resulting crisis center is a foundation for introducing a new concept&mdash;child routing.
You can leave Heroes in its current state as a contrast with the Crisis Center.

<div class="alert is-helpful">

In keeping with the <a href="https://blog.8thlight.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html" title="Separation of Concerns">Separation of Concerns principle</a>, changes to the Crisis Center don't affect the `AppModule` or any other feature's component.

</div>

{@a crisis-child-routes}

### A crisis center with child routes

This section shows you how to organize the crisis center to conform to the following recommended pattern for Angular applications:

* Each feature area resides in its own folder.
* Each feature has its own Angular feature module.
* Each area has its own area root component.
* Each area root component has its own router outlet and child routes.
* Feature area routes rarely (if ever) cross with routes of other features.

If your app had many feature areas, the app component trees might look like this:


<div class="lightbox">
  <img src='generated/images/guide/router/component-tree.png' alt="Component Tree">
</div>



{@a child-routing-component}


### Child routing component

Generate a `CrisisCenter` component in the `crisis-center` folder:

<code-example language="none" class="code-shell">
  ng generate component crisis-center/crisis-center
</code-example>

Update the component template with the following markup:

<code-example path="router/src/app/crisis-center/crisis-center/crisis-center.component.html" header="src/app/crisis-center/crisis-center/crisis-center.component.html"></code-example>

The `CrisisCenterComponent` has the following in common with the `AppComponent`:

* It is the root of the crisis center area, just as `AppComponent` is the root of the entire application.
* It is a shell for the crisis management feature area, just as the `AppComponent` is a shell to manage the high-level workflow.

Like most shells, the `CrisisCenterComponent` class is minimal because it has no business logic, and its template has no links, just a title and `<router-outlet>` for the crisis center child component.

{@a child-route-config}

### Child route configuration

As a host page for the "Crisis Center" feature, generate a `CrisisCenterHome` component in the `crisis-center` folder.

<code-example language="none" class="code-shell">
  ng generate component crisis-center/crisis-center-home
</code-example>

Update the template with a welcome message to the `Crisis Center`.

<code-example path="router/src/app/crisis-center/crisis-center-home/crisis-center-home.component.html" header="src/app/crisis-center/crisis-center-home/crisis-center-home.component.html"></code-example>

Update the `crisis-center-routing.module.ts` you renamed after copying it from `heroes-routing.module.ts` file.
This time, you define child routes within the parent `crisis-center` route.

<code-example path="router/src/app/crisis-center/crisis-center-routing.module.1.ts" header="src/app/crisis-center/crisis-center-routing.module.ts (Routes)" region="routes"></code-example>

Notice that the parent `crisis-center` route has a `children` property with a single route containing the `CrisisListComponent`.
The `CrisisListComponent` route also has a `children` array with two routes.

These two routes navigate to the crisis center child components,
`CrisisCenterHomeComponent` and `CrisisDetailComponent`, respectively.

There are important differences in the way the router treats child routes.

The router displays the components of these routes in the `RouterOutlet` of the `CrisisCenterComponent`, not in the `RouterOutlet` of the `AppComponent` shell.

The `CrisisListComponent` contains the crisis list and a `RouterOutlet` to display the `Crisis Center Home` and `Crisis Detail` route components.

The `Crisis Detail` route is a child of the `Crisis List`.
The router [reuses components](#reuse) by default, so the `Crisis Detail` component will be re-used as you select different crises.
In contrast, back in the `Hero Detail` route, [the component was recreated](#snapshot-the-no-observable-alternative) each time you selected a different hero from the list of heroes.

At the top level, paths that begin with `/` refer to the root of the application.
But child routes extend the path of the parent route.
With each step down the route tree,
you add a slash followed by the route path, unless the path is empty.

Apply that logic to navigation within the crisis center for which the parent path is `/crisis-center`.

* To navigate to the `CrisisCenterHomeComponent`, the full URL is `/crisis-center` (`/crisis-center` + `''` + `''`).

* To navigate to the `CrisisDetailComponent` for a crisis with `id=2`, the full URL is
`/crisis-center/2` (`/crisis-center` + `''` +  `'/2'`).

The absolute URL for the latter example, including the `localhost` origin, is as follows:

<code-example>
  localhost:4200/crisis-center/2

</code-example>

Here's the complete `crisis-center-routing.module.ts` file with its imports.

<code-example path="router/src/app/crisis-center/crisis-center-routing.module.1.ts" header="src/app/crisis-center/crisis-center-routing.module.ts (excerpt)"></code-example>

{@a import-crisis-module}

### Import crisis center module into the `AppModule` routes

As with the `HeroesModule`, you must add the `CrisisCenterModule` to the `imports` array of the `AppModule`
_before_ the `AppRoutingModule`:

<code-tabs>

  <code-pane path="router/src/app/crisis-center/crisis-center.module.ts"header="src/app/crisis-center/crisis-center.module.ts">

  </code-pane>

  <code-pane path="router/src/app/app.module.4.ts" header="src/app/app.module.ts (import CrisisCenterModule)" region="crisis-center-module">

  </code-pane>

</code-tabs>

Remove the initial crisis center route from the `app-routing.module.ts` because now the `HeroesModule` and the `CrisisCenter` modules provide the feature routes.

The `app-routing.module.ts` file retains the top-level application routes such as the default and wildcard routes.

<code-example path="router/src/app/app-routing.module.3.ts" header="src/app/app-routing.module.ts (v3)" region="v3"></code-example>

{@a relative-navigation}

### Relative navigation

While building out the crisis center feature, you navigated to the
crisis detail route using an absolute path that begins with a slash.

The router matches such absolute paths to routes starting from the top of the route configuration.

You could continue to use absolute paths like this to navigate inside the Crisis Center feature, but that pins the links to the parent routing structure.
If you changed the parent `/crisis-center` path, you would have to change the link parameters array.

You can free the links from this dependency by defining paths that are relative to the current URL segment.
Navigation within the feature area remains intact even if you change the parent route path to the feature.

<div class="alert is-helpful">

The router supports directory-like syntax in a _link parameters list_ to help guide route name lookup:

`./` or `no leading slash` is relative to the current level.

`../` to go up one level in the route path.

You can combine relative navigation syntax with an ancestor path.
If you must navigate to a sibling route, you could use the `../<sibling>` convention to go up
one level, then over and down the sibling route path.

</div>

To navigate a relative path with the `Router.navigate` method, you must supply the `ActivatedRoute`
to give the router knowledge of where you are in the current route tree.

After the _link parameters array_, add an object with a `relativeTo` property set to the `ActivatedRoute`.
The router then calculates the target URL based on the active route's location.

<div class="alert is-helpful">

Always specify the complete absolute path when calling router's `navigateByUrl()` method.

</div>

{@a nav-to-crisis}

### Navigate to crisis list with a relative URL

You've already injected the `ActivatedRoute` that you need to compose the relative navigation path.

When using a `RouterLink` to navigate instead of the `Router` service, you'd use the same link parameters array, but you wouldn't provide the object with the `relativeTo` property.
The `ActivatedRoute` is implicit in a `RouterLink` directive.

Update the `gotoCrises()` method of the `CrisisDetailComponent` to navigate back to the Crisis Center list using relative path navigation.

<code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (relative navigation)" region="gotoCrises-navigate"></code-example>

Notice that the path goes up a level using the `../` syntax.
If the current crisis `id` is `3`, the resulting path back to the crisis list is  `/crisis-center/;id=3;foo=foo`.

{@a named-outlets}

### Displaying multiple routes in named outlets

You decide to give users a way to contact the crisis center.
When a user clicks a "Contact" button, you want to display a message in a popup view.

The popup should stay open, even when switching between pages in the application, until the user closes it
by sending the message or canceling.
Clearly you can't put the popup in the same outlet as the other pages.

Until now, you've defined a single outlet and you've nested child routes under that outlet to group routes together.
The router only supports one primary unnamed outlet per template.

A template can also have any number of named outlets.
Each named outlet has its own set of routes with their own components.
Multiple outlets can display different content, determined by different routes, all at the same time.

Add an outlet named "popup" in the `AppComponent`, directly below the unnamed outlet.

<code-example path="router/src/app/app.component.4.html" header="src/app/app.component.html (outlets)" region="outlets"></code-example>

That's where a popup will go, once you learn how to route a popup component to it.

{@a secondary-routes}

#### Secondary routes

Named outlets are the targets of  _secondary routes_.

Secondary routes look like primary routes and you configure them the same way.
They differ in a few key respects.

* They are independent of each other.
* They work in combination with other routes.
* They are displayed in named outlets.

Generate a new component to compose the message.

<code-example language="none" class="code-shell">
  ng generate component compose-message
</code-example>

It displays a short form with a header, an input box for the message,
and two buttons, "Send" and "Cancel".

<div class="lightbox">
  <img src='generated/images/guide/router/contact-popup.png' alt="Contact popup">
</div>

Here's the component, its template and styles:

<code-tabs>

  <code-pane header="src/app/compose-message/compose-message.component.css" path="router/src/app/compose-message/compose-message.component.css">

  </code-pane>

  <code-pane header="src/app/compose-message/compose-message.component.html" path="router/src/app/compose-message/compose-message.component.html">

  </code-pane>

  <code-pane header="src/app/compose-message/compose-message.component.ts" path="router/src/app/compose-message/compose-message.component.ts">

  </code-pane>

</code-tabs>

It looks similar to any other component in this guide, but there are two key differences.

Note that the `send()` method simulates latency by waiting a second before "sending" the message and closing the popup.

The `closePopup()` method closes the popup view by navigating to the popup outlet with a `null` which the section on [clearing secondary routes](#clear-secondary-routes) covers.

{@a add-secondary-route}

#### Add a secondary route

Open the `AppRoutingModule` and add a new `compose` route to the `appRoutes`.

<code-example path="router/src/app/app-routing.module.3.ts" header="src/app/app-routing.module.ts (compose route)" region="compose"></code-example>

In addition to the `path` and `component` properties, there's a new property called `outlet`, which is set to `'popup'`.
This route now targets the popup outlet and the `ComposeMessageComponent` will display there.

To give users a way to open the popup, add a "Contact" link to the `AppComponent` template.

<code-example path="router/src/app/app.component.4.html" header="src/app/app.component.html (contact-link)" region="contact-link"></code-example>

Although the `compose` route is configured to the "popup" outlet, that's not sufficient for connecting the route to a `RouterLink` directive.
You have to specify the named outlet in a _link parameters array_ and bind it to the `RouterLink` with a property binding.

The _link parameters array_ contains an object with a single `outlets` property whose value is another object keyed by one (or more) outlet names.
In this case there is only the "popup" outlet property and its value is another _link parameters array_ that specifies the `compose` route.

In other words, when the user clicks this link, the router displays the component associated with the `compose` route in the `popup` outlet.

<div class="alert is-helpful">

This `outlets` object within an outer object was unnecessary when there was only one route and one unnamed outlet.

The router assumed that your route specification targeted the unnamed primary outlet and created these objects for you.

Routing to a named outlet has revealed a router feature:
you can target multiple outlets with multiple routes in the same `RouterLink` directive.

</div>

{@a secondary-route-navigation}

#### Secondary route navigation: merging routes during navigation

Navigate to the _Crisis Center_ and click "Contact".
you should see something like the following URL in the browser address bar.

<code-example>
  http://.../crisis-center(popup:compose)

</code-example>

The relevant part of the URL follows the `...`:

* The `crisis-center` is the primary navigation.
* Parentheses surround the secondary route.
* The secondary route consists of an outlet name (`popup`), a `colon` separator, and the secondary route path (`compose`).

Click the _Heroes_ link and look at the URL again.

<code-example>
  http://.../heroes(popup:compose)
</code-example>

The primary navigation part has changed; the secondary route is the same.

The router is keeping track of two separate branches in a navigation tree and generating a representation of that tree in the URL.

You can add many more outlets and routes, at the top level and in nested levels, creating a navigation tree with many branches and the router will generate the URLs to go with it.

You can tell the router to navigate an entire tree at once by filling out the `outlets` object and then pass that object inside a _link parameters array_  to the `router.navigate` method.

{@a clear-secondary-routes}

#### Clearing secondary routes

Like regular outlets, secondary outlets persists until you navigate away to a new component.

Each secondary outlet has its own navigation, independent of the navigation driving the primary outlet.
Changing a current route that displays in the primary outlet has no effect on the popup outlet.
That's why the popup stays visible as you navigate among the crises and heroes.

The `closePopup()` method again:

<code-example path="router/src/app/compose-message/compose-message.component.ts" header="src/app/compose-message/compose-message.component.ts (closePopup)" region="closePopup"></code-example>

Clicking the "send" or "cancel" buttons clears the popup view.
The `closePopup()` function navigates imperatively with the `Router.navigate()` method, passing in a [link parameters array](#link-parameters-array).

Like the array bound to the _Contact_ `RouterLink` in the `AppComponent`, this one includes an object with an `outlets` property.
The `outlets` property value is another object with outlet names for keys.
The only named outlet is `'popup'`.

This time, the value of `'popup'` is `null`.
That's not a route, but it is a legitimate value.
Setting the popup `RouterOutlet` to `null` clears the outlet and removes the secondary popup route from the current URL.

{@a guards}

{@a milestone-5-route-guards}


## Milestone 5: Route guards

At the moment, any user can navigate anywhere in the application anytime, but sometimes you need to control access to different parts of your app for various reasons. Some of which may include the following:

* Perhaps the user is not authorized to navigate to the target component.
* Maybe the user must login (authenticate) first.
* Maybe you should fetch some data before you display the target component.
* You might want to save pending changes before leaving a component.
* You might ask the user if it's OK to discard pending changes rather than save them.

You add guards to the route configuration to handle these scenarios.

A guard's return value controls the router's behavior:

* If it returns `true`, the navigation process continues.
* If it returns `false`, the navigation process stops and the user stays put.
* If it returns a `UrlTree`, the current navigation cancels and a new navigation is initiated to the `UrlTree` returned.

<div class="alert is-helpful">

**Note:** The guard can also tell the router to navigate elsewhere, effectively canceling the current navigation.
When doing so inside a guard, the guard should return `false`;

</div>

The guard might return its boolean answer synchronously.
But in many cases, the guard can't produce an answer synchronously.
The guard could ask the user a question, save changes to the server, or fetch fresh data.
These are all asynchronous operations.

Accordingly, a routing guard can return an `Observable<boolean>` or a `Promise<boolean>` and the
router will wait for the observable to resolve to `true` or `false`.

<div class="alert is-critical">

**Note:** The observable provided to the `Router` must also complete. If the observable does not complete, the navigation does not continue.

</div>

The router supports multiple guard interfaces:

* [`CanActivate`](api/router/CanActivate) to mediate navigation *to* a route.

* [`CanActivateChild`](api/router/CanActivateChild) to mediate navigation *to* a child route.

* [`CanDeactivate`](api/router/CanDeactivate) to mediate navigation *away* from the current route.

* [`Resolve`](api/router/Resolve) to perform route data retrieval *before* route activation.

* [`CanLoad`](api/router/CanLoad) to mediate navigation *to* a feature module loaded _asynchronously_.


You can have multiple guards at every level of a routing hierarchy.
The router checks the `CanDeactivate` and `CanActivateChild` guards first, from the deepest child route to the top.
Then it checks the `CanActivate` guards from the top down to the deepest child route.
If the feature module is loaded asynchronously, the `CanLoad` guard is checked before the module is loaded.
If _any_ guard returns false, pending guards that have not completed will be canceled, and the entire navigation is canceled.

There are several examples over the next few sections.

{@a can-activate-guard}

### `CanActivate`: requiring authentication

Applications often restrict access to a feature area based on who the user is.
You could permit access only to authenticated users or to users with a specific role.
You might block or limit access until the user's account is activated.

The `CanActivate` guard is the tool to manage these navigation business rules.

#### Add an admin feature module

This section guides you through extending the crisis center with some new administrative features.
Start by adding a new feature module named `AdminModule`.

Generate an `admin` folder with a feature module file and a routing configuration file.

<code-example language="none" class="code-shell">
  ng generate module admin --routing
</code-example>

Next, generate the supporting components.

<code-example language="none" class="code-shell">
  ng generate component admin/admin-dashboard
</code-example>

<code-example language="none" class="code-shell">
  ng generate component admin/admin
</code-example>

<code-example language="none" class="code-shell">
  ng generate component admin/manage-crises
</code-example>

<code-example language="none" class="code-shell">
  ng generate component admin/manage-heroes
</code-example>

The admin feature file structure looks like this:


<div class='filetree'>

  <div class='file'>
    src/app/admin
  </div>

  <div class='children'>

    <div class='file'>
      admin
    </div>

      <div class='children'>

        <div class='file'>
          admin.component.css
        </div>

        <div class='file'>
          admin.component.html
        </div>

        <div class='file'>
          admin.component.ts
        </div>

      </div>

    <div class='file'>
      admin-dashboard
    </div>

      <div class='children'>

        <div class='file'>
          admin-dashboard.component.css
        </div>

        <div class='file'>
          admin-dashboard.component.html
        </div>

        <div class='file'>
          admin-dashboard.component.ts
        </div>

      </div>

    <div class='file'>
      manage-crises
    </div>

      <div class='children'>

        <div class='file'>
          manage-crises.component.css
        </div>

        <div class='file'>
          manage-crises.component.html
        </div>

        <div class='file'>
          manage-crises.component.ts
        </div>

      </div>

    <div class='file'>
      manage-heroes
    </div>

      <div class='children'>

        <div class='file'>
          manage-heroes.component.css
        </div>

        <div class='file'>
          manage-heroes.component.html
        </div>

        <div class='file'>
          manage-heroes.component.ts
        </div>

      </div>

    <div class='file'>
      admin.module.ts
    </div>

    <div class='file'>
      admin-routing.module.ts
    </div>

  </div>

</div>

The admin feature module contains the `AdminComponent` used for routing within the
feature module, a dashboard route and two unfinished components to manage crises and heroes.

<code-tabs>

  <code-pane header="src/app/admin/admin/admin.component.html"  path="router/src/app/admin/admin/admin.component.html">

  </code-pane>

  <code-pane header="src/app/admin/admin-dashboard/admin-dashboard.component.html" path="router/src/app/admin/admin-dashboard/admin-dashboard.component.1.html">

  </code-pane>

  <code-pane header="src/app/admin/admin.module.ts" path="router/src/app/admin/admin.module.ts">

  </code-pane>

  <code-pane header="src/app/admin/manage-crises/manage-crises.component.html" path="router/src/app/admin/manage-crises/manage-crises.component.html">

  </code-pane>

  <code-pane header="src/app/admin/manage-heroes/manage-heroes.component.html"  path="router/src/app/admin/manage-heroes/manage-heroes.component.html">

  </code-pane>

</code-tabs>

<div class="alert is-helpful">

Although the admin dashboard `RouterLink` only contains a relative slash without an additional URL segment, it is a match to any route within the admin feature area.
You only want the `Dashboard` link to be active when the user visits that route.
Adding an additional binding to the `Dashboard` routerLink,`[routerLinkActiveOptions]="{ exact: true }"`, marks the `./` link as active when the user navigates to the `/admin` URL and not when navigating to any of the child routes.

</div>

{@a component-less-route}

##### Component-less route: grouping routes without a component

The initial admin routing configuration:

<code-example path="router/src/app/admin/admin-routing.module.1.ts" header="src/app/admin/admin-routing.module.ts (admin routing)" region="admin-routes"></code-example>

The child route under the `AdminComponent` has a `path` and a `children` property but it's not using a `component`.
This defines a _component-less_ route.

To group the `Crisis Center` management routes under the `admin` path a component is unnecessary.
Additionally, a _component-less_ route makes it easier to [guard child routes](#can-activate-child-guard).

Next, import the `AdminModule` into `app.module.ts` and add it to the `imports` array
to register the admin routes.

<code-example path="router/src/app/app.module.4.ts" header="src/app/app.module.ts (admin module)" region="admin-module"></code-example>

Add an "Admin" link to the `AppComponent` shell so that users can get to this feature.

<code-example path="router/src/app/app.component.5.html" header="src/app/app.component.html (template)"></code-example>

{@a guard-admin-feature}

#### Guard the admin feature

Currently, every route within the Crisis Center is open to everyone.
The new admin feature should be accessible only to authenticated users.

Write a `canActivate()` guard method to redirect anonymous users to the
login page when they try to enter the admin area.

Generate an `AuthGuard` in the `auth` folder.

<code-example language="none" class="code-shell">
  ng generate guard auth/auth
</code-example>

To demonstrate the fundamentals, this example only logs to the console, `returns` true immediately, and allows navigation to proceed:

<code-example path="router/src/app/auth/auth.guard.1.ts" header="src/app/auth/auth.guard.ts (excerpt)"></code-example>

Next, open `admin-routing.module.ts `, import the `AuthGuard` class, and
update the admin route with a `canActivate` guard property that references it:

<code-example path="router/src/app/admin/admin-routing.module.2.ts" header="src/app/admin/admin-routing.module.ts (guarded admin route)" region="admin-route"></code-example>

The admin feature is now protected by the guard, but the guard requires more customization to work fully.

{@a teach-auth}

#### Authenticate with `AuthGuard`

Make the `AuthGuard` mimic authentication.

The `AuthGuard` should call an application service that can login a user and retain information about the current user. Generate a new `AuthService` in the `auth` folder:

<code-example language="none" class="code-shell">
  ng generate service auth/auth
</code-example>

Update the `AuthService` to log in the user:

<code-example path="router/src/app/auth/auth.service.ts" header="src/app/auth/auth.service.ts (excerpt)"></code-example>

Although it doesn't actually log in, it has an `isLoggedIn` flag to tell you whether the user is authenticated.
Its `login()` method simulates an API call to an external service by returning an observable that resolves successfully after a short pause.
The `redirectUrl` property stores the URL that the user wanted to access so you can navigate to it after authentication.

<div class="alert is-helpful">

To keep things minimal, this example redirects unauthenticated users to `/admin`.

</div>

Revise the `AuthGuard` to call the `AuthService`.

<code-example path="router/src/app/auth/auth.guard.2.ts" header="src/app/auth/auth.guard.ts (v2)"></code-example>

Notice that you inject the `AuthService` and the `Router` in the constructor.
You haven't provided the `AuthService` yet but it's good to know that you can inject helpful services into routing guards.

This guard returns a synchronous boolean result.
If the user is logged in, it returns true and the navigation continues.

The `ActivatedRouteSnapshot` contains the _future_ route that will be activated and the `RouterStateSnapshot` contains the _future_ `RouterState` of the application, should you pass through the guard check.

If the user is not logged in, you store the attempted URL the user came from using the `RouterStateSnapshot.url` and tell the router to redirect to a login page&mdash;a page you haven't created yet.
Returning a `UrlTree` tells the `Router` to cancel the current navigation and schedule a new one to redirect the user.

{@a add-login-component}

#### Add the `LoginComponent`

You need a `LoginComponent` for the user to log in to the app. After logging in, you'll redirect to the stored URL if available, or use the default URL.
There is nothing new about this component or the way you use it in the router configuration.

<code-example language="none" class="code-shell">
  ng generate component auth/login
</code-example>

Register a `/login` route in the `auth/auth-routing.module.ts`.
In `app.module.ts`, import and add the `AuthModule` to the `AppModule` imports.


<code-tabs>

  <code-pane header="src/app/app.module.ts" path="router/src/app/app.module.ts" region="auth">

  </code-pane>

  <code-pane header="src/app/auth/login/login.component.html" path="router/src/app/auth/login/login.component.html">

  </code-pane>

  <code-pane header="src/app/auth/login/login.component.ts" path="router/src/app/auth/login/login.component.1.ts">

  </code-pane>

  <code-pane header="src/app/auth/auth.module.ts" path="router/src/app/auth/auth.module.ts">

  </code-pane>

</code-tabs>


{@a can-activate-child-guard}

### `CanActivateChild`: guarding child routes

You can also protect child routes with the `CanActivateChild` guard.
The `CanActivateChild` guard is similar to the `CanActivate` guard.
The key difference is that it runs before any child route is activated.

You protected the admin feature module from unauthorized access.
You should also protect child routes _within_ the feature module.

Extend the `AuthGuard` to protect when navigating between the `admin` routes.
Open `auth.guard.ts` and add the `CanActivateChild` interface to the imported tokens from the router package.

Next, implement the `canActivateChild()` method which takes the same arguments as the `canActivate()` method: an `ActivatedRouteSnapshot` and `RouterStateSnapshot`.
The `canActivateChild()` method can return an `Observable<boolean|UrlTree>` or `Promise<boolean|UrlTree>` for async checks and a `boolean` or `UrlTree` for sync checks.
This one returns either `true` to allow the user to access the admin feature module or `UrlTree` to redirect the user to the login page instead:

<code-example path="router/src/app/auth/auth.guard.3.ts" header="src/app/auth/auth.guard.ts (excerpt)" region="can-activate-child"></code-example>

Add the same `AuthGuard` to the `component-less` admin route to protect all other child routes at one time
instead of adding the `AuthGuard` to each route individually.

<code-example path="router/src/app/admin/admin-routing.module.3.ts" header="src/app/admin/admin-routing.module.ts (excerpt)" region="can-activate-child"></code-example>

{@a can-deactivate-guard}


### `CanDeactivate`: handling unsaved changes

Back in the "Heroes" workflow, the app accepts every change to a hero immediately without validation.

In the real world, you might have to accumulate the users changes, validate across fields, validate on the server, or hold changes in a pending state until the user confirms them as a group or cancels and reverts all changes.

When the user navigates away, you can let the user decide what to do with unsaved changes.
If the user cancels, you'll stay put and allow more changes.
If the user approves, the app can save.

You still might delay navigation until the save succeeds.
If you let the user move to the next screen immediately and saving were to fail (perhaps the data is ruled invalid), you would lose the context of the error.

You need to stop the navigation while you wait, asynchronously, for the server to return with its answer.

The `CanDeactivate` guard helps you decide what to do with unsaved changes and how to proceed.

{@a cancel-save}

#### Cancel and save

Users update crisis information in the `CrisisDetailComponent`.
Unlike the `HeroDetailComponent`, the user changes do not update the crisis entity immediately.
Instead, the app updates the entity when the user presses the Save button and discards the changes when the user presses the Cancel button.

Both buttons navigate back to the crisis list after save or cancel.

<code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (cancel and save methods)" region="cancel-save"></code-example>

In this scenario, the user could click the heroes link, cancel, push the browser back button, or navigate away without saving.

This example app asks the user to be explicit with a confirmation dialog box that waits asynchronously for the user's
response.

<div class="alert is-helpful">

You could wait for the user's answer with synchronous, blocking code, however, the app is more responsive&mdash;and can do other work&mdash;by waiting for the user's answer asynchronously.

</div>

Generate a `Dialog` service to handle user confirmation.

<code-example language="none" class="code-shell">
  ng generate service dialog
</code-example>

Add a `confirm()` method to the `DialogService` to prompt the user to confirm their intent.
The `window.confirm` is a blocking action that displays a modal dialog and waits for user interaction.

<code-example path="router/src/app/dialog.service.ts" header="src/app/dialog.service.ts"></code-example>

It returns an `Observable` that resolves when the user eventually decides what to do: either to discard changes and navigate away (`true`) or to preserve the pending changes and stay in the crisis editor (`false`).

{@a CanDeactivate}

Generate a guard that checks for the presence of a `canDeactivate()` method in a component&mdash;any component.

<code-example language="none" class="code-shell">
  ng generate guard can-deactivate
</code-example>

Paste the following code into your guard.

<code-example path="router/src/app/can-deactivate.guard.ts" header="src/app/can-deactivate.guard.ts"></code-example>

While the guard doesn't have to know which component has a deactivate method, it can detect that the `CrisisDetailComponent` component has the `canDeactivate()` method and call it.
The guard not knowing the details of any component's deactivation method makes the guard reusable.

Alternatively, you could make a component-specific `CanDeactivate` guard for the `CrisisDetailComponent`.
The `canDeactivate()` method provides you with the current instance of the `component`, the current `ActivatedRoute`, and `RouterStateSnapshot` in case you needed to access some external information.
This would be useful if you only wanted to use this guard for this component and needed to get the component's properties or confirm whether the router should allow navigation away from it.

<code-example path="router/src/app/can-deactivate.guard.1.ts" header="src/app/can-deactivate.guard.ts (component-specific)"></code-example>

Looking back at the `CrisisDetailComponent`, it implements the confirmation workflow for unsaved changes.

<code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (excerpt)" region="canDeactivate"></code-example>

Notice that the `canDeactivate()` method can return synchronously; it returns `true` immediately if there is no crisis or there are no pending changes.
But it can also return a `Promise` or an `Observable` and the router will wait for that to resolve to truthy (navigate) or falsy (stay on the current route).

Add the `Guard` to the crisis detail route in `crisis-center-routing.module.ts` using the `canDeactivate` array property.

<code-example path="router/src/app/crisis-center/crisis-center-routing.module.3.ts" header="src/app/crisis-center/crisis-center-routing.module.ts (can deactivate guard)"></code-example>

Now you have given the user a safeguard against unsaved changes.

{@a Resolve}

{@a resolve-guard}

### _Resolve_: pre-fetching component data

In the `Hero Detail` and `Crisis Detail`, the app waited until the route was activated to fetch the respective hero or crisis.

If you were using a real world API, there might be some delay before the data to display is returned from the server.
You don't want to display a blank component while waiting for the data.

To improve this behavior, you can pre-fetch data from the server using a resolver so it's ready the
moment the route is activated.
This also allows you to handle errors before routing to the component.
There's no point in navigating to a crisis detail for an `id` that doesn't have a record.
It'd be better to send the user back to the `Crisis List` that shows only valid crisis centers.

In summary, you want to delay rendering the routed component until all necessary data has been fetched.


{@a fetch-before-navigating}

#### Fetch data before navigating

At the moment, the `CrisisDetailComponent` retrieves the selected crisis.
If the crisis is not found, the router navigates back to the crisis list view.

The experience might be better if all of this were handled first, before the route is activated.
A `CrisisDetailResolver` service could retrieve a `Crisis` or navigate away, if the `Crisis` did not exist, _before_ activating the route and creating the `CrisisDetailComponent`.

Generate a `CrisisDetailResolver` service file within the `Crisis Center` feature area.

<code-example language="none" class="code-shell">
  ng generate service crisis-center/crisis-detail-resolver
</code-example>

<code-example path="router/src/app/crisis-center/crisis-detail-resolver.service.1.ts" header="src/app/crisis-center/crisis-detail-resolver.service.ts (generated)"></code-example>

Move the relevant parts of the crisis retrieval logic in `CrisisDetailComponent.ngOnInit()` into the `CrisisDetailResolverService`.
Import the `Crisis` model, `CrisisService`, and the `Router` so you can navigate elsewhere if you can't fetch the crisis.

Be explicit and implement the `Resolve` interface with a type of `Crisis`.

Inject the `CrisisService` and `Router` and implement the `resolve()` method.
That method could return a `Promise`, an `Observable`, or a synchronous return value.

The `CrisisService.getCrisis()` method returns an observable in order to prevent the route from loading until the data is fetched.
The `Router` guards require an observable to `complete`, which means it has emitted all
of its values.
You use the `take` operator with an argument of `1` to ensure that the `Observable` completes after retrieving the first value from the Observable returned by the `getCrisis()` method.

If it doesn't return a valid `Crisis`, then return an empty `Observable`, cancel the previous in-progress navigation to the `CrisisDetailComponent`, and navigate the user back to the `CrisisListComponent`.
The updated resolver service looks like this:

<code-example path="router/src/app/crisis-center/crisis-detail-resolver.service.ts" header="src/app/crisis-center/crisis-detail-resolver.service.ts"></code-example>

Import this resolver in the `crisis-center-routing.module.ts` and add a `resolve` object to the `CrisisDetailComponent` route configuration.

<code-example path="router/src/app/crisis-center/crisis-center-routing.module.4.ts" header="src/app/crisis-center/crisis-center-routing.module.ts (resolver)"></code-example>

The `CrisisDetailComponent` should no longer fetch the crisis.
When you re-configured the route, you changed where the crisis is.
Update the `CrisisDetailComponent` to get the crisis from the  `ActivatedRoute.data.crisis` property instead;

<code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (ngOnInit v2)" region="ngOnInit"></code-example>

Note the following three important points:

1. The router's `Resolve` interface is optional.
The `CrisisDetailResolverService` doesn't inherit from a base class.
The router looks for that method and calls it if found.

1. The router calls the resolver in any case where the user could navigate away so you don't have to code for each use case.

1. Returning an empty `Observable` in at least one resolver will cancel navigation.

The relevant Crisis Center code for this milestone follows.

<code-tabs>

  <code-pane header="app.component.html" path="router/src/app/app.component.html">

  </code-pane>

  <code-pane header="crisis-center-home.component.html" path="router/src/app/crisis-center/crisis-center-home/crisis-center-home.component.html">

  </code-pane>

  <code-pane header="crisis-center.component.html" path="router/src/app/crisis-center/crisis-center/crisis-center.component.html">

  </code-pane>

  <code-pane header="crisis-center-routing.module.ts" path="router/src/app/crisis-center/crisis-center-routing.module.4.ts">

  </code-pane>

  <code-pane header="crisis-list.component.html" path="router/src/app/crisis-center/crisis-list/crisis-list.component.html">

  </code-pane>

  <code-pane header="crisis-list.component.ts" path="router/src/app/crisis-center/crisis-list/crisis-list.component.ts">

  </code-pane>

  <code-pane header="crisis-detail.component.html" path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.html">

  </code-pane>

  <code-pane header="crisis-detail.component.ts" path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts">

  </code-pane>

  <code-pane header="crisis-detail-resolver.service.ts" path="router/src/app/crisis-center/crisis-detail-resolver.service.ts">

  </code-pane>

  <code-pane header="crisis.service.ts" path="router/src/app/crisis-center/crisis.service.ts">

  </code-pane>

  <code-pane header="dialog.service.ts" path="router/src/app/dialog.service.ts">

  </code-pane>

</code-tabs>

Guards

<code-tabs>

  <code-pane header="auth.guard.ts" path="router/src/app/auth/auth.guard.3.ts">

  </code-pane>

  <code-pane header="can-deactivate.guard.ts" path="router/src/app/can-deactivate.guard.ts">

  </code-pane>

</code-tabs>

{@a query-parameters}

{@a fragment}

### Query parameters and fragments

In the [route parameters](#optional-route-parameters) section, you only dealt with parameters specific to the route.
However, you can use query parameters to get optional parameters available to all routes.

[Fragments](https://en.wikipedia.org/wiki/Fragment_identifier) refer to certain elements on the page
identified with an `id` attribute.

Update the `AuthGuard` to provide a `session_id` query that will remain after navigating to another route.

Add an `anchor` element so you can jump to a certain point on the page.

Add the `NavigationExtras` object to the `router.navigate()` method that navigates you to the `/login` route.

<code-example path="router/src/app/auth/auth.guard.4.ts" header="src/app/auth/auth.guard.ts (v3)"></code-example>

You can also preserve query parameters and fragments across navigations without having to provide them again when navigating.
In the `LoginComponent`, you'll add an *object* as the second argument in the `router.navigateUrl()` function and provide the `queryParamsHandling` and `preserveFragment` to pass along the current query parameters and fragment to the next route.

<code-example path="router/src/app/auth/login/login.component.ts" header="src/app/auth/login/login.component.ts (preserve)" region="preserve"></code-example>

<div class="alert is-helpful">

The `queryParamsHandling` feature also provides a `merge` option, which preserves and combines the current query parameters with any provided query parameters when navigating.

</div>

To navigate to the Admin Dashboard route after logging in, update `admin-dashboard.component.ts` to handle the
query parameters and fragment.

<code-example path="router/src/app/admin/admin-dashboard/admin-dashboard.component.1.ts" header="src/app/admin/admin-dashboard/admin-dashboard.component.ts (v2)"></code-example>

Query parameters and fragments are also available through the `ActivatedRoute` service.
Just like route parameters, the query parameters and fragments are provided as an `Observable`.
The updated Crisis Admin component feeds the `Observable` directly into the template using the `AsyncPipe`.

Now, you can click on the Admin button, which takes you to the Login page with the provided `queryParamMap` and `fragment`.
After you click the login button, notice that you have been redirected to the `Admin Dashboard` page with the query parameters and fragment still intact in the address bar.

You can use these persistent bits of information for things that need to be provided across pages like authentication tokens or session ids.

<div class="alert is-helpful">

The `query params` and `fragment` can also be preserved using a `RouterLink` with
the `queryParamsHandling` and `preserveFragment` bindings respectively.

</div>


{@a asynchronous-routing}

## Milestone 6: Asynchronous routing

As you've worked through the milestones, the application has naturally gotten larger.
At some point you'll reach a point where the application takes a long time to load.

To remedy this issue, use asynchronous routing, which loads feature modules lazily, on request.
Lazy loading has multiple benefits.

* You can load feature areas only when requested by the user.
* You can speed up load time for users that only visit certain areas of the application.
* You can continue expanding lazy loaded feature areas without increasing the size of the initial load bundle.

You're already part of the way there.
By organizing the application into modules&mdash;`AppModule`,
`HeroesModule`, `AdminModule` and `CrisisCenterModule`&mdash;you
have natural candidates for lazy loading.

Some modules, like `AppModule`, must be loaded from the start.
But others can and should be lazy loaded.
The `AdminModule`, for example, is needed by a few authorized users, so
you should only load it when requested by the right people.

{@a lazy-loading-route-config}

### Lazy Loading route configuration

Change the `admin` path in the `admin-routing.module.ts` from `'admin'` to an empty string, `''`, the empty path.

Use empty path routes to group routes together without adding any additional path segments to the URL.
Users will still visit `/admin` and the `AdminComponent` still serves as the Routing Component containing child routes.

Open the `AppRoutingModule` and add a new `admin` route to its `appRoutes` array.

Give it a `loadChildren` property instead of a `children` property.
The `loadChildren` property takes a function that returns a promise using the browser's built-in syntax for lazy loading code using dynamic imports `import('...')`.
The path is the location of the `AdminModule` (relative to the app root).
After the code is requested and loaded, the `Promise` resolves an object that contains the `NgModule`, in this case the `AdminModule`.

<code-example path="router/src/app/app-routing.module.5.ts" region="admin-1" header="app-routing.module.ts (load children)"></code-example>

<div class="alert is-important">

*Note*: When using absolute paths, the `NgModule` file location must begin with `src/app` in order to resolve correctly. For custom [path mapping with absolute paths](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping), you must configure the `baseUrl` and `paths` properties in the project `tsconfig.json`.

</div>

When the router navigates to this route, it uses the `loadChildren` string to dynamically load the `AdminModule`.
Then it adds the `AdminModule` routes to its current route configuration.
Finally, it loads the requested route to the destination admin component.

The lazy loading and re-configuration happen just once, when the route is first requested; the module and routes are available immediately for subsequent requests.


<div class="alert is-helpful">

Angular provides a built-in module loader that supports SystemJS to load modules asynchronously. If you were
using another bundling tool, such as Webpack, you would use the Webpack mechanism for asynchronously loading modules.

</div>

Take the final step and detach the admin feature set from the main application.
The root `AppModule` must neither load nor reference the `AdminModule` or its files.

In `app.module.ts`, remove the `AdminModule` import statement from the top of the file
and remove the `AdminModule` from the NgModule's `imports` array.

{@a can-load-guard}

### `CanLoad`: guarding unauthorized loading of feature modules

You're already protecting the `AdminModule` with a `CanActivate` guard that prevents unauthorized users from accessing the admin feature area.
It redirects to the login page if the user is not authorized.

But the router is still loading the `AdminModule` even if the user can't visit any of its components.
Ideally, you'd only load the `AdminModule` if the user is logged in.

Add a `CanLoad` guard that only loads the `AdminModule` once the user is logged in _and_ attempts to access the admin feature area.

The existing `AuthGuard` already has the essential logic in its `checkLogin()` method to support the `CanLoad` guard.

Open `auth.guard.ts`.
Import the `CanLoad` interface from `@angular/router`.
Add it to the `AuthGuard` class's `implements` list.
Then implement `canLoad()` as follows:

<code-example path="router/src/app/auth/auth.guard.ts" header="src/app/auth/auth.guard.ts (CanLoad guard)" region="canLoad"></code-example>

The router sets the `canLoad()` method's `route` parameter to the intended destination URL.
The `checkLogin()` method redirects to that URL once the user has logged in.

Now import the `AuthGuard` into the `AppRoutingModule` and add the `AuthGuard` to the `canLoad`
array property for the `admin` route.
The completed admin route looks like this:

<code-example path="router/src/app/app-routing.module.5.ts" region="admin" header="app-routing.module.ts (lazy admin route)"></code-example>

{@a preloading}

### Preloading: background loading of feature areas

In addition to loading modules on-demand, you can load modules asynchronously with preloading.

The `AppModule` is eagerly loaded when the application starts, meaning that it loads right away.
Now the `AdminModule` loads only when the user clicks on a link, which is called lazy loading.

Preloading allows you to load modules in the background so that the data is ready to render when the user activates a particular route.
Consider the Crisis Center.
It isn't the first view that a user sees.
By default, the Heroes are the first view.
For the smallest initial payload and fastest launch time, you should eagerly load the `AppModule` and the `HeroesModule`.

You could lazy load the Crisis Center.
But you're almost certain that the user will visit the Crisis Center within minutes of launching the app.
Ideally, the app would launch with just the `AppModule` and the `HeroesModule` loaded and then, almost immediately, load the `CrisisCenterModule` in the background.
By the time the user navigates to the Crisis Center, its module will have been loaded and ready.

{@a how-preloading}

#### How preloading works

After each successful navigation, the router looks in its configuration for an unloaded module that it can preload.
Whether it preloads a module, and which modules it preloads, depends upon the preload strategy.

The `Router` offers two preloading strategies:

* No preloading, which is the default. Lazy loaded feature areas are still loaded on-demand.
* Preloading of all lazy loaded feature areas.

The router either never preloads, or preloads every lazy loaded module.
The `Router` also supports [custom preloading strategies](#custom-preloading) for fine control over which modules to preload and when.

This section guides you through updating the `CrisisCenterModule` to load lazily by default and use the `PreloadAllModules` strategy to load all lazy loaded modules.

{@a lazy-load-crisis-center}

#### Lazy load the crisis center

Update the route configuration to lazy load the `CrisisCenterModule`.
Take the same steps you used to configure `AdminModule` for lazy loading.

1. Change the `crisis-center` path in the `CrisisCenterRoutingModule` to an empty string.

1. Add a `crisis-center` route to the `AppRoutingModule`.

1. Set the `loadChildren` string to load the `CrisisCenterModule`.

1. Remove all mention of the `CrisisCenterModule` from `app.module.ts`.


Here are the updated modules _before enabling preload_:


<code-tabs>

  <code-pane header="app.module.ts" path="router/src/app/app.module.ts" region="preload">

  </code-pane>

  <code-pane header="app-routing.module.ts" path="router/src/app/app-routing.module.6.ts" region="preload-v1">

  </code-pane>

  <code-pane header="crisis-center-routing.module.ts" path="router/src/app/crisis-center/crisis-center-routing.module.ts">

  </code-pane>

</code-tabs>

You could try this now and confirm that the  `CrisisCenterModule` loads after you click the "Crisis Center" button.

To enable preloading of all lazy loaded modules, import the `PreloadAllModules` token from the Angular router package.

The second argument in the `RouterModule.forRoot()` method takes an object for additional configuration options.
The `preloadingStrategy` is one of those options.
Add the `PreloadAllModules` token to the `forRoot()` call:

<code-example path="router/src/app/app-routing.module.6.ts" header="src/app/app-routing.module.ts (preload all)" region="forRoot"></code-example>

This configures the `Router` preloader to immediately load all lazy loaded routes (routes with a `loadChildren` property).

When you visit `http://localhost:4200`, the `/heroes` route loads immediately upon launch and the router starts loading the `CrisisCenterModule` right after the `HeroesModule` loads.

Currently, the `AdminModule` does not preload because `CanLoad` is blocking it.

{@a preload-canload}

#### `CanLoad` blocks preload

The `PreloadAllModules` strategy does not load feature areas protected by a [CanLoad](#can-load-guard) guard.

You added a `CanLoad` guard to the route in the `AdminModule` a few steps back to block loading of that module until the user is authorized.
That `CanLoad` guard takes precedence over the preload strategy.

If you want to preload a module as well as guard against unauthorized access, remove the `canLoad()` guard method and rely on the [canActivate()](#can-activate-guard) guard alone.

{@a custom-preloading}

### Custom Preloading Strategy

Preloading every lazy loaded module works well in many situations.
However, in consideration of things such as low bandwidth and user metrics, you can use a custom preloading strategy for specific feature modules.

This section guides you through adding a custom strategy that only preloads routes whose `data.preload` flag is set to `true`.
Recall that you can add anything to the `data` property of a route.

Set the `data.preload` flag in the `crisis-center` route in the `AppRoutingModule`.

<code-example path="router/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts (route data preload)" region="preload-v2"></code-example>

Generate a new `SelectivePreloadingStrategy` service.

<code-example language="none" class="code-shell">
  ng generate service selective-preloading-strategy
</code-example>

Replace the contents of `selective-preloading-strategy.service.ts` with the following:

<code-example path="router/src/app/selective-preloading-strategy.service.ts" header="src/app/selective-preloading-strategy.service.ts"></code-example>

`SelectivePreloadingStrategyService` implements the `PreloadingStrategy`, which has one method, `preload()`.

The router calls the `preload()` method with two arguments:

1. The route to consider.
1. A loader function that can load the routed module asynchronously.

An implementation of `preload` must return an `Observable`.
If the route does preload, it returns the observable returned by calling the loader function.
If the route does not preload, it returns an `Observable` of `null`.

In this sample, the  `preload()` method loads the route if the route's `data.preload` flag is truthy.

As a side-effect, `SelectivePreloadingStrategyService` logs the `path` of a selected route in its public `preloadedModules` array.

Shortly, you'll extend the `AdminDashboardComponent` to inject this service and display its `preloadedModules` array.

But first, make a few changes to the `AppRoutingModule`.

1. Import `SelectivePreloadingStrategyService` into `AppRoutingModule`.
1. Replace the `PreloadAllModules` strategy in the call to `forRoot()` with this `SelectivePreloadingStrategyService`.
1. Add the `SelectivePreloadingStrategyService` strategy to the `AppRoutingModule` providers array so you can inject it elsewhere in the app.

Now edit the `AdminDashboardComponent` to display the log of preloaded routes.

1. Import the `SelectivePreloadingStrategyService`.
1. Inject it into the dashboard's constructor.
1. Update the template to display the strategy service's `preloadedModules` array.

Now the file is as follows:

<code-example path="router/src/app/admin/admin-dashboard/admin-dashboard.component.ts" header="src/app/admin/admin-dashboard/admin-dashboard.component.ts (preloaded modules)"></code-example>

Once the application loads the initial route, the `CrisisCenterModule` is preloaded.
Verify this by logging in to the `Admin` feature area and noting that the `crisis-center` is listed in the `Preloaded Modules`.
It also logs to the browser's console.

{@a redirect-advanced}

### Migrating URLs with redirects

You've setup the routes for navigating around your application and used navigation imperatively and declaratively.
But like any application, requirements change over time.
You've setup links and navigation to `/heroes` and `/hero/:id` from the `HeroListComponent` and `HeroDetailComponent` components.
If there were a requirement that links to `heroes` become `superheroes`, you would still want the previous URLs to navigate correctly.
You also don't want to update every link in your application, so redirects makes refactoring routes trivial.

{@a url-refactor}

#### Changing `/heroes` to `/superheroes`

This section guides you through migrating the `Hero` routes to new URLs.
The `Router` checks for redirects in your configuration before navigating, so each redirect is triggered when needed. To support this change, add redirects from the old routes to the new routes in the `heroes-routing.module`.

<code-example path="router/src/app/heroes/heroes-routing.module.ts" header="src/app/heroes/heroes-routing.module.ts (heroes redirects)"></code-example>

Notice two different types of redirects.
The first change is from  `/heroes` to `/superheroes` without any parameters.
The second change is from `/hero/:id` to `/superhero/:id`, which includes the `:id` route parameter.
Router redirects also use powerful pattern-matching, so the `Router` inspects the URL and replaces route parameters in the `path` with their appropriate destination.
Previously, you navigated to a URL such as `/hero/15` with a route parameter `id` of `15`.

<div class="alert is-helpful">

The `Router` also supports [query parameters](#query-parameters) and the [fragment](#fragment) when using redirects.

* When using absolute redirects, the `Router` will use the query parameters and the fragment from the `redirectTo` in the route config.
* When using relative redirects, the `Router` use the query params and the fragment from the source URL.

</div>

Currently, the empty path route redirects to `/heroes`, which redirects to `/superheroes`.
This won't work because the `Router` handles redirects once at each level of routing configuration.
This prevents chaining of redirects, which can lead to endless redirect loops.

Instead, update the empty path route in `app-routing.module.ts` to redirect to `/superheroes`.

<code-example path="router/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts (superheroes redirect)"></code-example>

A `routerLink` isn't tied to route configuration, so update the associated router links to remain active when the new route is active.
Update the `app.component.ts` template for the `/heroes` `routerLink`.

<code-example path="router/src/app/app.component.html" header="src/app/app.component.html (superheroes active routerLink)"></code-example>

Update the `goToHeroes()` method in the `hero-detail.component.ts` to navigate back to `/superheroes` with the optional route parameters.

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.ts" region="redirect" header="src/app/heroes/hero-detail/hero-detail.component.ts (goToHeroes)"></code-example>

With the redirects setup, all previous routes now point to their new destinations and both URLs still function as intended.

{@a inspect-config}

### Inspect the router's configuration

To determine if your routes are actually evaluated [in the proper order](#routing-module-order), you can inspect the router's configuration.

Do this by injecting the router and logging to the console its `config` property.
For example, update the `AppModule` as follows and look in the browser console window
to see the finished route configuration.

<code-example path="router/src/app/app.module.7.ts" header="src/app/app.module.ts (inspect the router config)" region="inspect-config"></code-example>

{@a final-app}

## Final app

For the completed router app, see the <live-example name="router"></live-example> for the final source code.

{@a link-parameters-array}
