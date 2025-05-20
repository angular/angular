# Read route state

Angular Router allows you to read and use information associated with a route to create responsive and context-aware components.

## Get information about the current route with ActivatedRoute

`ActivatedRoute` is a service from `@angular/router` that provides all the information associated with the current route.

```angular-ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
})
export class ProductComponent {
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    console.log(this.activatedRoute);
  }
}
```

The `ActivatedRoute` can provide different information about the route. Some common properties include:

| Property      | Details                                                                                                                           |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| `url`         | An `Observable` of the route paths, represented as an array of strings for each part of the route path.                           |
| `data`        | An `Observable` that contains the `data` object provided for the route. Also contains any resolved values from the resolve guard. |
| `params`      | An `Observable` that contains the required and optional parameters specific to the route.                                         |
| `queryParams` | An `Observable` that contains the query parameters available to all routes.                                                       |

Check out the [`ActivatedRoute` API docs](/api/router/ActivatedRoute) for a complete list of what you can access with in the route.

## Understanding route snapshots

Page navigations are events over time, and you can access the router state at a given time by retrieving a route snapshot.

Route snapshots contain essential information about the route, including its parameters, data, and child routes. In addition, snapshots are static and will not reflect future changes.

Here’s an example of how you’d access a route snapshot:

```angular-ts
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

@Component({ ... })
export class UserProfileComponent {
  readonly userId: string;
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    // Example URL: https://www.angular.dev/users/123?role=admin&status=active#contact

    // Access route parameters from snapshot
    this.userId = this.route.snapshot.paramMap.get('id');

    // Access multiple route elements
    const snapshot = this.route.snapshot;
    console.log({
      url: snapshot.url,           // https://www.angular.dev
      // Route parameters object: {id: '123'}
      params: snapshot.params,
      // Query parameters object: {role: 'admin', status: 'active'}
      queryParams: snapshot.queryParams,  // Query parameters
    });
  }
}
```

Check out the [`ActivatedRoute` API docs](/api/router/ActivatedRoute) and [`ActivatedRouteSnapshot` API docs](/api/router/ActivatedRouteSnapshot) for a complete list of all properties you can access.

## Reading parameters on a route

There are two types of parameters that developers can utilize from a route: route and query parameters.

### Route Parameters

Route parameters allow you to pass data to a component through the URL. This is useful when you want to display specific content based on an identifier in the URL, like a user ID or a product ID.

You can [define route parameters](/guide/routing/define-routes#define-url-paths-with-route-parameters) by prefixing the parameter name with a colon (`:`).

```angular-ts
import { Routes } from '@angular/router';
import { ProductComponent } from './product/product.component';

const routes: Routes = [
  { path: 'product/:id', component: ProductComponent }
];
```

You can access parameters by subscribing to `route.params`.

```angular-ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  template: `<h1>Product Details: {{ productId() }}</h1>`,
})
export class ProductDetailComponent {
  productId = signal('');
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    // Access route parameters
    this.activatedRoute.params.subscribe((params) => {
      this.productId.set(params['id']);
    });
  }
}
```

### Query Parameters

[Query parameters](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) provide a flexible way to pass optional data through URLs without affecting the route structure. Unlike route parameters, query parameters can persist across navigation events and are perfect for handling filtering, sorting, pagination, and other stateful UI elements.

```angular-ts
// Single parameter structure
// /products?category=electronics
router.navigate(['/products'], {
  queryParams: { category: 'electronics' }
});

// Multiple parameters
// /products?category=electronics&sort=price&page=1
router.navigate(['/products'], {
  queryParams: {
    category: 'electronics',
    sort: 'price',
    page: 1
  }
});
```

You can access query parameters with `route.queryParams`.

Here is an example of a `ProductListComponent` that updates the query parameters that affect how it displays a list of products:

```angular-ts
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  template: `
    <div>
      <select (change)="updateSort($event)">
        <option value="price">Price</option>
        <option value="name">Name</option>
      </select>
      <!-- Products list -->
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    // Access query parameters reactively
    this.route.queryParams.subscribe(params => {
      const sort = params['sort'] || 'price';
      const page = Number(params['page']) || 1;
      this.loadProducts(sort, page);
    });
  }

  updateSort(event: Event) {
    const sort = (event.target as HTMLSelectElement).value;
    // Update URL with new query parameter
    this.router.navigate([], {
      queryParams: { sort },
      queryParamsHandling: 'merge' // Preserve other query parameters
    });
  }
}
```

In this example, users can use a select element to sort the product list by name or price. The associated change handler updates the URL’s query parameters, which in turn triggers a change event that can read the updated query parameters and update the product list.

For more information, check out the [official docs on QueryParamsHandling](/api/router/QueryParamsHandling).

## Detect active current route with RouterLinkActive

You can use the `RouterLinkActive` directive to dynamically style navigation elements based on the current active route. This is common in navigation elements to inform users what the active route is.

```angular-html
<nav>
  <a class="button"
     routerLink="/about"
     routerLinkActive="active-button"
     ariaCurrentWhenActive="page">
    About
  </a> |
  <a class="button"
     routerLink="/settings"
     routerLinkActive="active-button"
     ariaCurrentWhenActive="page">
    Settings
  </a>
</nav>
```

In this example, Angular Router will apply the `active-button` class to the correct anchor link and `ariaCurrentWhenActive` to `page` when the URL matches the corresponding `routerLink`.

If you need to add multiple classes onto the element, you can use either a space-separated string or an array:

```angular-html
<!-- Space-separated string syntax -->
<a routerLink="/user/bob" routerLinkActive="class1 class2">Bob</a>

<!-- Array syntax -->
<a routerLink="/user/bob" [routerLinkActive]="['class1', 'class2']">Bob</a>
```

When you specify a value for routerLinkActive, you are also defining the same value for `ariaCurrentWhenActive`. This makes sure that visually impaired users (which may not perceive the different styling being applied) can also identify the active button.

If you want to define a different value for aria, you’ll need to explicitly set the value using the `ariaCurrentWhenActive` directive.

### Route matching strategy

By default, `RouterLinkActive` considers any ancestors in the route a match.

```angular-html
<a [routerLink]="['/user/jane']" routerLinkActive="active-link">
  User
</a>
<a [routerLink]="['/user/jane/role/admin']" routerLinkActive="active-link">
  Role
</a>
```

When the user visits `/user/jane/role/admin`, both links would have the `active-link` class.

### Only apply RouterLinkActive on exact route matches

If you only want to apply the class on an exact match, you need to provide the `routerLinkActiveOptions` directive with a configuration object that contains the value `exact: true`.

```angular-html
<a [routerLink]="['/user/jane']"
  routerLinkActive="active-link"
  [routerLinkActiveOptions]="{exact: true}"
>
  User
</a>
<a [routerLink]="['/user/jane/role/admin']"
  routerLinkActive="active-link"
  [routerLinkActiveOptions]="{exact: true}"
>
  Role
</a>
```

If you want to be more precise in how a route is matched, it’s worth noting that `exact: true` is actually syntactic sugar for the full set of matching options:

```angular-ts
// `exact: true` is equivalent to
{
  paths: 'exact',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'exact',
}

// `exact: false` is equivalent
{
  paths: 'subset',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'subset',
}
```

For more information, check out the official docs for [isActiveMatchOptions](/api/router/IsActiveMatchOptions).

### Apply RouterLinkActive to an ancestor

The RouterLinkActive directive can also be applied to an ancestor element in order to allow developers to style the elements as desired.

```angular-html
<div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
  <a routerLink="/user/jim">Jim</a>
  <a routerLink="/user/bob">Bob</a>
</div>
```

For more information, check out the [API docs for RouterLinkActive](/api/router/RouterLinkActive).
