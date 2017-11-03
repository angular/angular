# Lazy Loading Feature Modules

## Prerequisites
A basic understanding of the following:
* [Feature Modules](guide/feature-modules)
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule)
* [Frequently Used Modules](guide/frequent-ngmodules)
* [Types of Modules](guide/module-types)
* [Routing and Navigation](guide/router)

<hr>

## High level view

There are three main steps to setting up a lazy loaded feature module:

1. Create the feature module.
1. Create the feature module’s routing module.
1. Configure the routes.

## Set up an app

If you don’t already have an app, you can follow the steps below to
create one with the CLI. If you do already have an app, skip to 
[Configure the routes](#config-routes). Enter the following command 
where `customer-app` is the name of your app:

```
ng new customer-app --routing
```

This creates an app called `customer-app` and the `--routing` flag
generates a file called `app-routing.module.ts`, which is one of
the files you need for setting up lazy loading for your feature module.

## Create a feature module with routing

Next, you’ll need a feature module to route to. To make one, enter
the following command at the terminal window prompt where `customers` is the name of the module:

```
ng generate module customers --routing
```

This creates a customers folder with two files inside; `CustomersModule`
and `CustomersRoutingModule`. `CustomersModule` will act as the gatekeeper
for anything that concerns customers. `CustomersRoutingModule` will handle
any customer-related routing. This keeps the app’s structure organized as
the app grows and allows you to reuse this module while easily keeping its routing intact.

The CLI imports the `CustomersRoutingModule` into the `CustomersModule` by
adding a JavaScript import statement at the top of the file and adding
`CustomersRoutingModule` to the `@NgModule` `imports` array.

## Add a component to the feature module

In order to see the module being lazy loaded in the browser, create a component to render some HTML when the app loads `CustomersModule`. At the command line, enter the following:

```
ng generate component customers/customer-list
```

This creates a folder inside of `customers` called `customer-list`
with the four files that make up the component. For more information
about components, see [Components]().

Just like with the routing module, the CLI imports the
`CustomerListComponent` into the `CustomersModule`.


## Add another feature module

For another place to route to, create a second feature module with routing:

```
ng generate module orders --routing
```

This makes a new folder called `orders` containing an `OrdersModule` and an `OrdersRoutingModule`.

Now, just like with the `CustomersModule`, give it some content:

```
ng generate component orders/order-list
```

## Set up the UI

Though you can type the URL into the address bar, a nav
is easier for the user and more common. Add some buttons
to `app.component.html` so you can easily navigate to your modules in the browser:

```html
<h1>
 {{title}}
</h1>

<button routerLink="/customers">Customers</button>
<button routerLink="/orders">Orders</button>
<button routerLink="">Home</button>

<router-outlet></router-outlet>
```

To see your app in the browser so far, enter the following command in the terminal window:

```
ng serve
```

Then go to localhost:4200 where you should see “app works!” and three buttons.

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

In `AppRoutingModule`, update the routes array with the following:

```javascript
const routes: Routes = [
   {
   	path: customers,
   	loadChildren: './customers/customers.module#CustomersModule'
   },
   {
   	path: 'orders',
   	loadChildren: './orders/orders.module#OrdersModule'
   },
   {
   	path: '',
   	redirectTo: '',
   	pathMatch: 'full'
    }
];
```

The import statements stay the same. The first two paths are the routes to the `CustomersModule` and the `OrdersModule` respectively. Notice that the lazy loading syntax uses `loadChildren` followed by a string that is the path to the module, a hash mark or `#`, and the module’s class name.

### Inside the feature module

Next, take a look at `customers.module.ts`. If you’re using the CLI and following the steps outlined in this page, you don’t have to do anything here. The feature module is like a connector between the `AppRoutingModule` and the feature routing module. The `AppRoutingModule` imports the feature module, `CustomersModule`, and `CustomersModule` in turn imports the `CustomersRoutingModule`.

```javascript
...
import { CustomersRoutingModule } from './customers-routing.module';
import { CustomerListComponent } from './customer-list/customer-list.component';

@NgModule({
 imports: [
   CommonModule,
   CustomersRoutingModule
 ],
 declarations: [CustomerListComponent]
})
export class CustomersModule { }

```

The `customers.module.ts` file imports the `CustomersRoutingModule` and `CustomerListComponent` so the `CustomersModule` class can have access to them. `CustomerRoutingModule` is then listed in the `@NgModule` `imports` array giving `CustomersModule` access to its own routing module, and `CustomerListComponent` is in the `declarations` array, which means `CustomerListComponent` belongs to the `CustomersModule`.


### Configure the feature module’s routes

The next step is in `customer-routing.module.ts`. First, import the component at the top of the file with the other JavaScript import statements. Then, add the route.

```javascript
...
import { CustomerListComponent } from './customer-list/customer-list.component';
...

const routes: Routes = [
 {
   path: '',
   component: CustomerListComponent
 }
];

...
```

Notice that the `path` is set to an empty string. This is because the path in `AppRoutingModule` is already set to `customers`, so this route in the `CustomerRoutingModule`, is already within the `customers` context. Every route in this routing module is a child route.

Repeat this last step of importing the `OrdersListComponent` and configuring the Routes array for the `orders-routing.module.ts`:

```javascript
...
import { OrderListComponent } from './order-list/order-list.component';
...

const routes: Routes = [
 {
   path: '',
   component: OrderListComponent
 }
];

...
```

Now, if you view the app in the browser, the three buttons take you to each module.



## Confirm it’s working

You can check to see that a module is indeed being lazy loaded with the Chrome developer tools. In the browser, open the dev tools by pressing `Cmd+Option+i` on a Mac or `Ctrl+Alt+i` on a PC and go to the Network Tab.

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

<hr>


## More on NgModules and routing

You may also be interested in the following:
* [Routing and Navigation](guide/router).
* [Providers](guide/providers).
* [Types of NgModules](guide/module-types).
