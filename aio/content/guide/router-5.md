# Milestone 5: Child Routes

This page introduces a new concept&mdash;**child routes**, which are routes within routes.

To demonstrate that concept you'll start by adding features to the app's current placeholder crisis center much as you did with *Heroes*. 
Then you'll take the crisis center in a new direction with child routes.

You'll leave *Heroes* in its current state as a contrast with the *Crisis Center*
and decide later if the differences are worthwhile.

Begin by imitating the heroes feature:

* Delete the placeholder crisis center file.
* Create an `app/crisis-center` folder.
* Copy the files from `app/heroes` into the new crisis center folder.
* In the new files, change every mention of "hero" to "crisis", and "heroes" to "crises".

You'll turn the `CrisisService` into a purveyor of mock crises instead of mock heroes:


<code-example path="router/src/app/crisis-center/crisis.service.ts" linenums="false" title="src/app/crisis-center/crisis.service.ts (mock-crises)" region="mock-crises">

</code-example>



<div class="alert is-helpful">



In keeping with the
<a href="https://blog.8thlight.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html" title="Separation of Concerns">*Separation of Concerns* principle</a>,
changes to the *Crisis Center* won't affect the `AppModule` or
any other feature's component.

</div>



{@a crisis-child-routes}


## A crisis center with child routes

This section shows you how to organize the crisis center
to conform to the following recommended pattern for Angular applications:

* Each feature area resides in its own folder.
* Each feature has its own Angular feature module.
* Each area has its own area root component.
* Each area root component has its own router outlet and child routes.
* Feature area routes rarely (if ever) cross with routes of other features.

If your app had many feature areas, the app component trees might look like this:


<figure class='image-display'>
  <img src='content/images/guide/router/component-tree.png' alt="Component Tree"></img>
</figure>



{@a child-routing-component}

## Child routing component

Add the following `crisis-center.component.ts` to the `crisis-center` folder:


<code-example path="router/src/app/crisis-center/crisis-center.component.ts" linenums="false" title="src/app/crisis-center/crisis-center.component.ts (minus imports)" region="minus-imports">

</code-example>



The `CrisisCenterComponent` has the following in common with the `AppComponent`:

* It is the *root* of the crisis center area,
just as `AppComponent` is the root of the entire application.
* It is a *shell* for the crisis management feature area,
just as the `AppComponent` is a shell to manage the high-level workflow.

Like most shells, the `CrisisCenterComponent` class is very simple, simpler even than `AppComponent`:
it has no business logic, and its template has no links, just a title and
`<router-outlet>` for the crisis center child views.

Unlike `AppComponent`, and most other components, it _lacks a selector_.
It doesn't _need_ one since you don't *embed* this component in a parent template,
instead you use the router to *navigate* to it.


{@a child-route-config}


## Child route configuration

The `CrisisCenterComponent` is a *routing component* like the `AppComponent`.
It has its own `RouterOutlet` and its own child routes.

Add the following `crisis-center-home.component.ts` to the `crisis-center` folder.


<code-example path="router/src/app/crisis-center/crisis-center-home.component.ts" linenums="false" title="src/app/crisis-center/crisis-center-home.component.ts (minus imports)" region="minus-imports">

</code-example>



Create a `crisis-center-routing.module.ts` file as you did the `heroes-routing.module.ts` file.
This time, you define **child routes** *within* the parent `crisis-center` route.


<code-example path="router/src/app/crisis-center/crisis-center-routing.module.1.ts" linenums="false" title="src/app/crisis-center/crisis-center-routing.module.ts (Routes)" region="routes">

</code-example>



Notice that the parent `crisis-center` route has a `children` property
with a single route containing the `CrisisListComponent`. The `CrisisListComponent` route
also has a `children` array with two routes.

These two routes navigate to the crisis center child components,
`CrisisCenterHomeComponent` and `CrisisDetailComponent`, respectively.

There are *important differences* in the way the router treats these _child routes_.

The router displays the components of these routes in the `RouterOutlet`
of the `CrisisCenterComponent`, not in the `RouterOutlet` of the `AppComponent` shell.

The `CrisisListComponent` contains the crisis list and a `RouterOutlet` to
display the `Crisis Center Home` and `Crisis Detail` route components.

The `Crisis Detail` route is a child of the `Crisis List`. Since the router [reuses components](guide/router-4#reuse)
by default, the `Crisis Detail` component will be re-used as you select different crises.
In contrast, back in the `Hero Detail` route, the component was recreated each time you selected a different hero.

At the top level, paths that begin with `/` refer to the root of the application.
But child routes *extend* the path of the parent route.
With each step down the route tree,
you add a slash followed by the route path, unless the path is _empty_.

Apply that logic to navigation within the crisis center for which the parent path is `/crisis-center`.

* To navigate to the `CrisisCenterHomeComponent`, the full URL is `/crisis-center` (`/crisis-center` + `''` + `''`).

* To navigate to the `CrisisDetailComponent` for a crisis with `id=2`, the full URL is
`/crisis-center/2` (`/crisis-center` + `''` +  `'/2'`).

The absolute URL for the latter example, including the `localhost` origin, is

<code-example>
  localhost:3000/crisis-center/2

</code-example>



Here's the complete `crisis-center-routing.module.ts` file with its imports.


<code-example path="router/src/app/crisis-center/crisis-center-routing.module.1.ts" linenums="false" title="src/app/crisis-center/crisis-center-routing.module.ts (excerpt)">

</code-example>



{@a import-crisis-module}


## Import crisis center module into the *AppModule* routes

As with the `HeroesModule`, you must add the `CrisisCenterModule` to the `imports` array of the `AppModule`
_before_ the `AppRoutingModule`:


<code-example path="router/src/app/app.module.4.ts" linenums="false" title="src/app/app.module.ts (import CrisisCenterModule)" region="crisis-center-module">

</code-example>



Remove the initial crisis center route from the `app-routing.module.ts`.
The feature routes are now provided by the `HeroesModule` and the `CrisisCenter` modules.

The `app-routing.module.ts` file retains the top-level application routes such as the default and wildcard routes.


<code-example path="router/src/app/app-routing.module.3.ts" linenums="false" title="src/app/app-routing.module.ts (v3)" region="v3">

</code-example>




{@a relative-navigation}


## Relative navigation

While building out the crisis center feature, you navigated to the
crisis detail route using an **absolute path** that begins with a _slash_.

The router matches such _absolute_ paths to routes starting from the top of the route configuration.

You could continue to use absolute paths like this to navigate inside the *Crisis Center*
feature, but that pins the links to the parent routing structure.
If you changed the parent `/crisis-center` path, you would have to change the link parameters array.

You can free the links from this dependency by defining paths that are **relative** to the current URL segment.
Navigation _within_ the feature area remains intact even if you change the parent route path to the feature.

Here's an example:


<div class="l-sub-section">



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


<div class="l-sub-section">



**Always** specify the complete _absolute_ path when calling router's `navigateByUrl` method.


</div>



{@a nav-to-crisis}


## Navigate to crisis detail with a relative URL

Update the *Crisis List* `onSelect` method to use relative navigation so you don't have
to start from the top of the route configuration.

You've already injected the `ActivatedRoute` that you need to compose the relative navigation path.

<code-example path="router/src/app/crisis-center/crisis-list.component.ts" linenums="false" title="src/app/crisis-center/crisis-list.component.ts (constructor)" region="ctor">

</code-example>



When you visit the *Crisis Center*, the ancestor path is `/crisis-center`,
so you only need to add the `id` of the *Crisis Center* to the existing path.


<code-example path="router/src/app/crisis-center/crisis-list.component.ts" linenums="false" title="src/app/crisis-center/crisis-list.component.ts (relative navigation)" region="onSelect">

</code-example>



If you were using a `RouterLink` to navigate instead of the `Router` service, you'd use the _same_
link parameters array, but you wouldn't provide the object with the `relativeTo` property.
The `ActivatedRoute` is implicit in a `RouterLink` directive.


<code-example path="router/src/app/crisis-center/crisis-list.component.1.ts" linenums="false" title="src/app/crisis-center/crisis-list.component.ts (relative routerLink)" region="relative-navigation-router-link">

</code-example>



Update the `gotoCrises` method of the `CrisisDetailComponent` to navigate back to the *Crisis Center* list using relative path navigation.


<code-example path="router/src/app/crisis-center/crisis-detail.component.ts" linenums="false" title="src/app/crisis-center/crisis-detail.component.ts (relative navigation)" region="gotoCrises-navigate">

</code-example>



Notice that the path goes up a level using the `../` syntax.
If the current crisis `id` is `3`, the resulting path back to the crisis list is  `/crisis-center/;id=3;foo=foo`.


{@a named-outlets}



## Displaying multiple routes in named outlets

You decide to give users a way to contact the crisis center.
When a user clicks a "Contact" button, you want to display a message in a popup view.

The popup should stay open, even when switching between pages in the application, until the user closes it
by sending the message or canceling.
Clearly you can't put the popup in the same outlet as the other pages.

Until now, you've defined a single outlet and you've nested child routes
under that outlet to group routes together.
The router only supports one primary _unnamed_ outlet per template.

A template can also have any number of _named_ outlets.
Each named outlet has its own set of routes with their own components.
Multiple outlets can be displaying different content, determined by different routes, all at the same time.

Add an outlet named "popup" in the `AppComponent`, directly below the unnamed outlet.


<code-example path="router/src/app/app.component.4.ts" linenums="false" title="src/app/app.component.ts (outlets)" region="outlets">

</code-example>



That's where a popup will go, once you learn how to route a popup component to it.


{@a secondary-routes}


### Secondary routes

Named outlets are the targets of  _secondary routes_.

Secondary routes look like primary routes and you configure them the same way.
They differ in a few key respects.

* They are independent of each other.
* They work in combination with other routes.
* They are displayed in named outlets.

Create a new component named `ComposeMessageComponent` in `src/app/compose-message.component.ts`.
It displays a simple form with a header, an input box for the message,
and two buttons, "Send" and "Cancel".


<figure class='image-display'>
  <img src='content/images/guide/router/contact-popup.png' alt="Contact popup" width="250"></img>
</figure>



Here's the component and its template:


<code-tabs>

  <code-pane title="src/app/compose-message.component.ts" path="router/src/app/compose-message.component.ts">

  </code-pane>

  <code-pane title="src/app/compose-message.component.html" path="router/src/app/compose-message.component.html">

  </code-pane>

</code-tabs>



It looks about the same as any other component you've seen in this guide.
There are two noteworthy differences.

Note that the `send()` method simulates latency by waiting a second before "sending" the message and closing the popup.

The `closePopup()` method closes the popup view by navigating to the popup outlet with a `null`.
That's a peculiarity covered [below](#clear-secondary-routes).

As with other application components, you add the `ComposeMessageComponent` to the `declarations` of an `NgModule`.
Do so in the `AppModule`.


{@a add-secondary-route}


#### Add a secondary route

Open the `AppRoutingModule` and add a new `compose` route to the `appRoutes`.

<code-example path="router/src/app/app-routing.module.3.ts" linenums="false" title="src/app/app-routing.module.ts (compose route)" region="compose">

</code-example>



The `path` and `component` properties should be familiar.
There's a new property, `outlet`, set to `'popup'`.
This route now targets the popup outlet and the `ComposeMessageComponent` will display there.

The user needs a way to open the popup.
Open the `AppComponent` and add a "Contact" link.

<code-example path="router/src/app/app.component.4.ts" linenums="false" title="src/app/app.component.ts (contact-link)" region="contact-link">

</code-example>



Although the `compose` route is pinned to the "popup" outlet, that's not sufficient for wiring the route to a `RouterLink` directive.
You have to specify the named outlet in a _link parameters array_ and bind it to the `RouterLink` with a property binding.

The _link parameters array_ contains an object with a single `outlets` property whose value
is another object keyed by one (or more) outlet names.
In this case there is only the "popup" outlet property and its value is another _link parameters array_ that specifies the `compose` route.

You are in effect saying, _when the user clicks this link, display the component associated with the `compose` route in the `popup` outlet_.


<div class="l-sub-section">



This `outlets` object within an outer object was completely unnecessary
when there was only one route and one _unnamed_ outlet to think about.

The router assumed that your route specification targeted the _unnamed_ primary outlet
and created these objects for you.

Routing to a named outlet has revealed a previously hidden router truth:
you can target multiple outlets with multiple routes in the same `RouterLink` directive.

You're not actually doing that here.
But to target a named outlet, you must use the richer, more verbose syntax.


</div>



{@a secondary-route-navigation}


### Secondary route navigation: merging routes during navigation
Navigate to the _Crisis Center_ and click "Contact".
you should see something like the following URL in the browser address bar.


<code-example>
  http://.../crisis-center(popup:compose)

</code-example>



The interesting part of the URL follows the `...`:

* The `crisis-center` is the primary navigation.
* Parentheses surround the secondary route.
* The secondary route consists of an outlet name (`popup`), a `colon` separator, and the secondary route path (`compose`).

Click the _Heroes_ link and look at the URL again.


<code-example>
  http://.../heroes(popup:compose)
</code-example>



The primary navigation part has changed; the secondary route is the same.

The router is keeping track of two separate branches in a navigation tree and generating a representation of that tree in the URL.

You can add many more outlets and routes, at the top level and in nested levels, creating a navigation tree with many branches.
The router will generate the URL to go with it.

You can tell the router to navigate an entire tree at once by filling out the `outlets` object mentioned above.
Then pass that object inside a _link parameters array_  to the `router.navigate` method.

Experiment with these possibilities at your leisure.



{@a clear-secondary-routes}


### Clearing secondary routes
As you've learned, a component in an outlet persists until you navigate away to a new component.
Secondary outlets are no different in this regard.

Each secondary outlet has its own navigation, independent of the navigation driving the primary outlet.
Changing a current route that displays in the primary outlet has no effect on the popup outlet.
That's why the popup stays visible as you navigate among the crises and heroes.

Clicking the "send" or "cancel" buttons _does_ clear the popup view.
To see how, look at the `closePopup()` method again:

<code-example path="router/src/app/compose-message.component.ts" linenums="false" title="src/app/compose-message.component.ts (closePopup)" region="closePopup">

</code-example>



It navigates imperatively with the `Router.navigate()` method, passing in a [link parameters array](guide/router-appendix#link-parameters-array).

Like the array bound to the _Contact_ `RouterLink` in the `AppComponent`,
this one includes an object with an `outlets` property.
The `outlets` property value is another object with outlet names for keys.
The only named outlet is `'popup'`.

This time, the value of `'popup'` is `null`. That's not a route, but it is a legitimate value.
Setting the popup `RouterOutlet` to `null` clears the outlet and removes
the secondary popup route from the current URL.

## Next step 

Learn to intercept users' attempts to navigate to or from a page with [_route guards_](guide/router-6).