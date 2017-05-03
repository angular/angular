# Milestone 7: Asynchronous "Lazy" Routing

As you've worked through the milestones, the application has naturally gotten larger.
As you continue to build out feature areas, the overall application size will continue to grow.
At some point you'll reach a tipping point where the application takes long time to load.

How do you combat this problem?  With asynchronous routing, which loads feature modules _lazily_, on request.
Lazy loading has multiple benefits.

* You can load feature areas only when requested by the user.
* You can speed up load time for users that only visit certain areas of the application.
* You can continue expanding lazy loaded feature areas without increasing the size of the initial load bundle.

You're already made part way there.
By organizing the application into modules&mdash;`AppModule`,
`HeroesModule`, `AdminModule` and `CrisisCenterModule`&mdash;you
have natural candidates for lazy loading.

Some modules, like `AppModule`, must be loaded from the start.
But others can and should be lazy loaded.
The `AdminModule`, for example, is needed by a few authorized users, so
you should only load it when requested by the right people.


{@a lazy-loading-route-config}


## Lazy Loading route configuration

Change the `admin` **path** in the `admin-routing.module.ts` from `'admin'` to an empty string, `''`, the _empty path_.

The `Router` supports  *empty path* routes;
use them to group routes together without adding any additional path segments to the URL.
Users will still visit `/admin` and the `AdminComponent` still serves as the *Routing Component* containing child routes.

Open the `AppRoutingModule` and add a new `admin` route to its `appRoutes` array.

Give it a `loadChildren` property (not a `children` property!), set to the address of the `AdminModule`.
The address is the `AdminModule` file location (relative to the app root),
followed by a `#` separator,
followed by the name of the exported module class, `AdminModule`.


<code-example path="router/src/app/app-routing.module.5.ts" region="admin-1" title="app-routing.module.ts (load children)">

</code-example>



When the router navigates to this route, it uses the `loadChildren` string to dynamically load the `AdminModule`.
Then it adds the `AdminModule` routes to its current route configuration.
Finally, it loads the requested route to the destination admin component.

The lazy loading and re-configuration happen just once, when the route is _first_ requested;
the module and routes are available immediately for subsequent requests.


<div class="l-sub-section">



Angular provides a built-in module loader that supports SystemJS to load modules asynchronously. If you were
using another bundling tool, such as Webpack, you would use the Webpack mechanism for asynchronously loading modules.


</div>



Take the final step and detach the admin feature set from the main application.
The root `AppModule` must neither load nor reference the `AdminModule` or its files.

In `app.module.ts`, remove the `AdminModule` import statement from the top of the file
and remove the `AdminModule` from the Angular module's `imports` array.


{@a can-load-guard}


## _CanLoad_ Guard: guarding unauthorized loading of feature modules

You're already protecting the `AdminModule` with a `CanActivate` guard that prevents unauthorized users from
accessing the admin feature area.
It redirects to the  login page if the user is not authorized.

But the router is still loading the `AdminModule` even if the user can't visit any of its components.
Ideally, you'd only load the `AdminModule` if the user is logged in.

Add a **`CanLoad`** guard that only loads the `AdminModule` once the user is logged in _and_ attempts to access the admin feature area.

The existing `AuthGuard` already has the essential logic in
its `checkLogin()` method to support the `CanLoad` guard.

Open `auth-guard.service.ts`.
Import the `CanLoad` interface from `@angular/router`.
Add it to the `AuthGuard` class's `implements` list.
Then implement `canLoad` as follows:


<code-example path="router/src/app/auth-guard.service.ts" linenums="false" title="src/app/auth-guard.service.ts (CanLoad guard)" region="canLoad">

</code-example>



The router sets the `canLoad()` method's `route` parameter to the intended destination URL.
The `checkLogin()` method redirects to that URL once the user has logged in.

Now import the `AuthGuard` into the `AppRoutingModule` and add the `AuthGuard` to the `canLoad`
array for the `admin` route.
The completed admin route looks like this:


<code-example path="router/src/app/app-routing.module.5.ts" region="admin" title="app-routing.module.ts (lazy admin route)">

</code-example>



{@a preloading}


## Preloading: background loading of feature areas
You've learned how to load modules on-demand.
You can also load modules asynchronously with _preloading_.

This may seem like what the app has been doing all along. Not quite.
The `AppModule` is loaded when the application starts; that's _eager_ loading.
Now the `AdminModule` loads only when the user clicks on a link; that's _lazy_ loading.

_Preloading_ is something in between.
Consider the _Crisis Center_.
It isn't the first view that a user sees.
By default, the _Heroes_ are the first view.
For the smallest initial payload and fastest launch time,
you should eagerly load the `AppModule` and the `HeroesModule`.

You could lazy load the _Crisis Center_.
But you're almost certain that the user will visit the _Crisis Center_ within minutes of launching the app.
Ideally, the app would launch with just the `AppModule` and the `HeroesModule` loaded
and then, almost immediately, load the `CrisisCenterModule` in the background.
By the time the user navigates to the _Crisis Center_, its module will have been loaded and ready to go.

That's _preloading_.


{@a how-preloading}


### How preloading works

After each _successful_ navigation, the router looks in its configuration for an unloaded module that it can preload.
Whether it preloads a module, and which modules it preloads, depends upon the *preload strategy*.

The `Router` offers two preloading strategies out of the box:

* No preloading at all which is the default. Lazy loaded feature areas are still loaded on demand.
* Preloading of all lazy loaded feature areas.

Out of the box, the router either never preloads, or preloads every lazy load module.
The `Router` also supports [custom preloading strategies](#custom-preloading) for
fine control over which modules to preload and when.

In this next section, you'll update the `CrisisCenterModule` to load lazily
by default and use the `PreloadAllModules` strategy
to load it (and _all other_ lazy loaded modules) as soon as possible.


{@a lazy-load-crisis-center}


### Lazy load the _crisis center_

Update the route configuration to lazy load the `CrisisCenterModule`.
Take the same steps you used to configure `AdminModule` for lazy load.

1. Change the `crisis-center` path in the `CrisisCenterRoutingModule` to an empty string.

1. Add a `crisis-center` route to the `AppRoutingModule`.

1. Set the `loadChildren` string to load the `CrisisCenterModule`.

1. Remove all mention of the `CrisisCenterModule` from `app.module.ts`.

Here are the updated modules _before enabling preload_:


<code-tabs>

  <code-pane title="app.module.ts" path="router/src/app/app.module.ts">

  </code-pane>

  <code-pane title="app-routing.module.ts" path="router/src/app/app-routing.module.6.ts" region="preload-v1">

  </code-pane>

  <code-pane title="crisis-center-routing.module.ts" path="router/src/app/crisis-center/crisis-center-routing.module.ts">

  </code-pane>

</code-tabs>



You could try this now and confirm that the  `CrisisCenterModule` loads after you click the "Crisis Center" button.

To enable preloading of all lazy loaded modules, import the `PreloadAllModules` token from the Angular router package.

The second argument in the `RouterModule.forRoot` method takes an object for additional configuration options.
The `preloadingStrategy` is one of those options.
Add the `PreloadAllModules` token to the `forRoot` call:

<code-example path="router/src/app/app-routing.module.6.ts" linenums="false" title="src/app/app-routing.module.ts (preload all)" region="forRoot">

</code-example>



This tells the `Router` preloader to immediately load _all_ lazy loaded routes (routes with a `loadChildren` property).

When you visit `http://localhost:3000`, the `/heroes` route loads immediately upon launch
and the router starts loading the `CrisisCenterModule` right after the `HeroesModule` loads.

Surprisingly, the `AdminModule` does _not_ preload. Something is blocking it.


{@a preload-canload}


### CanLoad blocks preload

The `PreloadAllModules` strategy does not load feature areas protected by a [CanLoad](#can-load-guard) guard.
This is by design.

You added a `CanLoad` guard to the route in the `AdminModule` a few steps back
to block loading of that module until the user is authorized.
That `CanLoad` guard takes precedence over the preload strategy.

If you want to preload a module _and_ guard against unauthorized access,
drop the `canLoad` guard and rely on the [CanActivate](guide/router-6#can-activate-guard) guard alone.


{@a custom-preloading}


## Custom Preloading Strategy

Preloading every lazy loaded modules works well in many situations,
but it isn't always the right choice, especially on mobile devices and over low bandwidth connections.
You may choose to preload only certain feature modules, based on user metrics and other business and technical factors.

You can control what and how the router preloads with a custom preloading strategy.

In this section, you'll add a custom strategy that _only_ preloads routes whose `data.preload` flag is set to `true`.
Recall that you can add anything to the `data` property of a route.

Set the `data.preload` flag in the `crisis-center` route in the `AppRoutingModule`.


<code-example path="router/src/app/app-routing.module.ts" linenums="false" title="src/app/app-routing.module.ts (route data preload)" region="preload-v2">

</code-example>



Add a new file to the project called `selective-preloading-strategy.ts`
and define a `SelectivePreloadingStrategy` service class as follows:

<code-example path="router/src/app/selective-preloading-strategy.ts" linenums="false" title="src/app/selective-preloading-strategy.ts (excerpt)">

</code-example>



`SelectivePreloadingStrategy` implements the `PreloadingStrategy`, which has one method, `preload`.

The router calls the `preload` method with two arguments:

1. The route to consider.
1. A loader function that can load the routed module asynchronously.

An implementation of `preload`must return an `Observable`.
If the route should preload, it returns the observable returned by calling the loader function.
If the route should _not_ preload, it returns an `Observable` of `null`.

In this sample, the  `preload` method loads the route if the route's `data.preload` flag is truthy.

It also has a side-effect.
`SelectivePreloadingStrategy` logs the `path` of a selected route in its public `preloadedModules` array.

Shortly, you'll extend the `AdminDashboardComponent` to inject this service and display its `preloadedModules` array.

But first, make a few changes to the `AppRoutingModule`.

1. Import `SelectivePreloadingStrategy` into `AppRoutingModule`.
1. Replace the `PreloadAllModules` strategy in the call to `forRoot` with this `SelectivePreloadingStrategy`.
1. Add the `SelectivePreloadingStrategy` strategy to the `AppRoutingModule` providers array so it can be injected
elsewhere in the app.

Now edit the `AdminDashboardComponent` to display the log of preloaded routes.

1. Import the `SelectivePreloadingStrategy` (it's a service).
1. Inject it into the dashboard's constructor.
1. Update the template to display the strategy service's `preloadedModules` array.

When you're done it looks like this.


<code-example path="router/src/app/admin/admin-dashboard.component.ts" linenums="false" title="src/app/admin/admin-dashboard.component.ts (preloaded modules)">

</code-example>



Once the application loads the initial route, the `CrisisCenterModule` is preloaded.
Verify this by logging in to the `Admin` feature area and noting that the `crisis-center` is listed in the `Preloaded Modules`.
It's also logged to the browser's console.


{@a inspect-config}

## Inspect the router's configuration

You put a lot of effort into configuring the router in several routing module files
and were careful to list them [in the proper order](guide/router-4#routing-module-order).
Are routes actually evaluated as you planned?
How is the router really configured?

You can inspect the router's current configuration any time by injecting it and
examining its `config` property.
For example, update the `AppModule` as follows and look in the browser console window
to see the finished route configuration.

<code-example path="router/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (inspect the router config)" region="inspect-config">

</code-example>



{@a final-app}

## Wrap up and final app

You've covered a lot of ground in this guide and the application is too big to reprint here.
Please visit the <live-example title="Router Sample in Plunker"></live-example>
where you can download the final source code.
