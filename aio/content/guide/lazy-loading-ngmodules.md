# Lazy Loading Feature Modules

## High level view

By default, NgModules are eagerly loaded, which means that as soon as the app loads, so do all the NgModules, whether or not they are immediately necessary. For large apps with lots of routes, consider lazy loading&mdash;a design pattern that loads NgModules as needed. Lazy loading helps keep initial
bundle sizes smaller, which in turn helps decrease load times.

For the final sample app with two lazy-loaded modules that this page describes, see the
<live-example></live-example>.

There are three main steps to setting up a lazy-loaded feature module:

1. Create the feature module with the CLI, using the `--route` flag.
1. Create the feature module’s component.
1. Configure the routes.

## Set up an app

If you don’t already have an app, you can follow the steps below to
create one with the CLI. If you do already have an app, skip to
[Configure the routes](#config-routes). Enter the following command
where `customer-app` is the name of your app:

<code-example language="bash">
ng new customer-app --routing
</code-example>

This creates an app called `customer-app` and the `--routing` flag
generates a file called `app-routing.module.ts`, which is one of
the files you need for setting up lazy loading for your feature module.
Navigate into the project by issuing the command `cd customer-app`.

## Create a feature module with routing

Next, you’ll need a feature module with a component to route to.
To make one, enter the following command at the terminal window prompt, where `customers` is the name of the features module, and `customer-list` is the component to route to:

<code-example language="bash">
ng generate module customers --route=customer-list --module=app.module
</code-example>

This creates a `customers` folder with the new lazy-loadable module `CustomersModule` defined in the file `customers.module.ts`. The command automatically adds the `CustomerListComponent` to the new feature module. The `customers` folder contains the four files that make up the stub for the new component.

Because the new module is meant to be lazy-loaded, the command does NOT add a JavaScript `import` statement for the new feature module to the root application's module file,
`app.module.ts`.
Instead, it adds the declared `customer-list` route to the `routes` array in `app.module.ts`.

```ts
const routes: Routes = [
    { path: 'customer-list',
      loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule) }
    ];
```

Notice that the lazy-loading syntax uses `loadChildren` followed by a function that uses the browser's built-in `import('...')` syntax for dynamic imports.
The import path is the relative path to the module.

### Add another feature module

For another place to route to, create a second lazy-loaded feature module with routing, along with its stub component.

<code-example language="bash">
ng generate module orders --route=order-list --module=app.module
</code-example>

This makes a new folder called `orders` containing an `OrdersModule` and `OrdersRoutingModule`, along with the new `OrderListComponent` source files.
The `order-list` route is added to the `routes` array in `app.module.ts`, using the lazy-loading syntax.

```ts
const routes: Routes = [
    { path: 'customer-list',
      loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule) },
    { path: 'order-list',
      loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule) }
    ];
```

## Set up the UI

Though you can type the URL into the address bar, a navigation UI is easier for the user and more common.
Replace the default placeholder markup in `app.component.html` with a custom nav
so you can easily navigate to your modules in the browser:


<code-example path="lazy-loading-ngmodules/src/app/app.component.html" id="app.component.html" region="app-component-template" header="src/app/app.component.html"></code-example>


To see your app in the browser so far, enter the following command in the terminal window:

<code-example language="bash">
ng serve
</code-example>

Then go to `localhost:4200` where you should see “app works!” and three buttons.

<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/three-buttons.png" width="300" alt="three buttons in the browser">
</figure>

These buttons work, because the CLI automatically added the routes to the feature modules to the `routes` array in `app.module.ts`.

{@a config-routes}

## Imports and route configuration

The CLI automatically added each feature module to the routes map at the application level.
Finish this off by adding the default route.
In `AppRoutingModule`, update the `routes` array with the following:

<code-example path="lazy-loading-ngmodules/src/app/app-routing.module.ts" id="app-routing.module.ts" region="const-routes" header="src/app/app-routing.module.ts"></code-example>

The first two paths are the routes to the `CustomersModule` and the `OrdersModule`.
The final entry defines a default route. The empty path matches everything that doesn't match an earlier path.


### Inside the feature module

Next, take a look at `customers.module.ts`. If you’re using the CLI and following the steps outlined in this page, you don’t have to do anything here.

<code-example path="lazy-loading-ngmodules/src/app/customers/customers.module.ts" id="customers.module.ts" region="customers-module" header="src/app/customers/customers.module.ts"></code-example>

The `customers.module.ts` file imports the `CustomersRoutingModule` and `CustomerListComponent` so the `CustomersModule` class can have access to them. `CustomersRoutingModule` is then listed in the `@NgModule` `imports` array giving `CustomersModule` access to its own routing module, and `CustomerListComponent` is in the `declarations` array, which means `CustomerListComponent` belongs to the `CustomersModule`.


The feature module has its own routing module, `customers-routing.module.ts`. The `AppRoutingModule` imports the feature module, `CustomersModule`, and `CustomersModule` in turn imports the `CustomersRoutingModule`.

The feature-specific routing module imports its own feature component, `CustomerListComponent`, along with the other JavaScript import statements. It also adds the route to its own component.

<code-example path="lazy-loading-ngmodules/src/app/customers/customers-routing.module.ts" id="customers-routing.module.ts" region="customers-routing-module" header="src/app/customers/customers-routing.module.ts"></code-example>

Notice that the `path` is set to an empty string. This is because the path in `AppRoutingModule` is already set to `customers`, so this route in the `CustomersRoutingModule`, is already within the `customers` context. Every route in this routing module is a child route.

The other feature module's routing module is configured similarly.

<code-example path="lazy-loading-ngmodules/src/app/orders/orders-routing.module.ts" id="orders-routing.module.ts" region="orders-routing-module-detail" header="src/app/orders/orders-routing.module.ts (excerpt)"></code-example>

## Confirm it’s working

You can check to see that a module is indeed being lazy loaded with the Chrome developer tools. In Chrome, open the dev tools by pressing `Cmd+Option+i` on a Mac or `Ctrl+Shift+j` on a PC and go to the Network Tab.

<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/network-tab.png" width="600" alt="lazy loaded modules diagram">
</figure>


Click on the Orders or Customers button. If you see a chunk appear, everything is wired up properly and the feature module is being lazy loaded. A chunk should appear for Orders and for Customers but will only appear once for each.


<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/chunk-arrow.png" width="600" alt="lazy loaded modules diagram">
</figure>


To see it again, or to test after working in the project, clear everything out by clicking the circle with a line through it in the upper left of the Network Tab:

<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/clear.gif" width="200" alt="lazy loaded modules diagram">
</figure>


Then reload with `Cmd+r` or `Ctrl+r`, depending on your platform.

## `forRoot()` and `forChild()`

You might have noticed that the CLI adds `RouterModule.forRoot(routes)` to the `app-routing.module.ts` `imports` array.
This lets Angular know that this module, `AppRoutingModule`, is a routing module and `forRoot()` specifies that this is the root routing module.
It configures all the routes you pass to it, gives you access to the router directives, and registers the `RouterService`.
Use `forRoot()` in the `AppRoutingModule`&mdash;that is, one time in the app at the root level.

The CLI also adds `RouterModule.forChild(routes)` to feature routing modules.
This way, Angular knows that the route list is only responsible for providing additional routes and is intended for feature modules.
You can use `forChild()` in multiple modules.

The `forRoot()` method takes care of the *global* injector configuration for the Router.
The `forChild()` method has no injector configuration. It uses directives such as `RouterOutlet` and `RouterLink`.
For more information, see the [`forRoot()` pattern](guide/singleton-services#forRoot) section of the [Singleton Services](guide/singleton-services) guide.

<hr>

## More on NgModules and routing

You may also be interested in the following:
* [Routing and Navigation](guide/router).
* [Providers](guide/providers).
* [Types of Feature Modules](guide/module-types).
* [Route-level code-splitting in Angular](https://web.dev/route-level-code-splitting-in-angular/)
* [Route preloading strategies in Angular](https://web.dev/route-preloading-in-angular/)
