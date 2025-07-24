# Define routes

Routes serve as the fundamental building blocks for navigation within an Angular app.

## What are routes?

In Angular, a **route** is an object that defines which component should render for a specific URL path or pattern, as well as additional configuration options about what happens when a user navigates to that URL.

Here is a basic example of a route:

```angular-ts
import { AdminPage } from './app-admin/app-admin.component';

const adminPage = {
  path: 'admin',
  component: AdminPage
}
```

For this route, when a user visits the `/admin` path, the app will display the `AdminPage` component.

### Managing routes in your application

Most projects define routes in a separate file that contains `routes` in the filename.

A collection of routes looks like this:

```angular-ts
import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page.component';
import { AdminPage } from './about-page/admin-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'admin',
    component: AdminPage,
  },
];
```

Tip: If you generated a project with Angular CLI, your routes are defined in `src/app/app.routes.ts`.

### Adding the router to your application

When bootstrapping an Angular application without the Angular CLI, you can pass a configuration object that includes a `providers` array.

Inside of the `providers` array, you can add the Angular router to your application by adding a `provideRouter` function call with your routes.

```angular-ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ...
  ]
};
```

## Route URL Paths

### Static URL Paths

Static URL Paths refer to routes with predefined paths that don't change based on dynamic parameters. These are routes that match a `path` string exactly and have a fixed outcome.

Examples of this include:

- "/admin"
- "/blog"
- "/settings/account"

### Define URL Paths with Route Parameters

Parameterized URLs allow you to define dynamic paths that allow multiple URLs to the same component while dynamically displaying data based on parameters in the URL.

You can define this type of pattern by adding parameters to your route’s `path` string and prefixing each parameter with the colon (`:`) character.

IMPORTANT: Parameters are distinct from information in the URL's [query string](https://en.wikipedia.org/wiki/Query_string).
Learn more about [query parameters in Angular in this guide](/guide/routing/read-route-state#query-parameters).

The following example displays a user profile component based on the user id passed in through the URL.

```angular-ts
import { Routes } from '@angular/router';
import { UserProfile } from './user-profile/user-profile;

const routes: Routes = [
  { path: 'user/:id', component: UserProfile }
];
```

In this example, URLs such as `/user/leeroy` and `/user/jenkins` render the `UserProfile` component. This component can then read the `id` parameter and use it to perform additional work, such as fetching data. See [reading route state guide](/guide/routing/read-route-state) for details on reading route parameters.

Valid route parameter names must start with a letter (a-z, A-Z) and can only contain:

- Letters (a-z, A-Z)
- Numbers (0-9)
- Underscore (\_)
- Hyphen (-)

You can also define paths with multiple parameters:

```angular-ts
import { Routes } from '@angular/router';
import { UserProfile } from './user-profile/user-profile.component';
import { SocialMediaFeed } from './user-profile/social–media-feed.component';

const routes: Routes = [
  { path: 'user/:id/:social-media', component: SocialMediaFeed },
  { path: 'user/:id/', component: UserProfile },
];
```

With this new path, users can visit `/user/leeroy/youtube` and `/user/leeroy/bluesky` and see respective social media feeds based on the parameter for the user leeroy.

See [Reading route state](/guide/routing/read-route-state) for details on reading route parameters.

### Wildcards

When you need to catch all routes for a specific path, the solution is a wildcard route which is defined with the double asterisk (`**`).

A common example is defining a Page Not Found component.

```angular-ts
import { Home } from './home/home.component';
import { UserProfile } from './user-profile/user-profile.component';
import { NotFound } from './not-found/not-found.component';

const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'user/:id', component: UserProfile },
  { path: '**', component: NotFound }
];
```

In this routes array, the app displays the `NotFound` component when the user visits any path outside of `home` and `user/:id`.

Tip: Wildcard routes are typically placed at the end of a routes array.

## How Angular matches URLs

When you define routes, the order is important because Angular uses a first-match wins strategy. This means that once Angular matches a URL with a route `path`, it stops checking any further routes. As a result, always put more specific routes before less specific routes.

The following example shows routes defined from most-specific to least specific:

```angular-ts
const routes: Routes = [
  { path: '', component: HomeComponent },              // Empty path
  { path: 'users/new', component: NewUserComponent },  // Static, most specific
  { path: 'users/:id', component: UserDetailComponent }, // Dynamic
  { path: 'users', component: UsersComponent },        // Static, less specific
  { path: '**', component: NotFoundComponent }         // Wildcard - always last
];
```

If a user visits `/users/new`, Angular router would go through the following steps:

1. Checks `''` - doesn't match
1. Checks `users/new` - matches! Stops here
1. Never reaches `users/:id` even though it could match
1. Never reaches `users`
1. Never reaches `**`

## Loading Route Component Strategies

Understanding how and when components load in Angular routing is crucial for building responsive web applications. Angular offers two primary strategies to control component loading behavior:

1. **Eagerly loaded**: Components that are loaded immediately
2. **Lazily loaded**: Components loaded only when needed

Each approach offers distinct advantages for different scenarios.

### Eagerly loaded components

When you define a route with the `component` property, the referenced component is eagerly loaded as part of the same JavaScript bundle as the route configuration.

```angular-ts
import { Routes } from "@angular/router";
import { HomePage } from "./components/home/home-page"
import { LoginPage } from "./components/auth/login-page"

export const routes: Routes = [
  // HomePage and LoginPage are both directly referenced in this config,
  // so their code is eagerly included in the same JavaScript bundle as this file.
  {
    path: "",
    component: HomePage
  },
  {
    path: "login",
    component: LoginPage
  }
]
```

Eagerly loading route components like this means that the browser has to download and parse all of the JavaScript for these components as part of your initial page load, but the components are available to Angular immediately.

While including more JavaScript in your initial page load leads to slower initial load times, this can lead to more seamless transitions as the user navigates through an application.

### Lazily loaded components

You can use the `loadComponent` property to lazily load the JavaScript for a route only at the point at which that route would become active.

```angular-ts
import { Routes } from "@angular/router";

export const routes: Routes = [
  // The HomePage and LoginPage components are loaded lazily at the point at which
  // their corresponding routes become active.
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login-page').then(m => m.LoginPage)
  },
  {
    path: '',
    loadComponent: () => import('./components/home/home-page').then(m => m.HomePage)
  }
]
```

The `loadComponent` property accepts a loader function that returns a Promise that resolves to an Angular component. In most cases, this function uses the standard [JavaScript dynamic import API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import). You can, however, use any arbitrary async loader function.

Lazily loading routes can significantly improve the load speed of your Angular application by removing large portions of JavaScript from the initial bundle. These portions of your code compile into separate JavaScript "chunks" that the router requests only when the user visits the corresponding route.

### Should I use an eager or a lazy route?

There are many factors to consider when deciding on whether a route should be eager or lazy.

In general, eager loading is recommended for primary landing page(s) while other pages would be lazy-loaded.

Note: While lazy routes have the upfront performance benefit of reducing the amount of initial data requested by the user, it adds future data requests that could be undesirable. This is particularly true when dealing with nested lazy loading at multiple levels, which can significantly impact performance.

## Redirects

You can define a route that redirects to another route instead of rendering a component:

```angular-ts
import { BlogComponent } from './home/blog.component';

const routes: Routes = [
  {
    path: 'articles',
    redirectTo: '/blog',
  },
  {
    path: 'blog',
    component: BlogComponent
  },
];
```

If you modify or remove a route, some users may still click on out-of-date links or bookmarks to that route. You can add a redirect to direct those users to an appropriate alternative route instead of a "not found" page.

## Page titles

You can associate a **title** with each route. Angular automatically updates the [page title](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title) when a route activates. Always define appropriate page titles for your application, as these titles are necessary to create an accessible experience.

```angular-ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ProductsComponent } from './products/products.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home Page'
  },
  {
    path: 'about',
    component: AboutComponent,
    title: 'About Us'
  },
  {
    path: 'products',
    component: ProductsComponent,
    title: 'Our Products'
  }
];
```

## Route-level providers for dependency injection

Each route has a `providers` property that lets you provide dependencies to that route's content via [dependency injection](/guide/di).

Common scenarios where this can be helpful include applications that have different services based on whether the user is an admin or not.

```angular-ts
export const ROUTES: Route[] = [
  {
    path: 'admin',
    providers: [
      AdminService,
      {provide: ADMIN_API_KEY, useValue: '12345'},
    ],
    children: [
      {path: 'users', component: AdminUsersComponent},
      {path: 'teams', component: AdminTeamsComponent},
    ],
  },
  // ... other application routes that don't
  //     have access to ADMIN_API_KEY or AdminService.
];
```

In this code sample, the `admin` path contains a protected data property of `ADMIN_API_KEY` that is only available to children within its section. As a result, no other paths will be able to access the data provided via `ADMIN_API_KEY`.

See the [Dependency injection guide](/guide/di) for more information about providers and injection in Angular.

## Associating data with routes

Route data enables you to attach additional information to routes. You are able to configure how components behave based on this data.

There are two ways to work with route data: static data that remains constant, and dynamic data that can change based on runtime conditions.

### Static data

You can associate arbitrary static data with a route via the `data` property in order to centralize things like route-specific metadata (e.g., analytics tracking, permissions, etc.):

```angular-ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ProductsComponent } from './products/products.component';

const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent,
    data: { analyticsId: '456' }
  },
  {
    path: '',
    component: HomeComponent,
    data: { analyticsId: '123' }
  }
];
```

In this code sample, the home and about page are configured with specific `analyticsId` which would then be used in their respective components for page tracking analytics.

You can read this static data by injecting the `ActivatedRoute`. See [Reading route state](/guide/routing/read-route-state) for details.

### Dynamic data with data resolvers

When you need to provide dynamic data to a route, check out the [guide on route data resolvers](/guide/routing/data-resolvers).

## Nested Routes

Nested routes, also known as child routes, are a common technique for managing more complex navigation routes where a component has a sub-view that changes based on the URL.

<img alt="Diagram to illustrate nested routes" src="assets/images/guide/router/nested-routing-diagram.svg">

You can add child routes to any route definition with the `children` property:

```angular-ts
const routes: Routes = [
  {
    path: 'product/:id',
    component: ProductComponent,
    children: [
      {
        path: 'info',
        component: ProductInfoComponent
      },
      {
        path: 'reviews',
        component: ProductReviewsComponent
      }
    ]
  }
]
```

The above example defines a route for a product page that allows a user to change whether the product info or reviews are displayed based on the url.

The `children` property accepts an array of `Route` objects.

To display child routes, the parent component (`ProductComponent` in the example above) includes its own `<router-outlet>`.

```angular-html
<!-- ProductComponent -->
<article>
  <h1>Product {{ id }}</h1>
  <router-outlet />
</article>
```

After adding child routes to the configuration and adding a `<router-outlet>` to the component, navigation between URLs that match the child routes updates only the nested outlet.

## Next steps

Learn how to [display the contents of your routes with Outlets](/guide/routing/show-routes-with-outlets).
