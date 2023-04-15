# Common Routing Tasks

This topic describes how to implement many of the common tasks associated with adding the Angular router to your application.

<a id="basics"></a>

## Generate an application with routing enabled

The following command uses the Angular CLI to generate a basic Angular application with an application routing module, called `AppRoutingModule`, which is an NgModule where you can configure your routes.
The application name in the following example is `routing-app`.

<code-example format="shell" language="shell">

ng new routing-app --routing --defaults

</code-example>

### Adding components for routing

To use the Angular router, an application needs to have at least two components so that it can navigate from one to the other.
To create a component using the CLI, enter the following at the command line where `first` is the name of your component:

<code-example format="shell" language="shell">

ng generate component first

</code-example>

Repeat this step for a second component but give it a different name.
Here, the new name is `second`.

<code-example format="shell" language="shell">

ng generate component second

</code-example>

The CLI automatically appends `Component`, so if you were to write `first-component`, your component would be `FirstComponentComponent`.

<a id="basics-base-href"></a>

<div class="alert is-helpful">

<header><code>&lt;base href&gt;</code></header>

This guide works with a CLI-generated Angular application.
If you are working manually, make sure that you have `<base href="/">` in the `<head>` of your index.html file.
This assumes that the `app` folder is the application root, and uses `"/"`.

</div>

### Importing your new components

To use your new components, import them into `AppRoutingModule` at the top of the file, as follows:

<code-example header="AppRoutingModule (excerpt)">

import { FirstComponent } from './first/first.component';
import { SecondComponent } from './second/second.component';

</code-example>

<a id="basic-route"></a>

## Defining a basic route

There are three fundamental building blocks to creating a route.

Import the `AppRoutingModule` into `AppModule` and add it to the `imports` array.

The Angular CLI performs this step for you.
However, if you are creating an application manually or working with an existing, non-CLI application, verify that the imports and configuration are correct.
The following is the default `AppModule` using the CLI with the `--routing` flag.

<code-example header="Default CLI AppModule with routing" path="router/src/app/app.module.8.ts"></code-example>

1.  Import `RouterModule` and `Routes` into your routing module.

    The Angular CLI performs this step automatically.
    The CLI also sets up a `Routes` array for your routes and configures the `imports` and `exports` arrays for `@NgModule()`.

    <code-example header="CLI application routing module" path="router/src/app/app-routing.module.7.ts"></code-example>

1.  Define your routes in your `Routes` array.

    Each route in this array is a JavaScript object that contains two properties.
    The first property, `path`, defines the URL path for the route.
    The second property, `component`, defines the component Angular should use for the corresponding path.

    <code-example header="AppRoutingModule (excerpt)" path="router/src/app/app-routing.module.8.ts" region="routes"></code-example>

1.  Add your routes to your application.

    Now that you have defined your routes, add them to your application.
    First, add links to the two components.
    Assign the anchor tag that you want to add the route to the `routerLink` attribute.
    Set the value of the attribute to the component to show when a user clicks on each link.
    Next, update your component template to include `<router-outlet>`.
    This element informs Angular to update the application view with the component for the selected route.

    <code-example header="Template with routerLink and router-outlet" path="router/src/app/app.component.7.html"></code-example>

<a id="route-order"></a>

### Route order

The order of routes is important because the `Router` uses a first-match wins strategy when matching routes, so more specific routes should be placed above less specific routes.
List routes with a static path first, followed by an empty path route, which matches the default route.
The [wildcard route](guide/router#setting-up-wildcard-routes) comes last because it matches every URL and the `Router` selects it only if no other routes match first.

<a id="getting-route-information"></a>

## Getting route information

Often, as a user navigates your application, you want to pass information from one component to another.
For example, consider an application that displays a shopping list of grocery items.
Each item in the list has a unique `id`.
To edit an item, users click an Edit button, which opens an `EditGroceryItem` component.
You want that component to retrieve the `id` for the grocery item so it can display the right information to the user.

Use a route to pass this type of information to your application components.
To do so, you use the [withComponentInputBinding](api/router/withComponentInputBinding) feature with `provideRouter` or the `bindToComponentInputs` option of `RouterModule.forRoot`.

To get information from a route:

1.  Add the `withComponentInputBinding` feature to the `provideRouter` method.

    <code-example header="provideRouter feature" path="router/src/app/app-routing.module.11.ts" region="withComponentInputBinding"></code-example>

1.  Update the component to have an `Input` matching the name of the parameter.

    <code-example header="The component input (excerpt)" path="router/src/app/heroes/hero-detail/hero-detail.component.4.ts" region="id-input"></code-example>

    <div class="alert is-helpful">

    **NOTE:** <br>
    You can bind all route data with key, value pairs to component inputs: static or resolved route data, path parameters, matrix parameters, and query parameters.

    </div>

<a id="wildcard-route-how-to"></a>

## Setting up wildcard routes

A well-functioning application should gracefully handle when users attempt to navigate to a part of your application that does not exist.
To add this functionality to your application, you set up a wildcard route.
The Angular router selects this route any time the requested URL doesn't match any router paths.

To set up a wildcard route, add the following code to your `routes` definition.

<code-example header="AppRoutingModule (excerpt)">

{ path: '**', component: &lt;component-name&gt; }

</code-example>

The two asterisks, `**`, indicate to Angular that this `routes` definition is a wildcard route.
For the component property, you can define any component in your application.
Common choices include an application-specific `PageNotFoundComponent`, which you can define to [display a 404 page](guide/router#404-page-how-to) to your users; or a redirect to your application's main component.
A wildcard route is the last route because it matches any URL.
For more detail on why order matters for routes, see [Route order](guide/router#route-order).

<a id="404-page-how-to"></a>

## Displaying a 404 page

To display a 404 page, set up a [wildcard route](guide/router#wildcard-route-how-to) with the `component` property set to the component you'd like to use for your 404 page as follows:

<code-example header="AppRoutingModule (excerpt)" path="router/src/app/app-routing.module.8.ts" region="routes-with-wildcard"></code-example>

The last route with the `path` of `**` is a wildcard route.
The router selects this route if the requested URL doesn't match any of the paths earlier in the list and sends the user to the `PageNotFoundComponent`.

## Setting up redirects

To set up a redirect, configure a route with the `path` you want to redirect from, the `component` you want to redirect to, and a `pathMatch` value that tells the router how to match the URL.

<code-example header="AppRoutingModule (excerpt)" path="router/src/app/app-routing.module.8.ts" region="redirect"></code-example>

In this example, the third route is a redirect so that the router defaults to the `first-component` route.
Notice that this redirect precedes the wildcard route.
Here, `path: ''` means to use the initial relative URL \(`''`\).

For more details on `pathMatch` see [Spotlight on `pathMatch`](guide/router-tutorial-toh#pathmatch).

<a id="nesting-routes"></a>

## Nesting routes

As your application grows more complex, you might want to create routes that are relative to a component other than your root component.
These types of nested routes are called child routes.
This means you're adding a second `<router-outlet>` to your app, because it is in addition to the `<router-outlet>` in `AppComponent`.

In this example, there are two additional child components, `child-a`, and `child-b`.
Here, `FirstComponent` has its own `<nav>` and a second `<router-outlet>` in addition to the one in `AppComponent`.

<code-example header="In the template" path="router/src/app/app.component.8.html" region="child-routes"></code-example>

A child route is like any other route, in that it needs both a `path` and a `component`.
The one difference is that you place child routes in a `children` array within the parent route.

<code-example header="AppRoutingModule (excerpt)" path="router/src/app/app-routing.module.9.ts" region="child-routes"></code-example>

<a id="setting-the-page-title"></a>

## Setting the page title

Each page in your application should have a unique title so that they can be identified in the browser history.
The `Router` sets the document's title using the `title` property from the `Route` config.

<code-example header="AppRoutingModule (excerpt)" path="router/src/app/app-routing.module.10.ts" region="page-title"></code-example>

<div class="alert is-helpful">

**NOTE**: <br /> The `title` property follows the same rules as static route `data` and dynamic values that implement `ResolveFn`.

</div>

You can also provide a custom title strategy by extending the `TitleStrategy`.

<code-example header="AppRoutingModule (excerpt)" path="router/src/app/app-routing.module.10.ts" region="custom-page-title"></code-example>

<a id="using-relative-paths"></a>

## Using relative paths

Relative paths let you define paths that are relative to the current URL segment.
The following example shows a relative route to another component, `second-component`.
`FirstComponent` and `SecondComponent` are at the same level in the tree, however, the link to `SecondComponent` is situated within the `FirstComponent`, meaning that the router has to go up a level and then into the second directory to find the `SecondComponent`.
Rather than writing out the whole path to get to `SecondComponent`, use the `../` notation to go up a level.

<code-example header="In the template" path="router/src/app/app.component.8.html" region="relative-route"></code-example>

In addition to `../`, use `./` or no leading slash to specify the current level.

### Specifying a relative route

To specify a relative route, use the `NavigationExtras` `relativeTo` property.
In the component class, import `NavigationExtras` from the `@angular/router`.

Then use `relativeTo` in your navigation method.
After the link parameters array, which here contains `items`, add an object with the `relativeTo` property set to the `ActivatedRoute`, which is `this.route`.

<code-example header="RelativeTo" path="router/src/app/app.component.4.ts" region="relative-to">

The `navigate()` arguments configure the router to use the current route as a basis upon which to append `items`.

</code-example>

The `goToItems()` method interprets the destination URI as relative to the activated route and navigates to the `items` route.

## Accessing query parameters and fragments

Sometimes, a feature of your application requires accessing a part of a route, such as a query parameter or a fragment.
The Tour of Heroes application at this stage in the tutorial uses a list view in which you can click on a hero to see details.
The router uses an `id` to show the correct hero's details.

First, import the following members in the component you want to navigate from.

<code-example header="Component import statements (excerpt)">

import { ActivatedRoute } from '&commat;angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

</code-example>

Next inject the activated route service:

<code-example header="Component (excerpt)">

constructor(private route: ActivatedRoute) {}

</code-example>

Configure the class so that you have an observable, `heroes$`, a `selectedId` to hold the `id` number of the hero, and the heroes in the `ngOnInit()`, add the following code to get the `id` of the selected hero.
This code snippet assumes that you have a heroes list, a hero service, a function to get your heroes, and the HTML to render your list and details, just as in the Tour of Heroes example.

<code-example header="Component 1 (excerpt)">

heroes&dollar;: Observable&lt;Hero[]&gt;;
selectedId: number;
heroes = HEROES;

ngOnInit() {
  this.heroes&dollar; = this.route.paramMap.pipe(
    switchMap(params =&gt; {
      this.selectedId = Number(params.get('id'));
      return this.service.getHeroes();
    })
  );
}

</code-example>

Next, in the component that you want to navigate to, import the following members.

<code-example header="Component 2 (excerpt)">

import { Router, ActivatedRoute, ParamMap } from '&commat;angular/router';
import { Observable } from 'rxjs';

</code-example>

Inject `ActivatedRoute` and `Router` in the constructor of the component class so they are available to this component:

<code-example header="Component 2 (excerpt)">

hero&dollar;: Observable&lt;Hero&gt;;

constructor(
  private route: ActivatedRoute,
  private router: Router  ) {}

ngOnInit() {
  const heroId = this.route.snapshot.paramMap.get('id');
  this.hero&dollar; = this.service.getHero(heroId);
}

gotoItems(hero: Hero) {
  const heroId = hero ? hero.id : null;
  // Pass along the hero id if available
  // so that the HeroList component can select that item.
  this.router.navigate(['/heroes', { id: heroId }]);
}

</code-example>

<a id="lazy-loading"></a>

## Lazy loading

You can configure your routes to lazy load modules, which means that Angular only loads modules as needed, rather than loading all modules when the application launches.
Additionally, preload parts of your application in the background to improve the user experience.

For more information on lazy loading and preloading see the dedicated guide [Lazy loading NgModules](guide/lazy-loading-ngmodules).

## Preventing unauthorized access

Use route guards to prevent users from navigating to parts of an application without authorization.
The following route guards are available in Angular:

*   [`canActivate`](api/router/CanActivateFn)
*   [`canActivateChild`](api/router/CanActivateChildFn)
*   [`canDeactivate`](api/router/CanDeactivateFn)
*   [`canMatch`](api/router/CanMatchFn)
*   [`resolve`](api/router/ResolveFn)
*   [`canLoad`](api/router/CanLoadFn)

To use route guards, consider using [component-less routes](api/router/Route#componentless-routes) as this facilitates guarding child routes.

Create a service for your guard:

<code-example format="shell" language="shell">

ng generate guard your-guard

</code-example>

In your guard function, implement the guard you want to use.
The following example uses `canActivate` to guard the route.

<code-example header="guard (excerpt)">

export const yourGuard: CanActivateFn = (
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
      // your  logic goes here
  }

</code-example>

In your routing module, use the appropriate property in your `routes` configuration.
Here, `canActivate` tells the router to mediate navigation to this particular route.

<code-example header="Routing module (excerpt)">

{
  path: '/your-path',
  component: YourComponent,
  canActivate: [yourGuard],
}

</code-example>

For more information with a working example, see the [routing tutorial section on route guards](guide/router-tutorial-toh#milestone-5-route-guards).

## Link parameters array

A link parameters array holds the following ingredients for router navigation:

*   The path of the route to the destination component
*   Required and optional route parameters that go into the route URL

Bind the `RouterLink` directive to such an array like this:

<code-example header="src/app/app.component.ts (h-anchor)" path="router/src/app/app.component.3.ts" region="h-anchor"></code-example>

The following is a two-element array when specifying a route parameter:

<code-example header="src/app/heroes/hero-list/hero-list.component.html (nav-to-detail)" path="router/src/app/heroes/hero-list/hero-list.component.1.html" region="nav-to-detail"></code-example>

Provide optional route parameters in an object, as in `{ foo: 'foo' }`:

<code-example header="src/app/app.component.ts (cc-query-params)" path="router/src/app/app.component.3.ts" region="cc-query-params"></code-example>

These three examples cover the needs of an application with one level of routing.
However, with a child router, such as in the crisis center, you create new link array possibilities.

The following minimal `RouterLink` example builds upon a specified [default child route](guide/router-tutorial-toh#a-crisis-center-with-child-routes) for the crisis center.

<code-example header="src/app/app.component.ts (cc-anchor-w-default)" path="router/src/app/app.component.3.ts" region="cc-anchor-w-default"></code-example>

Review the following:

*   The first item in the array identifies the parent route \(`/crisis-center`\)
*   There are no parameters for this parent route
*   There is no default for the child route so you need to pick one
*   You're navigating to the `CrisisListComponent`, whose route path is `/`, but you don't need to explicitly add the slash

Consider the following router link that navigates from the root of the application down to the Dragon Crisis:

<code-example header="src/app/app.component.ts (Dragon-anchor)" path="router/src/app/app.component.3.ts" region="Dragon-anchor"></code-example>

*   The first item in the array identifies the parent route \(`/crisis-center`\)
*   There are no parameters for this parent route
*   The second item identifies the child route details about a particular crisis \(`/:id`\)
*   The details child route requires an `id` route parameter
*   You added the `id` of the Dragon Crisis as the second item in the array \(`1`\)
*   The resulting path is `/crisis-center/1`

You could also redefine the `AppComponent` template with Crisis Center routes exclusively:

<code-example header="src/app/app.component.ts (template)" path="router/src/app/app.component.3.ts" region="template"></code-example>

In summary, you can write applications with one, two or more levels of routing.
The link parameters array affords the flexibility to represent any routing depth and any legal sequence of route paths, \(required\) router parameters, and \(optional\) route parameter objects.

<a id="browser-url-styles"></a>
<a id="location-strategy"></a>

## `LocationStrategy` and browser URL styles

When the router navigates to a new component view, it updates the browser's location and history with a URL for that view.

Modern HTML5 browsers support [history.pushState](https://developer.mozilla.org/docs/Web/API/History_API/Working_with_the_History_API#adding_and_modifying_history_entries "HTML5 browser history push-state"), a technique that changes a browser's location and history without triggering a server page request.
The router can compose a "natural" URL that is indistinguishable from one that would otherwise require a page load.

Here's the Crisis Center URL in this "HTML5 pushState" style:

<code-example format="none" language="http">

localhost:3002/crisis-center

</code-example>

Older browsers send page requests to the server when the location URL changes unless the change occurs after a "#" \(called the "hash"\).
Routers can take advantage of this exception by composing in-application route URLs with hashes.
Here's a "hash URL" that routes to the Crisis Center.

<code-example format="none" language="http">

localhost:3002/src/#/crisis-center

</code-example>

The router supports both styles with two `LocationStrategy` providers:

| Providers              | Details |
|:---                    |:---     |
| `PathLocationStrategy` | The default "HTML5 pushState" style. |
| `HashLocationStrategy` | The "hash URL" style.                |

The `RouterModule.forRoot()` function sets the `LocationStrategy` to the `PathLocationStrategy`, which makes it the default strategy.
You also have the option of switching to the `HashLocationStrategy` with an override during the bootstrapping process.

<div class="alert is-helpful">

For more information on providers and the bootstrap process, see [Dependency Injection](guide/dependency-injection-providers).

</div>

## Choosing a routing strategy

You must choose a routing strategy early in the development of your project because once the application is in production, visitors to your site use and depend on application URL references.

Almost all Angular projects should use the default HTML5 style.
It produces URLs that are easier for users to understand and it preserves the option to do server-side rendering.

Rendering critical pages on the server is a technique that can greatly improve perceived responsiveness when the application first loads.
An application that would otherwise take ten or more seconds to start could be rendered on the server and delivered to the user's device in less than a second.

This option is only available if application URLs look like normal web URLs without hash \(`#`\) characters in the middle.

## `<base href>`

The router uses the browser's [history.pushState](https://developer.mozilla.org/docs/Web/API/History_API/Working_with_the_History_API#adding_and_modifying_history_entries "HTML5 browser history push-state") for navigation.
`pushState` lets you customize in-application URL paths; for example, `localhost:4200/crisis-center`.
The in-application URLs can be indistinguishable from server URLs.

Modern HTML5 browsers were the first to support `pushState` which is why many people refer to these URLs as "HTML5 style" URLs.

<div class="alert is-helpful">

HTML5 style navigation is the router default.
In the [LocationStrategy and browser URL styles](#browser-url-styles) section, learn why HTML5 style is preferable, how to adjust its behavior, and how to switch to the older hash \(`#`\) style, if necessary.

</div>

You must add a [`<base href>` element](https://developer.mozilla.org/docs/Web/HTML/Element/base "base href") to the application's `index.html` for `pushState` routing to work.
The browser uses the `<base href>` value to prefix relative URLs when referencing CSS files, scripts, and images.

Add the `<base>` element just after the `<head>` tag.
If the `app` folder is the application root, as it is for this application, set the `href` value in `index.html` as shown here.

<code-example header="src/index.html (base-href)" path="router/src/index.html" region="base-href"></code-example>

### HTML5 URLs and the `<base href>`

The guidelines that follow will refer to different parts of a URL.
This diagram outlines what those parts refer to:

<code-example format="output" hideCopy language="none">

foo://example.com:8042/over/there?name=ferret#nose
&bsol;&lowbar;/   &bsol;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;/&bsol;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;/ &bsol;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;/ &bsol;&lowbar;&lowbar;/
 &verbar;           &verbar;            &verbar;            &verbar;        &verbar;
scheme    authority      path        query   fragment

</code-example>

While the router uses the [HTML5 pushState](https://developer.mozilla.org/docs/Web/API/History_API#Adding_and_modifying_history_entries "Browser history push-state") style by default, you must configure that strategy with a `<base href>`.

The preferred way to configure the strategy is to add a [`<base href>` element](https://developer.mozilla.org/docs/Web/HTML/Element/base "base href") tag in the `<head>` of the `index.html`.

<code-example header="src/index.html (base-href)" path="router/src/index.html" region="base-href"></code-example>

Without that tag, the browser might not be able to load resources \(images, CSS, scripts\) when "deep linking" into the application.

Some developers might not be able to add the `<base>` element, perhaps because they don't have access to `<head>` or the `index.html`.

Those developers can still use HTML5 URLs by taking the following two steps:

1.  Provide the router with an appropriate `APP_BASE_HREF` value.
1.  Use root URLs \(URLs with an `authority`\) for all web resources: CSS, images, scripts, and template HTML files.

    *   The `<base href>` `path` should end with a "/", as browsers ignore characters in the `path` that follow the right-most "`/`"
    *   If the `<base href>` includes a `query` part, the `query` is only used if the `path` of a link in the page is empty and has no `query`.
        This means that a `query` in the `<base href>` is only included when using `HashLocationStrategy`.

    *   If a link in the page is a root URL \(has an `authority`\), the `<base href>` is not used.
        In this way, an `APP_BASE_HREF` with an authority will cause all links created by Angular to ignore the `<base href>` value.

    *   A fragment in the `<base href>` is *never* persisted

For more complete information on how `<base href>` is used to construct target URIs, see the [RFC](https://tools.ietf.org/html/rfc3986#section-5.2.2) section on transforming references.

<a id="hashlocationstrategy"></a>

### `HashLocationStrategy`

Use `HashLocationStrategy` by providing the `useHash: true` in an object as the second argument of the `RouterModule.forRoot()` in the `AppModule`.

<code-example header="src/app/app.module.ts (hash URL strategy)" path="router/src/app/app.module.6.ts"></code-example>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
