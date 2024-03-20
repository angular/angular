# Lazy-loading feature modules

By default, NgModules are eagerly loaded. This means that as soon as the application loads, so do all the NgModules, whether they are immediately necessary or not.
For large applications with lots of routes, consider lazy loading &mdash;a design pattern that loads NgModules as needed.
Lazy loading helps keep initial bundle sizes smaller, which in turn helps decrease load times.

<!-- For the final sample application with two lazy-loaded modules that this page describes: -->
<!-- TODO: link to GitHub -->
<!-- <docs-code live/> -->

## Lazy loading basics

This section introduces the basic procedure for configuring a lazy-loaded route.
For a step-by-step example, see the [step-by-step setup](#step-by-step-setup) section on this page.

To lazy load Angular modules, use `loadChildren` (instead of `component`) in your `AppRoutingModule` `routes` configuration as follows.

<docs-code header="AppRoutingModule (excerpt)" language="typescript">

const routes: Routes = [
  {
    path: 'items',
    loadChildren: () => import('./items/items.module').then(m => m.ItemsModule)
  }
];

</docs-code>

In the lazy-loaded module's routing module, add a route for the component.

<docs-code header="Routing module for lazy loaded module (excerpt)" language="typescript">

const routes: Routes = [
  {
    path: '',
    component: ItemsComponent
  }
];

</docs-code>

Also be sure to remove the `ItemsModule` from the `AppModule`.
For step-by-step instructions on lazy loading modules, continue with the following sections of this page.

## Step-by-step setup

Setting up a lazy-loaded feature module requires two main steps:

1. Create the feature module with the Angular CLI, using the `--route` flag.
1. Configure the routes.

### Set up an application

If you don't already have an application, follow the following steps to create one with the Angular CLI.
If you already have an application, skip to [Configure the routes](#config-routes).

Enter the following command where `customer-app` is the name of your app:

<docs-code language="shell">

ng new customer-app --no-standalone --routing

</docs-code>

This creates an application called `customer-app`, `--no-standalone` flag makes the app module-based, and the `--routing` flag generates a file called `app-routing.module.ts`.
This is one of the files you need for setting up lazy loading for your feature module.
Navigate into the project by issuing the command `cd customer-app`.

### Create a feature module with routing

Next, you need a feature module with a component to route to.
To make one, enter the following command in the command line tool, where `customers` is the name of the feature module.
The path for loading the `customers` feature modules is also `customers` because it is specified with the `--route` option:

<docs-code language="shell">

ng generate module customers --route customers --module app.module

</docs-code>

This creates a `customers` directory having the new lazy-loadable feature module `CustomersModule` defined in the `customers.module.ts` file and the routing module `CustomersRoutingModule` defined in the `customers-routing.module.ts` file.
The command automatically declares the `CustomersComponent` and imports `CustomersRoutingModule` inside the new feature module.

Because the new module is meant to be lazy-loaded, the command does **not** add a reference to it in the application's root module file, `app.module.ts`.
Instead, it adds the declared route, `customers` to the `routes` array declared in the module provided as the `--module` option.

<docs-code header="src/app/app-routing.module.ts" language="typescript">
const routes: Routes = [
  {
    path: 'customers',
    loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule)
  }
];
</docs-code>

Notice that the lazy-loading syntax uses `loadChildren` followed by a function that uses the browser's built-in `import('...')` syntax for dynamic imports.
The import path is the relative path to the module.

<docs-callout title="String-based lazy loading">

In Angular version 8, the string syntax for the `loadChildren` route specification was deprecated in favor of the `import()` syntax.
You can opt into using string-based lazy loading (`loadChildren: './path/to/module#Module'`) by including the lazy-loaded routes in your `tsconfig` file, which includes the lazy-loaded files in the compilation.

By default the Angular CLI generates projects with stricter file inclusions intended to be used with the `import()` syntax.

</docs-callout>

### Add another feature module

Use the same command to create a second lazy-loaded feature module with routing, along with its stub component.

<docs-code language="shell">

ng generate module orders --route orders --module app.module

</docs-code>

This creates a new directory called `orders` containing the `OrdersModule` and `OrdersRoutingModule`, along with the new `OrdersComponent` source files.
The `orders` route, specified with the `--route` option, is added to the `routes` array inside the `app-routing.module.ts` file, using the lazy-loading syntax.

<docs-code header="src/app/app-routing.module.ts" language="typescript" highlight="[6,7,8,9]">
const routes: Routes = [
  {
    path: 'customers',
    loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule)
  }
];
</docs-code>

### Set up the UI

Though you can type the URL into the address bar, a navigation UI is straightforward for the user and more common.
Replace the default placeholder markup in `app.component.html` with a custom nav, so you can navigate to your modules in the browser:

<docs-code header="src/app/app.component.html" language="html" highlight="[4,5,6]">
<h1>
  {{title}}
</h1>
<button type="button" routerLink="/customers">Customers</button>
<button type="button" routerLink="/orders">Orders</button>
<button type="button" routerLink="">Home</button>
<router-outlet></router-outlet>
</docs-code>

To see your application in the browser so far, enter the following command in the command line tool window:

<docs-code language="shell">

ng serve

</docs-code>

Then go to `localhost:4200` where you should see "customer-app" and three buttons.

<img alt="three buttons in the browser" src="assets/images/guide/modules/lazy-loading-three-buttons.png" width="300">

These buttons work, because the Angular CLI automatically added the routes for the feature modules to the `routes` array in `app-routing.module.ts`.

### Imports and route configuration

The Angular CLI automatically added each feature module to the routes map at the application level.
Finish this off by adding the default route.
In the `app-routing.module.ts` file, update the `routes` array with the following:

<docs-code header="src/app/app-routing.module.ts" language="typescript">
const routes: Routes = [
  {
    path: 'customers',
    loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule)
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];
</docs-code>

The first two paths are the routes to the `CustomersModule` and the `OrdersModule`.
The final entry defines a default route.
The empty path matches everything that doesn't match an earlier path.

### Inside the feature module

Next, take a look at the `customers.module.ts` file.
If you're using the Angular CLI and following the steps outlined in this page, you don't have to do anything here.

<docs-code header="src/app/customers/customers.module.ts" language="typescript">
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersComponent } from './customers.component';

@NgModule({
  imports: [
    CommonModule,
    CustomersRoutingModule
  ],
  declarations: [CustomersComponent]
})
export class CustomersModule { }
</docs-code>

The `customers.module.ts` file imports the `customers-routing.module.ts` and `customers.component.ts` files.
`CustomersRoutingModule` is listed in the `@NgModule` `imports` array giving `CustomersModule` access to its own routing module.
`CustomersComponent` is in the `declarations` array, which means `CustomersComponent` belongs to the `CustomersModule`.

The `app-routing.module.ts` then imports the feature module, `customers.module.ts` using JavaScript's dynamic import.

The feature-specific route definition file `customers-routing.module.ts` imports its own feature component defined in the `customers.component.ts` file, along with the other JavaScript import statements.
It then maps the empty path to the `CustomersComponent`.

<docs-code header="src/app/customers/customers-routing.module.ts" language="typescript"
           highlight="[8,9]">
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomersComponent } from './customers.component';

const routes: Routes = [
  {
    path: '',
    component: CustomersComponent
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }
</docs-code>

The `path` here is set to an empty string because the path in `AppRoutingModule` is already set to `customers`, so this route in the `CustomersRoutingModule`, is already within the `customers` context.
Every route in this routing module is a child route.

The other feature module's routing module is configured similarly.

<docs-code header="src/app/orders/orders-routing.module.ts (excerpt)" language="typescript">
import { OrdersComponent } from './orders.component';

const routes: Routes = [
  {
    path: '',
    component: OrdersComponent
  }
];
</docs-code>

### Verify lazy loading

You can verify that a module is indeed being lazy loaded with the Chrome developer tools.
In Chrome, open the developer tools by pressing <kbd>⌘ Cmd</kbd>+<kbd>Option</kbd>+<kbd>i</kbd> on a Mac or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>j</kbd> on a PC and go to the Network Tab.

<img alt="lazy loaded modules diagram" src="assets/images/guide/modules/lazy-loading-network-tab.png" width="600">

Click on the Orders or Customers button.
If you see a chunk appear, everything is wired up properly and the feature module is being lazy loaded.
A chunk should appear for Orders and for Customers but only appears once for each.

<img alt="lazy loaded modules diagram" src="assets/images/guide/modules/lazy-loading-chunk-arrow.png" width="600">

To see it again, or to test after making changes, click the circle with a line through it in the upper left of the Network Tab:

<img alt="lazy loaded modules diagram" src="assets/images/guide/modules/lazy-loading-clear.gif" width="200">

Then reload with <kbd>⌘ Cmd</kbd>+<kbd>R</kbd> or <kbd>Ctrl</kbd>+<kbd>R</kbd>, depending on your platform.

## `forRoot()` and `forChild()`

You might have noticed that the Angular CLI adds `RouterModule.forRoot(routes)` to the `AppRoutingModule` `imports` array.
This lets Angular know that the `AppRoutingModule` is a routing module and `forRoot()` specifies that this is the root routing module.
It configures all the routes you pass to it, gives you access to the router directives, and registers the `Router` service.
Use `forRoot()` only once in the application, inside the `AppRoutingModule`.

The Angular CLI also adds `RouterModule.forChild(routes)` to feature routing modules.
This way, Angular knows that the route list is only responsible for providing extra routes and is intended for feature modules.
You can use `forChild()` in multiple modules.

The `forRoot()` method takes care of the *global* injector configuration for the Router.
The `forChild()` method has no injector configuration.
It uses directives such as `RouterOutlet` and `RouterLink`.
For more information, see the [`forRoot()` pattern](guide/ngmodules/singleton-services#forRoot) section of the singleton services guide.

## Preloading

Preloading improves UX by loading parts of your application in the background.
You can preload modules, standalone components or component data.

### Preloading modules and standalone components

Preloading modules and standalone components improves UX by loading parts of your application in the background. By doing this, users don't have to wait for the elements to download when they activate a route.

To enable preloading of all lazy loaded modules and standalone components, import the `PreloadAllModules` token from the Angular `router`.

### Module based application

<docs-code header="AppRoutingModule (excerpt)" language="typescript">

import { PreloadAllModules } from '@angular/router';

</docs-code>

Then, specify your preloading strategy in the `AppRoutingModule`'s `RouterModule.forRoot()` call.

<docs-code header="AppRoutingModule (excerpt)" language="typescript" highlight="[4]">
RouterModule.forRoot(
  appRoutes,
  {
    preloadingStrategy: PreloadAllModules
  }
)
</docs-code>

### Standalone application

For standalone applications configure preloading strategies by adding `withPreloading` to  `provideRouter`s RouterFeatures in `app.config.ts`

<docs-code header="app.config.ts" language="typescript" highlight="[3,5,14]">
import { ApplicationConfig } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter
  withPreloading,
} from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),
  ],
};
</docs-code>

### Preloading component data

To preload component data, use a `resolver`.
Resolvers improve UX by blocking the page load until all necessary data is available to fully display the page.

#### Resolvers

Create a resolver service.
With the Angular CLI, the command to create a service is as follows:

<docs-code language="shell">
ng generate service <service-name>
</docs-code>

In the newly created service, implement the `Resolve` interface provided by the `@angular/router` package:

<docs-code header="Resolver service (excerpt)" language="typescript">

import { Resolve } from '@angular/router';

&hellip;

/*An interface that represents your data model*/
export interface Crisis {
  id: number;
  name: string;
}

export class CrisisDetailResolverService implements Resolve&lt;Crisis&gt; {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable&lt;Crisis&gt; {
    // your logic goes here
  }
}

</docs-code>

Import this resolver into your module's routing module.

<docs-code header="Feature module's routing module (excerpt)" language="typescript">

import { CrisisDetailResolverService } from './crisis-detail-resolver.service';

</docs-code>

Add a `resolve` object to the component's `route` configuration.

<docs-code header="Feature module's routing module (excerpt)" language="typescript"
           highlight="[4,5,6]">
{
  path: '/your-path',
  component: YourComponent,
  resolve: {
    crisis: CrisisDetailResolverService
  }
}
</docs-code>

In the component's constructor, inject an instance of the `ActivatedRoute` class that represents the current route.

<docs-code header="Component's constructor (excerpt)">
import { ActivatedRoute } from '@angular/router';

@Component({ &hellip; })
class YourComponent {
  constructor(private route: ActivatedRoute) {}
}
</docs-code>

Use the injected instance of the `ActivatedRoute` class to access `data` associated with a given route.

<docs-code header="Component's ngOnInit lifecycle hook (excerpt)" language="typescript"
           highlight="[1,5,8]">
import { ActivatedRoute } from '@angular/router';

@Component({ &hellip; })
class YourComponent {
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data
      .subscribe(data => {
        const crisis: Crisis = data.crisis;
        // &hellip;
      });
  }
}
</docs-code>

## Troubleshooting lazy-loading modules

A common error when lazy-loading modules is importing common modules in multiple places within an application.
Test for this condition by first generating the module using the Angular CLI and including the `--route route-name` parameter, where `route-name` is the name of your module.
Next, create the module without the `--route` parameter.
If `ng generate module` with the `--route` parameter returns an error, but runs correctly without it, you might have imported the same module in multiple places.

Remember, many common Angular modules should be imported at the base of your application.

For more information on Angular Modules, see [NgModules](/guide/ngmodules).

## More on NgModules and routing

You might also be interested in the following:

* [Routing and Navigation](guide/routing)
* [Providers](guide/ngmodules/providers)
* [Types of Feature Modules](guide/ngmodules/module-types)
* [Route-level code-splitting in Angular](https://web.dev/route-level-code-splitting-in-angular)
* [Route preloading strategies in Angular](https://web.dev/route-preloading-in-angular)
