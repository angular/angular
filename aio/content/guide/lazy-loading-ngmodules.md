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

```sh
ng new customer-app --routing
```

This creates an app called `customer-app` and the `--routing` flag
generates a file called `app-routing.module.ts`, which is one of
the files you need for setting up lazy loading for your feature module.
Navigate into the project by issuing the command `cd customer-app`.

## Create a feature module with routing

Next, you’ll need a feature module with a component to route to.
To make one, enter the following command at the terminal window prompt, where `customers` is the name of the features module, and `customer-list` is the component to route to:

```sh
ng generate module customers --route=customer-list --module=app.module
```

This creates a `customers` folder with the new lazy-loadable module `CustomersModule` defined in the file `customers.module.ts`.
Because the new module is meant to be lazy-loaded, the command does NOT add a JavaScript `import` statement for the new feature module to the root application's module file,
`app.module.ts`.
Instead, it adds the declared route to the `routes` array in `app.module.ts`. *Is this  what it is supposed to do? It doesn't do it.*

### Create the feature component

To see the routing work, you need to add the `CustomerListComponent` to the new feature module.
Use the following CLI command to generate a stub component, with `CustomersModule` as the declaring module.

<code-example language="bash">
ng generate component customers/customer-list --module=customers.module
</code-example>

This creates the new component folder, `customer-list`, with the four files that make up the stub for `CustomerListComponent`.

### Add another feature module

For another place to route to, create a second lazy-loaded feature module with routing, and a stub component.

```sh
ng generate module orders --route=order-list --module=orders.module
```

This makes a new folder called `orders` containing an `OrdersModule` and `OrdersRoutingModule`, along with the new `order-list` folder. All of the module imports are added automatically.

Create an `OrderListComponent` in the new module folder.

<code-example language="bash">
ng generate component orders/order-list --module=orders.module
</code-example>

## Set up the UI

Though you can type the URL into the address bar, a nav
is easier for the user and more common. Replace the default
placeholder markup in `app.component.html` with a custom nav
so you can easily navigate to your modules in the browser:


<code-example path="lazy-loading-ngmodules/src/app/app.component.html" region="app-component-template" header="src/app/app.component.html"></code-example>



To see your app in the browser so far, enter the following command in the terminal window:

```sh
ng serve
```

Then go to `localhost:4200` where you should see “app works!” and three buttons.

<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/three-buttons.png" width="300" alt="three buttons in the browser">
</figure>


To make the buttons work, you need to configure the routing modules.

{@a config-routes}

## Configure the routes

The two feature modules, `OrdersModule` and `CustomersModule`, have to be
wired up to the `AppRoutingModule` so the router knows about them. The structure is as follows:

<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/lazy-load-relationship.jpg" width="400" alt="lazy loaded modules diagram">
</figure>


Each feature module acts as a doorway via the router. In the `AppRoutingModule`, you configure the routes to the feature modules, in this case `OrdersModule` and `CustomersModule`. This way, the router knows to go to the feature module. The feature module then connects the `AppRoutingModule` to the `CustomersRoutingModule` or the `OrdersRoutingModule`. Those routing modules tell the router where to go to load relevant components.

### Routes at the app level

In `AppRoutingModule`, update the `routes` array with the following:


<code-example path="lazy-loading-ngmodules/src/app/app-routing.module.ts" region="const-routes" header="src/app/app-routing.module.ts"></code-example>


The import statements stay the same. The first two paths are the routes to the `CustomersModule` and the `OrdersModule` respectively. Notice that the lazy loading syntax uses `loadChildren` followed by a function that uses the browser's built-in `import('...')` syntax for dynamic imports. The import path is the relative path to the module.

### Inside the feature module

Next, take a look at `customers.module.ts`. If you’re using the CLI and following the steps outlined in this page, you don’t have to do anything here. The feature module is like a connector between the `AppRoutingModule` and the feature routing module. The `AppRoutingModule` imports the feature module, `CustomersModule`, and `CustomersModule` in turn imports the `CustomersRoutingModule`.


<code-example path="lazy-loading-ngmodules/src/app/customers/customers.module.ts" region="customers-module" header="src/app/customers/customers.module.ts"></code-example>



The `customers.module.ts` file imports the `CustomersRoutingModule` and `CustomerListComponent` so the `CustomersModule` class can have access to them. `CustomersRoutingModule` is then listed in the `@NgModule` `imports` array giving `CustomersModule` access to its own routing module, and `CustomerListComponent` is in the `declarations` array, which means `CustomerListComponent` belongs to the `CustomersModule`.


### Configure the feature module’s routes

The next step is in `customers-routing.module.ts`. First, import the component at the top of the file with the other JavaScript import statements. Then, add the route to `CustomerListComponent`.

<code-example path="lazy-loading-ngmodules/src/app/customers/customers-routing.module.ts" region="customers-routing-module" header="src/app/customers/customers-routing.module.ts"></code-example>


Notice that the `path` is set to an empty string. This is because the path in `AppRoutingModule` is already set to `customers`, so this route in the `CustomersRoutingModule`, is already within the `customers` context. Every route in this routing module is a child route.

Repeat this last step of importing the `OrdersListComponent` and configuring the Routes array for the `orders-routing.module.ts`:

<code-example path="lazy-loading-ngmodules/src/app/orders/orders-routing.module.ts" region="orders-routing-module-detail" header="src/app/orders/orders-routing.module.ts (excerpt)"></code-example>

Now, if you view the app in the browser, the three buttons take you to each module.

## Confirm it’s working

You can check to see that a module is indeed being lazy loaded with the Chrome developer tools. In Chrome, open the dev tools by pressing `Cmd+Option+i` on a Mac or `Ctrl+Shift+j` on a PC and go to the Network Tab.

<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/network-tab.png" width="600" alt="lazy loaded modules diagram">
</figure>


Click on the Orders or Customers button. If you see a chunk appear, you’ve wired everything up properly and the feature module is being lazy loaded. A chunk should appear for Orders and for Customers but will only appear once for each.


<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/chunk-arrow.png" width="600" alt="lazy loaded modules diagram">
</figure>


To see it again, or to test after working in the project, clear everything out by clicking the circle with a line through it in the upper left of the Network Tab:

<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/clear.gif" width="200" alt="lazy loaded modules diagram">
</figure>


Then reload with `Cmd+r` or `Ctrl+r`, depending on your platform.

## `forRoot()` and `forChild()`

You might have noticed that the CLI adds `RouterModule.forRoot(routes)` to the `app-routing.module.ts` `imports` array. This lets Angular know that this module,
`AppRoutingModule`, is a routing module and `forRoot()` specifies that this is the root
routing module. It configures all the
routes you pass to it, gives you access to the router directives, and registers the `RouterService`.
Use `forRoot()` in the `AppRoutingModule`&mdash;that is, one time in the app at the root level.

The CLI also adds `RouterModule.forChild(routes)` to feature routing modules. This way, Angular
knows that the route list is only responsible for providing additional routes and is intended for feature modules. You can use `forChild()` in multiple modules.

`forRoot()` contains injector configuration which is global; such as configuring the Router. `forChild()` has no injector configuration, only directives such as `RouterOutlet` and `RouterLink`.

For more information, see the [`forRoot()` pattern](guide/singleton-services#forRoot) section of the [Singleton Services](guide/singleton-services) guide.

<hr>

## More on NgModules and routing

You may also be interested in the following:
* [Routing and Navigation](guide/router).
* [Providers](guide/providers).
* [Types of Feature Modules](guide/module-types).
* [Route-level code-splitting in Angular](https://web.dev/route-level-code-splitting-in-angular/)
* [Route preloading strategies in Angular](https://web.dev/route-preloading-in-angular/)
