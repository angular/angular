# Milestone 2: Getting started with the router

Begin with a simple version of the app that navigates between two empty views.

<figure class='image-display'>
  <img src='content/images/guide/router/router-1-anim.gif' alt="App in action" width="250"></img>
</figure>



{@a base-href}


## Set the *&lt;base href>*

The router uses the browser's
<a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="HTML5 browser history push-state">history.pushState</a>
for navigation. Thanks to `pushState`, you can make in-app URL paths look the way you want them to
look, e.g. `localhost:3000/crisis-center`. The in-app URLs can be indistinguishable from server URLs.

Modern HTML5 browsers were the first to support `pushState` which is why many people refer to these URLs as
"HTML5 style" URLs.


<div class="l-sub-section">



HTML5 style navigation is the router default.
In the [LocationStrategy and browser URL styles](guide/router-appendix#browser-url-styles) Appendix,
learn why HTML5 style is preferred, how to adjust its behavior, and how to switch to the
older hash (#) style, if necessary.


</div>



You must **add a
<a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base" title="base href">&lt;base href&gt; element</a>**
to the app's `index.html` for `pushState` routing to work.
The browser uses the `<base href>` value to prefix *relative* URLs when referencing
CSS files, scripts, and images.

Add the `<base>` element just after the  `<head>` tag.
If the `app` folder is the application root, as it is for this application,
set the `href` value in **`index.html`** *exactly* as shown here.


<code-example path="router/src/index.html" linenums="false" title="src/index.html (base-href)" region="base-href">

</code-example>



<div class="callout is-important">



<header>
  Live example note
</header>



A live coding environment like Plunker sets the application base address dynamically so you can't specify a fixed address.
That's why the example code replaces the `<base href...>` with a script that writes the `<base>` tag on the fly.


<code-example language="html">
  &lt;script>document.write('&lt;base href="' + document.location + '" />');&lt;/script>

</code-example>



You only need this trick for the live example, not production code.


</div>



{@a import}


## Importing from the router library

Begin by importing some symbols from the router library.
The Router is in its own `@angular/router` package.
It's not part of the Angular core. The router is an optional service because not all applications
need routing and, depending on your requirements, you may need a different routing library.

You teach the router how to navigate by configuring it with routes.


{@a route-config}


## Define routes

A router must be configured with a list of route definitions.

The first configuration defines an array of two routes with simple paths leading to the
`CrisisListComponent` and `HeroListComponent`.

Each definition translates to a [Route](api/router/index/Route-interface) object which has two things: a
`path`, the URL path segment for this route; and a
`component`, the component associated with this route.

The router draws upon its registry of definitions when the browser URL changes
or when application code tells the router to navigate along a route path.

In simpler terms, you might say this of the first route:

* When the browser's location URL changes to match the path segment `/crisis-center`, then
the router activates an instance of the `CrisisListComponent` and displays its view.

* When the application requests navigation to the path `/crisis-center`, the router
activates an instance of `CrisisListComponent`, displays its view, and updates the
browser's address location and history with the URL for that path.


Here is the first configuration. Pass the array of routes, `appRoutes`, to the `RouterModule.forRoot` method.
It returns a module, containing the configured `Router` service provider, plus other providers that the routing library requires.
Once the application is bootstrapped, the `Router` performs the initial navigation based on the current browser URL.


<code-example path="router/src/app/app.module.1.ts" linenums="false" title="src/app/app.module.ts (first-config)" region="first-config">

</code-example>



<div class="l-sub-section">



Adding the configured `RouterModule` to the `AppModule` is sufficient for simple route configurations.
As the application grows, you'll want to refactor the routing configuration into a separate file
and create a **[Routing Module](guide/router-3#routing-module)**, a special type of `Service Module` dedicated to the purpose
of routing in feature modules.


</div>



Providing the `RouterModule` in the `AppModule` makes the Router available everywhere in the application.


{@a shell}


## The *AppComponent* shell

The root `AppComponent` is the application shell. It has a title, a navigation bar with two links,
and a *router outlet* where the router swaps views on and off the page. Here's what you get:


<figure class='image-display'>
  <img src='content/images/guide/router/shell-and-outlet.png' alt="Shell" width="300"></img>
</figure>



{@a shell-template}


The corresponding component template looks like this:


<code-example path="router/src/app/app.component.1.ts" linenums="false" title="src/app/app.component.ts (template)" region="template">

</code-example>



{@a router-outlet}


## *RouterOutlet*

The `RouterOutlet` is a directive from the router library that marks
the spot in the template where the router should display the views for that outlet.


<div class="l-sub-section">



The router adds the `<router-outlet>` element to the DOM
and subsequently inserts the navigated view element
immediately _after_ the `<router-outlet>`.


</div>



{@a router-link}


## *RouterLink* binding

Above the outlet, within the anchor tags, you see
[attribute bindings](guide/template-syntax#attribute-binding) to
the `RouterLink` directive that look like `routerLink="..."`.

The links in this example each have a string path, the path of a route that
you configured earlier. There are no route parameters yet.

You can also add more contextual information to the `RouterLink` by providing query string parameters
or a URL fragment for jumping to different areas on the page. Query string parameters
are provided through the `[queryParams]` binding which takes an object (e.g. `{ name: 'value' }`), while the URL fragment
takes a single value bound to the `[fragment]` input binding.

<div class="l-sub-section">



Learn about the how you can also use the _link parameters array_ in the [appendix](guide/router-appendix#link-parameters-array).


</div>



{@a router-link-active}


## *RouterLinkActive* binding

On each anchor tag, you also see [property bindings](guide/template-syntax#property-binding) to
the `RouterLinkActive` directive that look like `routerLinkActive="..."`.

The template expression to the right of the equals (=) contains a space-delimited string of CSS classes
that the Router will add when this link is active (and remove when the link is inactive).
You can also set the `RouterLinkActive` directive to a string of classes such as `[routerLinkActive]="active fluffy"`
or bind it to a component property that returns such a string.

The `RouterLinkActive` directive toggles css classes for active `RouterLink`s based on the current `RouterState`.
This cascades down through each level of the route tree, so parent and child router links can be active at the same time.
To override this behavior, you can bind to the `[routerLinkActiveOptions]` input binding with the `{ exact: true }` expression.
By using `{ exact: true }`, a given `RouterLink` will only be active if its URL is an exact match to the current URL.


{@a router-directives}


## *Router directives*

`RouterLink`, `RouterLinkActive` and `RouterOutlet` are directives provided by the Angular `RouterModule` package.
They are readily available for you to use in the template.

The current state of `app.component.ts` looks like this:


<code-example path="router/src/app/app.component.1.ts" linenums="false" title="src/app/app.component.ts (excerpt)">

</code-example>



{@a wildcard}


## Wildcard route

You've created two routes in the app so far, one to `/crisis-center` and the other to `/heroes`.
Any other URL causes the router to throw an error and crash the app.

Add a **wildcard** route to intercept invalid URLs and handle them gracefully.
A _wildcard_ route has a path consisting of two asterisks. It matches _every_ URL.
The router will select _this_ route if it can't match a route earlier in the configuration.
A wildcard route can navigate to a custom "404 Not Found" component or [redirect](#redirect) to an existing route.


<div class="l-sub-section">



The router selects the route with a [_first match wins_](guide/router-1#example-config) strategy.
Wildcard routes are the least specific routes in the route configuration.
Be sure it is the _last_ route in the configuration.


</div>



To test this feature, add a button with a `RouterLink` to the `HeroListComponent` template and set the link to `"/sidekicks"`.

<code-example path="router/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (excerpt)">

</code-example>



The application will fail if the user clicks that button because you haven't defined a `"/sidekicks"` route yet.

Instead of adding the `"/sidekicks"` route, define a `wildcard` route instead and have it navigate to a simple `PageNotFoundComponent`.

<code-example path="router/src/app/app.module.1.ts" linenums="false" title="src/app/app.module.ts (wildcard)" region="wildcard">

</code-example>



Create the `PageNotFoundComponent` to display when users visit invalid URLs.

<code-example path="router/src/app/not-found.component.ts" linenums="false" title="src/app/not-found.component.ts (404 component)">

</code-example>



As with the other components, add the `PageNotFoundComponent` to the `AppModule` declarations.

Now when the user visits `/sidekicks`, or any other invalid URL, the browser displays "Page not found".
The browser address bar continues to point to the invalid URL.



{@a default-route}


## The _default_ route to heroes

When the application launches, the initial URL in the browser bar is something like:


<code-example>
  localhost:3000

</code-example>



That doesn't match any of the configured routes which means that the application won't display any component when it's launched.
The user must click one of the links to trigger a navigation and display a component.

It would be nicer if the application had a **default route** that displayed the list of heroes immediately,
just as it will when the user clicks the "Heroes" link or pastes `localhost:3000/heroes` into the address bar.


{@a redirect}


## Redirecting routes

The preferred solution is to add a `redirect` route that translates the initial relative URL (`''`)
to the desired default path (`/heroes`). The browser address bar shows `.../heroes` as if you'd navigated there directly.

Add the default route somewhere _above_ the wildcard route.
It's just above the wildcard route in the following excerpt showing the complete `appRoutes` for this milestone.


<code-example path="router/src/app/app-routing.module.1.ts" linenums="false" title="src/app/app-routing.module.ts (appRoutes)" region="appRoutes">

</code-example>



A redirect route requires a `pathMatch` property to tell the router how to match a URL to the path of a route.
The router throws an error if you don't.
In this app, the router should select the route to the `HeroListComponent` only when the *entire URL* matches `''`,
so set the `pathMatch` value to `'full'`.


<div class="l-sub-section">



Technically, `pathMatch = 'full'` results in a route hit when the *remaining*, unmatched segments of the URL match `''`.
In this example, the redirect is in a top level route so the *remaining* URL and the *entire* URL are the same thing.

The other possible `pathMatch` value is `'prefix'` which tells the router
to match the redirect route when the *remaining* URL ***begins*** with the redirect route's _prefix_ path.

Don't do that here.
If the `pathMatch` value were `'prefix'`, _every_ URL would match `''`.

Try setting it to `'prefix'` then click the `Go to sidekicks` button.
Remember that's a bad URL and you should see the "Page not found" page.
Instead, you're still on the "Heroes" page.
Enter a bad URL in the browser address bar.
You're instantly re-routed to `/heroes`.
_Every_ URL, good or bad, that falls through to _this_ route definition
will be a match.

The default route should redirect to the `HeroListComponent` _only_ when the _entire_ url is  `''`.
Remember to restore the redirect to `pathMatch = 'full'`.

Learn more in Victor Savkin's
[post on redirects](http://victorsavkin.com/post/146722301646/angular-router-empty-paths-componentless-routes).


</div>



## Basics wrap up

You've got a very basic navigating app, one that can switch between two views
when the user clicks a link.

You've learned how to do the following:

* Load the router library.
* Add a nav bar to the shell template with anchor tags, `routerLink`  and `routerLinkActive` directives.
* Add a `router-outlet` to the shell template where views will be displayed.
* Configure the router module with `RouterModule.forRoot`.
* Set the router to compose HTML5 browser URLs.
* handle invalid routes with a `wildcard` route.
* navigate to the default route when the app launches with an empty path.

The rest of the starter app is mundane, with little interest from a router perspective.
Here are the details for readers inclined to build the sample through to this milestone.

The starter app's structure looks like this:


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
          app.component.ts
        </div>

        <div class='file'>
          app.module.ts
        </div>

        <div class='file'>
          crisis-list.component.ts
        </div>

        <div class='file'>
          hero-list.component.ts
        </div>

        <div class='file'>
          not-found.component.ts
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


Here are the files discussed in this milestone.


<code-tabs>

  <code-pane title="app.component.ts" path="router/src/app/app.component.1.ts">

  </code-pane>

  <code-pane title="app.module.ts" path="router/src/app/app.module.1.ts">

  </code-pane>

  <code-pane title="main.ts" path="router/src/main.ts">

  </code-pane>

  <code-pane title="hero-list.component.ts" path="router/src/app/hero-list.component.ts">

  </code-pane>

  <code-pane title="crisis-list.component.ts" path="router/src/app/crisis-list.component.ts">

  </code-pane>

  <code-pane title="not-found.component.ts" path="router/src/app/not-found.component.ts">

  </code-pane>

  <code-pane title="index.html" path="router/src/index.html">

  </code-pane>

</code-tabs>

## Next step 

Add routes to the router in a [_Routing Module_](guide/router-3).
