# Milestone 6: Route guards

At the moment, *any* user can navigate *anywhere* in the application *anytime*.
That's not always the right thing to do.

* Perhaps the user is not authorized to navigate to the target component.
* Maybe the user must login (*authenticate*) first.
* Maybe you should fetch some data before you display the target component.
* You might want to save pending changes before leaving a component.
* You might ask the user if it's OK to discard pending changes rather than save them.

You can add _guards_ to the route configuration to handle these scenarios.

A guard's return value controls the router's behavior:

* If it returns `true`, the navigation process continues.
* If it returns `false`, the navigation process stops and the user stays put.


<div class="l-sub-section">



The guard can also tell the router to navigate elsewhere, effectively canceling the current navigation.


</div>

The guard *might* return its boolean answer synchronously.
But in many cases, the guard can't produce an answer synchronously.
The guard could ask the user a question, save changes to the server, or fetch fresh data.
These are all asynchronous operations.

Accordingly, a routing guard can return an `Observable<boolean>` or a `Promise<boolean>` and the
router will wait for the observable to resolve to `true` or `false`.

The router supports multiple kinds of guards:

1. [`CanActivate`](api/router/index/CanActivate-interface) to mediate navigation *to* a route.

2. [`CanActivateChild()`](api/router/index/CanActivateChild-interface) to mediate navigation *to* a child route.

3. [`CanDeactivate`](api/router/index/CanDeactivate-interface) to mediate navigation *away* from the current route.

4. [`Resolve`](api/router/index/Resolve-interface) to perform route data retrieval *before* route activation.

5. [`CanLoad`](api/router/index/CanLoad-interface) to mediate navigation *to* a feature module loaded _asynchronously_.


You can have multiple guards at every level of a routing hierarchy.
The router checks the `CanDeactivate()` and `CanActivateChild()` guards first, from the deepest child route to the top.
Then it checks the `CanActivate()` guards from the top down to the deepest child route. If the feature module
is loaded asynchronously, the `CanLoad()` guard is checked before the module is loaded.
If _any_ guard returns false, pending guards that have not completed will be canceled,
and the entire navigation is canceled.

There are several examples over the next few sections.


{@a can-activate-guard}


## _CanActivate_: requiring authentication

Applications often restrict access to a feature area based on who the user is.
You could permit access only to authenticated users or to users with a specific role.
You might block or limit access until the user's account is activated.

The `CanActivate` guard is the tool to manage these navigation business rules.

### Add an admin feature module

In this next section, you'll extend the crisis center with some new *administrative* features.
Those features aren't defined yet.
But you can start by adding a new feature module named `AdminModule`.

Create an `admin` folder with a feature module file, a routing configuration file, and supporting components.

The admin feature file structure looks like this:


<div class='filetree'>

  <div class='file'>
    src/app/admin
  </div>

  <div class='children'>

    <div class='file'>
      admin-dashboard.component.ts
    </div>

    <div class='file'>
      admin.component.ts
    </div>

    <div class='file'>
      admin.module.ts
    </div>

    <div class='file'>
      admin-routing.module.ts
    </div>

    <div class='file'>
      manage-crises.component.ts
    </div>

    <div class='file'>
      manage-heroes.component.ts
    </div>

  </div>

</div>



The admin feature module contains the `AdminComponent` used for routing within the
feature module, a dashboard route and two unfinished components to manage crises and heroes.


<code-tabs>

  <code-pane title="src/app/admin/admin-dashboard.component.ts" path="router/src/app/admin/admin-dashboard.component.1.ts">

  </code-pane>

  <code-pane title="src/app/admin/admin.component.ts" path="router/src/app/admin/admin.component.ts">

  </code-pane>

  <code-pane title="src/app/admin/admin.module.ts" path="router/src/app/admin/admin.module.ts">

  </code-pane>

  <code-pane title="src/app/admin/manage-crises.component.ts" path="router/src/app/admin/manage-crises.component.ts">

  </code-pane>

  <code-pane title="src/app/admin/manage-heroes.component.ts" path="router/src/app/admin/manage-heroes.component.ts">

  </code-pane>

</code-tabs>



<div class="l-sub-section">



Since the admin dashboard `RouterLink` is an empty path route in the `AdminComponent`, it
is considered a match to any route within the admin feature area.
You only want the `Dashboard` link to be active when the user visits that route.
Adding an additional binding to the `Dashboard` routerLink,
`[routerLinkActiveOptions]="{ exact: true }"`, marks the `./` link as active when
the user navigates to the `/admin` URL and not when navigating to any of the child routes.


</div>



The initial admin routing configuration:


<code-example path="router/src/app/admin/admin-routing.module.1.ts" linenums="false" title="src/app/admin/admin-routing.module.ts (admin routing)" region="admin-routes">

</code-example>



{@a component-less-route}


## Component-less route: grouping routes without a component
Looking at the child route under the `AdminComponent`, there is a `path` and a `children`
property but it's not using a `component`.
You haven't made a mistake in the configuration.
You've defined a _component-less_ route.

The goal is to group the `Crisis Center` management routes under the `admin` path.
You don't need a component to do it.
A _component-less_ route makes it easier to [guard child routes](#can-activate-child-guard).


Next, import the `AdminModule` into `app.module.ts` and add it to the `imports` array
to register the admin routes.


<code-example path="router/src/app/app.module.4.ts" linenums="false" title="src/app/app.module.ts (admin module)" region="admin-module">

</code-example>



Add an "Admin" link to the `AppComponent` shell so that users can get to this feature.


<code-example path="router/src/app/app.component.5.ts" linenums="false" title="src/app/app.component.ts (template)" region="template">

</code-example>



{@a guard-admin-feature}


### Guard the admin feature

Currently every route within the *Crisis Center* is open to everyone.
The new *admin* feature should be accessible only to authenticated users.

You could hide the link until the user logs in. But that's tricky and difficult to maintain.

Instead you'll write a `CanActivate()` guard to redirect anonymous users to the
login page when they try to enter the admin area.

This is a general purpose guard&mdash;you can imagine other features
that require authenticated users&mdash;so you create an
`auth-guard.service.ts` in the application root folder.

At the moment you're interested in seeing how guards work so the first version does nothing useful.
It simply logs to console and `returns` true immediately, allowing navigation to proceed:


<code-example path="router/src/app/auth-guard.service.1.ts" linenums="false" title="src/app/auth-guard.service.ts (excerpt)">

</code-example>



Next, open `admin-routing.module.ts `, import the `AuthGuard` class, and
update the admin route with a `CanActivate()` guard property that references it:


<code-example path="router/src/app/admin/admin-routing.module.2.ts" linenums="false" title="src/app/admin/admin-routing.module.ts (guarded admin route)" region="admin-route">

</code-example>



The admin feature is now protected by the guard, albeit protected poorly.


{@a teach-auth}


### Teach *AuthGuard* to authenticate

Make the `AuthGuard` at least pretend to authenticate.

The `AuthGuard` should call an application service that can login a user and retain information about the current user.
Here's a demo `AuthService`:


<code-example path="router/src/app/auth.service.ts" linenums="false" title="src/app/auth.service.ts (excerpt)">

</code-example>



Although it doesn't actually log in, it has what you need for this discussion.
It has an `isLoggedIn` flag to tell you whether the user is authenticated.
Its `login` method simulates an API call to an external service by returning an
Observable that resolves successfully after a short pause.
The `redirectUrl` property will store the attempted URL so you can navigate to it after authenticating.

Revise the `AuthGuard` to call it.


<code-example path="router/src/app/auth-guard.service.2.ts" linenums="false" title="src/app/auth-guard.service.ts (v2)">

</code-example>



Notice that you *inject* the `AuthService` and the `Router` in the constructor.
You haven't provided the `AuthService` yet but it's good to know that you can inject helpful services into routing guards.

This guard returns a synchronous boolean result.
If the user is logged in, it returns true and the navigation continues.

The `ActivatedRouteSnapshot` contains the _future_ route that will be activated and the `RouterStateSnapshot`
contains the _future_ `RouterState` of the application, should you pass through the guard check.

If the user is not logged in, you store the attempted URL the user came from using the `RouterStateSnapshot.url` and
tell the router to navigate to a login page&mdash;a page you haven't created yet.
This secondary navigation automatically cancels the current navigation; `checkLogin()` returns
`false` just to be clear about that.


{@a add-login-component}


### Add the *LoginComponent*

You need a `LoginComponent` for the user to log in to the app. After logging in, you'll redirect
to the stored URL if available, or use the default URL.
There is nothing new about this component or the way you wire it into the router configuration.

Register a `/login` route in the `login-routing.module.ts` and add the necessary providers to the `providers`
array. In `app.module.ts`, import the `LoginComponent` and add it to the `AppModule` `declarations`.
Import and add the `LoginRoutingModule` to the `AppModule` imports as well.


<code-tabs>

  <code-pane title="src/app/app.module.ts" path="router/src/app/app.module.ts">

  </code-pane>

  <code-pane title="src/app/login.component.ts" path="router/src/app/login.component.1.ts">

  </code-pane>

  <code-pane title="src/app/login-routing.module.ts" path="router/src/app/login-routing.module.ts">

  </code-pane>

</code-tabs>



<div class="l-sub-section">



Guards and the service providers they require _must_ be provided at the module-level. This allows
the Router access to retrieve these services from the `Injector` during the navigation process.
The same rule applies for feature modules loaded [asynchronously](guide/router-7#asynchronous-routing).


</div>



{@a can-activate-child-guard}


## _CanActivateChild_: guarding child routes

You can also protect child routes with the `CanActivateChild` guard.
The `CanActivateChild` guard is similar to the `CanActivate` guard.
The key difference is that it runs _before_  any child route is activated.

You protected the admin feature module from unauthorized access.
You should also protect child routes _within_ the feature module.

Extend the `AuthGuard` to protect when navigating between the `admin` routes.
Open `auth-guard.service.ts` and add the `CanActivateChild` interface to the imported tokens from the router package.

Next, implement the `CanActivateChild` method which takes the same arguments as the `CanActivate` method:
an `ActivatedRouteSnapshot` and `RouterStateSnapshot`.
The `CanActivateChild` method can return an `Observable<boolean>` or `Promise<boolean>` for
async checks and a `boolean` for sync checks.
This one returns a `boolean`:


<code-example path="router/src/app/auth-guard.service.3.ts" linenums="false" title="src/app/auth-guard.service.ts (excerpt)" region="can-activate-child">

</code-example>



Add the same `AuthGuard` to the `component-less` admin route to protect all other child routes at one time
instead of adding the `AuthGuard` to each route individually.


<code-example path="router/src/app/admin/admin-routing.module.3.ts" linenums="false" title="src/app/admin/admin-routing.module.ts (excerpt)" region="can-activate-child">

</code-example>



{@a can-deactivate-guard}


## _CanDeactivate_: handling unsaved changes
Back in the "Heroes" workflow, the app accepts every change to a hero immediately without hesitation or validation.

In the real world, you might have to accumulate the users changes.
You might have to validate across fields.
You might have to validate on the server.
You might have to hold changes in a pending state until the user confirms them *as a group* or
cancels and reverts all changes.

What do you do about unapproved, unsaved changes when the user navigates away?
You can't just leave and risk losing the user's changes; that would be a terrible experience.

It's better to pause and let the user decide what to do.
If the user cancels, you'll stay put and allow more changes.
If the user approves, the app can save.

You still might delay navigation until the save succeeds.
If you let the user move to the next screen immediately and
the save were to fail (perhaps the data are ruled invalid), you would lose the context of the error.

You can't block while waiting for the server&mdash;that's not possible in a browser.
You need to stop the navigation while you wait, asynchronously, for the server
to return with its answer.

You need the `CanDeactivate` guard.

{@a cancel-save}


## Cancel and save

The sample application doesn't talk to a server.
Fortunately, you have another way to demonstrate an asynchronous router hook.

Users update crisis information in the `CrisisDetailComponent`.
Unlike the `HeroDetailComponent`, the user changes do not update the crisis entity immediately.
Instead, the app updates the entity when the user presses the *Save* button and
discards the changes when the user presses the *Cancel* button.

Both buttons navigate back to the crisis list after save or cancel.


<code-example path="router/src/app/crisis-center/crisis-detail.component.ts" linenums="false" title="src/app/crisis-center/crisis-detail.component.ts (cancel and save methods)" region="cancel-save">

</code-example>



What if the user tries to navigate away without saving or canceling?
The user could push the browser back button or click the heroes link.
Both actions trigger a navigation.
Should the app save or cancel automatically?

This demo does neither. Instead, it asks the user to make that choice explicitly
in a confirmation dialog box that *waits asynchronously for the user's
answer*.

<div class="l-sub-section">



You could wait for the user's answer with synchronous, blocking code.
The app will be more responsive&mdash;and can do other work&mdash;by
waiting for the user's answer asynchronously. Waiting for the user asynchronously
is like waiting for the server asynchronously.

</div>



The `DialogService`, provided in the `AppModule` for app-wide use, does the asking.

It returns a [promise](http://exploringjs.com/es6/ch_promises.html) that
*resolves* when the user eventually decides what to do: either
to discard changes and navigate away (`true`) or to preserve the pending changes and stay in the crisis editor (`false`).


{@a CanDeactivate}


Create a _guard_ that checks for the presence of a `canDeactivate` method in a component&mdash;any component.
The `CrisisDetailComponent` will have this method.
But the guard doesn't have to know that.
The guard shouldn't know the details of any component's deactivation method.
It need only detect that the component has a `canDeactivate()` method and call it.
This approach makes the guard reusable.


<code-example path="router/src/app/can-deactivate-guard.service.ts" title="src/app/can-deactivate-guard.service.ts">

</code-example>



Alternatively, you could make a component-specific `CanDeactivate` guard for the `CrisisDetailComponent`.
The `canDeactivate()` method provides you with the current
instance of the `component`, the current `ActivatedRoute`,
and `RouterStateSnapshot` in case you needed to access
some external information. This would be useful if you only
wanted to use this guard for this component and needed to get
the component's properties or confirm whether the router should allow navigation away from it.


<code-example path="router/src/app/can-deactivate-guard.service.1.ts" linenums="false" title="src/app/can-deactivate-guard.service.ts (component-specific)">

</code-example>



Looking back at the `CrisisDetailComponent`, it implements the confirmation workflow for unsaved changes.


<code-example path="router/src/app/crisis-center/crisis-detail.component.ts" linenums="false" title="src/app/crisis-center/crisis-detail.component.ts (excerpt)" region="canDeactivate">

</code-example>



Notice that the `canDeactivate` method *can* return synchronously;
it returns `true` immediately if there is no crisis or there are no pending changes.
But it can also return a `Promise` or an `Observable` and the router will wait for that
to resolve to truthy (navigate) or falsy (stay put).


Add the `Guard` to the crisis detail route in `crisis-center-routing.module.ts` using the `canDeactivate` array.


<code-example path="router/src/app/crisis-center/crisis-center-routing.module.3.ts" linenums="false" title="src/app/crisis-center/crisis-center-routing.module.ts (can deactivate guard)">

</code-example>



Add the `Guard` to the main `AppRoutingModule` `providers` array so the
`Router` can inject it during the navigation process.


<code-example path="router/src/app/app-routing.module.4.ts">

</code-example>



Now you have given the user a safeguard against unsaved changes.
{@a Resolve}

{@a resolve-guard}


## _Resolve_: pre-fetching component data

In the `Hero Detail` and `Crisis Detail`, the app waited until the route was activated to fetch the respective hero or crisis.

This worked well, but there's a better way.
If you were using a real world API, there might be some delay before the data to display is returned from the server.
You don't want to display a blank component while waiting for the data.

It's preferable to pre-fetch data from the server so it's ready the
moment the route is activated. This also allows you to handle errors before routing to the component.
There's no point in navigating to a crisis detail for an `id` that doesn't have a record.
It'd be better to send the user back to the `Crisis List` that shows only valid crisis centers.

In summary, you want to delay rendering the routed component until all necessary data have been fetched.

You need a *resolver*.


{@a fetch-before-navigating}


## Fetch data before navigating

At the moment, the `CrisisDetailComponent` retrieves the selected crisis.
If the crisis is not found, it navigates back to the crisis list view.

The experience might be better if all of this were handled first, before the route is activated.
A `CrisisDetailResolver` service could retrieve a `Crisis` or navigate away if the `Crisis` does not exist
_before_ activating the route and creating the `CrisisDetailComponent`.

Create the `crisis-detail-resolver.service.ts` file within the `Crisis Center` feature area.


<code-example path="router/src/app/crisis-center/crisis-detail-resolver.service.ts" title="src/app/crisis-center/crisis-detail-resolver.service.ts">

</code-example>



Take the relevant parts of the crisis retrieval logic in `CrisisDetailComponent.ngOnInit`
and move them into the `CrisisDetailResolver`.
Import the `Crisis` model, `CrisisService`, and the `Router`
so you can navigate elsewhere if you can't fetch the crisis.

Be explicit. Implement the `Resolve` interface with a type of `Crisis`.

Inject the `CrisisService` and `Router` and implement the `resolve()` method.
That method could return a `Promise`, an `Observable`, or a synchronous return value.

The `CrisisService.getCrisis` method returns a promise.
Return that promise to prevent the route from loading until the data is fetched.
If it doesn't return a valid `Crisis`, navigate the user back to the `CrisisListComponent`,
canceling the previous in-flight navigation to the `CrisisDetailComponent`.

Import this resolver in the `crisis-center-routing.module.ts`
and add a `resolve` object to the `CrisisDetailComponent` route configuration.

Remember to add the `CrisisDetailResolver` service to the `CrisisCenterRoutingModule`'s `providers` array.


<code-example path="router/src/app/crisis-center/crisis-center-routing.module.4.ts" linenums="false" title="src/app/crisis-center/crisis-center-routing.module.ts (resolver)" region="crisis-detail-resolver">

</code-example>



The `CrisisDetailComponent` should no longer fetch the crisis.
Update the `CrisisDetailComponent` to get the crisis from the  `ActivatedRoute.data.crisis` property instead;
that's where you said it should be when you re-configured the route.
It will be there when the `CrisisDetailComponent` ask for it.


<code-example path="router/src/app/crisis-center/crisis-detail.component.ts" linenums="false" title="src/app/crisis-center/crisis-detail.component.ts (ngOnInit v2)" region="ngOnInit">

</code-example>



**Two critical points**

1. The router's `Resolve` interface is optional.
The `CrisisDetailResolver` doesn't inherit from a base class.
The router looks for that method and calls it if found.

1. Rely on the router to call the resolver.
Don't worry about all the ways that the user  could navigate away.
That's the router's job. Write this class and let the router take it from there.

The relevant *Crisis Center* code for this milestone follows.


<code-tabs>

  <code-pane title="app.component.ts" path="router/src/app/app.component.ts">

  </code-pane>

  <code-pane title="crisis-center-home.component.ts" path="router/src/app/crisis-center/crisis-center-home.component.ts">

  </code-pane>

  <code-pane title="crisis-center.component.ts" path="router/src/app/crisis-center/crisis-center.component.ts">

  </code-pane>

  <code-pane title="crisis-center-routing.module.ts" path="router/src/app/crisis-center/crisis-center-routing.module.4.ts">

  </code-pane>

  <code-pane title="crisis-list.component.ts" path="router/src/app/crisis-center/crisis-list.component.ts">

  </code-pane>

  <code-pane title="crisis-detail.component.ts" path="router/src/app/crisis-center/crisis-detail.component.ts">

  </code-pane>

  <code-pane title="crisis-detail-resolver.service.ts" path="router/src/app/crisis-center/crisis-detail-resolver.service.ts">

  </code-pane>

  <code-pane title="crisis.service.ts" path="router/src/app/crisis-center/crisis.service.ts">

  </code-pane>

</code-tabs>



<code-tabs>

  <code-pane title="auth-guard.service.ts" path="router/src/app/auth-guard.service.3.ts">

  </code-pane>

  <code-pane title="can-deactivate-guard.service.ts" path="router/src/app/can-deactivate-guard.service.ts">

  </code-pane>

</code-tabs>



{@a query-parameters}


{@a fragment}


## Query parameters and fragments

In the [route parameters](guide/router-4#optional-route-parameters) example, you only dealt with parameters specific to
the route, but what if you wanted optional parameters available to all routes?
This is where query parameters come into play.

[Fragments](https://en.wikipedia.org/wiki/Fragment_identifier) refer to certain elements on the page
identified with an `id` attribute.

Update the `AuthGuard` to provide a `session_id` query that will remain after navigating to another route.

Add an `anchor` element so you can jump to a certain point on the page.

Add the `NavigationExtras` object to the `router.navigate` method that navigates you to the `/login` route.


<code-example path="router/src/app/auth-guard.service.4.ts" linenums="false" title="src/app/auth-guard.service.ts (v3)">

</code-example>



You can also preserve query parameters and fragments across navigations without having to provide them
again when navigating. In the `LoginComponent`, you'll add an *object* as the
second argument in the `router.navigate` function
and provide the `preserveQueryParams` and `preserveFragment` to pass along the current query parameters
and fragment to the next route.


<code-example path="router/src/app/login.component.ts" linenums="false" title="src/app/login.component.ts (preserve)" region="preserve">

</code-example>



Since you'll be navigating to the *Admin Dashboard* route after logging in, you'll update it to handle the
query parameters and fragment.


<code-example path="router/src/app/admin/admin-dashboard.component.2.ts" linenums="false" title="src/app/admin/admin-dashboard.component.ts (v2)">

</code-example>



*Query Parameters* and *Fragments* are also available through the `ActivatedRoute` service.
Just like *route parameters*, the query parameters and fragments are provided as an `Observable`.
The updated *Crisis Admin* component feeds the `Observable` directly into the template using the `AsyncPipe`.


Now, you can click on the *Admin* button, which takes you to the *Login*
page with the provided `query params` and `fragment`. After you click the login button, notice that
you have been redirected to the `Admin Dashboard` page with the `query params` and `fragment` still intact.

You can use these persistent bits of information for things that need to be provided across pages like
authentication tokens or session ids.


<div class="l-sub-section">



The `query params` and `fragment` can also be preserved using a `RouterLink` with
the `preserveQueryParams` and `preserveFragment` bindings respectively.


</div>

## Next step 

Learn how to [_lazy load_ modules](guide/router-7) asynchronously.