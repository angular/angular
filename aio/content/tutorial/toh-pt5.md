# Routing

There are new requirements for the Tour of Heroes app:

* Add a *Dashboard* view.
* Add the ability to navigate between the *Heroes* and *Dashboard* views.
* When users click a hero name in either view, navigate to a detail view of the selected hero.
* When users click a *deep link* in an email, open the detail view for a particular hero.

When you’re done, users will be able to navigate the app like this:

<figure>

  <img src='generated/images/guide/toh/nav-diagram.png' alt="View navigations">

</figure>

## Add the `AppRoutingModule`

An Angular best practice is to load and configure the router in a separate, top-level module
that is dedicated to routing and imported by the root `AppModule`.

By convention, the module class name is `AppRoutingModule` and it belongs in the `app-routing.module.ts` in the `src/app` folder.

Use the CLI to generate it.

<code-example language="sh" class="code-shell">
  ng generate module app-routing --flat --module=app
</code-example>

<div class="l-sub-section">

`--flat` puts the file in `src/app` instead of its own folder.<br>
`--module=app` tells the CLI to register it in the `imports` array of the `AppModule`.
</div>

The generated file looks like this:

<code-example path="toh-pt5/src/app/app-routing.module.0.ts" 
  title="src/app/app-routing.module.ts (generated)">
</code-example>

You generally don't declare components in a routing module so you can delete the
`@NgModule.declarations` array and delete `CommonModule` references too.

You'll configure the router with `Routes` in the `RouterModule`
so import those two symbols from the `@angular/router` library.

Add an `@NgModule.exports` array with `RouterModule` in it.
Exporting `RouterModule` makes router directives available for use
in the `AppModule` components that will need them.

`AppRoutingModule` looks like this now:

<code-example path="toh-pt5/src/app/app-routing.module.ts" 
  region="v1"
  title="src/app/app-routing.module.ts (v1)">
</code-example>

### Add routes

*Routes* tell the router which view to display when a user clicks a link or
pastes a URL into the browser address bar.

A typical Angular `Route` has two properties:

1. `path`: a string that matches the URL in the browser address bar.
1. `component`: the component that the router should create when navigating to this route.

You intend to navigate to the `HeroesComponent` when the URL is something like `localhost:4200/heroes`.

Import the `HeroesComponent` so you can reference it in a `Route`.
Then define an array of routes with a single `route` to that component.

<code-example path="toh-pt5/src/app/app-routing.module.ts" 
  region="heroes-route">
</code-example>

Once you've finished setting up, the router will match that URL to `path: 'heroes'` 
and display the `HeroesComponent`.

### _RouterModule.forRoot()_

You first must initialize the router and start it listening for browser location changes.

Add `RouterModule` to the `@NgModule.imports` array and 
configure it with the `routes` in one step by calling 
`RouterModule.forRoot()` _within_ the `imports` array, like this:

<code-example path="toh-pt5/src/app/app-routing.module.ts" 
  region="ngmodule-imports">
</code-example>

<div class="l-sub-section">

  The method is called `forRoot()` because you configure the router at the application's root level.
  The `forRoot()` method supplies the service providers and directives needed for routing, 
  and performs the initial navigation based on the current browser URL.

</div>

## Add _RouterOutlet_

Open the `AppComponent` template replace the `<app-heroes>` element with a `<router-outlet>` element.

<code-example path="toh-pt5/src/app/app.component.html" 
  region="outlet"
  title="src/app/app.component.html (router-outlet)">
</code-example>

You removed `<app-heroes>` because you will only display the `HeroesComponent` when the user navigates to it.

The `<router-outlet>` tells the router where to display routed views.

<div class="l-sub-section">

The `RouterOutlet` is one of the router directives that became available to the `AppComponent`
because `AppModule` imports `AppRoutingModule` which exported `RouterModule`.

</div>

#### Try it

You should still be running with this CLI command.

<code-example language="sh" class="code-shell">
  ng serve
</code-example>

The browser should refresh and display the app title but not the list of heroes.

Look at the browser's address bar. 
The URL ends in `/`.
The route path to `HeroesComponent` is `/heroes`.

Append `/heroes` to the URL in the browser address bar.
You should see the familiar heroes master/detail view.

{@a routerlink}

## Add a navigation link (`routerLink`)

Users shouldn't have to paste a route URL into the address bar. 
They should be able to click a link to navigate.

Add a `<nav>` element and, within that, an anchor element that, when clicked, 
triggers navigation to the `HeroesComponent`.
The revised `AppComponent` template looks like this:

<code-example 
  path="toh-pt5/src/app/app.component.html" 
  region="heroes"
  title="src/app/app.component.html (heroes RouterLink)">
</code-example>

A [`routerLink` attribute](#routerlink) is set to `"/heroes"`,
the string that the router matches to the route to `HeroesComponent`.
The `routerLink` is the selector for the [`RouterLink` directive](#routerlink)
that turns user clicks into router navigations.
It's another of the public directives in the `RouterModule`.

The browser refreshes and displays the app title and heroes link, 
but not the heroes list.

Click the link. 
The address bar updates to `/heroes` and the list of heroes appears.

<div class="l-sub-section">

Make this and future navigation links look better by adding private CSS styles to `app.component.css`
as listed in the [final code review](#appcomponent) below.

</div>


## Add a dashboard view

Routing makes more sense when there are multiple views.
So far there's only the heroes view. 

Add a `DashboardComponent` using the CLI:

<code-example language="sh" class="code-shell">
  ng generate component dashboard
</code-example>

The CLI generates the files for the `DashboardComponent` and declares it in `AppModule`.

Replace the default file content in these three files as follows and then return for a little discussion:

<code-tabs>
  <code-pane 
    title="src/app/dashboard/dashboard.component.html" path="toh-pt5/src/app/dashboard/dashboard.component.1.html">
  </code-pane>

  <code-pane 
    title="src/app/dashboard/dashboard.component.ts" path="toh-pt5/src/app/dashboard/dashboard.component.ts">
  </code-pane>

  <code-pane 
    title="src/app/dashboard/dashboard.component.css" path="toh-pt5/src/app/dashboard/dashboard.component.css">
  </code-pane>
</code-tabs>

The  _template_ presents a grid of hero name links.

* The `*ngFor` repeater creates as many links as are in the component's `heroes` array.
* The links are styled as colored blocks by the `dashboard.component.css`.
* The links don't go anywhere yet but [they will shortly](#hero-details).

The _class_ is similar to the `HeroesComponent` class.
* It defines a `heroes` array property.
* The constructor expects Angular to inject the `HeroService` into a private `heroService` property.
* The `ngOnInit()` lifecycle hook calls `getHeroes`.

This `getHeroes` reduces the number of heroes displayed to four
(2nd, 3rd, 4th, and 5th).

<code-example path="toh-pt5/src/app/dashboard/dashboard.component.ts" region="getHeroes">
</code-example>

### Add the dashboard route

To navigate to the dashboard, the router needs an appropriate route.

Import the `DashboardComponent` in the `AppRoutingModule`.

<code-example 
  path="toh-pt5/src/app/app-routing.module.ts" 
  region="import-dashboard" 
  title="src/app/app-routing.module.ts (import DashboardComponent)">
</code-example>

Add a route to the `AppRoutingModule.routes` array that matches a path to the `DashboardComponent`.

<code-example 
  path="toh-pt5/src/app/app-routing.module.ts" 
  region="dashboard-route">
</code-example>

### Add a default route

When the app starts, the browsers address bar points to the web site's root.
That doesn't match any existing route so the router doesn't navigate anywhere.
The space below the `<router-outlet>` is blank.

To make the app navigate to the dashboard automatically, add the following
route to the `AppRoutingModule.Routes` array.

<code-example path="toh-pt5/src/app/app-routing.module.ts" region="redirect-route">
</code-example>

This route redirects a URL that fully matches the empty path to the route whose path is `'/dashboard'`.

After the browser refreshes, the router loads the `DashboardComponent`
and the browser address bar shows the `/dashboard` URL.

### Add dashboard link to the shell

The user should be able to navigate back and forth between the
`DashboardComponent` and the `HeroesComponent` by clicking links in the
navigation area near the top of the page.

Add a dashboard navigation link to the `AppComponent` shell template, just above the *Heroes* link.

<code-example path="toh-pt5/src/app/app.component.html" title="src/app/app.component.html">
</code-example>

After the browser refreshes you can navigate freely between the two views by clicking the links.

{@a hero-details}
## Navigating to hero details

The `HeroDetailsComponent` displays details of a selected hero.
At the moment the `HeroDetailsComponent` is only visible at the bottom of the `HeroesComponent`

The user should be able to get to these details in three ways.

1. By clicking a hero in the dashboard.
1. By clicking a hero in the heroes list.
1. By pasting a "deep link" URL into the browser address bar that identifies the hero to display.

In this section, you'll enable navigation to the `HeroDetailsComponent`
and liberate it from the `HeroesComponent`.

### Delete _hero details_ from `HeroesComponent`

When the user clicks a hero item in the `HeroesComponent`,
the app should navigate to the `HeroDetailComponent`,
replacing the heroes list view with the hero detail view.
The heroes list view should no longer show hero details as it does now.

Open the `HeroesComponent` template (`heroes/heroes.component.html`) and
delete the `<app-hero-detail>` element from the bottom.

Clicking a hero item now does nothing. 
You'll [fix that shortly](#heroes-component-links) after you enable routing to the `HeroDetailComponent`.

### Add a _hero detail_ route

A URL like `~/detail/11` would be a good URL for navigating to the *Hero Detail* view of the hero whose `id` is `11`. 

Open `AppRoutingModule` and import `HeroDetailComponent`.

<code-example 
  path="toh-pt5/src/app/app-routing.module.ts" 
  region="import-herodetail" 
  title="src/app/app-routing.module.ts (import HeroDetailComponent)">
</code-example>

Then add a _parameterized_ route to the `AppRoutingModule.routes` array that matches the path pattern to the _hero detail_ view.

<code-example 
  path="toh-pt5/src/app/app-routing.module.ts" 
  region="detail-route">
</code-example>

The colon (:) in the `path` indicates that `:id` is a placeholder for a specific hero `id`.

At this point, all application routes are in place.

<code-example 
  path="toh-pt5/src/app/app-routing.module.ts" 
  region="routes" 
  title="src/app/app-routing.module.ts (all routes)">
</code-example>

### `DashboardComponent` hero links

The `DashboardComponent` hero links do nothing at the moment.

Now that the router has a route to `HeroDetailComponent`,
fix the dashboard hero links to navigate via the _parameterized_ dashboard route.

<code-example 
  path="toh-pt5/src/app/dashboard/dashboard.component.html" 
  region="click" 
  title="src/app/dashboard/dashboard.component.html (hero links)">
</code-example>

You're using Angular [interpolation binding](guide/template-syntax#interpolation) within the `*ngFor` repeater 
to insert the current interation's `hero.id` into each 
[`routerLink`](#routerlink).

{@a heroes-component-links}
### `HeroesComponent` hero links

The hero items in the `HeroesComponent` are `<li>` elements whose click events
are bound to the component's `onSelect()` method.

<code-example 
  path="toh-pt4/src/app/heroes/heroes.component.html" 
  region="list" 
  title="src/app/heroes/heroes.component.html (list with onSelect)">
</code-example>

Strip the `<li>` back to just its `*ngFor`,
wrap the badge and name in an anchor element (`<a>`),
and add a `routerLink` attribute to the anchor that 
is the same as in the dashboard template

<code-example 
  path="toh-pt5/src/app/heroes/heroes.component.html" 
  region="list" 
  title="src/app/heroes/heroes.component.html (list with links)">
</code-example>

You'll have to fix the private stylesheet (`heroes.component.css`) to make
the list look as it did before.
Revised styles are in the [final code review](#heroescomponent) at the bottom of this guide.

#### Remove dead code (optional)

While the `HeroesComponent` class still works, 
the `onSelect()` method and `selectedHero` property are no longer used.

It's nice to tidy up and you'll be grateful to yourself later.
Here's the class after pruning away the dead code.

<code-example 
  path="toh-pt5/src/app/heroes/heroes.component.ts"
  region="class" 
  title="src/app/heroes/heroes.component.ts (cleaned up)" linenums="false">
</code-example>

## Routable *HeroDetailComponent*

Previously, the parent `HeroesComponent` set the `HeroDetailComponent.hero`
property and the `HeroDetailComponent` displayed the hero.

`HeroesComponent` doesn't do that anymore.
Now the router creates the `HeroDetailComponent` in response to a URL such as `~/detail/11`.

The `HeroDetailComponent` needs a new way to obtain the _hero-to-display_.

* Get the route that created it, 
* Extract the `id` from the route
* Acquire the hero with that `id` from the server via the `HeroService`

Add the following imports:

<code-example 
  path="toh-pt5/src/app/hero-detail/hero-detail.component.ts" 
  region="added-imports" 
  title="src/app/hero-detail/hero-detail.component.ts">
</code-example>

{@a hero-detail-ctor}

Inject the `ActivatedRoute`, `HeroService`, and `Location` services
into the constructor, saving their values in private fields:

<code-example 
  path="toh-pt5/src/app/hero-detail/hero-detail.component.ts" region="ctor">
</code-example>

The [`ActivatedRoute`](api/router/ActivatedRoute) holds information about the route to this instance of the `HeroDetailComponent`.
This component is interested in the route's bag of parameters extracted from the URL.
The _"id"_ parameter is the `id` of the hero to display.

The [`HeroService`](tutorial/toh-pt4) gets hero data from the remote server
and this component will use it to get the _hero-to-display_.

The [`location`](api/common/Location) is an Angular service for interacting with the browser.
You'll use it [later](#goback) to navigate back to the view that navigated here.

### Extract the _id_ route parameter

In the `ngOnInit()` [lifecycle hook](guide/lifecycle-hooks#oninit)
call `getHero()` and define it as follows.

<code-example 
  path="toh-pt5/src/app/hero-detail/hero-detail.component.ts" region="ngOnInit">
</code-example>

The `route.snapshot` is a static image of the route information shortly after the component was created.

The `paramMap` is a dictionary of route parameter values extracted from the URL.
The `"id"` key returns the `id` of the hero to fetch.

Route parameters are always strings.
The JavaScript (+) operator converts the string to a number,
which is what a hero `id` should be.

The browser refreshes and the app crashes with a compiler error.
`HeroService` doesn't have a `getHero()` method.
Add it now.

### Add `HeroService.getHero()`

Open `HeroService` and add this `getHero()` method

<code-example 
  path="toh-pt5/src/app/hero.service.ts" 
  region="getHero" 
  title="src/app/hero.service.ts (getHero)">
</code-example>

<div class="alert is-important">

Note the backticks ( &#96; ) that 
define a JavaScript 
[_template literal_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) for embedding the `id`.
</div>

Like [`getHeroes()`](tutorial/toh-pt4#observable-heroservice),
`getHero()` has an asynchronous signature.
It returns a _mock hero_ as an `Observable`, using the RxJS `of()` function.

You'll be able to re-implement `getHero()` as a real `Http` request
without having to change the `HeroDetailComponent` that calls it.

#### Try it

The browser refreshes and the app is working again.
You can click a hero in the dashboard or in the heroes list and navigate to that hero's detail view.

If you paste `localhost:4200/detail/11` in the browser address bar,
the router navigates to the detail view for the hero with `id: 11`,  "Mr. Nice".

{@a goback}

### Find the way back

By clicking the browser's back button, 
you can go back to the hero list or dashboard view,
depending upon which sent you to the detail view.

It would be nice to have a button on the `HeroDetail` view that can do that.

Add a *go back* button to the bottom of the component template and bind it
to the component's `goBack()` method.

<code-example 
  path="toh-pt5/src/app/hero-detail/hero-detail.component.html" 
  region="back-button"
  title="src/app/hero-detail/hero-detail.component.html (back button)">
</code-example>

Add a `goBack()` _method_ to the component class that navigates backward one step 
in the browser's history stack
using the `Location` service that you [injected previously](#hero-detail-ctor).

<code-example path="toh-pt5/src/app/hero-detail/hero-detail.component.ts" region="goBack" title="src/app/hero-detail/hero-detail.component.ts (goBack)">

</code-example>


Refresh the browser and start clicking.
Users can navigate around the app, from the dashboard to hero details and back,
from heroes list to the mini detail to the hero details and back to the heroes again.

You've met all of the navigational requirements that propelled this page.

## Final code review

Here are the code files discussed on this page and your app should look like this <live-example></live-example>.

{@a approutingmodule}
{@a appmodule}
#### _AppRoutingModule_, _AppModule_, and _HeroService_

<code-tabs>
  <code-pane 
    title="src/app/app-routing.module.ts" 
    path="toh-pt5/src/app/app-routing.module.ts">
  </code-pane>
  <code-pane 
    title="src/app/app.module.ts" 
    path="toh-pt5/src/app/app.module.ts">
  </code-pane>
  <code-pane 
    title="src/app/hero.service.ts" 
    path="toh-pt5/src/app/hero.service.ts">
  </code-pane>
</code-tabs>

{@a appcomponent}
#### _AppComponent_

<code-tabs>
  <code-pane 
    title="src/app/app.component.html"
    path="toh-pt5/src/app/app.component.html">
  </code-pane>

  <code-pane 
    title="src/app/app.component.css"
    path="toh-pt5/src/app/app.component.css">
  </code-pane>
</code-tabs>

{@a dashboardcomponent}
#### _DashboardComponent_

<code-tabs>
  <code-pane 
    title="src/app/dashboard/dashboard.component.html" path="toh-pt5/src/app/dashboard/dashboard.component.html">
  </code-pane>

  <code-pane 
    title="src/app/dashboard/dashboard.component.ts" path="toh-pt5/src/app/dashboard/dashboard.component.ts">
  </code-pane>

  <code-pane 
    title="src/app/dashboard/dashboard.component.css" path="toh-pt5/src/app/dashboard/dashboard.component.css">
  </code-pane>
</code-tabs>

{@a heroescomponent}
#### _HeroesComponent_

<code-tabs>
  <code-pane 
    title="src/app/heroes/heroes.component.html" path="toh-pt5/src/app/heroes/heroes.component.html">
  </code-pane>

  <code-pane 
    title="src/app/heroes/heroes.component.ts" 
    path="toh-pt5/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane 
    title="src/app/heroes/heroes.component.css" 
    path="toh-pt5/src/app/heroes/heroes.component.css">
  </code-pane>
</code-tabs>

{@a herodetailcomponent}
#### _HeroDetailComponent_

<code-tabs>
  <code-pane 
    title="src/app/hero-detail/hero-detail.component.html" path="toh-pt5/src/app/hero-detail/hero-detail.component.html">
  </code-pane>

  <code-pane 
    title="src/app/hero-detail/hero-detail.component.ts" path="toh-pt5/src/app/hero-detail/hero-detail.component.ts">
  </code-pane>

  <code-pane 
    title="src/app/hero-detail/hero-detail.component.css" path="toh-pt5/src/app/hero-detail/hero-detail.component.css">
  </code-pane>
</code-tabs>

## Summary

* You added the Angular router to navigate among different components.
* You turned the `AppComponent` into a navigation shell with `<a>` links and a `<router-outlet>`.
* You configured the router in an `AppRoutingModule` 
* You defined simple routes, a redirect route, and a parameterized route.
* You used the `routerLink` directive in anchor elements.
* You refactored a tightly-coupled master/detail view into a routed detail view.
* You used router link parameters to navigate to the detail view of a user-selected hero.
* You shared the `HeroService` among multiple components.
