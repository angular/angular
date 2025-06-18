# Redirecting Routes

Route redirects allow you to automatically navigate users from one route to another. Think of it like mail forwarding, where mail intended for one address is sent to a different address. This is useful for handling legacy URLs, implementing default routes, or managing access control.

## How to configure redirects

You can define redirects in your route configuration with the `redirectTo` property. This property accepts a string.

```ts
import { Routes } from '@angular/router';

const routes: Routes = [
  // Simple redirect
  { path: 'marketing', redirectTo: 'newsletter' },

  // Redirect with path parameters
  { path: 'legacy-user/:id', redirectTo: 'users/:id' },

  // Redirect any other URLs that don’t match
  // (also known as a "wildcard" redirect)
  { path: '**', redirectTo: '/login' }
];
```

In this example, there are three redirects:

1. When a user visits the `/marketing` path, they are redirected to `/newsletter`.
2. When a user visits any `/legacy-user/:id` path, they are routed to the corresponding `/users/:id` path.
3. When a user visit any path that’s not defined in the router, they are redirected to the login page because of the `**` wildcard path definition.

## Understanding `pathMatch`

The `pathMatch` property on routes enables developers to control how Angular matches a URL to routes.

There are two values that `pathMatch` accepts:

| Value      | Description                                  |
| ---------- | -------------------------------------------- |
| `'full'`   | The entire URL path must match exactly       |
| `'prefix'` | Only the beginning of the URL needs to match |

By default, all redirects use the `prefix` strategy.

### `pathMatch: 'prefix'`

`pathMatch: 'prefix'` is the default strategy and ideal when you want Angular Router to match all subsequent routes when triggering a redirect.

```ts
export const routes: Routes = [
  // This redirect route is equivalent to…
  { path: 'news', redirectTo: 'blog },

  // This explicitly defined route redirect pathMatch
  { path: 'news', redirectTo: 'blog', pathMatch: 'prefix' },
];
```

In this example, all routes that are prefixed with `news` are redirected to their `/blog` equivalents. Here are some examples where users are redirected when visiting the old `news` prefix:

- `/news` redirects to `/blog`
- `/news/article` redirects to `/blog/article`
- `/news/article/:id` redirects to `/blog/article/:id`

### `pathMatch: 'full'`

On the other hand, `pathMatch: 'full'` is useful when you want Angular Router to only redirect a specific path.

```ts
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
```

In this example, any time the user visits the root URL (i.e., `''`), the router redirects that user to the `'/dashboard'` page.

Any subsequent pages (e.g., `/login`, `/about`, `/product/id`, etc.), are ignored and do not trigger a redirect.

TIP: Be careful when configuring a redirect on the root page (i.e., `"/"` or `""`). If you do not set `pathMatch: 'full'`, the router will redirect all URLs.

To further illustrate this, if the `news` example from the previous section used `pathMatch: 'full'` instead:

```ts
export const routes: Routes = [
  { path: 'news', redirectTo: '/blog', pathMatch: 'full' },
];
```

This means that:

1. Only the `/news` path will be redirected to `/blog`.
2. Any subsequent segments such as `/news/articles` or `/news/articles/1` would not redirect with the new `/blog` prefix.

## Conditional redirects

The `redirectTo` property can also accept a function in order to add logic to how users are redirected.

The [function](api/router/RedirectFunction) only has access part of the [`ActivatedRouteSnapshot`](api/router/ActivatedRouteSnapshot) data since some data is not accurately known at the route matching phase. Examples include: resolved titles, lazy loaded components, etc.

It typically returns a string or [`URLTree`](api/router/UrlTree), but it can also return an observable or promise.

Here is an example where the user is redirected to different menu based on the time of the day:

```ts
import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';

export const routes: Routes = [
  {
    path: 'restaurant/:location/menu',
    redirectTo: (activatedRouteSnapshot) => {
      const location = activatedRouteSnapshot.params['location'];
      const currentHour = new Date().getHours();

      // Check if user requested a specific meal via query parameter
      if (activatedRouteSnapshot.queryParams['meal']) {
        return `/restaurant/${location}/menu/${queryParams['meal']}`;
      }

      // Auto-redirect based on time of day
      if (currentHour >= 5 && currentHour < 11) {
        return `/restaurant/${location}/menu/breakfast`;
      } else if (currentHour >= 11 && currentHour < 17) {
        return `/restaurant/${location}/menu/lunch`;
      } else {
        return `/restaurant/${location}/menu/dinner`;
      }
    }
  },

  // Destination routes
  { path: 'restaurant/:location/menu/breakfast', component: MenuComponent },
  { path: 'restaurant/:location/menu/lunch', component: MenuComponent },
  { path: 'restaurant/:location/menu/dinner', component: MenuComponent },

  // Default redirect
  { path: '', redirectTo: '/restaurant/downtown/menu', pathMatch: 'full' }
];
```

To learn more, check out [the API docs for the RedirectFunction](api/router/RedirectFunction).

## Next steps

For more information about the `redirectTo` property, check out the [API docs](api/router/Route#redirectTo).
