# Using Angular routes in a single-page application

This tutorial describes how you can build a [single-page application (SPA)](https://en.wikipedia.org/wiki/Single-page_application) that uses multiple Angular routes.

In an SPA, all of your application's functions exist in a single HTML page.
As users access your application's features, the browser needs to render only the parts that matter to the user, instead of loading a new page. This pattern can significantly improve your application's user experience.

To enable navigation in your application, you must add *routes* that define how users navigate from one part of your application to another.
You can also configure routes to guard against unexpected or unauthorized behavior.

To explore a sample app featuring the contents of this tutorial, see the <live-example></live-example>.

## Objectives

* Organize a sample application's features into modules.
* Define how to navigate to a component's view.
* Pass information to a component using a parameter.
* Identify the active route and apply CSS styles to show current navigation state.
* Handle failed navigation attempts with redirects or a "404 not found" page.

## Prerequisites

To complete this tutorial, you should have a basic understanding of the following concepts:

* JavaScript
* HTML
* CSS
* [Angular CLI](/cli)

You might find the [Tour of Heroes tutorial](/tutorial) helpful, but it is not required.

## Create a sample application

Using the Angular CLI, create a new application, _angular-router-sample_. This application will have two components: _crisis-list_ and _heroes-list_.

1. Create a new Angular project, _angular-router-sample_.

   <code-example language="sh">
   ng new angular-router-sample
   </code-example>

   When prompted with `Would you like to add Angular routing?`, select `N`.

   When prompted with `Which stylesheet format would you like to use?`, select `CSS`.

   After a few moments, a new project, `angular-router-sample`, is ready.

1. From your terminal, navigate to the `angular-router-sample` directory.

1. Create a component, _crisis-list_.

  <code-example language="sh">
   ng generate component crisis-list
  </code-example>

1. In your code editor, locate the file, `crisis-list.component.html` and replace
   the placeholder content with the following HTML.

   <code-example header="src/app/crisis-list/crisis-list.component.html" path="router-tutorial/src/app/crisis-list/crisis-list.component.html"></code-example>

1. Create a second component, _heroes-list_.

  <code-example language="sh">
   ng generate component heroes-list
  </code-example>

1. In your code editor, locate the file, `heroes-list.component.html` and replace the placeholder content with the following HTML.

   <code-example header="src/app/heroes-list/heroes-list.component.html" path="router-tutorial/src/app/heroes-list/heroes-list.component.html"></code-example>

1. In your code editor, open the file, `app.component.html` and replace its contents with the following HTML.

   <code-example header="src/app/app.component.html" path="router-tutorial/src/app/app.component.html" region="setup"></code-example>

1. Verify that your new application runs as expected by running the `ng serve` command.

  <code-example language="sh">
   ng serve
  </code-example>

1. Open a browser to `http://localhost:4200`.

   You should see a single web page, consisting of a title and the HTML of your two components.

### Import `RouterModule` from `@angular/router`

Routing allows you to display specific views of your application depending on the URL path.
To add this functionality to your sample application, you need to update the `app.module.ts` file to use the module, `RouterModule`.
You import this module from `@angular/router`.

1. From your code editor, open the `app.module.ts` file.

1. Add the following `import` statement.

  <code-example header="src/app/app.module.ts" path="router-tutorial/src/app/app.module.ts" region="router-import"></code-example>

### Define your routes

In this section, you'll define two routes:

* The route `/crisis-center` opens the `crisis-center` component.
* The route `/heroes-list` opens the `heroes-list` component.

A route definition is a JavaScript object. Each route typically has two properties. The first property, `path`, is a string
that specifies the URL path for the route. The second property, `component`, is a string that specifies
what component your application should display for that path.

1. From your code editor, open the `app.module.ts` file.

1. Locate the `@NgModule()` section.

1. Replace the `imports` array in that section with the following.

   <code-example header="src/app/app.module.ts" path="router-tutorial/src/app/app.module.ts" region="import-basic"></code-example>

This code adds the `RouterModule` to the `imports` array. Next, the code uses the `forRoot()` method of the `RouterModule` to
define your two routes. This method takes an array of JavaScript objects, with each object defining the proprties of a route.
The `forRoot()` method ensures that your application only instantiates one `RouterModule`. For more information, see
[Singleton Services](guide/singleton-services#forroot-and-the-router).

## Update the UI to support routing

At this point, you have defined two routes for your application, and the components have the logic that supports routing. However, your application still has both the `crisis-list` and `heroes-list` components hard-coded in your `app.component.html` template. For your routes to
work, you need to update your template to dynamically load a component based on the URL path.

To make navigation available to users, the template needs two things:

* A `<router-outlet>` directive as a placeholder for the location where you want a new view to appear.
* Buttons or other selection elements that let the user initiate navigation to particular views.

### Add a route placeholder to the template

Use the following steps to replace the hard-coded components in the template with the `router-outlet` placeholder directive.

1. From your code editor, open the template file for the root component, `app.component.html`.

1. Delete the following lines.

   <code-example header="src/app/app.component.html" path="router-tutorial/src/app/app.component.html" region="components"></code-example>

1. Add the `router-outlet` directive.

   <code-example header="src/app/app.component.html" path="router-tutorial/src/app/app.component.html" region="router-outlet"></code-example>

View your updated application in your browser. You should see only the application title. To
view the `crisis-list` component, add `crisis-list` to the end of the path in your browser's
address bar. For example:

<code-example language="none">
http://localhost:4200/crisis-list
</code-example>

Notice that the `crisis-list` component displays. Angular is using the route you defined to dynamically load the
component. You can load the `heroes-list` component the same way:

<code-example language="none">
http://localhost:4200/heroes-list
</code-example>

### Control navigation with UI elements

You can't expect the user to manually type the path in the browser's address bar.
In this section, you'll add two links that users can click to navigate between the `heroes-list` and `crisis-list` components.
You'll also add some CSS styles, which will make it easier to identify the link for the currently-displayed component. You'll add that functionality in the next section.

1. Open the `app.component.html` file and add the following HTML below the title.

   <code-example header="src/app/app.component.html" path="router-tutorial/src/app/app.component.html" region="nav"></code-example>

   This HTML uses an Angular directive, `routerLink`. This directive connects the routes
   you defined to your template files.

1. Open the `app.component.css` file and add the following styles.

   <code-example header="src/app/app.component.css" path="router-tutorial/src/app/app.component.css"></code-example>


If you view your application in the browser, you should see these two links. When you click
on a link, the corresponding component appears.

### Use styles to identify the active route

While users can navigate your application using the links you added in the previous section,
they don't have an easy way to identify which view is being displayed&emdash;that is, which route is currently active.

You created a CSS style (`activebutton`) that distinguishes a button for the active route.
By adding the `routerLinkActive` directive to the anchor, you tell the router to apply that CSS class to the element when the route becomes active.

1. From your code editor, open the `app.component.html` file.

1. Update the anchor tags to include the `routerLinkActive` directive.

   <code-example header="src/app/app.component.html" path="router-tutorial/src/app/app.component.html" region="routeractivelink"></code-example>

View your application again. As you click one of the buttons, the style for that button updates
automatically, identifying the active component to the user.

## Configure routes to handle different cases

Your route configuration should take care of common navigation failures or errors.
You can define a default view and redirect unknown (or partially unknown) URLs to that view, or you can display an error message like the "Page Not Found" page that a browser normally shows in response to the HTTP 404 error.

### Use a redirect route to identify a default view

In this step of the tutorial, you add a route that redirects the user to display the `/heroes-list` component.

1. From your code editor, open the `app.module.ts` file.

1. In the `imports` array, update the `RouterModule` section as follows.

   <code-example header="src/app/app.module.ts" path="router-tutorial/src/app/app.module.ts" region="import-redirect"></code-example>

   Notice that this new route uses an empty string as its path. In addition, it replaces the `component` property with two new ones:

   * `redirectTo`. This property instructs Angular to redirect from an empty path to the
     `heroes-list` path.
   * `pathMatch`. This property instructs Angular on how much of the URL to match. For this
      tutorial, you should set this property to `full`. This strategy is recommended when
      you have an empty string for a path. For more information about this property,
      see the [Route API documentation](api/router/Route).

Now when you open your application, it displays the `heroes-list` component by default.

### Handle failed navigation with an error view

<<<<<<< HEAD
It is possible for a user to try to access a route that you have not defined. To account for
this behavior, the best practice is to display a 404 page. In this section, you'll create a 404 page and
update your route configuration to show that page for any unspecified routes.
=======
It is possible for a user to try to access a route that you have not defined.
When this happens, your application should inform the user with a suitable error message.
In this section, you'll create a component that displays such a message, and
update your route configuration to show that component for any unspecified routes.
>>>>>>> docs: separate router tutorial from router guide

1. From the terminal, create a new component, `PageNotFound`.

   <code-example language="sh">
   ng generate component page-not-found
   </code-example>

1. From your code editor, open the `page-not-found.component.html` file and replace its contents
   with the following HTML.

   <code-example header="src/app/page-not-found/page-not-found.component.html" path="router-tutorial/src/app/page-not-found/page-not-found.component.html"></code-example>

1. Open the `app.module.ts` file. In the `imports` array, update the `RouterModule` section as follows.

   <code-example header="src/app/app.module.ts" path="router-tutorial/src/app/app.module.ts" region="import-wildcard"></code-example>

   The new route uses a path, `**`. This path is how Angular identifies a wildcard route. Any route
   that does not match an existing route in your configuration will use this route.

   <div class="alert is-important">
    Notice that the wildcard route is placed at the end of the array. The order of your
    routes is important, as Angular applies routes in order and uses the first match it finds.
   </div>

Try navigating to a non-existing route on your application, such as `http://localhost:4200/powers`.
This route doesn't match anything defined in your `app.module.ts` file.
However, because you defined a wildcard route, the application automatically displays your `PageNotFound` component.

## Restructure with feature modules

So far, the sample application contains only the single root module, with three components for the crisis view, the hero-list view, and the error message "Page not found" view.
The navigation buttons are all defined in the root component's template, which contained the one router outlet.
This design works for introducing the basics of navigation and routing, but a typical application has multiple feature areas, each dedicated to a particular business purpose with its own NgModule.
This section shows how to refactor the app into different feature modules, import them into the main module and navigate among them.

This section covers the following:

* Organizing the app and routes into feature areas using modules.
* Navigating imperatively from one component to another.
* Passing required and optional information in route parameters.

{@a heroes-functionality}

### Add heroes functionality

This section expands the basic app by creating multiple routing modules and importing those routing modules in the correct order.

Take the following steps to restructure the application with multiple feature modules.

1. To manage the heroes, create a `HeroesModule` with routing in the heroes folder and register it with the root `AppModule`.

   <code-example language="none" class="code-shell">
     ng generate module heroes/heroes --module app --flat --routing
   </code-example>

2. Move the placeholder `hero-list` folder that's in the `app` folder into the `heroes` folder.

3. Copy the contents of the `heroes/heroes.component.html` from
the <live-example name="toh-pt4" title="Tour of Heroes: Services example code">"Services" tutorial</live-example> into the `hero-list.component.html` template.

   * Re-label the `<h2>` to `<h2>HEROES</h2>`.

   * Delete the `<app-hero-detail>` component at the bottom of the template.

4. Copy the contents of the `heroes/heroes.component.css` from the live example into the `hero-list.component.css` file.

5. Copy the contents of the `heroes/heroes.component.ts` from the live example into the `hero-list.component.ts` file.

   * Change the component class name to `HeroListComponent`.

   * Change the `selector` to `app-hero-list`.

<div class="alert is-helpful">

   Selectors are not required for routed components because components are dynamically inserted when the page is rendered. However, they are useful for identifying and targeting them in your HTML element tree.

</div>

6. Copy the `hero-detail` folder, the `hero.ts`, `hero.service.ts`,  and `mock-heroes.ts` files into the `heroes` subfolder.

   * Copy the `message.service.ts` into the `src/app` folder.

   * Update the relative path import to the `message.service` in the `hero.service.ts` file.

7. Update the `HeroesModule` metadata.

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

### Add routes for navigation between features

The component structure supports the two interacting components, the hero list and the hero detail.
When you navigate to list view, the app fetches a list of heroes and displays them.
When you click on a hero in the list, the app opens the detail view for that particular hero.

1. To tell the router which hero to display in the detail view, include the selected hero's `id` in the route URL. This is an example of a *route parameter*.

2. Import the hero components from their new locations in the `src/app/heroes/` folder and define the two hero routes.

3. Register the routes for the new `Heroes` module with the `RouterModule`. The new feature module is a child of the root module; to register the routes, use the static `RouterModule.forChild()` method instead of the static `RouterModule.forRoot()` method.

   <div class="alert is-helpful">

      Only call `RouterModule.forRoot()` in the root NgModule.
      In any other module, you must call the `RouterModule.forChild()` method to register additional routes.

   </div>

   The updated `HeroesRoutingModule` looks like this:

   <code-example path="router/src/app/heroes/heroes-routing.module.1.ts" header="src/app/heroes/heroes-routing.module.ts"></code-example>

<div class="alert is-helpful">

Consider giving each feature module its own route configuration file.
Though the feature routes are currently minimal, routes have a tendency to grow more complex even in small apps.

</div>

{@a remove-duplicate-hero-routes}

The hero routes are currently defined in two places: in the `HeroesRoutingModule`, by way of the `HeroesModule`, and in the `AppRoutingModule`.

Routes provided by feature modules are combined together into their imported module's routes by the router.
This allows you to continue defining the feature module routes without modifying the main route configuration.

4. To remove duplicate hero routes, remove the `HeroListComponent` import and the `/heroes` route from the `app-routing.module.ts`. Leave the default and the wildcard routes as these are still in use at the top level of the application.

   <code-example path="router/src/app/app-routing.module.2.ts" header="src/app/app-routing.module.ts (v2)"></code-example>

{@a merge-hero-routes}

5. The `HeroesModule` now provides the `HeroListComponent`, so you can remove it from the `AppModule`'s `declarations` array.

After these steps, the `AppModule` should look like this:

<code-example path="router/src/app/app.module.3.ts" header="src/app/app.module.ts" region="remove-heroes"></code-example>

Now that you have a separate `HeroesModule`, you can evolve the hero feature with more components and different routes.

## Examine the sample app

At this point, you have a basic application that uses Angular's routing feature to change
what components the user can see based on the URL address. You extended these features
to include a redirect, as well as a wildcard route to display a custom navigation error page.
Finally, you expanded the basic application structure to support multiple routing modules and route trees.

{@a routing-module-order}

### Module import order

Notice that in the module `imports` array, the `AppRoutingModule` is last and comes _after_ the `HeroesModule`.

<code-example path="router/src/app/app.module.3.ts" region="module-imports" header="src/app/app.module.ts (module-imports)"></code-example>

The order of route configuration is important because the router accepts the first route that matches a navigation request path.

When all routes were in one `AppRoutingModule`, you put the default and [wildcard](guide/router#wildcard) routes last, after the `/heroes` route, so that the router had a chance to match a URL to the `/heroes` route _before_ hitting the wildcard route and navigating to "Page not found".

Each routing module augments the route configuration in the order of import.
If you listed `AppRoutingModule` first, the wildcard route would be registered _before_ the hero routes.
The wildcard route&mdash;which matches _every_ URL&mdash;would intercept the attempt to navigate to a hero route.
You can reverse the routing modules to see a click of the heroes link resulting in "Page not found".

{@a inspect-config}

### Inspect the router's configuration

To determine if your routes are actually evaluated in the proper order, you can inspect the router's configuration.

Do this by injecting the router and logging its `config` property to the console.
For example, update the `AppModule` as follows and look in the browser console window
to see the finished route configuration.

<code-example path="router/src/app/app.module.7.ts" header="src/app/app.module.ts (inspect the router config)" region="inspect-config"></code-example>

</div>

## Next steps

* [Navigation techniques](guide/router-techniques) expands this application further to demonstrate more complex routing hierarchies and navigational control.
* [In-app Routing and Navigation](guide/router) explains routing concepts.
* [Router API reference](api/router) provides complete syntax details for the Angular `RouterModule` library.
