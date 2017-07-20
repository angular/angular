@title
Routing

@intro
Add the Angular component router and learn to navigate among the views.

@description



There are new requirements for the Tour of Heroes app:

* Add a *Dashboard* view.
* Add the ability to navigate between the *Heroes* and *Dashboard* views.
* When users click a hero name in either view, navigate to a detail view of the selected hero.
* When users click a *deep link* in an email, open the detail view for a particular hero.

When you’re done, users will be able to navigate the app like this:


<figure>
  <img src='generated/images/guide/toh/nav-diagram.png' alt="View navigations">
</figure>



To satisfy these requirements, you'll add Angular’s router to the app.


<div class="l-sub-section">



For more information about the router, read the [Routing and Navigation](guide/router) page.


</div>



When you're done with this page, the app should look like this <live-example></live-example>.



## Where you left off
Before continuing with the Tour of Heroes, verify that you have the following structure.



<div class='filetree'>

  <div class='file'>
    angular-tour-of-heroes
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
          hero.service.ts
        </div>

        <div class='file'>
          hero.ts
        </div>

        <div class='file'>
          hero-detail.component.ts
        </div>

        <div class='file'>
          mock-heroes.ts
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
        systemjs.config.js
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



## Keep the app transpiling and running
Enter the following command in the terminal window:


<code-example language="sh" class="code-shell">
  npm start

</code-example>



This command runs the TypeScript compiler in "watch mode", recompiling automatically when the code changes.
The command simultaneously launches the app in a browser and refreshes the browser when the code changes.


You can keep building the Tour of Heroes without pausing to recompile or refresh the browser.

## Action plan

Here's the plan:

* Turn `AppComponent` into an application shell that only handles navigation.
* Relocate the *Heroes* concerns within the current `AppComponent` to a separate `HeroesComponent`.
* Add routing.
* Create a new `DashboardComponent`.
* Tie the *Dashboard* into the navigation structure.


<div class="l-sub-section">



*Routing* is another name for *navigation*. The router is the mechanism for navigating from view to view.


</div>




## Splitting the *AppComponent*

The current app loads `AppComponent` and immediately displays the list of heroes.

The revised app should present a shell with a choice of views (*Dashboard* and *Heroes*)
and then default to one of them.

The `AppComponent` should only handle navigation, so you'll
move the display of *Heroes* out of `AppComponent` and into its own `HeroesComponent`.

### *HeroesComponent*

`AppComponent` is already dedicated to *Heroes*.
Instead of moving the code out of `AppComponent`, rename it to `HeroesComponent`
and create a separate `AppComponent` shell.

Do the following:

* Rename the <code>app.component.ts</code> file to <code>heroes.component.ts</code>.
* Rename the `AppComponent` class as `HeroesComponent` (rename locally, _only_ in this file).
* Rename the selector `my-app` as `my-heroes`.


<code-example path="toh-pt5/src/app/heroes.component.ts" region="renaming" title="src/app/heroes.component.ts (showing renamings only)">

</code-example>



### Create *AppComponent*

The new `AppComponent` is the application shell.
It will have some navigation links at the top and a display area below.

Perform these steps:

* Create the file <code>src/app/app.component.ts</code>.
* Define an exported `AppComponent` class.
* Add an `@Component` decorator above the class with a `my-app` selector.
* Move the following from `HeroesComponent` to `AppComponent`:

  * `title` class property.
  * `@Component` template `<h1>` element, which contains a binding to  `title`.

* Add a `<my-heroes>` element to the app template just below the heading so you still see the heroes.
* Add `HeroesComponent` to the `declarations` array of `AppModule` so Angular recognizes the `<my-heroes>` tags.
* Add `HeroService` to the  `providers` array of `AppModule` because you'll need it in every other view.
* Remove `HeroService` from the `HeroesComponent` `providers` array since it was promoted.
* Add the supporting `import` statements for `AppComponent`.

The first draft looks like this:


<code-tabs>

  <code-pane title="src/app/app.component.ts (v1)" path="toh-pt5/src/app/app.component.1.ts">

  </code-pane>

  <code-pane title="src/app/app.module.ts (v1)" path="toh-pt5/src/app/app.module.1.ts">

  </code-pane>

</code-tabs>



The app still runs and displays heroes.


## Add routing

Instead of displaying automatically, heroes should display after users click a button.
In other words, users should be able to navigate to the list of heroes.

Use the Angular router to enable navigation.


The Angular router is an external, optional Angular NgModule called `RouterModule`.
The router is a combination of multiple provided services (`RouterModule`),
multiple directives (`RouterOutlet, RouterLink, RouterLinkActive`),
and a configuration (`Routes`). You'll configure the routes first.


### *&lt;base href>*

Open `index.html` and ensure there is a `<base href="...">` element
(or a script that dynamically sets this element)
at the top of the `<head>` section.


<code-example path="toh-pt5/src/index.html" region="base-href" title="src/index.html (base-href)">

</code-example>



<div class="callout is-important">



<header>
  base href is essential
</header>



For more information, see the [Set the base href](guide/router)
section of the [Routing and Navigation](guide/router) page.



</div>



{@a configure-routes}


### Configure routes

Create a configuration file for the app routes.


*Routes* tell the router which views to display when a user clicks a link or
pastes a URL into the browser address bar.

Define the first route as a route to the heroes component.


<code-example path="toh-pt5/src/app/app.module.2.ts" region="heroes" title="src/app/app.module.ts (heroes route)">

</code-example>



The `Routes` are an array of *route definitions*.

This route definition has the following parts:

* *Path*: The router matches this route's path to the URL in the browser address bar (`heroes`).
* *Component*: The component that the router should create when navigating to this route (`HeroesComponent`).



<div class="l-sub-section">



Read more about defining routes with `Routes` in the [Routing & Navigation](guide/router) page.


</div>



### Make the router available

Import the `RouterModule` and add it to the `AppModule` imports array.


<code-example path="toh-pt5/src/app/app.module.2.ts" title="src/app/app.module.ts (app routing)">

</code-example>



<div class="l-sub-section">



The `forRoot()` method is called because a configured router is provided at the app's root.
The `forRoot()` method supplies the Router service providers and directives needed for routing, and
performs the initial navigation based on the current browser URL.


</div>



### Router outlet

If you paste the path, `/heroes`, into the browser address bar at the end of the URL,
the router should match it to the `heroes` route and display the `HeroesComponent`.
However, you have to tell the router where to display the component.
To do this, you can add a `<router-outlet>` element at the end of the template.
`RouterOutlet` is one of the directives provided by the `RouterModule`.
The router displays each component immediately below the `<router-outlet>` as users navigate through the app.

### Router links

Users shouldn't have to paste a route URL into the address bar.
Instead, add an anchor tag to the template that, when clicked, triggers navigation to the `HeroesComponent`.

The revised template looks like this:


<code-example path="toh-pt5/src/app/app.component.1.ts" region="template-v2" title="src/app/app.component.ts (template-v2)">

</code-example>



Note the `routerLink` binding in the anchor tag.
The `RouterLink` directive (another of the `RouterModule` directives) is bound to a string
that tells the router where to navigate when the user clicks the link.

Since the link is not dynamic, a routing instruction is defined with a one-time binding to the route path.
Looking back at the route configuration, you can confirm that `'/heroes'` is the path of the route to the `HeroesComponent`.

<div class="l-sub-section">



Read more about dynamic router links and the link parameters array
in the [Appendix: Link Parameters Array](guide/router#link-parameters-array) section of the
[Routing & Navigation](guide/router) page.


</div>



Refresh the browser. The browser displays the app title and heroes link, but not the heroes list.


<div class="l-sub-section">



The browser's address bar shows `/`.
The route path to `HeroesComponent` is `/heroes`, not `/`.
Soon you'll add a route that matches the path `/`.


</div>



Click the *Heroes* navigation link. The address bar updates to `/heroes`
and the list of heroes displays.

`AppComponent` now looks like this:


<code-example path="toh-pt5/src/app/app.component.1.ts" region="v2" title="src/app/app.component.ts (v2)">

</code-example>



The  *AppComponent* is now attached to a router and displays routed views.
For this reason, and to distinguish it from other kinds of components,
this component type is called a *router component*.


## Add a dashboard

Routing only makes sense when multiple views exist.
To add another view, create a placeholder `DashboardComponent`, which users can navigate to and from.


<code-example path="toh-pt5/src/app/dashboard.component.1.ts" title="src/app/dashboard.component.ts (v1)">

</code-example>



You'll make this component more useful later.

### Configure the dashboard route

To teach `app.module.ts` to navigate to the dashboard,
import the dashboard component and
add the following route definition to the `Routes` array of definitions.


<code-example path="toh-pt5/src/app/app.module.3.ts" region="dashboard" title="src/app/app.module.ts (Dashboard route)">

</code-example>



Also import and add `DashboardComponent` to the `AppModule`'s `declarations`.


<code-example path="toh-pt5/src/app/app.module.ts" region="dashboard" title="src/app/app.module.ts (dashboard)">

</code-example>



### Add a redirect route

Currently, the browser launches with `/` in the address bar.
When the app starts, it should show the dashboard and
display a `/dashboard` URL in the browser address bar.


To make this happen, use a redirect route. Add the following
to the array of route definitions:


<code-example path="toh-pt5/src/app/app.module.3.ts" region="redirect" title="src/app/app.module.ts (redirect)">

</code-example>



<div class="l-sub-section">



Read more about *redirects* in the [Redirecting routes](guide/router) section
of the [Routing & Navigation](guide/router) page.


</div>



### Add navigation to the template

Add a dashboard navigation link to the template, just above the *Heroes* link.


<code-example path="toh-pt5/src/app/app.component.1.ts" region="template-v3" title="src/app/app.component.ts (template-v3)">

</code-example>



<div class="l-sub-section">



The `<nav>` tags don't do anything yet, but they'll be useful later when you style the links.


</div>



In your browser, go to the application root (`/`) and reload.
The app displays the dashboard and you can navigate between the dashboard and the heroes.

## Add heroes to the dashboard

To make the dashboard more interesting, you'll display the top four heroes at a glance.

Replace the `template` metadata with a `templateUrl` property that points to a new
template file.


<code-example path="toh-pt5/src/app/dashboard.component.ts" region="metadata" title="src/app/dashboard.component.ts (metadata)">

</code-example>



Create that file with this content:


<code-example path="toh-pt5/src/app/dashboard.component.1.html" title="src/app/dashboard.component.html">

</code-example>



`*ngFor` is used again to iterate over a list of heroes and display their names.
The extra `<div>` elements will help with styling later.

### Sharing the *HeroService*

To populate the component's `heroes` array, you can re-use the `HeroService`.

Earlier, you removed the `HeroService` from the `providers` array of `HeroesComponent`
and added it to the `providers` array of `AppModule`.
That move created a singleton `HeroService` instance, available to all components of the app.
Angular injects `HeroService` and you can use it in the `DashboardComponent`.

### Get heroes

In <code>dashboard.component.ts</code>, add the following `import` statements.


<code-example path="toh-pt5/src/app/dashboard.component.ts" region="imports" title="src/app/dashboard.component.ts (imports)">

</code-example>



Now create the `DashboardComponent` class like this:


<code-example path="toh-pt5/src/app/dashboard.component.ts" region="class" title="src/app/dashboard.component.ts (class)">

</code-example>



This kind of logic is also used in the `HeroesComponent`:

* Define a `heroes` array property.
* Inject the `HeroService` in the constructor and hold it in a private `heroService` field.
* Call the service to get heroes inside the Angular `ngOnInit()` lifecycle hook.

In this dashboard you specify four heroes (2nd, 3rd, 4th, and 5th) with the `Array.slice` method.

Refresh the browser to see four hero names in the new dashboard.



## Navigating to hero details

While the details of a selected hero displays at the bottom of the `HeroesComponent`,
users should be able to navigate to the `HeroDetailComponent` in the following additional ways:

* From the dashboard to a selected hero.
* From the heroes list to a selected hero.
* From a "deep link" URL pasted into the browser address bar.

### Routing to a hero detail

You can add a route to the `HeroDetailComponent` in `app.module.ts`, where the other routes are configured.

The new route is unusual in that you must tell the `HeroDetailComponent` which hero to show.
You didn't have to tell the `HeroesComponent` or the `DashboardComponent` anything.

Currently, the parent `HeroesComponent` sets the component's `hero` property to a
hero object with a binding like this:


<code-example language="html">
  &lt;hero-detail [hero]="selectedHero">&lt;/hero-detail>

</code-example>



But this binding won't work in any of the routing scenarios.

### Parameterized route

You can add the hero's `id` to the URL. When routing to the hero whose `id` is 11,
you could expect to see a URL such as this:


<code-example format="nocode">
  /detail/11

</code-example>



The `/detail/` part of the URL is constant. The trailing numeric `id` changes from hero to hero.
You need to represent the variable part of the route with a *parameter* (or *token*) that stands for the hero's `id`.

### Configure a route with a parameter

Use the following *route definition*.


<code-example path="toh-pt5/src/app/app.module.3.ts" region="hero-detail" title="src/app/app.module.ts (hero detail)">

</code-example>



The colon (:) in the path indicates that `:id` is a placeholder for a specific hero `id`
when navigating to the `HeroDetailComponent`.


<div class="l-sub-section">



Be sure to import the hero detail component before creating this route.


</div>



You're finished with the app routes.

You didn't add a `'Hero Detail'` link to the template because users
don't click a navigation *link* to view a particular hero;
they click a *hero name*, whether the name displays on the dashboard or in the heroes list.

You don't need to add the hero clicks until the `HeroDetailComponent`
is revised and ready to be navigated to.



## Revise the *HeroDetailComponent*

Here's what the `HeroDetailComponent` looks like now:


<code-example path="toh-pt4/src/app/hero-detail.component.ts" title="src/app/hero-detail.component.ts (current)">

</code-example>



The template won't change. Hero names will display the same way.
The major changes are driven by how you get hero names.


You'll no longer receive the hero in a parent component property binding.
The new `HeroDetailComponent` should take the `id` parameter from the `params` Observable
in the `ActivatedRoute` service and use the `HeroService` to fetch the hero with that `id`.


Add the following imports:


<code-example path="toh-pt5/src/app/hero-detail.component.1.ts" region="added-imports" title="src/app/hero-detail.component.ts">

</code-example>



Inject the `ActivatedRoute`, `HeroService`, and `Location` services
into the constructor, saving their values in private fields:


<code-example path="toh-pt5/src/app/hero-detail.component.ts" region="ctor" title="src/app/hero-detail.component.ts (constructor)">

</code-example>



Import the `switchMap` operator to use later with the route parameters `Observable`.


<code-example path="toh-pt5/src/app/hero-detail.component.ts" region="rxjs-import" title="src/app/hero-detail.component.ts (switchMap import)">

</code-example>



Tell the class to implement the `OnInit` interface.


<code-example path="toh-pt5/src/app/hero-detail.component.ts" region="implement" title="src/app/hero-detail.component.ts">

</code-example>



Inside the `ngOnInit()` lifecycle hook, use the `params` Observable to
extract the `id` parameter value from the `ActivatedRoute` service
and use the `HeroService` to fetch the hero with that `id`.


<code-example path="toh-pt5/src/app/hero-detail.component.ts" region="ngOnInit" title="src/app/hero-detail.component.ts">

</code-example>



The `switchMap` operator maps the `id` in the Observable route parameters
to a new `Observable`, the result of the `HeroService.getHero()` method.

If a user re-navigates to this component while a `getHero` request is still processing,
`switchMap` cancels the old request and then calls `HeroService.getHero()` again.


The hero `id` is a number. Route parameters are always strings.
So the route parameter value is converted to a number with the JavaScript (+) operator.


<div class="l-sub-section">



### Do you need to unsubscribe?

As described in the [ActivatedRoute: the one-stop-shop for route information](guide/router#activated-route)
section of the [Routing & Navigation](guide/router) page,
the `Router` manages the observables it provides and localizes
the subscriptions. The subscriptions are cleaned up when the component is destroyed, protecting against
memory leaks, so you don't need to unsubscribe from the route `params` `Observable`.


</div>



### Add *HeroService.getHero()*

In the previous code snippet, `HeroService` doesn't have a `getHero()` method. To fix this issue,
open `HeroService` and add a `getHero()` method that filters the heroes list from `getHeroes()` by `id`.


<code-example path="toh-pt5/src/app/hero.service.ts" region="getHero" title="src/app/hero.service.ts (getHero)">

</code-example>



### Find the way back

Users have several ways to navigate *to* the `HeroDetailComponent`.

To navigate somewhere else, users can click one of the two links in the `AppComponent` or click the browser's back button.
Now add a third option, a `goBack()` method that navigates backward one step in the browser's history stack
using the `Location` service you injected previously.


<code-example path="toh-pt5/src/app/hero-detail.component.ts" region="goBack" title="src/app/hero-detail.component.ts (goBack)">

</code-example>



<div class="l-sub-section">



Going back too far could take users out of the app.
In a real app, you can prevent this issue with the <em>CanDeactivate</em> guard.
Read more on the [CanDeactivate](api/router/CanDeactivate) page.


</div>



You'll wire this method with an event binding to a *Back* button that you'll add to the component template.


<code-example path="toh-pt5/src/app/hero-detail.component.html" region="back-button">

</code-example>



Migrate the template to its own file
called <code>hero-detail.component.html</code>:


<code-example path="toh-pt5/src/app/hero-detail.component.html" title="src/app/hero-detail.component.html">

</code-example>



Update the component metadata with a `templateUrl` pointing to the template file that you just created.



<code-example path="toh-pt5/src/app/hero-detail.component.ts" region="metadata" title="src/app/hero-detail.component.ts (metadata)">

</code-example>



Refresh the browser and see the results.



## Select a dashboard hero

When a user selects a hero in the dashboard, the app should navigate to the `HeroDetailComponent` to view and edit the selected hero.

Although the dashboard heroes are presented as button-like blocks, they should behave like anchor tags.
When hovering over a hero block, the target URL should display in the browser status bar
and the user should be able to copy the link or open the hero detail view in a new tab.

To achieve this effect, reopen `dashboard.component.html` and replace the repeated `<div *ngFor...>` tags
with `<a>` tags. Change the opening `<a>` tag to the following:


<code-example path="toh-pt5/src/app/dashboard.component.html" region="click" title="src/app/dashboard.component.html (repeated &lt;a&gt; tag)">

</code-example>



Notice the `[routerLink]` binding.
As described in the [Router links](tutorial/toh-pt5#router-links) section of this page,
top-level navigation in the `AppComponent` template has router links set to fixed paths of the
destination routes, "/dashboard" and "/heroes".

This time, you're binding to an expression containing a *link parameters array*.
The array has two elements: the *path* of
the destination route and a *route parameter* set to the value of the current hero's `id`.

The two array items align with the *path* and *:id*
token in the parameterized hero detail route definition that you added to
`app.module.ts` earlier:


<code-example path="toh-pt5/src/app/app.module.3.ts" region="hero-detail" title="src/app/app.module.ts (hero detail)">

</code-example>



Refresh the browser and select a hero from the dashboard; the app navigates to that hero’s details.



## Refactor routes to a _Routing Module_

Almost 20 lines of `AppModule` are devoted to configuring four routes.
Most applications have many more routes and they add guard services
to protect against unwanted or unauthorized navigations.
(Read more about guard services in the [Route Guards](guide/router#guards)
section of the [Routing & Navigation](guide/router) page.)
Routing considerations could quickly dominate this module and obscure its primary purpose, which is to
establish key facts about the entire app for the Angular compiler.

It's a good idea to refactor the routing configuration into its own class.
The current `RouterModule.forRoot()` produces an Angular `ModuleWithProviders`,
a class dedicated to routing should be a *routing module*.
For more information, see the [Milestone #2: The Routing Module](guide/router#routing-module)
section of the [Routing & Navigation](guide/router) page.

By convention, a routing module name contains the word "Routing" and
aligns with the name of the module that declares the components navigated to.

Create an `app-routing.module.ts` file as a sibling to `app.module.ts`.
Give it the following contents, extracted from the `AppModule` class:


<code-example path="toh-pt5/src/app/app-routing.module.ts" title="src/app/app-routing.module.ts">

</code-example>



The following points are typical of routing modules:

* The Routing Module pulls the routes into a variable. The variable clarifies the
  routing module pattern in case you export the module in the future.
* The Routing Module adds `RouterModule.forRoot(routes)` to `imports`.
* The Routing Module adds `RouterModule` to `exports` so that the
components in the companion module have access to Router declarables,
such as `RouterLink` and `RouterOutlet`.
* There are no `declarations`.  Declarations are the responsibility of the companion module.
* If you have guard services, the Routing Module adds module `providers`. (There are none in this example.)

### Update *AppModule*

Delete the routing configuration from `AppModule` and import the `AppRoutingModule`.
Use an ES2015 `import` statement *and* add it to the `NgModule.imports` list.

Here is the revised `AppModule`, compared to its pre-refactor state:

<code-tabs>
  <code-pane path="toh-pt5/src/app/app.module.ts" title="src/app/app.module.ts (after)"></code-pane>
  <code-pane path="toh-pt5/src/app/app.module.3.ts" title="src/app/app.module.ts (before)"></code-pane>
</code-tabs>

The revised and simplified `AppModule` is focused on identifying the key pieces of the app.

## Select a hero in the *HeroesComponent*

In the `HeroesComponent`,
the current template exhibits a "master/detail" style with the list of heroes
at the top and details of the selected hero below.


<code-example path="toh-pt4/src/app/app.component.ts" region="template" title="src/app/heroes.component.ts (current template)" linenums="false">

</code-example>



Delete the `<h1>` at the top.

Delete the last line of the template with the `<hero-detail>` tags.

You'll no longer show the full `HeroDetailComponent` here.
Instead, you'll display the hero detail on its own page and route to it as you did in the dashboard.

However, when users select a hero from the list, they won't go to the detail page.
Instead, they'll see a mini detail on *this* page and have to click a button to navigate to the *full detail* page.

### Add the *mini detail*

Add the following HTML fragment at the bottom of the template where the `<hero-detail>` used to be:


<code-example path="toh-pt5/src/app/heroes.component.html" region="mini-detail" title="src/app/heroes.component.ts">

</code-example>



After clicking a hero, users should see something like this below the hero list:


<figure>
  <img src='generated/images/guide/toh/mini-hero-detail.png' alt="Mini Hero Detail">
</figure>



### Format with the uppercase pipe

The hero's name is displayed in capital letters because of the `uppercase` pipe
that's included in the interpolation binding, right after the pipe operator ( | ).


<code-example path="toh-pt5/src/app/heroes.component.html" region="pipe">

</code-example>



Pipes are a good way to format strings, currency amounts, dates and other display data.
Angular ships with several pipes and you can write your own.


<div class="l-sub-section">



Read more about pipes on the [Pipes](guide/pipes) page.


</div>



### Move content out of the component file

You still have to update the component class to support navigation to the
`HeroDetailComponent` when users click the *View Details* button.

The component file is big.
It's difficult to find the component logic amidst the noise of HTML and CSS.

Before making any more changes, migrate the template and styles to their own files.

First, move the template contents from `heroes.component.ts`
into a new <code>heroes.component.html</code> file.
Don't copy the backticks. As for `heroes.component.ts`, you'll
come back to it in a minute. Next, move the
styles contents into a new <code>heroes.component.css</code> file.

The two new files should look like this:


<code-tabs>

  <code-pane title="src/app/heroes.component.html" path="toh-pt5/src/app/heroes.component.html">

  </code-pane>

  <code-pane title="src/app/heroes.component.css" path="toh-pt5/src/app/heroes.component.css">

  </code-pane>

</code-tabs>



Now, back in the component metadata for `heroes.component.ts`,
delete `template` and `styles`, replacing them with
`templateUrl` and `styleUrls` respectively.
Set their properties to refer to the new files.


<code-example path="toh-pt5/src/app/heroes.component.ts" region="metadata" title="src/app/heroes.component.ts (revised metadata)">

</code-example>



<div class="l-sub-section">



The `styleUrls` property is an array of style file names (with paths).
You could list multiple style files from different locations if you needed them.


</div>



### Update the _HeroesComponent_ class

The `HeroesComponent` navigates to the `HeroesDetailComponent` in response to a button click.
The button's click event is bound to a `gotoDetail()` method that navigates _imperatively_
by telling the router where to go.

This approach requires the following changes to the component class:

1. Import the `Router` from the Angular router library.
1. Inject the `Router` in the constructor, along with the `HeroService`.
1. Implement `gotoDetail()` by calling the router `navigate()` method.


<code-example path="toh-pt5/src/app/heroes.component.ts" region="gotoDetail" title="src/app/heroes.component.ts (gotoDetail)">

</code-example>



Note that you're passing a two-element *link parameters array*&mdash;a
path and the route parameter&mdash;to
the router `navigate()` method, just as you did in the `[routerLink]` binding
back in the `DashboardComponent`.
Here's the revised `HeroesComponent` class:


<code-example path="toh-pt5/src/app/heroes.component.ts" region="class" title="src/app/heroes.component.ts (class)">

</code-example>



Refresh the browser and start clicking.
Users can navigate around the app, from the dashboard to hero details and back,
from heroes list to the mini detail to the hero details and back to the heroes again.

You've met all of the navigational requirements that propelled this page.



## Style the app

The app is functional but it needs styling.
The dashboard heroes should display in a row of rectangles.
You've received around 60 lines of CSS for this purpose, including some simple media queries for responsive design.

As you now know, adding the CSS to the component `styles` metadata
would obscure the component logic.
Instead, edit the CSS in a separate `*.css` file.

Add a <code>dashboard.component.css</code> file to the `app` folder and reference
that file in the component metadata's `styleUrls` array property like this:


<code-example path="toh-pt5/src/app/dashboard.component.ts" region="css" title="src/app/dashboard.component.ts (styleUrls)">

</code-example>



### Add stylish hero details

You've also been provided with CSS styles specifically for the `HeroDetailComponent`.

Add a <code>hero-detail.component.css</code> to the `app`
folder and refer to that file inside
the `styleUrls` array as you did for `DashboardComponent`.
Also, in `hero-detail.component.ts`, remove the `hero` property `@Input` decorator
and its import.

Here's the content for the component CSS files.


<code-tabs>

  <code-pane title="src/app/hero-detail.component.css" path="toh-pt5/src/app/hero-detail.component.css">

  </code-pane>

  <code-pane title="src/app/dashboard.component.css" path="toh-pt5/src/app/dashboard.component.css">

  </code-pane>

</code-tabs>



### Style the navigation links

The provided CSS makes the navigation links in the `AppComponent` look more like selectable buttons.
You'll surround those links in `<nav>` tags.

Add an <code>app.component.css</code> file to the `app` folder with the following content.


<code-example path="toh-pt5/src/app/app.component.css" title="src/app/app.component.css (navigation styles)">

</code-example>



<div class="l-sub-section">



**The *routerLinkActive* directive**

The Angular router provides a `routerLinkActive` directive you can use to
add a class to the HTML navigation element whose route matches the active route.
All you have to do is define the style for it.


</div>



<code-example path="toh-pt5/src/app/app.component.ts" region="template" title="src/app/app.component.ts (active router links)">

</code-example>



Add a `styleUrls` property that refers to this CSS file as follows:


<code-example path="toh-pt5/src/app/app.component.ts" region="styleUrls" title="src/app/app.component.ts">

</code-example>



### Global application styles

When you add styles to a component, you keep everything a component needs&mdash;HTML,
the CSS, the code&mdash;together in one convenient place.
It's easy to package it all up and re-use the component somewhere else.

You can also create styles at the *application level* outside of any component.

The designers provided some basic styles to apply to elements across the entire app.
These correspond to the full set of master styles that you installed earlier during [setup](guide/setup).
Here's an excerpt:


<code-example path="toh-pt5/src/styles.css" region="toh"  title="src/styles.css (excerpt)">

</code-example>



Create the file <code>styles.css</code>.
Ensure that the file contains the [master styles provided here](https://raw.githubusercontent.com/angular/angular/master/aio/tools/examples/shared/boilerplate/src/styles.css).
Also edit <code>index.html</code> to refer to this stylesheet.


<code-example path="toh-pt5/src/index.html" region="css" title="src/index.html (link ref)">

</code-example>



Look at the app now. The dashboard, heroes, and navigation links are styled.


<figure>
  <img src='generated/images/guide/toh/heroes-dashboard-1.png' alt="View navigations">
</figure>




## Application structure and code

Review the sample source code in the <live-example></live-example> for this page.
Verify that you have the following structure:


<div class='filetree'>

  <div class='file'>
    angular-tour-of-heroes
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
          app.component.css
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
          dashboard.component.css
        </div>

        <div class='file'>
          dashboard.component.html
        </div>

        <div class='file'>
          dashboard.component.ts
        </div>

        <div class='file'>
          hero.service.ts
        </div>

        <div class='file'>
          hero.ts
        </div>

        <div class='file'>
          hero-detail.component.css
        </div>

        <div class='file'>
          hero-detail.component.html
        </div>

        <div class='file'>
          hero-detail.component.ts
        </div>

        <div class='file'>
          heroes.component.css
        </div>

        <div class='file'>
          heroes.component.html
        </div>

        <div class='file'>
          heroes.component.ts
        </div>

        <div class='file'>
          mock-heroes.ts
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
        systemjs.config.js
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




## The road you’ve travelled
Here's what you achieved in this page:

* You added the Angular router to navigate among different components.
* You learned how to create router links to represent navigation menu items.
* You used router link parameters to navigate to the details of the user-selected hero.
* You shared the `HeroService` among multiple components.
* You moved HTML and CSS out of the component file and into their own files.
* You added the `uppercase` pipe to format data.

Your app should look like this <live-example></live-example>.

### The road ahead

You have much of the foundation you need to build an app.
You're still missing a key piece: remote data access.

In the [next tutorial page](tutorial/toh-pt6 "Http")
you’ll replace the mock data with data retrieved from a server using http.
