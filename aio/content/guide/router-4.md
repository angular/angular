# Milestone 4: Routing to a Feature

You've seen how to navigate using the `RouterLink` directive.
Now you'll learn the following:

* Organize the app and routes into *feature areas* using modules.
* Navigate imperatively from one component to another.
* Pass required and optional information in route parameters.

This page illustrates these points by recreating the heroes feature in the "Services" episode of the
[Tour of Heroes tutorial](tutorial/toh-pt4 "Tour of Heroes: Services").
You'll be copying much of the code
from the <live-example name="toh-pt4" title="Tour of Heroes: Services example code"></live-example>.

Here's how the user will experience this version of the app:


<figure class='image-display'>
  <img src='content/images/guide/router/router-2-anim.gif' alt="App in action"></img>
</figure>



A typical application has multiple *feature areas*,
each dedicated to a particular business purpose.

While you could continue to add files to the `src/app/` folder,
that is unrealistic and ultimately not maintainable.
Most developers prefer to put each feature area in its own folder.

You are about to break up the app into different *feature modules*, each with its own concerns.
Then you'll import into the main module and navigate among them.


{@a heroes-functionality}


## Add heroes functionality

Follow these steps:

* Create the `src/app/heroes` folder; you'll be adding files implementing *hero management* there.
* Delete the placeholder `hero-list.component.ts` that's in the `app` folder.
* Create a new `hero-list.component.ts` under `src/app/heroes`.
* Copy into it the contents of the `app.component.ts` from
  the <live-example name="toh-pt4" title="Tour of Heroes: Services example code">"Services" tutorial</live-example>.
* Make a few minor but necessary changes:

  * Delete the `selector` (routed components don't need them).
  * Delete the `<h1>`.
  * Relabel the `<h2>` to `<h2>HEROES</h2>`.
  * Delete the `<hero-detail>` at the bottom of the template.
  * Rename the `AppComponent` class to `HeroListComponent`.

* Copy the `hero-detail.component.ts` and the `hero.service.ts` files into the `heroes` subfolder.
* Create a (pre-routing) `heroes.module.ts` in the heroes folder that looks like this:


<code-example path="router/src/app/heroes/heroes.module.ts" region="v1" title="src/app/heroes/heroes.module.ts (pre-routing)">

</code-example>



When you're done, you'll have these *hero management* files:


<div class='filetree'>

  <div class='file'>
    src/app/heroes
  </div>

  <div class='children'>

    <div class='file'>
      hero-detail.component.ts
    </div>

    <div class='file'>
      hero-list.component.ts
    </div>

    <div class='file'>
      hero.service.ts
    </div>

    <div class='file'>
      heroes.module.ts
    </div>

  </div>

</div>



{@a hero-routing-requirements}


## *Hero* feature routing requirements

The heroes feature has two interacting components, the hero list and the hero detail.
The list view is self-sufficient; you navigate to it, it gets a list of heroes and displays them.

The detail view is different. It displays a particular hero. It can't know which hero to show on its own.
That information must come from outside.

When the user selects a hero from the list, the app should navigate to the detail view
and show that hero.
You tell the detail view which hero to display by including the selected hero's id in the route URL.


{@a hero-routing-module}


## *Hero* feature route configuration

Create a new `heroes-routing.module.ts` in the `heroes` folder
using the same techniques you learned while creating the `AppRoutingModule`.


<code-example path="router/src/app/heroes/heroes-routing.module.ts" title="src/app/heroes/heroes-routing.module.ts">

</code-example>



<div class="l-sub-section">



Put the routing module file in the same folder as its companion module file.
Here both `heroes-routing.module.ts` and `heroes.module.ts` are in the same `src/app/heroes` folder.

Consider giving each feature module its own route configuration file.
It may seem like overkill early when the feature routes are simple.
But routes have a tendency to grow more complex and consistency in patterns pays off over time.


</div>



Import the hero components from their new locations in the `src/app/heroes/` folder, define the two hero routes,
and export the `HeroRoutingModule` class.

Now that you have routes for the `Heroes` module, register them with the `Router` via the
`RouterModule` _almost_ as you did in the `AppRoutingModule`.

There is a small but critical difference.
In the `AppRoutingModule`, you used the static **`RouterModule.forRoot`** method to register the routes and application level service providers.
In a feature module you use the static **`forChild`** method.


<div class="l-sub-section">



Only call `RouterModule.forRoot` in the root `AppRoutingModule`
(or the `AppModule` if that's where you register top level application routes).
In any other module, you must call the **`RouterModule.forChild`** method to register additional routes.

</div>



{@a adding-routing-module}


## Add the routing module to the _HeroesModule_
Add the `HeroRoutingModule` to the `HeroModule`
just as you added `AppRoutingModule` to the `AppModule`.

Open `heroes.module.ts`.
Import the `HeroRoutingModule` token from `heroes-routing.module.ts` and
add it to the `imports` array of the `HeroesModule`.
The finished `HeroesModule` looks like this:


<code-example path="router/src/app/heroes/heroes.module.ts" title="src/app/heroes/heroes.module.ts">

</code-example>



{@a remove-duplicate-hero-routes}


## Remove duplicate hero routes

The hero routes are currently defined in _two_ places: in the `HeroesRoutingModule`,
by way of the `HeroesModule`, and in the `AppRoutingModule`.

Routes provided by feature modules are combined together into their imported module's routes by the router.
This allows you to continue defining the feature module routes without modifying the main route configuration.

But you don't want to define the same routes twice.
Remove the `HeroListComponent` import and the `/heroes` route from the `app-routing.module.ts`.

**Leave the default and the wildcard routes!**
These are concerns at the top level of the application itself.


<code-example path="router/src/app/app-routing.module.2.ts" linenums="false" title="src/app/app-routing.module.ts (v2)">

</code-example>



{@a merge-hero-routes}


## Import hero module into AppModule
The heroes feature module is ready, but the application doesn't know about the `HeroesModule` yet.
Open `app.module.ts` and revise it as follows.

Import the `HeroesModule` and add it to the `imports` array in the `@NgModule` metadata of the `AppModule`.

Remove the `HeroListComponent` from the `AppModule`'s `declarations` because it's now provided by the `HeroesModule`.
This is important. There can be only _one_ owner for a declared component.
In this case, the `Heroes` module is the owner of the `Heroes` components and is making them available to
components in the `AppModule` via the `HeroesModule`.

As a result, the `AppModule` no longer has specific knowledge of the hero feature, its components, or its route details.
You can evolve the hero feature with more components and different routes.
That's a key benefit of creating a separate module for each feature area.

After these steps, the `AppModule` should look like this:


<code-example path="router/src/app/app.module.3.ts" title="src/app/app.module.ts">

</code-example>



{@a routing-module-order}


## Module import order matters

Look at the module `imports` array. Notice that the `AppRoutingModule` is _last_.
Most importantly, it comes _after_ the `HeroesModule`.

<code-example path="router/src/app/app.module.3.ts" region="module-imports" title="src/app/app.module.ts (module-imports)" linenums="false">

</code-example>



The order of route configuration matters.
The router accepts the first route that matches a navigation request path.

When all routes were in one `AppRoutingModule`,
you put the default and [wildcard](guide/router-2#wildcard) routes last, after the `/heroes` route,
so that the router had a chance to match a URL to the `/heroes` route _before_
hitting the wildcard route and navigating to "Page not found".

The routes are no longer in one file.
They are distributed across two modules, `AppRoutingModule` and `HeroesRoutingModule`.

Each routing module augments the route configuration _in the order of import_.
If you list `AppRoutingModule` first, the wildcard route will be registered
_before_ the hero routes.
The wildcard route &mdash; which matches _every_ URL &mdash;
will intercept the attempt to navigate to a hero route.


<div class="l-sub-section">



Reverse the routing modules and see for yourself that
a click of the heroes link results in "Page not found".
Learn about inspecting the runtime router configuration
[later in this series](guide/router-7#inspect-config "Inspect the router config").


</div>



{@a route-def-with-parameter}


## Route definition with a parameter

Return to the `HeroesRoutingModule` and look at the route definitions again.
The route to `HeroDetailComponent` has a twist.


<code-example path="router/src/app/heroes/heroes-routing.module.ts" linenums="false" title="src/app/heroes/heroes-routing.module.ts (excerpt)" region="hero-detail-route">

</code-example>



Notice the `:id` token in the path. That creates a slot in the path for a **Route Parameter**.
In this case, the router will insert the `id` of a hero into that slot.

If you tell the router to navigate to the detail component and display "Magneta",
you expect a hero id to appear in the browser URL like this:


<code-example format="nocode">
  localhost:3000/hero/15

</code-example>



If a user enters that URL into the browser address bar, the router should recognize the
pattern and go to the same "Magneta" detail view.


<div class="callout is-helpful">



<header>
  Route parameter: Required or optional?
</header>



Embedding the route parameter token, `:id`,
in the route definition path is a good choice for this scenario
because the `id` is *required* by the `HeroDetailComponent` and because
the value `15` in the path clearly distinguishes the route to "Magneta" from
a route for some other hero.


</div>



{@a navigate}


## Navigate to hero detail imperatively

Users *will not* navigate to the detail component by clicking a link
so you won't add a new `RouterLink` anchor tag to the shell.

Instead, when the user *clicks* a hero in the list, you'll ask the router
to navigate to the hero detail view for the selected hero.

Start in the `HeroListComponent`.
Revise its constructor so that it acquires the `Router` and the `HeroService` by dependency injection:


<code-example path="router/src/app/heroes/hero-list.component.1.ts" linenums="false" title="src/app/heroes/hero-list.component.ts (constructor)" region="ctor">

</code-example>



Make the following few changes to the component's template:


<code-example path="router/src/app/heroes/hero-list.component.1.ts" linenums="false" title="src/app/heroes/hero-list.component.ts (template)" region="template">

</code-example>



The template defines an `*ngFor` repeater such as [you've seen before](guide/displaying-data#ngFor).
There's a `(click)` [event binding](guide/template-syntax#event-binding) to the component's
`onSelect` method which you implement as follows:


<code-example path="router/src/app/heroes/hero-list.component.1.ts" linenums="false" title="src/app/heroes/hero-list.component.ts (select)" region="select">

</code-example>



The component's `onSelect` calls the router's **`navigate`** method with a _link parameters array_.
You can use this same syntax in a `RouterLink` if you decide later to navigate in HTML template rather than in component code.


{@a route-parameters}


## Setting the route parameters in the list view

After navigating to the `HeroDetailComponent`, you expect to see the details of the selected hero.
You need *two* pieces of information: the routing path to the component and the hero's `id`.

Accordingly, the _link parameters array_ has *two* items:  the routing _path_ and a _route parameter_ that specifies the
`id` of the selected hero.


<code-example path="router/src/app/heroes/hero-list.component.1.ts" linenums="false" title="src/app/heroes/hero-list.component.ts (link-parameters-array)" region="link-parameters-array">

</code-example>



The router composes the destination URL from the array like this:
`localhost:3000/hero/15`.



<div class="l-sub-section">



How does the target `HeroDetailComponent` learn about that `id`?
Don't analyze the URL. Let the router do it.

The router extracts the route parameter (`id:15`) from the URL and supplies it to
the `HeroDetailComponent` via the `ActivatedRoute` service.


</div>



{@a activated-route}


## ActivatedRoute: the one-stop-shop for route information

The route path and parameters are available through an injected router service called the
[ActivatedRoute](api/router/index/ActivatedRoute-interface).
It has a great deal of useful information including:


<div class="l-sub-section">

**`url`**: An `Observable` of the route path(s), represented as an array of strings for each part of the route path.

**`data`**: An `Observable` that contains the `data` object provided for the route. Also contains any resolved values from the [resolve guard](guide/router-6#resolve-guard).

**`params`**: An `Observable` that contains the required and [optional parameters](#optional-route-parameters) specific to the route.

**`queryParams`**: An `Observable` that contains the [query parameters](guide/router-6#query-parameters) available to all routes.

**`fragment`**:  An `Observable` of the URL [fragment](guide/router-6#fragment) available to all routes.

**`outlet`**: The name of the `RouterOutlet` used to render the route. For an unnamed outlet, the outlet name is _primary_.

**`routeConfig`**: The route configuration used for the route that contains the origin path.

**`parent`**: an `ActivatedRoute` that contains the information from the parent route when using [child routes](guide/router-5#child-routing-component).

**`firstChild`**: contains the first `ActivatedRoute` in the list of child routes.

**`children`**: contains all the [child routes](guide/router-5#child-routing-component) activated under the current route.


</div>



Import the `Router`, `ActivatedRoute`, and `Params` tokens from the router package.


<code-example path="router/src/app/heroes/hero-detail.component.1.ts" linenums="false" title="src/app/heroes/hero-detail.component.ts (activated route)" region="imports">

</code-example>



Import the `switchMap` operator because you need it later to process the `Observable` route parameters.


<code-example path="router/src/app/heroes/hero-detail.component.ts" linenums="false" title="src/app/heroes/hero-detail.component.ts (switchMap operator import)" region="rxjs-operator-import">

</code-example>



{@a hero-detail-ctor}


As usual, you write a constructor that asks Angular to inject services
that the component requires and reference them as private variables.


<code-example path="router/src/app/heroes/hero-detail.component.ts" linenums="false" title="src/app/heroes/hero-detail.component.ts (constructor)" region="ctor">

</code-example>



Later, in the `ngOnInit` method, you use the `ActivatedRoute` service to retrieve the parameters for the route,
pull the hero `id` from the parameters and retrieve the hero to display.


<div class="l-sub-section">



Put this data access logic in the `ngOnInit` method rather than inside the constructor to improve the component's testability.
Angular calls the `ngOnInit` method shortly after creating an instance of the `HeroDetailComponent`
so the hero will be retrieved in time to use it.

Learn more about the `ngOnInit` method and other component lifecycle hooks in the [Lifecycle Hooks](guide/lifecycle-hooks) guide.


</div>



<code-example path="router/src/app/heroes/hero-detail.component.ts" linenums="false" title="src/app/heroes/hero-detail.component.ts (ngOnInit)" region="ngOnInit">

</code-example>



Since the parameters are provided as an `Observable`, you use the `switchMap` operator to
provide them for the `id` parameter by name and tell the `HeroService` to fetch the hero with that `id`.

The `switchMap` operator allows you to perform an action with the current value of the `Observable`,
and map it to a new `Observable`. As with many `rxjs` operators, `switchMap` handles
an `Observable` as well as a `Promise` to retrieve the value they emit.

The `switchMap` operator will also cancel any in-flight requests if the user re-navigates to the route
while still retrieving a hero.

Use the `subscribe` method to detect `id` changes and to (re)set the retrieved `Hero`.


{@a reuse}


### Observable <i>params</i> and component reuse

In this example, you retrieve the route params from an `Observable`.
That implies that the route params can change during the lifetime of this component.

They might. By default, the router re-uses a component instance when it re-navigates to the same component type
without visiting a different component first. The route parameters could change each time.

Suppose a parent component navigation bar had "forward" and "back" buttons
that scrolled through the list of heroes.
Each click navigated imperatively to the `HeroDetailComponent` with the next or previous `id`.

You don't want the router to remove the current `HeroDetailComponent` instance from the DOM only to re-create it for the next `id`.
That could be visibly jarring.
Better to simply re-use the same component instance and update the parameter.

Unfortunately, `ngOnInit` is only called once per component instantiation.
You need a way to detect when the route parameters change from _within the same instance_.
The observable `params` property handles that beautifully.


<div class="l-sub-section">



When subscribing to an observable in a component, you almost always arrange to unsubscribe when the component is destroyed.

There are a few exceptional observables where this is not necessary.
The `ActivatedRoute` observables are among the exceptions.

The `ActivatedRoute` and its observables are insulated from the `Router` itself.
The `Router` destroys a routed component when it is no longer needed and the injected `ActivatedRoute` dies with it.

Feel free to unsubscribe anyway. It is harmless and never a bad practice.


</div>



{@a snapshot}


### _Snapshot_: the _no-observable_ alternative
_This_ application won't re-use the `HeroDetailComponent`.
The user always returns to the hero list to select another hero to view.
There's no way to navigate from one hero detail to another hero detail
without visiting the list component in between.
Therefore, the router creates a new `HeroDetailComponent` instance every time.

When you know for certain that a `HeroDetailComponent` instance will *never, never, ever*
be re-used, you can simplify the code with the *snapshot*.

The `route.snapshot` provides the initial value of the route parameters.
You can access the parameters directly without subscribing or adding observable operators.
It's much simpler to write and read:


<code-example path="router/src/app/heroes/hero-detail.component.2.ts" linenums="false" title="src/app/heroes/hero-detail.component.ts (ngOnInit snapshot)" region="snapshot">

</code-example>



<div class="l-sub-section">



**Remember:** you only get the _initial_ value of the parameters with this technique.
Stick with the observable `params` approach if there's even a chance that the router
could re-use the component.
This sample stays with the observable `params` strategy just in case.


</div>



{@a nav-to-list}


## Navigating back to the list component

The `HeroDetailComponent` has a "Back" button wired to its `gotoHeroes` method that navigates imperatively
back to the `HeroListComponent`.

The router `navigate` method takes the same one-item _link parameters array_
that you can bind to a `[routerLink]` directive.
It holds the _path to the `HeroListComponent`_:


<code-example path="router/src/app/heroes/hero-detail.component.1.ts" linenums="false" title="src/app/heroes/hero-detail.component.ts (excerpt)" region="gotoHeroes">

</code-example>




## Route Parameters: Required or optional?

Use [*route parameters*](#route-parameters) to specify a *required* parameter value *within* the route URL
as you do when navigating to the `HeroDetailComponent` in order to view the hero with *id* 15:


<code-example format="nocode">
  localhost:3000/hero/15

</code-example>

{@a optional-route-parameters}

You can also add *optional* information to a route request.
For example, when returning to the heroes list from the hero detail view,
it would be nice if the viewed hero was preselected in the list.


<figure class='image-display'>
  <img src='content/images/guide/router/selected-hero.png' alt="Selected hero"></img>
</figure>



You'll implement this feature in a moment by including the viewed hero's `id`
in the URL as an optional parameter when returning from the `HeroDetailComponent`.

Optional information takes other forms. Search criteria are often loosely structured, e.g., `name='wind*'`.
Multiple values are common&mdash;`after='12/31/2015' & before='1/1/2017'`&mdash;in no
particular order&mdash;`before='1/1/2017' & after='12/31/2015'`&mdash; in a
variety of formats&mdash;`during='currentYear'`.

These kinds of parameters don't fit easily in a URL *path*. Even if you could define a suitable URL token scheme,
doing so greatly complicates the pattern matching required to translate an incoming URL to a named route.

Optional parameters are the ideal vehicle for conveying arbitrarily complex information during navigation.
Optional parameters aren't involved in pattern matching and afford flexibility of expression.

The router supports navigation with optional parameters as well as required route parameters.
Define _optional_ parameters in a separate object _after_ you define the required route parameters.

In general, prefer a *required route parameter* when
the value is mandatory (for example, if necessary to distinguish one route path from another);
prefer an *optional parameter* when the value is optional, complex, and/or multivariate.


{@a optionally-selecting}


## Heroes list: optionally selecting a hero

When navigating to the `HeroDetailComponent` you specified the _required_ `id` of the hero-to-edit in the
*route parameter* and made it the second item of the [_link parameters array_](guide/router-appendix#link-parameters-array).


<code-example path="router/src/app/heroes/hero-list.component.1.ts" linenums="false" title="src/app/heroes/hero-list.component.ts (link-parameters-array)" region="link-parameters-array">

</code-example>



The router embedded the `id` value in the navigation URL because you had defined it
as a route parameter with an `:id` placeholder token in the route `path`:


<code-example path="router/src/app/heroes/heroes-routing.module.ts" linenums="false" title="src/app/heroes/heroes-routing.module.ts (hero-detail-route)" region="hero-detail-route">

</code-example>



When the user clicks the back button, the `HeroDetailComponent` constructs another _link parameters array_
which it uses to navigate back to the `HeroListComponent`.


<code-example path="router/src/app/heroes/hero-detail.component.1.ts" linenums="false" title="src/app/heroes/hero-detail.component.ts (gotoHeroes)" region="gotoHeroes">

</code-example>



This array lacks a route parameter because you had no reason to send information to the `HeroListComponent`.

Now you have a reason. You'd like to send the id of the current hero with the navigation request so that the
`HeroListComponent` can highlight that hero in its list.
This is a _nice-to-have_ feature; the list will display perfectly well without it.

Send the `id` with an object that contains an _optional_ `id` parameter.
For demonstration purposes, there's an extra junk parameter (`foo`) in the object that the `HeroListComponent` should ignore.
Here's the revised navigation statement:


<code-example path="router/src/app/heroes/hero-detail.component.ts" linenums="false" title="src/app/heroes/hero-detail.component.ts (go to heroes)" region="gotoHeroes">

</code-example>



The application still works. Clicking "back" returns to the hero list view.

Look at the browser address bar.


It should look something like this, depending on where you run it:


<code-example language="bash">
  localhost:3000/heroes;id=15;foo=foo

</code-example>



The `id` value appears in the URL as (`;id=15;foo=foo`), not in the URL path.
The path for the "Heroes" route doesn't have an `:id` token.

The optional route parameters are not separated by "?" and "&" as they would be in the URL query string.
They are **separated by semicolons ";"**
This is *matrix URL* notation &mdash; something you may not have seen before.


<div class="l-sub-section">



*Matrix URL* notation is an idea first introduced
in a [1996 proposal](http://www.w3.org/DesignIssues/MatrixURIs.html) by the founder of the web, Tim Berners-Lee.

Although matrix notation never made it into the HTML standard, it is legal and
it became popular among browser routing systems as a way to isolate parameters
belonging to parent and child routes. The Router is such a system and provides
support for the matrix notation across browsers.

The syntax may seem strange to you but users are unlikely to notice or care
as long as the URL can be emailed and pasted into a browser address bar
as this one can.

</div>



{@a route-parameters-activated-route}


## Route parameters in the *ActivatedRoute* service

The list of heroes is unchanged. No hero row is highlighted.


<div class="l-sub-section">



The <live-example></live-example> *does* highlight the selected
row because it demonstrates the final state of the application which includes the steps you're *about* to cover.
At the moment this guide is describing the state of affairs *prior* to those steps.

</div>



The `HeroListComponent` isn't expecting any parameters at all and wouldn't know what to do with them.
You can change that.

Previously, when navigating from the `HeroListComponent` to the `HeroDetailComponent`,
you subscribed to the route params `Observable` and made it available to the `HeroDetailComponent`
in the `ActivatedRoute` service.
You injected that service in the constructor of the `HeroDetailComponent`.

This time you'll be navigating in the opposite direction, from the `HeroDetailComponent` to the `HeroListComponent`.

First you extend the router import statement to include the `ActivatedRoute` service symbol:


<code-example path="router/src/app/heroes/hero-list.component.ts" linenums="false" title="src/app/heroes/hero-list.component.ts (import)" region="import-router">

</code-example>



Import the `switchMap` operator to perform an operation on the `Observable` of route parameters.


<code-example path="router/src/app/heroes/hero-list.component.ts" linenums="false" title="src/app/heroes/hero-list.component.ts (rxjs imports)" region="rxjs-imports">

</code-example>



Then you inject the `ActivatedRoute` in the `HeroListComponent` constructor.


<code-example path="router/src/app/heroes/hero-list.component.ts" linenums="false" title="src/app/heroes/hero-list.component.ts (constructor and ngOnInit)" region="ctor">

</code-example>



The `ActivatedRoute.params` property is an `Observable` of route parameters. The `params` emits new `id` values
when the user navigates to the component. In `ngOnInit` you subscribe to those values, set the `selectedId`,
and get the heroes.


<div class="l-sub-section">



All route/query parameters are strings.
The (+) in front of the `params['id']` expression is a JavaScript trick to convert the string to an integer.

</div>



Add an `isSelected` method that returns `true` when a hero's `id` matches the selected `id`.


<code-example path="router/src/app/heroes/hero-list.component.ts" linenums="false" title="src/app/heroes/hero-list.component.ts (isSelected)" region="isSelected">

</code-example>



Finally, update the template with a [class binding](guide/template-syntax#class-binding) to that `isSelected` method.
The binding adds the `selected` CSS class when the method returns `true` and removes it when `false`.
Look for it within the repeated `<li>` tag as shown here:


<code-example path="router/src/app/heroes/hero-list.component.ts" linenums="false" title="src/app/heroes/hero-list.component.ts (template)" region="template">

</code-example>



When the user navigates from the heroes list to the "Magneta" hero and back, "Magneta" appears selected:

<figure class='image-display'>
  <img src='content/images/guide/router/selected-hero.png' alt="Selected List"></img>
</figure>



The optional `foo` route parameter is harmless and continues to be ignored.


{@a route-animation}


## Adding animations to the routed component
The heroes feature module is almost complete, but what is a feature without some smooth transitions?

This section shows you how to add some [animations](guide/animations)
to the `HeroDetailComponent`.

First import `BrowserAnimationsModule`:

<code-example path="router/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (animations-module)" region="animations-module">

</code-example>



Create an `animations.ts` file in the root `src/app/` folder. The contents look like this:

<code-example path="router/src/app/animations.ts" linenums="false" title="src/app/animations.ts (excerpt)">

</code-example>



This file does the following:

* Imports the animation symbols that build the animation triggers, control state, and manage transitions between states.

* Exports a constant named `slideInDownAnimation` set to an animation trigger named *`routeAnimation`*;
animated components will refer to this name.

* Specifies the _wildcard state_ , `*`, that matches any animation state that the route component is in.

* Defines two *transitions*, one to ease the component in from the left of the screen as it enters the application view (`:enter`),
the other to animate the component down as it leaves the application view (`:leave`).

You could create more triggers with different transitions for other route components. This trigger is sufficient for the current milestone.


Back in the `HeroDetailComponent`, import the `slideInDownAnimation` from `'./animations.ts`.
Add the `HostBinding` decorator  to the imports from `@angular/core`; you'll need it in a moment.

Add an `animations` array to the `@Component` metadata's that contains the `slideInDownAnimation`.

Then add three `@HostBinding` properties to the class to set the animation and styles for the route component's element.

<code-example path="router/src/app/heroes/hero-detail.component.ts" linenums="false" title="src/app/heroes/hero-detail.component.ts (host bindings)" region="host-bindings">

</code-example>



The `'@routeAnimation'` passed to the first `@HostBinding` matches
the name of the `slideInDownAnimation` _trigger_, `routeAnimation`.
Set the `routeAnimation` property to `true` because you only care about the `:enter` and `:leave` states.

The other two `@HostBinding` properties style the display and position of the component.

The `HeroDetailComponent` will ease in from the left when routed to and will slide down when navigating away.


<div class="l-sub-section">



Applying route animations to individual components works for a simple demo, but in a real life app,
it is better to animate routes based on _route paths_.


</div>


## Wrap up

You've learned how to do the following:

* Organize the app into *feature areas*.
* Navigate imperatively from one component to another.
* Pass information along in route parameters and subscribe to them in the component.
* Import the feature area NgModule into the `AppModule`.
* Apply animations to the route component.

After these changes, the folder structure looks like this:


<div class='filetree'>

  <div class='file'>
    router-sample
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
          heroes
        </div>

        <div class='children'>

          <div class='file'>
            hero-detail.component.ts
          </div>

          <div class='file'>
            hero-list.component.ts
          </div>

          <div class='file'>
            hero.service.ts
          </div>

          <div class='file'>
            heroes.module.ts
          </div>

          <div class='file'>
            heroes-routing.module.ts
          </div>

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
          crisis-list.component.ts
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

  <Here>
    are the relevant files for this version of the sample application.
  </Here>

</div>



<code-tabs>

  <code-pane title="app.component.ts" path="router/src/app/app.component.1.ts">

  </code-pane>

  <code-pane title="app.module.ts" path="router/src/app/app.module.3.ts">

  </code-pane>

  <code-pane title="app-routing.module.ts" path="router/src/app/app-routing.module.2.ts">

  </code-pane>

  <code-pane title="hero-list.component.ts" path="router/src/app/heroes/hero-list.component.ts">

  </code-pane>

  <code-pane title="hero-detail.component.ts" path="router/src/app/heroes/hero-detail.component.ts">

  </code-pane>

  <code-pane title="hero.service.ts" path="router/src/app/heroes/hero.service.ts">

  </code-pane>

  <code-pane title="heroes.module.ts" path="router/src/app/heroes/heroes.module.ts">

  </code-pane>

  <code-pane title="heroes-routing.module.ts" path="router/src/app/heroes/heroes-routing.module.ts">

  </code-pane>

</code-tabs>

## Next step 

Learn to add sub-routes called [_Child Routes_](guide/router-5).