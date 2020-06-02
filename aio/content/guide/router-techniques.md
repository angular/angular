# Navigation techniques

The sample application that you create in the [basic routing tutorial](guide/router-tutorial) demonstrates basic navigation setup and configuration, and recommends a modular design that supports complex navigation needs.
This follow-on tutorial discusses and demonstrates additional navigation capabilities and techniques by extending the sample application.

{@a final-app}

<div class="alert is-helpful">

See the <live-example></live-example> for the source code of the completed sample application.

</div>

## Prerequisites

* Basic navigation and routing concepts: [In-app navigation: routing to views](guide/router)
* Basic router tutorial: [Using Angular routes in a single-page application](guide/router-tutorial).

The sample app uses the same domain as the [Getting Started: Tour of Heroes](tutorial).
You might find the original Tour of Heroes tutorial helpful, but it is not required.

---

{@a overview}

## Sample application overview

The sample application for this tutorial helps the Hero Employment Agency find crises for heroes to solve.
When it is complete, the application has three main feature areas:

* A *Crisis Center* for maintaining the list of crises for assignment to heroes.
* A *Heroes* area for maintaining the list of heroes employed by the agency.
* An *Admin* area to manage the list of crises and heroes.

The finished sample application demonstrates the following techniques.

* Using required and optional route parameters to construct route paths.
* Animating view transitions.
* Creating child routes.
* Showing multiple, related views with nested routes.
* Using route guards to restrict access to views and check whether users can access a route.
* Controlling whether the application can discard unsaved changes.
* Requiring specific criteria to load components.

Try it by clicking on this <live-example title="Hero Employment Agency Live Example">live example link</live-example>.

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

If you click the browser's back button instead of the app's "Back" button, the app still returns you to the heroes list.
Angular app navigation updates the browser history just like normal web navigation.

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
This demonstrates the router's `CanDeactivate` guard.
The guard function gives you a chance to clean up or ask the user's permission before navigating away from the current view.

The `Admin` and `Login` buttons illustrate the use of *route guards* to control access to parts of an application.

---

{@a route-def-with-parameter}
{@a route-parameters}

## Part 1: Track navigation states with route parameters

As a user navigates among views, the router keeps track of the current navigation state and navigation history.
To implement a "back" button, for example, you need to navigate to the previously active route.
You can identify a previously displayed view by looking at the [route parameters](guide/router#route-parameters "About route parameters") that were passed to the activation operation.

{@a activated-route-in-action}

### Retrieve parameters with `Activated Route`

When the router activates a route, it extracts the route parameter (`id:15`) from the URL and supplies it to
the `HeroDetailComponent` via the `ActivatedRoute` service.
Use the following steps to retrieve the parameters used to activate a route.

1. Import the `Router`, `ActivatedRoute`, and `ParamMap` tokens from the router package.

   <code-example path="router/src/app/heroes/hero-detail/hero-detail.component.1.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (activated route)" region="imports"></code-example>

2. Import the `switchMap` operator because you need it later to process the `Observable` route parameters.

   <code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (switchMap operator import)" region="rxjs-operator-import"></code-example>

{@a hero-detail-ctor}

3. Add the services as private variables to the constructor so that Angular injects them (makes them visible to the component).

   <code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (constructor)" region="ctor"></code-example>

4. In the `ngOnInit()` method, use the `ActivatedRoute` service to retrieve the parameters for the route, pull the hero `id` from the parameters, and retrieve the hero to display.

   <code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (ngOnInit)" region="ngOnInit"></code-example>

   When the map changes, the `paramMap` gets the `id` parameter from the changed parameters.
   Then you tell the `HeroService` to fetch the hero with that `id` and return the result of the `HeroService` request.

The `switchMap` operator does two things. It flattens the `Observable<Hero>` that `HeroService` returns and cancels previous pending requests.

* If the user re-navigates to this route with a new `id` while the `HeroService` is still retrieving the old `id`, `switchMap` discards that old request and returns the hero for the new `id`.

* `AsyncPipe` handles the observable subscription and the component's `hero` property is reset with the retrieved hero.

<div class="alert is-helpful">

See more about [working with parameter maps](guide/router#param-maps).

</div>

Currently, the `HeroDetailComponent` "Back" button uses the `gotoHeroes()` method that navigates imperatively back to the `HeroListComponent`, using the `navigate()` method.
This method takes the same single-item [_link parameters array_](guide/router#link-parameters-array) that you can bind to a `[routerLink]` directive.
So far, the array holds only the path to the `HeroListComponent`:

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.1.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (excerpt)" region="gotoHeroes"></code-example>

You can add the required parameter (`id`) to the link parameters array in an explicit route request, in order to display that detail page imperatively.

{@a nav-to-list}

### Preselect previously viewed item in list view

When returning to the `hero-detail.component.ts` list from the hero detail view, it would be nice if the viewed hero were preselected in the list.

<div class="lightbox">
  <img src='generated/images/guide/router/selected-hero.png' alt="Selected hero">
</div>

Implement this feature by including the viewed hero's `id` in the URL as an *optional* parameter when returning from the `HeroDetailComponent`.

In the router link that original triggered navigation to the list, the `id` of the hero-to-edit is a required parameter, and is specified as the second item of the link parameters array.

<code-example path="router/src/app/heroes/hero-list/hero-list.component.1.html" header="src/app/heroes/hero-list/hero-list.component.html (link-parameters-array)" region="link-parameters-array"></code-example>

The router embedded the `id` value in the navigation URL because you had defined it as a route parameter with an `:id` placeholder token in the route `path`:

<code-example path="router/src/app/heroes/heroes-routing.module.1.ts" header="src/app/heroes/heroes-routing.module.ts (hero-detail-route)" region="hero-detail-route"></code-example>

When the user clicks the back button, the `HeroDetailComponent` constructs another link parameters array
which it uses to navigate back to the `HeroListComponent`.

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.1.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (gotoHeroes)" region="gotoHeroes"></code-example>

This array lacks a route parameter because you didn't need to send information back to the `HeroListComponent`.
Now, however, you want to tell the hero-list which hero was previously selected.

To add the selection information in an *optional* parameter, use the following steps.

1. Send the `id` of the current hero with the navigation request so that the
`HeroListComponent` can highlight that hero in its list.
   In the link parameters array, include an object that contains an optional `id` parameter.

   For demonstration purposes, there's an extra junk parameter (`foo`) in the object that the `HeroListComponent` should ignore.
   Here's the revised navigation statement:

   <code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" header="src/app/heroes/hero-detail/hero-detail.component.ts (go to heroes)" region="gotoHeroes"></code-example>

2. Run the app and click  "back" to show that it returns to the hero list view.

3. Look at the browser address bar. It should look something like this, depending on where you run it:

   <code-example language="bash">
     localhost:4200/heroes;id=15;foo=foo

   </code-example>

   Notice that the `id` value appears in the URL as (`;id=15;foo=foo`), not in the URL path. The path for the "Heroes" route doesn't have an `:id` token.

   Notice also that the optional route parameters are not separated by "?" and "&" as they would be in the URL query string. They are separated by semicolons (";"), using matrix URL notation.

<div class="alert is-helpful">

Matrix URL notation is an idea first introduced in a
[1996 proposal](http://www.w3.org/DesignIssues/MatrixURIs.html) by the founder of the web, Tim Berners-Lee.

Although matrix notation is not part of the HTML standard,
it is legal and it became popular among browser routing systems
as a way to isolate parameters belonging to parent and child routes.
The Angular router provides support for the matrix notation across browsers.

</div>

{@a route-parameters-activated-route}

### Access route parameters using `ActivatedRoute` methods

In its current state of development, the list of heroes is unchanged.
No hero row is highlighted.

The `HeroListComponent` needs code that expects parameters.

Previously, when navigating from the `HeroListComponent` to the `HeroDetailComponent`,
you subscribed to the route parameter map `Observable` and made it available to the `HeroDetailComponent`
in the `ActivatedRoute` service.
You injected that service in the constructor of the `HeroDetailComponent`.

This time you'll be navigating in the opposite direction, from the `HeroDetailComponent` to the `HeroListComponent`.

1. Extend the router import statement to include the `ActivatedRoute` service symbol:

   <code-example path="router/src/app/heroes/hero-list/hero-list.component.ts" header="src/app/heroes/hero-list/hero-list.component.ts (import)" region="import-router"></code-example>

2. Import the `switchMap` operator to perform an operation on the `Observable` of route parameter map.

   <code-example path="router/src/app/heroes/hero-list/hero-list.component.ts" header="src/app/heroes/hero-list/hero-list.component.ts (rxjs imports)" region="rxjs-imports"></code-example>

3. Inject the `ActivatedRoute` in the `HeroListComponent` constructor.

   <code-example path="router/src/app/heroes/hero-list/hero-list.component.ts" header="src/app/heroes/hero-list/hero-list.component.ts (constructor and ngOnInit)" region="ctor"></code-example>

   * The `ActivatedRoute.paramMap` property is an `Observable` map of route parameters.
   * The `paramMap` emits a new map of values that includes `id` when the user navigates to the component.
   * In `ngOnInit()` you subscribe to those values, set the `selectedId`, and get the heroes.

4. Update the template with a [class binding](guide/template-syntax#class-binding). The binding adds the `selected` CSS class when the comparison returns `true` and removes it when `false`. Look for it within the repeated `<li>` tag as shown here:

   <code-example path="router/src/app/heroes/hero-list/hero-list.component.html" header="src/app/heroes/hero-list/hero-list.component.html"></code-example>

5. Add some styles to apply when the list item is selected.

   <code-example path="router/src/app/heroes/hero-list/hero-list.component.css" region="selected" header="src/app/heroes/hero-list/hero-list.component.css"></code-example>

When the user navigates from the heroes list to the "Magneta" hero and back, "Magneta" appears selected:

   <div class="lightbox">
     <img src='generated/images/guide/router/selected-hero.png' alt="Selected List">
   </div>

The optional `foo` route parameter is harmless and the router continues to ignore it.

{@a route-animation}

### Add routable animations

This section shows you how to add some [animations](guide/animations) to the `HeroDetailComponent`.

1. Import the `BrowserAnimationsModule` and add it to the `imports` array:

   <code-example path="router/src/app/app.module.ts" header="src/app/app.module.ts (animations-module)" region="animations-module"></code-example>

2. Add a `data` object to the routes for `HeroListComponent` and `HeroDetailComponent`. Transitions are based on `states` and you use the `animation` data from the route to provide a named animation `state` for the transitions.

   <code-example path="router/src/app/heroes/heroes-routing.module.2.ts" header="src/app/heroes/heroes-routing.module.ts (animation data)"></code-example>

3. Create an `animations.ts` file in the root `src/app/` folder. The contents look like this:

   <code-example path="router/src/app/animations.ts" header="src/app/animations.ts (excerpt)"></code-example>

   This file does the following:

   * Imports the animation symbols that build the animation triggers, control state, and manage transitions between states.

   * Exports a constant named `slideInAnimation` set to an animation trigger named `routeAnimation`.

   * Defines one transition when switching back and forth from the `heroes` and `hero` routes to ease the component in from the left of the screen as it enters the application view (`:enter`), the other to animate the component to the right as it leaves the application view (`:leave`).

4. In the `AppComponent`, import the `RouterOutlet` token from the `@angular/router` package and the `slideInAnimation` from `'./animations.ts`.

5. Add an `animations` array to the `@Component` metadata that contains the `slideInAnimation`.

   <code-example path="router/src/app/app.component.2.ts" header="src/app/app.component.ts (animations)" region="animation-imports"></code-example>

6. In order to use the routable animations, wrap the `RouterOutlet` inside an element, use the `@routeAnimation` trigger, and bind it to the element.

   * Provide the `data` value from the `ActivatedRoute` so that the `@routeAnimation` transitions can key off route states.

   * The `#routerOutlet` template variable lets you reference the `<router-outlet>` tag elsewhere in the template. The `@routeAnimation` property is bound to the `getAnimationData()` using the `routerOutlet` reference

   <code-example path="router/src/app/app.component.2.html" header="src/app/app.component.html (router outlet)"></code-example>

7. Define the `getAnimationData()` function in the `AppComponent`. This function returns the animation property from the `data` provided through the `ActivatedRoute`. The `animation` property matches the `transition` names you used in the `slideInAnimation` defined in `animations.ts`.

   <code-example path="router/src/app/app.component.2.ts" header="src/app/app.component.ts (router outlet)" region="function-binding"></code-example>

When switching between the two routes, the `HeroDetailComponent` and `HeroListComponent` now ease in from the left when routed to and slide to the right when navigating away.

### Part 1 Summary

The sample app you have built to this point demonstrates the following routing techniques.

* Organizing the app into feature areas.
* Navigating imperatively from one view to another.
* Passing information along in route parameters and subscribing to them in the component.
* Importing the feature area NgModule into the `AppModule`.
* Applying routable animations based on view transitions.

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

---

<!--- Possible new page: Complex routes (includes 'Add child routes' and 'Add multiple named outlets') -->

{@a milestone-4}
{@a relative-routing}

## Part 2: Add child routes and relative paths

In this section, you will create a new Crisis Center feature to learn how to add child routes and use relative routing in your app.
The Crisis Center stands alone, and changes to it don't affect the `AppModule` or any other feature component.

You will organize the crisis center to conform to the following recommended pattern for Angular applications:

* Each feature area resides in its own folder.
* Each feature has its own Angular feature module.
* Each area has its own area root component.
* Each area root component has its own router outlet and child routes.
* Feature area routes rarely or never cross with routes of other features.

If your app had many feature areas, the app component trees might look like this:

<div class="lightbox">
  <img src='generated/images/guide/router/component-tree.png' alt="Component Tree">
</div>

{@a crisis-child-routes}

### Create a crisis center feature module

To add features to the app's current crisis center, make it an independent module, as you did for the heroes feature.

1. Create a `crisis-center` subfolder in the `src/app` folder.

2. Copy the files and folders from `app/heroes` into the new `crisis-center` folder.

3. In the new files, change every mention of "hero" to "crisis", and "heroes" to "crises".

4. Rename the NgModule files to `crisis-center.module.ts` and `crisis-center-routing.module.ts`.

For this exercise, you use mock crises instead of mock heroes:

<code-example path="router/src/app/crisis-center/mock-crises.ts" header="src/app/crisis-center/mock-crises.ts"></code-example>

The routing style for the new Crisis Center will offer a contrast to the current state of Heroes.

{@a child-routing-component}

### Create a child routing component

The `CrisisCenterComponent` is the root of the crisis center area, just as `AppComponent` is the root of the entire application.

1. Generate a `CrisisCenter` component in the `crisis-center` folder:

   <code-example language="none" class="code-shell">
     ng generate component crisis-center/crisis-center
   </code-example>

2. Update the component template with the following markup:

   <code-example path="router/src/app/crisis-center/crisis-center/crisis-center.component.html" header="src/app/crisis-center/crisis-center/crisis-center.component.html"></code-example>

This `CrisisCenterComponent` is a shell for the crisis management feature area, just as the `AppComponent` is a shell to manage the high-level workflow.
Like most shells, the `CrisisCenterComponent` class is minimal because it has no business logic, and its template has no links, just a title and `<router-outlet>` for the crisis center child component.
The router displays the components of these routes in the `RouterOutlet` of the `CrisisCenterComponent`, not in the `RouterOutlet` of the `AppComponent` shell.

{@a child-route-config}

### Child route configuration

The Crisis Center feature needs a home page to host its child views.
Create the home page using the following steps.

1. Generate a `CrisisCenterHome` component in the `crisis-center` folder.

   <code-example language="none" class="code-shell">
     ng generate component crisis-center/crisis-center-home
   </code-example>

2. Update the template with a welcome message to the `Crisis Center`.

   <code-example path="router/src/app/crisis-center/crisis-center-home/crisis-center-home.component.html" header="src/app/crisis-center/crisis-center-home/crisis-center-home.component.html"></code-example>

3. Update the `crisis-center-routing.module.ts` you renamed after copying it from `heroes-routing.module.ts` file. This time, you define child routes within the parent `crisis-center` route.

   The parent `crisis-center` route has a `children` property with a single route containing the `CrisisListComponent`.
   The `CrisisListComponent` route also has a `children` array with two routes, which navigate to the crisis center child components, `CrisisCenterHomeComponent` and `CrisisDetailComponent`, respectively.

   <code-example path="router/src/app/crisis-center/crisis-center-routing.module.1.ts" header="src/app/crisis-center/crisis-center-routing.module.ts (Routes)" region="routes"></code-example>

The `CrisisListComponent` now contains the crisis list and a `RouterOutlet` to display the `Crisis Center Home` and `Crisis Detail` route components. The `Crisis Detail` route is a child of the `Crisis List`.

There are important differences in the way the router treats child routes.

* The router [reuses components](guide/router#reuse) by default, so the `Crisis Detail` component is re-used as you select different crises.
Compare this to the `Hero Detail` route, where [the component was recreated](guide/router#snapshot) each time you selected a different hero from the list of heroes.

* The path to a child route is [relative](#relative-navigation "More about relative navigation below") to the parent route. Within the crisis center, the parent path is `/crisis-center`. The router constructs the full URL by appending the relative path segment to its parent path.

   * To navigate to the `CrisisCenterHomeComponent`, the full URL is `/crisis-center` (`/crisis-center` + `''` + `''`).

   * To navigate to the `CrisisDetailComponent` for a crisis with `id=2`, the full URL is
`/crisis-center/2` (`/crisis-center` + `''` +  `'/2'`). The resulting absolute URL, including the `localhost` origin, is as follows:

   <code-example>
     localhost:4200/crisis-center/2

   </code-example>

Here's the complete `crisis-center-routing.module.ts` file with its imports.

<code-example path="router/src/app/crisis-center/crisis-center-routing.module.1.ts" header="src/app/crisis-center/crisis-center-routing.module.ts (excerpt)"></code-example>

{@a import-crisis-module}

### Import crisis center module into the `AppModule` routes

1. Add the `CrisisCenterModule` to the `imports` array of the `AppModule`
_before_ the `AppRoutingModule`.

2. Now that the `HeroesModule` and the `CrisisCenter` modules provide the feature routes, remove the initial crisis center route from the `app-routing.module.ts`.

<code-tabs>

  <code-pane path="router/src/app/crisis-center/crisis-center.module.ts"header="src/app/crisis-center/crisis-center.module.ts">

  </code-pane>

  <code-pane path="router/src/app/app.module.4.ts" header="src/app/app.module.ts (import CrisisCenterModule)" region="crisis-center-module">

  </code-pane>

</code-tabs>

3. Make sure that the `app-routing.module.ts` file retains the top-level application routes such as the default and wildcard routes.

   <code-example path="router/src/app/app-routing.module.3.ts" header="src/app/app-routing.module.ts (v3)" region="v3"></code-example>

{@a relative-navigation}
{@a nav-to-crisis}

While building out the crisis center feature, you navigated to the
crisis detail route using an absolute path that begins with a slash.
The router matches such absolute paths to routes starting from the top of the route configuration.

If you change the parent `/crisis-center` path, however, you would have to change the link parameters array.
You can free the links from this dependency by defining paths that are [relative to the current URL segment](guide/router#using-relative-paths "Using relative paths for routes").
Navigation within the feature area remains intact even if you change the parent route path to the feature.

4. Update the `gotoCrises()` method of the `CrisisDetailComponent` to navigate back to the Crisis Center list using relative path navigation.

   * You've already injected the `ActivatedRoute` that you need to compose the relative navigation path.
   * Change the path argument to a relative path specifier. The path goes up a level using the `../` syntax.
   * The link parameters array still specifies the parameters that you need to append to the path.
   * Add a third argument, a configuration object that sets the base path to the current active route.

   <code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (relative navigation)" region="gotoCrises-navigate"></code-example>

   If the current crisis `id` is `3`, the resulting path back to the crisis list is  `/crisis-center/;id=3;foo=foo`.

<div class="alert is-helpful">

When using a `RouterLink` to navigate instead of the `Router` service, you'd use the same link parameters array, but you wouldn't provide the object with the `relativeTo` property.
The `ActivatedRoute` is implicit in a `RouterLink` directive.

</div>

{@a named-outlets-example}
{@a secondary-routes}

### Display multiple views in named outlets

So far, there is only a single outlet and you've nested child routes under that outlet to group routes together.
Suppose you want to give users a way to contact the crisis center.
When a user clicks a "Contact" button, you want to display a message in a popup view.
The popup should stay open, even when switching between pages in the application, until the user closes it
by sending the message or canceling.

To accomplish this, you need to add a [secondary outlet](guide/router#define-secondary-routes "Read about secondary routes and named outlets") to the template.
While the primary outlet is unnamed, you can have any number of named secondary outlets, with their own route configurations.
You target a named outlet by adding the outlet name to the route definition.

1. Add an outlet named "popup" in the `AppComponent`, directly below the primary unnamed outlet.

   <code-example path="router/src/app/app.component.4.html" header="src/app/app.component.html (outlets)" region="outlets"></code-example>

   That's where a popup will go when you have routed a popup component to it.

2. Generate a new component to compose the message.

   <code-example language="none" class="code-shell">
     ng generate component compose-message
   </code-example>

3. Add the component logic with its template and styles:

<code-tabs>

  <code-pane header="src/app/compose-message/compose-message.component.css" path="router/src/app/compose-message/compose-message.component.css">

  </code-pane>

  <code-pane header="src/app/compose-message/compose-message.component.html" path="router/src/app/compose-message/compose-message.component.html">

  </code-pane>

  <code-pane header="src/app/compose-message/compose-message.component.ts" path="router/src/app/compose-message/compose-message.component.ts">

  </code-pane>

</code-tabs>

   * Note that the `send()` method simulates latency by waiting a second before "sending" the message and closing the popup.

   * The `closePopup()` method closes the popup view by navigating to the popup outlet with a `null`. See [clearing secondary routes](#clear-secondary-routes).

   The view for this component displays a short form with a header, an input box for the message, and two buttons, "Send" and "Cancel".

   <div class="lightbox">
     <img src='generated/images/guide/router/contact-popup.png' alt="Contact popup">
   </div>

4. To add a secondary route, open the `AppRoutingModule` and add a new `compose` route to the `appRoutes` array.
   In addition to the `path` and `component` properties, there's a third property, `outlet`, which is set to `'popup'`.

   <code-example path="router/src/app/app-routing.module.3.ts" header="src/app/app-routing.module.ts (compose route)" region="compose"></code-example>

   This route now targets the `popup` outlet. When it is activated, the `ComposeMessageComponent` view is displayed there.

5. To give users a way to open the popup, add a "Contact" link to the `AppComponent` template.

   Although the `compose` route is configured to the "popup" outlet, that's not sufficient for connecting the route to a `RouterLink` directive.
   You have to specify the named outlet in a link parameters array and bind it to the `RouterLink` with a property binding.

   <code-example path="router/src/app/app.component.4.html" header="src/app/app.component.html (contact-link)" region="contact-link"></code-example>

   * The link parameters array contains an object with a single `outlets` property whose value is another object keyed by one (or more) outlet names.
   In this case there is only the "popup" outlet property and its value is another link parameters array that specifies the `compose` route.

When the user clicks the "Contact" link, the router displays the component associated with the `compose` route in the `popup` outlet.

The [URL syntax](guide/router#secondary-route-navigation "Syntax details") for the secondary route appends the secondary outlet and route within parentheses:

<code-example>
  http://.../crisis-center(popup:compose)

</code-example>

If you click the _Heroes_ link, the primary navigation part changes; the secondary route remains the same.

<code-example>
  http://.../heroes(popup:compose)
</code-example>

That's why the popup stays visible as you navigate among the crises and heroes.

{@a clear-secondary-routes}

6. Clicking the "Send" or "Cancel" buttons clears the popup view by calling the `closePopup()` function:

   <code-example path="router/src/app/compose-message/compose-message.component.ts" header="src/app/compose-message/compose-message.component.ts (closePopup)" region="closePopup"></code-example>

   The `closePopup()` function navigates imperatively with the `Router.navigate()` method, passing in a link parameters array.

   * Like the array bound to the _Contact_ `RouterLink` in the `AppComponent`, this one includes an object with an `outlets` property.

   * The `outlets` property value is another object with outlet names for keys. The only named outlet is `'popup'`. This time, the value of `'popup'` is not a route, but the special value `null`.

Setting the "popup" `RouterOutlet` to `null` clears the outlet and removes the secondary popup route from the current URL.

---

<!--- Possible new page: Controlling access to views  -->

{@a guards}
{@a milestone-5-route-guards}

## Part 3: Control access with route guards

At this point, any user can navigate anywhere in the application anytime.
To control access, you can use one or more of the pre-defined route-guard functions, or create your own route guards.

The following section provide some examples.

### Add an administrative feature module

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
Adding an additional binding to the `Dashboard` routerLink, `[routerLinkActiveOptions]="{ exact: true }"`, marks the `./` link as active when the user navigates to the `/admin` URL and not when navigating to any of the child routes.

</div>

{@a component-less-route}

### Group routes with a componentless parent routes

The initial admin routing configuration:

<code-example path="router/src/app/admin/admin-routing.module.1.ts" header="src/app/admin/admin-routing.module.ts (admin routing)" region="admin-routes"></code-example>

The child route under the `AdminComponent` has a `path` and a `children` property but it's not using a `component`.
This defines a _component-less_ route.

To group the `Crisis Center` management routes under the `admin` path a component is unnecessary.
Additionally, a _componentless_ route makes it easier to [guard child routes](#can-activate-child-guard).

Next, import the `AdminModule` into `app.module.ts` and add it to the `imports` array
to register the admin routes.

<code-example path="router/src/app/app.module.4.ts" header="src/app/app.module.ts (admin module)" region="admin-module"></code-example>

Add an "Admin" link to the `AppComponent` shell so that users can get to this feature.

<code-example path="router/src/app/app.component.5.html" header="src/app/app.component.html (template)"></code-example>

{@a guard-admin-feature}
{@a can-activate-guard}

### Guard the administration feature

Applications often restrict access to a feature area based on who the user is.
You could permit access only to authenticated users or to users with a specific role.
You might block or limit access until the user's account is activated.

The `CanActivate` guard is the tool to manage these navigation business rules.

Currently, every route within the Crisis Center is open to everyone.
The new admin feature should be accessible only to authenticated users.

In this exercise, you write a `canActivate()` guard method to redirect anonymous users to the
login page when they try to enter the admin area.

1. Generate an `AuthGuard` in the `auth` folder.

   <code-example language="none" class="code-shell">
     ng generate guard auth/auth
   </code-example>

2. Add the following code. To demonstrate the fundamentals, this example just logs to the console, `returns` true immediately, and allows navigation to proceed.

   <code-example path="router/src/app/auth/auth.guard.1.ts" header="src/app/auth/auth.guard.ts (excerpt)"></code-example>

3. Open `admin-routing.module.ts `, import the `AuthGuard` class, and
update the admin route with a `canActivate` guard property that references it.

   <code-example path="router/src/app/admin/admin-routing.module.2.ts" header="src/app/admin/admin-routing.module.ts (guarded admin route)" region="admin-route"></code-example>



{@a teach-auth}

### Authenticate with `AuthGuard`

The admin feature is now protected by the guard, but the `AuthGuard` requires more customization to mimic authentication.
The `AuthGuard` should call an application service that can login a user and retain information about the current user.

1. Generate a new `AuthService` in the `auth` folder.

   <code-example language="none" class="code-shell">
     ng generate service auth/auth
   </code-example>

2. Update the `AuthService` to log in the user.

   <code-example path="router/src/app/auth/auth.service.ts" header="src/app/auth/auth.service.ts (excerpt)"></code-example>

   Although it doesn't actually log in, the service has an `isLoggedIn` flag to tell you whether the user is authenticated.
   * The `login()` method simulates an API call to an external service by returning an observable that resolves successfully after a short pause.
   * The `redirectUrl` property stores the URL that the user wanted to access so you can navigate to it after authentication.
   * To keep things minimal, this example redirects unauthenticated users to `/admin`.

3. Revise the `AuthGuard` to call the `AuthService`.

   <code-example path="router/src/app/auth/auth.guard.2.ts" header="src/app/auth/auth.guard.ts (v2)"></code-example>

   * Notice that you inject both the `AuthService` and the `Router` in the constructor.
   You haven't provided the `AuthService` yet, but this ensures that you will be able to inject helpful services into routing guards.

   * This guard returns a synchronous boolean result.
   If the user is logged in, it returns true and the navigation continues.

The `ActivatedRouteSnapshot` contains the _future_ route that will be activated and the `RouterStateSnapshot` contains the _future_ `RouterState` of the application, should you pass through the guard check.

If the user is not logged in, you store the attempted URL the user came from using the `RouterStateSnapshot.url` and tell the router to redirect to a login page&mdash;a page you haven't created yet.
Returning a `UrlTree` tells the `Router` to cancel the current navigation and schedule a new one to redirect the user.

{@a add-login-component}

### Add a `LoginComponent`

You need a `LoginComponent` for the user to log in to the app. After logging in, you'll redirect to the stored URL if available, or use the default URL.

1. Generate a login component.

   <code-example language="none" class="code-shell">
     ng generate component auth/login
   </code-example>

   There is nothing new about this component or the way you use it in the router configuration.

2. Register a `/login` route in the `auth/auth-routing.module.ts`.

3. In `app.module.ts`, import and add the `AuthModule` to the `AppModule` imports.

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

### Protect child routes with `CanActivateChild`

The `CanActivateChild` guard provides an additional way to protect child routes.
It is similar to the `CanActivate` guard, but it runs before any child route is activated.
You used `CanActivate` to protect the admin feature module from unauthorized access.

Now you can use  `CanActivateChild` to also protect child routes _within_ the feature module.
You will extend the `AuthGuard` to protect navigation between the `admin` routes.

1. Open `auth.guard.ts` and add the `CanActivateChild` interface to the imported tokens from the router package.

2. Implement the `canActivateChild()` method.

   * The method takes the same arguments as the `canActivate()` method: an `ActivatedRouteSnapshot` and `RouterStateSnapshot`.

   * The method can return an `Observable<boolean|UrlTree>` or `Promise<boolean|UrlTree>` for async checks and a `boolean` or `UrlTree` for sync checks. This one returns either `true` to allow the user to access the admin feature module or `UrlTree` to redirect the user to the login page instead:

   <code-example path="router/src/app/auth/auth.guard.3.ts" header="src/app/auth/auth.guard.ts (excerpt)" region="can-activate-child"></code-example>

3. Add the same `AuthGuard` to the [componentless admin route](#component-less-route "Remember componentless routes") to protect all other child routes at one time, rather than adding the `AuthGuard` to each route individually.

   <code-example path="router/src/app/admin/admin-routing.module.3.ts" header="src/app/admin/admin-routing.module.ts (excerpt)" region="can-activate-child"></code-example>

{@a can-deactivate-guard}

### Handle unsaved changes with `CanDeactivate`

In the "Heroes" workflow, the app accepts every change to a hero immediately without validation.
In the real world, you might have to accumulate the users changes, validate across fields, validate on the server, or hold changes in a pending state until the user confirms them as a group or cancels and reverts all changes.

When the user navigates away, you can let the user decide what to do with unsaved changes.
If the user cancels, you'll stay put and allow more changes.
If the user approves, the app can save.

You still might delay navigation until the save succeeds.
If you let the user move to the next screen immediately and saving were to fail (perhaps the data is ruled invalid), you would lose the context of the error.

You need to stop the navigation while you wait, asynchronously, for the server to return with its answer.
The `CanDeactivate` guard helps you decide what to do with unsaved changes and how to proceed.

{@a cancel-save}

In this exercise, you will implement a "Cancel or Save" dialog that intercepts the update operation. When users update crisis information in the `CrisisDetailComponent`, the app will not update the entity immediately, but will display the dialog.

1. Implement the cancel and save methods.

   * The app will update the entity when the user clicks Save, and discard the changes when the user clicks Cancel.
   * Both buttons navigate back to the crisis list after save or cancel.

   <code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (cancel and save methods)" region="cancel-save"></code-example>

2. Generate a `Dialog` service to handle user confirmation.

<code-example language="none" class="code-shell">
  ng generate service dialog
</code-example>

3. Add a `confirm()` method to the `DialogService` to prompt the user to confirm their intent.

   <code-example path="router/src/app/dialog.service.ts" header="src/app/dialog.service.ts"></code-example>

   The `window.confirm` is a blocking action that displays a modal dialog and waits for user interaction. It returns an `Observable` that resolves when the user eventually decides what to do: either to discard changes and navigate away (`true`) or to preserve the pending changes and stay in the crisis editor (`false`).

<div class="alert is-helpful">

In this scenario, the user could click the heroes link, cancel, push the browser back button, or navigate away without saving.
This example app asks the user to be explicit with a confirmation dialog box that waits asynchronously for the user's response.
You could wait for the user's answer with synchronous, blocking code, but the app is more responsive&mdash;and can do other work&mdash;by waiting for the user's answer asynchronously.

</div>

{@a CanDeactivate}

4. Generate a guard that checks for the presence of a `canDeactivate()` method in a component&mdash;any component.

   <code-example language="none" class="code-shell">
     ng generate guard can-deactivate
   </code-example>

5. Paste the following code into your guard.

   <code-example path="router/src/app/can-deactivate.guard.ts" header="src/app/can-deactivate.guard.ts"></code-example>

   While the guard doesn't have to know which component has a deactivate method, it can detect that the `CrisisDetailComponent` component has the `canDeactivate()` method and call it.
   Insulating the guard from details of any component's deactivation method makes the guard reusable.

<div class="alert is-helpful">

Alternatively, you could make a component-specific `CanDeactivate` guard for the `CrisisDetailComponent`.
The `canDeactivate()` method provides you with the current instance of the `component`, the current `ActivatedRoute`, and `RouterStateSnapshot` in case you needed to access some external information.
This would be useful if you only wanted to use this guard for this component and needed to get the component's properties or confirm whether the router should allow navigation away from it.

<code-example path="router/src/app/can-deactivate.guard.1.ts" header="src/app/can-deactivate.guard.ts (component-specific)"></code-example>

</div>

6. In the `CrisisDetailComponent`, implement the confirmation workflow for unsaved changes.

   <code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (excerpt)" region="canDeactivate"></code-example>

  Notice that the `canDeactivate()` method can return synchronously; it returns `true` immediately if there is no crisis or there are no pending changes. But it can also return a `Promise` or an `Observable` and the router will wait for that to resolve to truthy (navigate) or falsy (stay on the current route).

7. Add the `Guard` to the crisis detail route in `crisis-center-routing.module.ts` using the `canDeactivate` array property.

   <code-example path="router/src/app/crisis-center/crisis-center-routing.module.3.ts" header="src/app/crisis-center/crisis-center-routing.module.ts (can deactivate guard)"></code-example>

Now you have given the user a safeguard against unsaved changes.


{@a query-parameters}
{@a fragment}

## Shared query parameters and URL fragments

In [Part 1](#route-parameters) of this tutorial, you dealt with parameters specific to a route.
However, you can use query parameters to make optional parameters available to all routes.
When you require users to log in, for example, you need to identify a login session so that authorized users can remain authorized as they navigate to different views.

<div class="alert is-helpful">

In a route path, a hash mark # introduces an optional [fragment](https://en.wikipedia.org/wiki/Fragment_identifier) near the end of the URL, after any query parameters introduced by a question mark (`?`).
In Angular route paths, fragments refer to child views of the main or parent view.
In the example app, the main view is identified with an `id` attribute.

</div>

Use the following steps to add a login session that will remain after navigating to another route.

1. Update the `AuthGuard` to provide a `session_id` query parameter.

2. Add an `anchor` element as a URL fragment, so you can jump to a certain point on the page.

3. Add the `NavigationExtras` object to the `router.navigate()` method that activates the `/login` route.

<code-example path="router/src/app/auth/auth.guard.4.ts" header="src/app/auth/auth.guard.ts (v3)"></code-example>

{@a preserve-params}

### Preserve and share query parameters

You can preserve query parameters and fragments across navigations without having to provide them again when navigating.

1. In the `LoginComponent`,  add a navigation-options object, [NavigationExtras](api/router/NavigationExtras "NavigationExtras API reference"), as the second argument in the `router.navigateUrl()` function.

2. In the object, provide the query and fragment preservation options.

   <code-example path="router/src/app/auth/login/login.component.ts" header="src/app/auth/login/login.component.ts (preserve)" region="preserve"></code-example>

   This configuration allows you to pass along the current query parameters and fragment to the next route.

<div class="alert is-helpful">

The `queryParamsHandling` feature also provides a `merge` option, which preserves and combines the current query parameters with any provided query parameters when navigating.

</div>

3. To navigate to the Admin Dashboard route after logging in, update `admin-dashboard.component.ts` to retrieve the query parameters and fragments through the `ActivatedRoute` service.

   <code-example path="router/src/app/admin/admin-dashboard/admin-dashboard.component.1.ts" header="src/app/admin/admin-dashboard/admin-dashboard.component.ts (v2)"></code-example>

   Like route parameters, the query parameters and fragments are provided as an `Observable`.
   Feed the `Observable` directly into the template using the `AsyncPipe`.

Now, you can click on the Admin button, which takes you to the Login page with the provided `queryParamMap` and `fragment`.
After you click the login button, notice that you have been redirected to the `Admin Dashboard` page with the query parameters and fragment still intact in the address bar.

<div class="alert is-helpful">

The `query params` and `fragment` can also be preserved using a `RouterLink` with
the `queryParamsHandling` and `preserveFragment` bindings respectively.

</div>

{@a resolve}
{@a resolve-guard}

### Pre-fetch component data with a resolver

In the `Hero Detail` and `Crisis Detail`, the app waited until the route was activated to fetch the respective hero or crisis.
In a real-world app, there might be some delay before the data to display is returned from the server.
You don't want to display a blank component while waiting for the data.
To improve the user experience, you can pre-fetch data from the server using a [resolver function](api/router/Resolve "API reference"), so it's ready the moment the route is activated.

Pre-fetching data also allows you to handle errors before routing to the component.
There's no point in invoking navigation to a crisis detail for an `id` that doesn't have a record.
It's better to send the user back to the `Crisis List` that shows only valid crisis centers.

Currently, the route configuration falls back to the default view when the crisis is not found, but the router has already instantiated the `CrisisDetailComponent`. If you prefetch the data you can provide more graceful error handling, and avoid create the component when it is not going to be shown.

In this exercise, you create a `CrisisDetailResolver` service to retrieve a `Crisis`.
If the requested `Crisis` is not found, this service navigates away before activating the route and creating the `CrisisDetailComponent`.

1. Generate a `CrisisDetailResolver` service file within the `Crisis Center` feature area.

   <code-example language="none" class="code-shell">
     ng generate service crisis-center/crisis-detail-resolver
   </code-example>

   This generates the following code file.

   <code-example path="router/src/app/crisis-center/crisis-detail-resolver.service.1.ts" header="src/app/crisis-center/crisis-detail-resolver.service.ts (generated component code)"></code-example>

2. Move the relevant parts of the crisis retrieval logic in `CrisisDetailComponent.ngOnInit()` into the `CrisisDetailResolverService`.

3. Import the `Crisis` model, `CrisisService`, and the `Router` so you can navigate elsewhere if you can't fetch the crisis.

4. Inject the `CrisisService` and `Router` and implement the `resolve()` method, as defined in the [Resolve interface](api/router/Resolve "API reference).

   The `resolve()` method can return a `Promise`, an `Observable`, or a synchronous return value.
   Implement it to return an `Observable` with a type of `Crisis`.

  * The `CrisisService.getCrisis()` method returns an observable in order to prevent the route from loading until the data is fetched.
   The `Router` guards require an observable to `complete`, which means it has emitted all
of its values.
   Use the `take` operator with an argument of `1` to ensure that the `Observable` completes after retrieving the first value from the Observable returned by the `getCrisis()` method.

   * If the observable doesn't return a valid `Crisis`, then return an empty `Observable`, cancel the previous in-progress navigation to the `CrisisDetailComponent`, and navigate the user back to the `CrisisListComponent`.

   The updated resolver service looks like this:

   <code-example path="router/src/app/crisis-center/crisis-detail-resolver.service.ts" header="src/app/crisis-center/crisis-detail-resolver.service.ts"></code-example>

5. Import this resolver in the `crisis-center-routing.module.ts` and add a `resolve` object to the `CrisisDetailComponent` route configuration.

   <code-example path="router/src/app/crisis-center/crisis-center-routing.module.4.ts" header="src/app/crisis-center/crisis-center-routing.module.ts (resolver)"></code-example>

6. The `CrisisDetailComponent` should no longer fetch the crisis.
When you re-configured the route, you changed where the crisis is.
Update the `CrisisDetailComponent` to get the crisis from the  `ActivatedRoute.data.crisis` property instead;

   <code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (ngOnInit v2)" region="ngOnInit"></code-example>

   Note the following important points:

   * The router's `Resolve` interface is optional. The `CrisisDetailResolverService` doesn't inherit from a base class. The router looks for that method and calls it if found.

   * The router calls the resolver in any case where the the user could navigate away so you don't have to code for each use case.

   * Returning an empty `Observable` in at least one resolver cancels navigation.

### Part 3 Summary

The relevant Crisis Center code for this section follows.

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

The authorization and deactivation guard code follows.

<code-tabs>

  <code-pane header="auth.guard.ts" path="router/src/app/auth/auth.guard.3.ts">

  </code-pane>

  <code-pane header="can-deactivate.guard.ts" path="router/src/app/can-deactivate.guard.ts">

  </code-pane>

</code-tabs>

---

<!--- Edited to here -->

{@a asynchronous-routing}
{@a lazy-loaded-routed-modules}

## Part 4: Optimizing a routed application

A fully functional application with many routed modules can take a long time to load.
You can optimize your application's startup time by loading routed feature modules only on request.
Asynchronous routing, called [lazy loading](guide/glossary#lazy-loading "Definition of lazy loading"), has multiple benefits.

* For all users, application startup is faster and the intial bundle is smaller.
* For users who don't ever need a particular feature, the additional load time is never encountered.
* You can continue expanding lazy-loaded feature areas without increasing the size of the initial load bundle.

In addition to setting up lazy loading, you can improve the user experience by [pre-loading features in the background](#preloading).

When your URLs change as your app develops, you can ease maintenance by setting up [redirects](#redirects-advanced) in the route configuration.


{@a lazy-loading-route-config}

### Configure a lazy-loaded route

The sample application, organized into routed modules&mdash;`AppModule`,
`HeroesModule`, `AdminModule` and `CrisisCenterModule`&mdash;is a natural candidate for lazy loading.

Some modules, like `AppModule`, must be loaded from the start.
Other feature modules can and should be lazy loaded.
The `AdminModule` in particular is needed only by a few authorized users,
so it makes sense to load it only when requested by those users.

To set up lazy loading for the `AdminModule`, use the following steps.

1. Change the `admin` path in the `admin-routing.module.ts` from `'admin'` to an empty string, `''`, creating an empty path.

   Use empty path routes to group routes together without adding any additional path segments to the URL. Users will still visit `/admin` and the `AdminComponent` still serves as the Routing Component containing child routes.

2. Open the `AppRoutingModule` and add a new `admin` route to its `appRoutes` array. Give it a `loadChildren` property instead of a `children` property.

   The `loadChildren` property takes a function that returns a promise using the browser's built-in syntax for lazy loading code using dynamic imports `import('...')`.
   The path is the location of the `AdminModule` (relative to the app root).

   After the code is requested and loaded, the `Promise` resolves an object that contains the `NgModule`, in this case the `AdminModule`.

   <code-example path="router/src/app/app-routing.module.5.ts" region="admin-1" header="app-routing.module.ts (load children)"></code-example>

<div class="alert is-important">

When using absolute paths, the `NgModule` file location must begin with `src/app` in order to resolve correctly. For custom [path mapping with absolute paths](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping), you must configure the `baseUrl` and `paths` properties in the project's TypeScript configuration file, `tsconfig.json`.

</div>

   When the router navigates to this route, it uses the `loadChildren` string to dynamically load the `AdminModule`.
   Then it adds the `AdminModule` routes to its current route configuration.
   Finally, it loads the requested route to the destination admin component.

   The lazy loading and re-configuration happen just once, when the route is first requested; the module and routes are available immediately for subsequent requests.

<div class="alert is-helpful">

Angular provides a built-in module loader that supports SystemJS to load modules asynchronously. If you were
using another bundling tool, such as Webpack, you would use the Webpack mechanism for asynchronously loading modules.

</div>

3. Finally, detach the admin feature set from the main application. The root `AppModule` must neither load nor reference the `AdminModule` or its files.

   * In `app.module.ts`, remove the `AdminModule` import statement from the top of the file.
   * Remove the `AdminModule` from the NgModule's `imports` array.

{@a can-load-guard}

### Guard unauthorized loading of feature modules

You're already protecting the `AdminModule` with a `CanActivate` guard that prevents unauthorized users from accessing the admin feature area.
It redirects to the login page if the user is not authorized.

At this point, however, the router is still loading the `AdminModule` even if the user can't visit any of its components.
It would be more efficient to only load the `AdminModule` if the user is already logged in.
To accomplish this, add a `CanLoad` guard that only loads the `AdminModule` once the user is logged in _and_ attempts to access the admin feature area.

The existing `AuthGuard` already has the essential logic in its `checkLogin()` method to support the `CanLoad` guard.

1. Open `auth.guard.ts`.

2. Import the `CanLoad` interface from `@angular/router`.

3. Add it to the `AuthGuard` class's `implements` list.

4. Implement `canLoad()` as follows:

   <code-example path="router/src/app/auth/auth.guard.ts" header="src/app/auth/auth.guard.ts (CanLoad guard)" region="canLoad"></code-example>

   * The router sets the `canLoad()` method's `route` parameter to the intended destination URL.
   * The `checkLogin()` method redirects to that URL once the user has logged in.

5. Import the `AuthGuard` into the `AppRoutingModule` and add the `AuthGuard` to the `canLoad`
array property for the `admin` route.

The completed admin route looks like this:

<code-example path="router/src/app/app-routing.module.5.ts" region="admin" header="app-routing.module.ts (lazy admin route)"></code-example>

{@a preloading}

### Preload features in the background

In addition to lazy-loading modules on demand, you can load modules asynchronously with preloading.
Preloading allows you to load modules in the background so that the data is ready to render when the user activates a particular route.

For example, the Crisis Center is not the first view that a user sees.
By default, the Heroes are the first view.
For the smallest initial payload and fastest launch time, you should eagerly load the `AppModule` and the `HeroesModule`.

You could lazy load the Crisis Center, as you have done with the Admin module, but unlike the administrative view, it's likely that the user will visit the Crisis Center within minutes of launching the app.
For the best performance, you can launch with just the `AppModule` and the `HeroesModule` loaded and then, almost immediately, load the `CrisisCenterModule` in the background.
By the time the user navigates to the Crisis Center, its module is loaded and ready.

{@a how-preloading}

### How preloading works

After each successful navigation, the router looks in its configuration for an unloaded module that it can preload.
Whether it preloads a module, and which modules it preloads, depends upon the preload strategy.

The `Router` offers two predefined preloading strategies:

* No preloading, which is the default. Lazy-loaded feature areas are still loaded on-demand.
* Preloading of all lazy-loaded feature areas.

The following section guides you through updating the `CrisisCenterModule` to load lazily by default and use the `PreloadAllModules` strategy to load all lazy-loaded modules.

The `Router` also supports [custom preloading strategies](#custom-preloading) for fine control over which modules to preload and when.

{@a lazy-load-crisis-center}

### Lazy load the crisis center

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

To enable preloading of all lazy loaded modules, use the following steps.

1. Import the `PreloadAllModules` token from the Angular router package.

2. Pass a second argument in the `RouterModule.forRoot()` method, an object for additional configuration options. The `preloadingStrategy` is one of those options.

3. Add the `PreloadAllModules` token to the `forRoot()` call:

<code-example path="router/src/app/app-routing.module.6.ts" header="src/app/app-routing.module.ts (preload all)" region="forRoot"></code-example>

This configures the `Router` preloader to immediately load all lazy loaded routes (routes with a `loadChildren` property).

When you visit `http://localhost:4200`, the `/heroes` route loads immediately upon launch and the router starts loading the `CrisisCenterModule` right after the `HeroesModule` loads.

{@a preload-canload}

#### Blocking pre-load

Currently, the `AdminModule` does not preload because `CanLoad` is blocking it.
You added a `CanLoad` guard to the route in the `AdminModule` a few steps back to block loading of that module until the user is authorized.
That `CanLoad` guard takes precedence over the preload strategy.
The `PreloadAllModules` strategy does not load feature areas protected by a [CanLoad](#can-load-guard) guard.

If you want to preload a module as well as guard against unauthorized access, remove the `canLoad()` guard method and rely on the [canActivate()](#can-activate-guard) guard alone.

{@a custom-preloading}

### Custom preloading strategy

Preloading every lazy loaded module works well in many situations.
However, in consideration of things such as low bandwidth and user metrics, you can use a custom preloading strategy for specific feature modules.

This section guides you through adding a custom strategy that only preloads routes whose `data.preload` flag is set to `true`.
Recall that you can add anything to the `data` property of a route.

1. Set the `data.preload` flag in the `crisis-center` route in the `AppRoutingModule`.

   <code-example path="router/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts (route data preload)" region="preload-v2"></code-example>

1. Generate a new `SelectivePreloadingStrategy` service.

   <code-example language="none" class="code-shell">
     ng generate service selective-preloading-strategy
   </code-example>

1. Replace the contents of `selective-preloading-strategy.service.ts` with the following:

   <code-example path="router/src/app/selective-preloading-strategy.service.ts" header="src/app/selective-preloading-strategy.service.ts"></code-example>

   `SelectivePreloadingStrategyService` implements the `PreloadingStrategy`, which has one method, `preload()`. The router calls the `preload()` method with two arguments:

   * The route to consider.
   * A loader function that can load the routed module asynchronously.

   An implementation of `preload` must return an `Observable`.

   * If the route does preload, it returns the observable returned by calling the loader function.
   * If the route does not preload, it returns an `Observable` of `null`.

   In this sample, the  `preload()` method loads the route if the route's `data.preload` flag is truthy.
   As a side-effect, `SelectivePreloadingStrategyService` logs the `path` of a selected route in its public `preloadedModules` array.

Before you extend the `AdminDashboardComponent` to inject this service and display its `preloadedModules` array, make a few changes to the `AppRoutingModule`.

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

{@a redirects-advanced}
{@a url-refactor}

### Migrate URLs with redirects

You've set up the routes for navigating around your application and used navigation imperatively and declaratively.
You've set up links and navigation to `/heroes` and `/hero/:id` from the `HeroListComponent` and `HeroDetailComponent` components.

In any application, however, requirements change over time. Suppose you need those links to `heroes` become `superheroes`. You would still want the previous URLs to navigate correctly. Refactoring like this is time consuming and error prone.

For easier maintenance, use redirects to update every link in your application.
The `Router` checks for redirects in your configuration before navigating, so each redirect is triggered when needed.

This section guides you through changing  `/heroes` to `/superheroes`, and migrating the `Hero` routes to new URLs.

1.  To support the changed terminology, add redirects from the old routes to the new routes in the `heroes-routing.module`.

   <code-example path="router/src/app/heroes/heroes-routing.module.ts" header="src/app/heroes/heroes-routing.module.ts (heroes redirects)"></code-example>

   Notice two different types of redirects.

   * The first change is from  `/heroes` to `/superheroes` without any parameters.

   * The second change is from `/hero/:id` to `/superhero/:id`, which includes the `:id` route parameter.

   Router redirects also use powerful pattern-matching, so the `Router` inspects the URL and replaces route parameters in the `path` with their appropriate destination.

<div class="alert is-helpful">

The `Router` also supports [query parameters](#query-parameters) and the [fragment](#fragment) when using redirects.

* When using absolute redirects, the `Router` will use the query parameters and the fragment from the `redirectTo` in the route config.
* When using relative redirects, the `Router` use the query params and the fragment from the source URL.

</div>

2. Currently, the empty path route redirects to `/heroes`, which redirects to `/superheroes`.
This won't work because the `Router` handles redirects once at each level of routing configuration.
This prevents chaining of redirects, which can lead to endless redirect loops.

   Instead, update the empty path route in `app-routing.module.ts` to redirect to `/superheroes`.

   <code-example path="router/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts (superheroes redirect)"></code-example>

3. A `routerLink` isn't tied to route configuration, so update the associated router links to remain active when the new route is active. Update the `app.component.ts` template for the `/heroes` `routerLink`.

   <code-example path="router/src/app/app.component.html" header="src/app/app.component.html (superheroes active routerLink)"></code-example>

4. Update the `goToHeroes()` method in the `hero-detail.component.ts` to navigate back to `/superheroes` with the optional route parameters.

   <code-example path="router/src/app/heroes/hero-detail/hero-detail.component.ts" region="redirect" header="src/app/heroes/hero-detail/hero-detail.component.ts (goToHeroes)"></code-example>

With these redirects in place, all previous routes now point to their new destinations and both URLs still function as intended.

## Next steps

For more information about routing, see the following topics:

* [In-app Routing and Navigation guide](guide/router)
* [Router API reference](api/router)
