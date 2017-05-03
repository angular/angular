# Milestone 1: Router Overview

The browser is a familiar model of application navigation:

* Enter a URL in the address bar and the browser navigates to a corresponding page.
* Click links on the page and the browser navigates to a new page.
* Click the browser's back and forward buttons and the browser navigates
  backward and forward through the history of pages you've seen.

The Angular `Router` ("the router") borrows from this model.
It can interpret a browser URL as an instruction to navigate to a client-generated view.
It can pass optional parameters along to the supporting view component that help it decide what specific content to present.
You can bind the router to links on a page and it will navigate to
the appropriate application view when the user clicks a link.
You can navigate imperatively when the user clicks a button, selects from a drop box,
or in response to some other stimulus from any source. And the router logs activity
in the browser's history journal so the back and forward buttons work as well.


An introduction to a few core router concepts will help orient you to the details that follow in later pages.


## *&lt;base href>*

Most routing applications should add a `<base>` element to the `index.html` as the first child in the  `<head>` tag
to tell the router how to compose navigation URLs.

If the `app` folder is the application root, as it is for the sample application,
set the `href` value *exactly* as shown here.


<code-example path="router/src/index.html" linenums="false" title="src/index.html (base-href)" region="base-href">

</code-example>



{@a basics-router-imports}


## Router imports

The Angular Router is an optional service that presents a particular component view for a given URL.
It is not part of the Angular core. It is in its own library package, `@angular/router`.
Import what you need from it as you would from any other Angular package.


<code-example path="router/src/app/app.module.1.ts" linenums="false" title="src/app/app.module.ts (import)" region="import-router">

</code-example>



<div class="l-sub-section">



You can learn about more options in the [appendix](guide/router-appendix#browser-url-styles).


</div>



{@a basics-config}


## Configuration

A routed Angular application has one singleton instance of the *`Router`* service.
When the browser's URL changes, that router looks for a corresponding `Route`
from which it can determine the component to display.

A router has no routes until you configure it.
The following example creates four route definitions, configures the router via the `RouterModule.forRoot` method,
and adds the result to the `AppModule`'s `imports` array.


<code-example path="router/src/app/app.module.0.ts" linenums="false" title="src/app/app.module.ts (excerpt)">

</code-example>

{@a example-config}

The `appRoutes` array of *routes* describes how to navigate.
Pass it to the `RouterModule.forRoot` method in the module `imports` to configure the router.

Each `Route` maps a URL `path` to a component.
There are _no leading slashes_ in the _path_.
The router parses and builds the final URL for you,
allowing you to use both relative and absolute paths when navigating between application views.

The `:id` in the second route is a token for a route parameter. In a URL such as `/hero/42`, "42"
is the value of the `id` parameter. The corresponding `HeroDetailComponent`
will use that value to find and present the hero whose `id` is 42.
You'll learn more about route parameters later in this guide.

The `data` property in the third route is a place to store arbitrary data associated with
this specific route. The data property is accessible within each activated route. Use it to store
items such as page titles, breadcrumb text, and other read-only, _static_ data.
You'll use the [resolve guard](guide/router-6#resolve-guard) to retrieve _dynamic_ data later in the guide.

The `empty path` in the fourth route represents the default path for the application,
the place to go when the path in the URL is empty, as it typically is at the start.
This default route redirects to the route for the `/heroes` URL and, therefore, will display the `HeroesListComponent`.

The `**` path in the last route is a **wildcard**. The router will select this route
if the requested URL doesn't match any paths for routes defined earlier in the configuration.
This is useful for displaying a "404 - Not Found" page or redirecting to another route.

**The order of the routes in the configuration matters** and this is by design. The router uses a **first-match wins**
strategy when matching routes, so more specific routes should be placed above less specific routes.
In the configuration above, routes with a static path are listed first, followed by an empty path route,
that matches the default route.
The wildcard route comes last because it matches _every URL_ and should be selected _only_ if no other routes are matched first.


{@a basics-router-outlet}


## Router outlet

Given this configuration, when the browser URL for this application becomes `/heroes`,
the router matches that URL to the route path `/heroes` and displays the `HeroListComponent`
_after_ a `RouterOutlet` that you've placed in the host view's HTML.


<code-example language="html">
  &lt;router-outlet>&lt;/router-outlet>
  &lt;!-- Routed views go here -->

</code-example>



{@a basics-router-links}


## Router links

Now you have routes configured and a place to render them, but
how do you navigate? The URL could arrive directly from the browser address bar.
But most of the time you navigate as a result of some user action such as the click of
an anchor tag.

Consider the following template:


<code-example path="router/src/app/app.component.1.ts" linenums="false" title="src/app/app.component.ts (template)" region="template">

</code-example>



The `RouterLink` directives on the anchor tags give the router control over those elements.
The navigation paths are fixed, so you can assign a string to the `routerLink` (a "one-time" binding).

Had the navigation path been more dynamic, you could have bound to a template expression that
returned an array of route link parameters (the _link parameters array_).
The router resolves that array into a complete URL.

The **`RouterLinkActive`** directive on each anchor tag helps visually distinguish the anchor for the currently selected "active" route.
The router adds the `active` CSS class to the element when the associated *RouterLink* becomes active.
You can add this directive to the anchor or to its parent element.


{@a basics-router-state}


## Router state

After the end of each successful navigation lifecycle, the router builds a tree of `ActivatedRoute` objects
that make up the current state of the router. You can access the current `RouterState` from anywhere in the
application using the `Router` service and the `routerState` property.

Each `ActivatedRoute` in the `RouterState` provides methods to traverse up and down the route tree
to get information from parent, child and sibling routes.


{@a basics-summary}


## Summary

The application has a configured router.
The shell component has a `RouterOutlet` where it can display views produced by the router.
It has `RouterLink`s that users can click to navigate via the router.

Here are the key `Router` terms and their meanings:

<style>
  td, th {vertical-align: top}
</style>



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
      A separate Angular module that provides the necessary service providers
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
      The directive for binding a clickable HTML element to
      a route. Clicking an element with a <code>routerLink</code> directive
      that is bound to a <i>string</i> or a <i>link parameters array</i> triggers a navigation.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterLinkActive</code>
    </td>

    <td>
      The directive for adding/removing classes from an HTML element when an associated
      <code>routerLink</code> contained on or inside the element becomes active/inactive.
    </td>

  </tr>

  <tr>

    <td>
      <code>ActivatedRoute</code>
    </td>

    <td>
      A service that is provided to each route component that contains route specific
      information such as route parameters, static data, resolve data, global query params, and the global fragment.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterState</code>
    </td>

    <td>
      The current state of the router including a tree of the currently activated
      routes together with convenience methods for traversing the route tree.
    </td>

  </tr>

  <tr>

    <td>
      <b><i>Link parameters array</i></b>
    </td>

    <td>
      An array that the router interprets as a routing instruction.
      You can bind that array to a <code>RouterLink</code> or pass the array as an argument to
      the <code>Router.navigate</code> method.
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




{@a sample-app-intro}


## The sample application

This guide describes development of a multi-page routed sample application.
Along the way, it highlights design decisions and describes key features of the router such as:

* Organizing the application features into modules.
* Navigating to a component (*Heroes* link to "Heroes List").
* Including a route parameter (passing the Hero `id` while routing to the "Hero Detail").
* Child routes (the *Crisis Center* has its own routes).
* The `CanActivate` guard (checking route access).
* The `CanActivateChild` guard (checking child route access).
* The `CanDeactivate` guard (ask permission to discard unsaved changes).
* The `Resolve` guard (pre-fetching route data).
* Lazy loading feature modules.
* The `CanLoad` guard (check before loading feature module assets).


## The sample application in action

Imagine an application that helps the _Hero Employment Agency_ run its business.
Heroes need work and the agency finds crises for them to solve.

The application has three main feature areas:

1. A *Crisis Center* for maintaining the list of crises for assignment to heroes.
1. A *Heroes* area for maintaining the list of heroes employed by the agency.
1. An *Admin* area to manage the list of crises and heroes.

Try it by clicking on this <live-example title="Hero Employment Agency Live Example">live example link</live-example>.

Once the app warms up, you'll see a row of navigation buttons
and the *Heroes* view with its list of heroes.


<figure class='image-display'>
  <img src='content/images/guide/router/hero-list.png' alt="Hero List" width="250"></img>
</figure>



Select one hero and the app takes you to a hero editing screen.

<figure class='image-display'>
  <img src='content/images/guide/router/hero-detail.png' alt="Crisis Center Detail" width="250"></img>
</figure>



Alter the name.
Click the "Back" button and the app returns to the heroes list which displays the changed hero name.
Notice that the name change took effect immediately.

Had you clicked the browser's back button instead of the "Back" button,
the app would have returned you to the heroes list as well.
Angular app navigation updates the browser history as normal web navigation does.

Now click the *Crisis Center* link for a list of ongoing crises.


<figure class='image-display'>
  <img src='content/images/guide/router/crisis-center-list.png' alt="Crisis Center List" width="250"></img>
</figure>



Select a crisis and the application takes you to a crisis editing screen.
The _Crisis Detail_ appears in a child view on the same page, beneath the list.

Alter the name of a crisis.
Notice that the corresponding name in the crisis list does _not_ change.


<figure class='image-display'>
  <img src='content/images/guide/router/crisis-center-detail.png' alt="Crisis Center Detail" width="250"></img>
</figure>



Unlike *Hero Detail*, which updates as you type,
*Crisis Detail* changes are temporary until you either save or discard them by pressing the "Save" or "Cancel" buttons.
Both buttons navigate back to the *Crisis Center* and its list of crises.

***Do not click either button yet***.
Click the browser back button or the "Heroes" link instead.

Up pops a dialog box.


<figure class='image-display'>
  <img src='content/images/guide/router/confirm-dialog.png' alt="Confirm Dialog" width="250"></img>
</figure>



You can say "OK" and lose your changes or click "Cancel" and continue editing.

Behind this behavior is the router's `CanDeactivate` guard.
The guard gives you a chance to clean-up or ask the user's permission before navigating away from the current view.

The `Admin` and `Login` buttons illustrate other router capabilities to be covered later in the guide.
This short introduction will do for now.

## Next step 

Create your [first routed app](guide/router-2).
