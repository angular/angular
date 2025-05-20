# Show routes with outlets

The `RouterOutlet` directive is a placeholder that marks the location where the router should render the component for the current URL.

```angular-html
<app-header />
<router-outlet />  <!-- Angular inserts your route content here -->
<app-footer />
```

```angular-ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
```

In this example, if an application has the following routes defined:

```angular-ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home Page'
  },
  {
    path: 'products',
    component: ProductsComponent,
    title: 'Our Products'
  }
];
```

When a user visits `/products`, Angular renders the following:

```angular-html
<app-header></app-header>
<app-products></app-products>
<app-footer></app-footer>
```

If the user goes back to the home page, then Angular renders:

```angular-html
<app-header></app-header>
<app-home></app-home>
<app-footer></app-footer>
```

When displaying a route, the `<router-outlet>` element remains present in the DOM as a reference point for future navigations. Angular inserts routed content just after the outlet element as a sibling.

```angular-html
<!-- Contents of the component's template -->
<app-header />
<router-outlet />
<app-footer />
```

```angular-html
<!-- Content rendered on the page when the user visits /admin -->
<app-header>...</app-header>
<router-outlet></router-outlet>
<app-admin-page>...</app-admin-page>
<app-footer>...</app-footer>
```

## Nesting routes with child routes

As your application grows more complex, you might want to create routes that are relative to a component other than your root component. This enables you to create experiences where only part of the application changes when the URL changes, as opposed to the users feeling like the entire page is refreshed.

These types of nested routes are called child routes. This means you're adding a second `<router-outlet>` to your app, because it is in addition to the `<router-outlet>` in AppComponent.

In this example, the `Settings` component will display the desired panel based on what the user selects. One of the unique things you’ll notice about child routes is that the component often has its own `<nav>` and `<router-outlet>`.

```angular-html
<h1>Settings</h1>
<nav>
  <ul>
    <li><a routerLink="profile">Profile</a></li>
    <li><a routerLink="security">Security</a></li>
  </ul>
</nav>
<router-outlet />
```

A child route is like any other route, in that it needs both a `path` and a `component`. The one difference is that you place child routes in a children array within the parent route.

```angular-ts
const routes: Routes = [
  {
    path: 'settings-component',
    component: SettingsComponent, // this is the component with the <router-outlet> in the template
    children: [
      {
        path: 'profile', // child route path
        component: ProfileComponent, // child route component that the router renders
      },
      {
        path: 'security',
        component: SecurityComponent, // another child route component that the router renders
      },
    ],
  },
];
```

Once both the `routes` and `<router-outlet>` are configured correctly, your application is now using nested routes!

## Secondary routes with named outlets

Pages may have multiple outlets— you can assign a name to each outlet to specify which content belongs to which outlet.

```angular-html
<app-header />
<router-outlet />
<router-outlet name='read-more' />
<router-outlet name='additional-actions' />
<app-footer />
```

Each outlet must have a unique name. The name cannot be set or changed dynamically. By default, the name is `'primary'`.

Angular matches the outlet's name to the `outlet` property defined on each route:

```angular-ts
{
  path: 'user/:id',
  component: UserDetails,
  outlet: 'additional-actions'
}
```

## Outlet lifecycle events

There are four lifecycle events that a router outlet can emit:

| Event        | Description                                                              |
| ------------ | ------------------------------------------------------------------------ |
| `activate`   | When a new component is instantiated                                     |
| `deactivate` | When a component is destroyed                                            |
| `attach`     | When the `RouteReuseStrategy` instructs the outlet to attach the subtree |
| `detach`     | When the `RouteReuseStrategy` instructs the outlet to detach the subtree |

You can add event listeners with the standard event binding syntax:

```angular-html
<router-outlet
  (activate)='onActivate($event)'
  (deactivate)='onDeactivate($event)'
  (attach)='onAttach($event)'
  (detach)='onDetach($event)'
/>
```

Check out the [API docs for RouterOutlet](/api/router/RouterOutlet?tab=api) if you’d like to learn more.

## Next steps

Learn how to [navigate to routes](/guide/routing/navigate-to-routes) with Angular Router.
