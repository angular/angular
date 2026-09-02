# Error boundaries in routing

When building web applications, runtime errors can occur during component initialization, data loading, or rendering. Angular Router allows you to isolate these failures to individual routes using **error boundaries**, preventing a single failing component from crashing the entire application shell.

---

## What are router error boundaries?

Router error boundaries provide declarative error handling at the route outlet level. When a component within a route throws an error—such as a failed network resource, an unexpected null reference in a template, or an error during dependency injection—Angular Router catches the error and displays a dedicated fallback component (`errorComponent`) in place of the failing view.

Sibling outlets, parent layout components, and global navigation headers remain fully interactive and intact.

---

## Configure an error component

To display a custom fallback UI when a route fails, add the `errorComponent` property to your route definition:

```ts {header:"app.routes.ts"}
import {Routes} from '@angular/router';
import {ProductDetails} from './product-details';
import {ProductErrorFallback} from './product-error-fallback';

export const routes: Routes = [
  {
    path: 'products/:id',
    component: ProductDetails,
    errorComponent: ProductErrorFallback,
  },
];
```

When you navigate to `/products/123`, if `ProductDetails` throws an error during creation or rendering, Angular Router instantiates `ProductErrorFallback` inside the `<router-outlet>` instead.

---

## Create an error fallback component

An error fallback component is a standard Angular component that can receive error details and request a retry.

### Access error details with an input

You can accept the caught error object by declaring an `error` input:

```angular-ts {header:"product-error-fallback.ts"}
import {Component, input} from '@angular/core';

@Component({
  selector: 'app-product-error-fallback',
  template: `
    <div class="error-card">
      <h3>Failed to load product</h3>
      <p>{{ error()?.message }}</p>
    </div>
  `,
})
export class ProductErrorFallback {
  readonly error = input<Error>();
}
```

NOTE: If your route configuration includes parameters, query parameters, or route data named `error`, the caught runtime `Error` always takes precedence on the `error` input of an error component.

---

## Retry route activation

Transient issues (such as temporary network outages or server timeouts) can often be resolved by retrying the view.

To allow users to retry, inject the `RouterOutlet` and call its `retry()` method:

```angular-ts {header:"product-error-fallback.ts"}
import {Component, inject, input} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-product-error-fallback',
  template: `
    <div class="error-card">
      <h3>Failed to load product</h3>
      <p>{{ error()?.message }}</p>
      @if (outlet?.retry) {
        <button (click)="outlet?.retry?.()">Try again</button>
      }
    </div>
  `,
})
export class ProductErrorFallback {
  readonly error = input<Error>();
  protected outlet = inject(RouterOutlet, {optional: true});
}
```

When you call `outlet.retry()`, Angular Router tears down the error component and re-attempts the full activation of the route component, re-running dependency injection, component lifecycle hooks, and route resources.

TIP: Injecting `RouterOutlet` with `{ optional: true }` ensures that your error component can also be rendered safely in isolated unit tests or outside of a router outlet.

---

## Route parameter and data binding

When using `withComponentInputBinding()`, Angular Router binds route parameters and static data to inputs on the `errorComponent` as well. This allows you to display contextual information in your error UI:

```angular-ts {header:"product-error-fallback.ts"}
import {Component, inject, input} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-product-error-fallback',
  template: `
    <div class="error-card">
      <h3>Failed to load product #{{ id() }}</h3>
      <p>{{ error()?.message }}</p>
      <button (click)="outlet?.retry?.()">Retry</button>
    </div>
  `,
})
export class ProductErrorFallback {
  readonly id = input<string>();
  readonly error = input<Error>();
  protected outlet = inject(RouterOutlet, {optional: true});
}
```

---

## Global error boundary configuration

You can enable router error boundaries globally across your application using the `withErrorBoundaries` feature in `provideRouter`:

```ts {header:"app.config.ts"}
import {ApplicationConfig, inject} from '@angular/core';
import {provideRouter, withComponentInputBinding, withErrorBoundaries} from '@angular/router';
import {routes} from './app.routes';
import {GlobalErrorFallback} from './global-error-fallback';
import {AnalyticsService} from './analytics.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withErrorBoundaries({
        // Default fallback component for routes that do not define their own errorComponent
        defaultErrorComponent: GlobalErrorFallback,

        // Global telemetry hook invoked whenever a route error is caught
        onError: (error, details) => {
          inject(AnalyticsService).logException(error, details);
        },
      }),
    ),
  ],
};
```

### Options

| Option | Type | Description |
|---|---|---|
| `defaultErrorComponent` | `Type<any>` | Default fallback component to render when a route without its own `errorComponent` throws an error. |
| `onError` | `(error: Error, details?: ErrorDetails) => void` | Global callback invoked whenever any error is caught by a router error boundary. Ideal for sending telemetry to monitoring services. |

---

## Redirecting with RedirectCommand

When an authentication failure or data condition requires navigating to another page, components and route resources can throw a `RedirectCommand`:

```angular-ts {header:"user-profile.ts"}
import {Component, inject, resource} from '@angular/core';
import {Router, RedirectCommand} from '@angular/router';

@Component({
  selector: 'app-user-profile',
  template: `...`,
})
export class UserProfile {
  private router = inject(Router);

  userData = resource({
    loader: async () => {
      const response = await fetch('/api/user');
      if (response.status === 401) {
        // Automatically redirects to /login when unauthorized
        throw new RedirectCommand(this.router.parseUrl('/login'));
      }
      return response.json();
    },
  });
}
```

When a `RedirectCommand` is thrown:
1. `RouterOutlet` catches the command and initiates navigation to the specified redirect destination.
2. If nested outlets or template error boundaries exist, Angular deduplicates the command to ensure the navigation is only triggered once.
3. The error component (if configured) renders during the transition.

---

## Error boundary scope vs. Navigation errors

It is helpful to understand the distinction between **view-layer errors** and **navigation pipeline errors**:

- **View-layer errors (Error boundaries)**: Occur inside component constructors, dependency injection, lifecycle hooks (`ngOnInit`), template expressions, and component `resource()` loaders. These are caught by `RouterOutlet` and display the `errorComponent`.
- **Navigation pipeline errors (`NavigationError`)**: Occur before route activation, such as failing `canActivate` / `canMatch` guards or route `resolve` data functions. These halt the navigation transition before reaching the outlet and can be customized using `withNavigationErrorHandler`.

---

## Next steps

<docs-pill-row>
  <docs-pill href="/guide/routing/show-routes-with-outlets" title="Show routes with outlets"/>
  <docs-pill href="/guide/routing/redirecting-routes" title="Redirecting routes"/>
  <docs-pill href="/guide/routing/data-fetching-with-resources" title="Data fetching with resources"/>
</docs-pill-row>
