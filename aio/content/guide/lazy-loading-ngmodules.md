# Lazy-loading feature modules

By default, NgModules are eagerly loaded, which means that as soon as the app loads, so do all the NgModules, whether or not they are immediately necessary. For large apps with lots of routes, consider lazy loading&mdash;a design pattern that loads NgModules as needed. Lazy loading helps keep initial
bundle sizes smaller, which in turn helps decrease load times.

<div class="alert is-helpful">

For the final sample app with two lazy-loaded modules that this page describes, see the
<live-example></live-example>.

</div>

{@a lazy-loading}

## Lazy loading basics

This section introduces the basic procedure for configuring a lazy-loaded route.
For a step-by-step example, see the [step-by-step setup](#step-by-step) section on this page.

To lazy load Angular modules, use `loadChildren` (instead of `component`) in your `AppRoutingModule` `routes` configuration as follows.

<code-example header="AppRoutingModule (excerpt)">

const routes: Routes = [
  {
    path: 'items',
    loadChildren: () => import('./items/items.module').then(m => m.ItemsModule)
  }
];

</code-example>

In the lazy-loaded module's routing module, add a route for the component.

<code-example header="Routing module for lazy loaded module (excerpt)">

const routes: Routes = [
  {
    path: '',
    component: ItemsComponent
  }
];

</code-example>

Also be sure to remove the `ItemsModule` from the `AppModule`.
For step-by-step instructions on lazy loading modules, continue with the following sections of this page.

{@a step-by-step}

## Step-by-step setup

There are two main steps to setting up a lazy-loaded feature module:

1. Create the feature module with the CLI, using the `--route` flag.
1. Configure the routes.

### Set up an app

If you don’t already have an app, you can follow the steps below to
create one with the CLI. If you already have an app, skip to
[Configure the routes](#config-routes). Enter the following command
where `customer-app` is the name of your app:

<code-example language="bash">
ng new customer-app --routing
</code-example>

This creates an app called `customer-app` and the `--routing` flag
generates a file called `app-routing.module.ts`, which is one of
the files you need for setting up lazy loading for your feature module.
Navigate into the project by issuing the command `cd customer-app`.

<div class="alert is-helpful">

The `--routing` option requires Angular/CLI version 8.1 or higher.
See [Keeping Up to Date](guide/updating).

</div>

### Create a feature module with routing

Next, you’ll need a feature module with a component to route to.
To make one, enter the following command in the terminal, where `customers` is the name of the feature module. The path for loading the `customers` feature modules is also `customers` because it is specified with the `--route` option:

<code-example language="bash">
ng generate module customers --route customers --module app.module
</code-example>

This creates a `customers` folder having the new lazy-loadable feature module `CustomersModule` defined in the `customers.module.ts` file and the routing module `CustomersRoutingModule` defined in the `customers-routing.module.ts` file. The command automatically declares the `CustomersComponent` and imports `CustomersRoutingModule` inside the new feature module.

Because the new module is meant to be lazy-loaded, the command does NOT add a reference to the new feature module in the application's root module file, `app.module.ts`.
Instead, it adds the declared route, `customers` to the `routes` array declared in the module provided as the `--module` option.

<code-example
  header="src/app/app-routing.module.ts"
  path="lazy-loading-ngmodules/src/app/app-routing.module.ts"
  region="routes-customers">
</code-example>

Notice that the lazy-loading syntax uses `loadChildren` followed by a function that uses the browser's built-in `import('...')` syntax for dynamic imports.
The import path is the relative path to the module.

<div class="callout is-helpful">
<header>String-based lazy loading</header>

In Angular version 8, the string syntax for the `loadChildren` route specification [was deprecated](https://angular.io/guide/deprecations#loadchildren-string-syntax) in favor of the `import()` syntax. However, you can opt into using string-based lazy loading (`loadChildren: './path/to/module#Module'`) by including the lazy-loaded routes in your `tsconfig` file, which includes the lazy-loaded files in the compilation.

By default the CLI will generate projects which stricter file inclusions intended to be used with the `import()` syntax.

</div>

### Add another feature module

Use the same command to create a second lazy-loaded feature module with routing, along with its stub component.

<code-example language="bash">
ng generate module orders --route orders --module app.module
</code-example>

This creates a new folder called `orders` containing the `OrdersModule` and `OrdersRoutingModule`, along with the new `OrdersComponent` source files.
The `orders` route, specified with the `--route` option, is added to the `routes` array inside the `app-routing.module.ts` file, using the lazy-loading syntax.

<code-example
  header="src/app/app-routing.module.ts"
  path="lazy-loading-ngmodules/src/app/app-routing.module.ts"
  region="routes-customers-orders">
</code-example>

### Set up the UI

Though you can type the URL into the address bar, a navigation UI is easier for the user and more common.
Replace the default placeholder markup in `app.component.html` with a custom nav
so you can easily navigate to your modules in the browser:

<code-example path="lazy-loading-ngmodules/src/app/app.component.html" header="app.component.html" region="app-component-template" header="src/app/app.component.html"></code-example>

To see your app in the browser so far, enter the following command in the terminal window:

<code-example language="bash">
ng serve
</code-example>

Then go to `localhost:4200` where you should see “customer-app” and three buttons.

<div class="lightbox">
  <img src="generated/images/guide/lazy-loading-ngmodules/three-buttons.png" width="300" alt="three buttons in the browser">
</div>

These buttons work, because the CLI automatically added the routes to the feature modules to the `routes` array in `app.module.ts`.

{@a config-routes}

### Imports and route configuration

The CLI automatically added each feature module to the routes map at the application level.
Finish this off by adding the default route. In the `app-routing.module.ts` file, update the `routes` array with the following:

<code-example path="lazy-loading-ngmodules/src/app/app-routing.module.ts" id="app-routing.module.ts" region="const-routes" header="src/app/app-routing.module.ts"></code-example>

The first two paths are the routes to the `CustomersModule` and the `OrdersModule`.
The final entry defines a default route. The empty path matches everything that doesn't match an earlier path.


### Inside the feature module

Next, take a look at the `customers.module.ts` file. If you’re using the CLI and following the steps outlined in this page, you don’t have to do anything here.

<code-example path="lazy-loading-ngmodules/src/app/customers/customers.module.ts" id="customers.module.ts" region="customers-module" header="src/app/customers/customers.module.ts"></code-example>

The `customers.module.ts` file imports the `customers-routing.module.ts` and `customers.component.ts` files. `CustomersRoutingModule` is listed in the `@NgModule` `imports` array giving `CustomersModule` access to its own routing module. `CustomersComponent` is in the `declarations` array, which means `CustomersComponent` belongs to the `CustomersModule`.


The `app-routing.module.ts` then imports the feature module, `customers.module.ts` using JavaScript's dynamic import.

The feature-specific route definition file `customers-routing.module.ts` imports its own feature component defined in the `customers.component.ts` file, along with the other JavaScript import statements. It then maps the empty path to the `CustomersComponent`.

<code-example path="lazy-loading-ngmodules/src/app/customers/customers-routing.module.ts" id="customers-routing.module.ts" region="customers-routing-module" header="src/app/customers/customers-routing.module.ts"></code-example>

The `path` here is set to an empty string because the path in `AppRoutingModule` is already set to `customers`, so this route in the `CustomersRoutingModule`, is already within the `customers` context. Every route in this routing module is a child route.

The other feature module's routing module is configured similarly.

<code-example path="lazy-loading-ngmodules/src/app/orders/orders-routing.module.ts" id="orders-routing.module.ts" region="orders-routing-module-detail" header="src/app/orders/orders-routing.module.ts (excerpt)"></code-example>

### Verify lazy loading

You can check to see that a module is indeed being lazy loaded with the Chrome developer tools. In Chrome, open the dev tools by pressing `Cmd+Option+i` on a Mac or `Ctrl+Shift+j` on a PC and go to the Network Tab.

<div class="lightbox">
  <img src="generated/images/guide/lazy-loading-ngmodules/network-tab.png" width="600" alt="lazy loaded modules diagram">
</div>


Click on the Orders or Customers button. If you see a chunk appear, everything is wired up properly and the feature module is being lazy loaded. A chunk should appear for Orders and for Customers but will only appear once for each.


<div class="lightbox">
  <img src="generated/images/guide/lazy-loading-ngmodules/chunk-arrow.png" width="600" alt="lazy loaded modules diagram">
</div>


To see it again, or to test after working in the project, clear everything out by clicking the circle with a line through it in the upper left of the Network Tab:

<div class="lightbox">
  <img src="generated/images/guide/lazy-loading-ngmodules/clear.gif" width="200" alt="lazy loaded modules diagram">
</div>


Then reload with `Cmd+r` or `Ctrl+r`, depending on your platform.

## `forRoot()` and `forChild()`

You might have noticed that the CLI adds `RouterModule.forRoot(routes)` to the `AppRoutingModule` `imports` array.
This lets Angular know that the `AppRoutingModule` is a routing module and `forRoot()` specifies that this is the root routing module.
It configures all the routes you pass to it, gives you access to the router directives, and registers the `Router` service.
Use `forRoot()` only once in the application, inside the `AppRoutingModule`.

The CLI also adds `RouterModule.forChild(routes)` to feature routing modules.
This way, Angular knows that the route list is only responsible for providing additional routes and is intended for feature modules.
You can use `forChild()` in multiple modules.

The `forRoot()` method takes care of the *global* injector configuration for the Router.
The `forChild()` method has no injector configuration. It uses directives such as `RouterOutlet` and `RouterLink`.
For more information, see the [`forRoot()` pattern](guide/singleton-services#forRoot) section of the [Singleton Services](guide/singleton-services) guide.

{@a preloading}

## Preloading

Preloading improves UX by loading parts of your app in the background.
You can preload modules or component data.

### Preloading modules

Preloading modules improves UX by loading parts of your app in the background so users don't have to wait for the elements to download when they activate a route.

To enable preloading of all lazy loaded modules, import the `PreloadAllModules` token from the Angular `router`.

<code-example header="AppRoutingModule (excerpt)">

import { PreloadAllModules } from '@angular/router';

</code-example>

Still in the `AppRoutingModule`, specify your preloading strategy in `forRoot()`.

<code-example header="AppRoutingModule (excerpt)">

RouterModule.forRoot(
  appRoutes,
  {
    preloadingStrategy: PreloadAllModules
  }
)

</code-example>

### Preloading component data

To preload component data, you can use a `resolver`.
Resolvers improve UX by blocking the page load until all necessary data is available to fully display the page.

#### Resolvers

Create a resolver service.
With the CLI, the command to generate a service is as follows:


<code-example language="none" class="code-shell">
  ng generate service <service-name>
</code-example>

In your service, import the following router members, implement `Resolve`, and inject the `Router` service:

<code-example header="Resolver service (excerpt)">

import { Resolve } from '@angular/router';

...

export class CrisisDetailResolverService implements Resolve<> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<> {
    // your logic goes here
  }
}

</code-example>

Import this resolver into your module's routing module.

<code-example header="Feature module's routing module (excerpt)">

import { YourResolverService }    from './your-resolver.service';

</code-example>

Add a `resolve` object to the component's `route` configuration.

<code-example header="Feature module's routing module (excerpt)">
{
  path: '/your-path',
  component: YourComponent,
  resolve: {
    crisis: YourResolverService
  }
}
</code-example>


In the component, use an `Observable` to get the data from the `ActivatedRoute`.


<code-example header="Component (excerpt)">
ngOnInit() {
  this.route.data
    .subscribe((your-parameters) => {
      // your data-specific code goes here
    });
}
</code-example>

For more information with a working example, see the [routing tutorial section on preloading](guide/router-tutorial-toh#preloading-background-loading-of-feature-areas).

## Troubleshooting lazy-loading modules

A common error when lazy-loading modules is importing common modules in multiple places within an application.  You can test for this condition by first generating the module using the Angular CLI and including the `--route route-name` parameter, where `route-name` is the name of your module. Next, generate the module without the `--route` parameter. If the Angular CLI generates an error when you use the `--route` parameter, but runs correctly without it, you may have imported the same module in multiple places.

Remember, many common Angular modules should be imported at the base of your application.

For more information on Angular Modules, see [NgModules](guide/ngmodules).

## More on NgModules and routing

You may also be interested in the following:
* [Routing and Navigation](guide/router).
* [Providers](guide/providers).
* [Types of Feature Modules](guide/module-types).
* [Route-level code-splitting in Angular](https://web.dev/route-level-code-splitting-in-angular/)
* [Route preloading strategies in Angular](https://web.dev/route-preloading-in-angular/)
