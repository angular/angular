# Customizing route behavior

Angular Router provides powerful extension points that allow you to customize how routes behave in your application. While the default routing behavior works well for most applications, specific requirements often demand custom implementations for performance optimization, specialized URL handling, or complex routing logic.

Route customization can become valuable when your application needs:

- **Component state preservation** across navigations to avoid re-fetching data
- **Strategic lazy module loading** based on user behavior or network conditions
- **External URL integration** or handling Angular routes alongside legacy systems
- **Dynamic route matching** based on runtime conditions beyond simple path
  patterns

NOTE: Before implementing custom strategies, ensure the default router behavior doesn't meet your needs. Angular's default routing is optimized for common use cases and provides the best balance of performance and simplicity. Customizing route strategies can create additional code complexity and have performance implications on memory usage if not carefully managed.

Angular Router exposes four main areas for customization:

  <docs-pill-row>
    <docs-pill href="#route-reuse-strategy" title="Route reuse strategy"/>
    <docs-pill href="#preloading-strategy" title="Preloading strategy"/>
    <docs-pill href="#url-handling-strategy" title="URL handling strategy"/>
    <docs-pill href="#custom-route-matchers" title="Custom route matchers"/>
  </docs-pill-row>

## Route reuse strategy

Route reuse strategy controls whether Angular destroys and recreates components during navigation or preserves them for reuse. By default, Angular destroys component instances when navigating away from a route and creates new instances when navigating back.

### When to implement route reuse

Custom route reuse strategies benefit applications that need:

- **Form state preservation** - Keep partially completed forms when users navigate away and return
- **Expensive data retention** - Avoid re-fetching large datasets or complex calculations
- **Scroll position maintenance** - Preserve scroll positions in long lists or infinite scroll implementations
- **Tab-like interfaces** - Maintain component state when switching between tabs

### Creating a custom route reuse strategy

Angular's `RouteReuseStrategy` class allows you to customize navigation behavior through the concept of "detached route handles."

"Detached route handles" are Angular's way of storing component instances and their entire view hierarchy. When a route is detached, Angular preserves the component instance, its child components, and all associated state in memory. This preserved state can later be reattached when navigating back to the route.

The `RouteReuseStrategy` class provides five methods that control the lifecycle of route components:

| Method                                                               | Description                                                                                                 |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [`shouldDetach`](api/router/RouteReuseStrategy#shouldDetach)         | Determines if a route should be stored for later reuse when navigating away                                 |
| [`store`](api/router/RouteReuseStrategy#store)                       | Stores the detached route handle when `shouldDetach` returns true                                           |
| [`shouldAttach`](api/router/RouteReuseStrategy#shouldAttach)         | Determines if a stored route should be reattached when navigating to it                                     |
| [`retrieve`](api/router/RouteReuseStrategy#retrieve)                 | Returns the previously stored route handle for reattachment                                                 |
| [`shouldReuseRoute`](api/router/RouteReuseStrategy#shouldReuseRoute) | Determines if the router should reuse the current route instance instead of destroying it during navigation |

The following example demonstrates a custom route reuse strategy that selectively preserves component state based on route metadata:

```ts
import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers = new Map<string, DetachedRouteHandle>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Determines if a route should be stored for later reuse
    return route.data['reuse'] === true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    // Stores the detached route handle when shouldDetach returns true
    if (handle && route.data['reuse'] === true) {
      const key = this.getRouteKey(route);
      this.handlers.set(key, handle);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // Checks if a stored route should be reattached
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true && this.handlers.has(key);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    // Returns the stored route handle for reattachment
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true ? this.handlers.get(key) ?? null : null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Determines if the router should reuse the current route instance
    return future.routeConfig === curr.routeConfig;
  }

  private getRouteKey(route: ActivatedRouteSnapshot): string {
    return route.routeConfig ?? '';
  }
}
```

### Configuring a route to use a custom route reuse strategy

Routes can opt into reuse behavior through route configuration metadata. This approach keeps the reuse logic separate from component code, making it easy to adjust behavior without modifying components:

```ts
export const routes: Routes = [
  {
    path: 'products',
    component: ProductListComponent,
    data: { reuse: true }  // Component state persists across navigations
  },
  {
    path: 'products/:id',
    component: ProductDetailComponent,
    // No reuse flag - component recreates on each navigation
  },
  {
    path: 'search',
    component: SearchComponent,
    data: { reuse: true }  // Preserves search results and filter state
  }
];
```

You can also configure a custom route reuse strategy at the application level through Angular's dependency injection system. In this case, Angular creates a single instance of the strategy that manages all route reuse decisions throughout the application:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }
  ]
};
```

## Preloading strategy

Preloading strategies determine when Angular loads lazy-loaded route modules in the background. While lazy loading improves initial load time by deferring module downloads, users still experience a delay when first navigating to a lazy route. Preloading strategies eliminate this delay by loading modules before users request them.

### Built-in preloading strategies

Angular provides two preloading strategies out of the box:

| Strategy                                            | Description                                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [`NoPreloading`](api/router/NoPreloading)           | The default strategy that disables all preloading. In other words, modules only load when users navigate to them |
| [`PreloadAllModules`](api/router/PreloadAllModules) | Loads all lazy-loaded modules immediately after the initial navigation                                           |

The `PreloadAllModules` strategy can be configured as follows:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    )
  ]
};
```

The `PreloadAllModules` strategy works well for small to medium applications where downloading all modules doesn't significantly impact performance. However, larger applications with many feature modules might benefit from more selective preloading.

### Creating a custom preloading strategy

Custom preloading strategies implement the `PreloadingStrategy` interface, which requires a single `preload` method. This method receives the route configuration and a function that triggers the actual module load. The strategy returns an Observable that emits when preloading completes or an empty Observable to skip preloading:

```ts
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Only preload routes marked with data: { preload: true }
    if (route.data?.['preload']) {
      return load();
    }
    return of(null);
  }
}
```

This selective strategy checks route metadata to determine preloading behavior. Routes can opt into preloading through their configuration:

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes'),
    data: { preload: true }  // Preload immediately after initial navigation
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes'),
    data: { preload: false } // Only load when user navigates to reports
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes')
    // No preload flag - won't be preloaded
  }
];
```

### Performance considerations for preloading

Preloading impacts both network usage and memory consumption. Each preloaded module consumes bandwidth and increases the application's memory footprint. Mobile users on metered connections might prefer minimal preloading, while desktop users on fast networks can handle aggressive preloading strategies.

The timing of preloading also matters. Immediate preloading after initial load might compete with other critical resources like images or API calls. Strategies should consider the application's post-load behavior and coordinate with other background tasks to avoid performance degradation.

Browser resource limits also affect preloading behavior. Browsers limit concurrent HTTP connections, so aggressive preloading might queue behind other requests. Service workers can help by providing fine-grained control over caching and network requests, complementing the preloading strategy.

## URL handling strategy

URL handling strategies determine which URLs the Angular router processes versus which ones it ignores. By default, Angular attempts to handle all navigation events within the application, but real-world applications often need to coexist with other systems, handle external links, or integrate with legacy applications that manage their own routes.

The `UrlHandlingStrategy` class gives you control over this boundary between Angular-managed routes and external URLs. This becomes essential when migrating applications to Angular incrementally or when Angular applications need to share URL space with other frameworks.

### Implementing a custom URL handling strategy

Custom URL handling strategies extend the `UrlHandlingStrategy` class and implement three methods. The `shouldProcessUrl` method determines whether Angular should handle a given URL, `extract` returns the portion of the URL that Angular should process, and `merge` combines the URL fragment with the rest of the URL:

```ts
import { Injectable } from '@angular/core';
import { UrlHandlingStrategy, UrlTree } from '@angular/router';

@Injectable()
export class CustomUrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    // Only handle URLs that start with /app or /admin
    return url.toString().startsWith('/app') ||
           url.toString().startsWith('/admin');
  }

  extract(url: UrlTree): UrlTree {
    // Return the URL unchanged if we should process it
    return url;
  }

  merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree {
    // Combine the URL fragment with the rest of the URL
    return newUrlPart;
  }
}
```

This strategy creates clear boundaries in the URL space. Angular handles `/app` and `/admin` paths while ignoring everything else. This pattern works well when migrating legacy applications where Angular controls specific sections while the legacy system maintains others.

### Configuring a custom URL handling strategy

You can register a custom strategy through Angular's dependency injection system:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { UrlHandlingStrategy } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: UrlHandlingStrategy, useClass: CustomUrlHandlingStrategy }
  ]
};
```

## Custom route matchers

By default, Angular's router iterates through routes in the order they're defined, attempting to match the URL path against each route's path pattern. It supports static segments, parameterized segments (`:id`), and wildcards (`**`). The first route that matches wins, and the router stops searching.

When applications require more sophisticated matching logic based on runtime conditions, complex URL patterns, or other custom rules, custom matchers provide this flexibility without compromising the simplicity of standard routes.

The router evaluates custom matchers during the route matching phase, before path matching occurs. When a matcher returns a successful match, it can also extract parameters from the URL, making them available to the activated component just like standard route parameters.

### Creating a custom matcher

A custom matcher is a function that receives URL segments and returns either a match result with consumed segments and parameters, or null to indicate no match. The matcher function runs before Angular evaluates the route's path property:

```ts
import { Route, UrlSegment, UrlSegmentGroup, UrlMatchResult } from '@angular/router';

export function customMatcher(
  segments: UrlSegment[],
  group: UrlSegmentGroup,
  route: Route
): UrlMatchResult | null {
  // Matching logic here
  if (matchSuccessful) {
    return {
      consumed: segments,
      posParams: {
        paramName: new UrlSegment('paramValue', {})
      }
    };
  }
  return null;
}
```

### Implementing version-based routing

Consider an API documentation site that needs to route based on version numbers in the URL. Different versions might have different component structures or feature sets:

```ts
import { Routes, UrlSegment, UrlMatchResult } from '@angular/router';

export function versionMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  // Match patterns like /v1/docs, /v2.1/docs, /v3.0.1/docs
  if (segments.length >= 2 && segments[0].path.match(/^v\d+(\.\d+)*$/)) {
    return {
      consumed: segments.slice(0, 2),  // Consume version and 'docs'
      posParams: {
        version: segments[0],  // Make version available as a parameter
        section: segments[1]   // Make section available too
      }
    };
  }
  return null;
}

// Route configuration
export const routes: Routes = [
  {
    matcher: versionMatcher,
    component: DocumentationComponent
  },
  {
    path: 'latest/docs',
    redirectTo: 'v3/docs'
  }
];
```

The component receives the extracted parameters through route inputs:

```ts
import { Component, input, inject } from '@angular/core';
import { resource } from '@angular/core';

@Component({
  selector: 'app-documentation',
  template: `
    @if (documentation.isLoading()) {
      <div>Loading documentation...</div>
    } @else if (documentation.error()) {
      <div>Error loading documentation</div>
    } @else if (documentation.value(); as docs) {
      <article>{{ docs.content }}</article>
    }
  `
})
export class DocumentationComponent {
  // Route parameters are automatically bound to signal inputs
  version = input.required<string>();  // Receives the version parameter
  section = input.required<string>();  // Receives the section parameter

  private docsService = inject(DocumentationService);

  // Resource automatically loads documentation when version or section changes
  documentation = resource({
    params: () => {
      if (!this.version() || !this.section()) return;

      return {
        version: this.version(),
        section: this.section()
      }
    },
    loader: ({ params }) => {
      return this.docsService.loadDocumentation(params.version, params.section);
    }
  })
}
```

### Locale-aware routing

International applications often encode locale information in URLs. A custom matcher can extract locale codes and route to appropriate components while making the locale available as a parameter:

```ts
// Supported locales
const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh'];

export function localeMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length > 0) {
    const potentialLocale = segments[0].path;

    if (locales.includes(potentialLocale)) {
      // This is a locale prefix, consume it and continue matching
      return {
        consumed: [segments[0]],
        posParams: {
          locale: segments[0]
        }
      };
    } else {
      // No locale prefix, use default locale
      return {
        consumed: [],  // Don't consume any segments
        posParams: {
          locale: new UrlSegment('en', {})
        }
      };
    }
  }

  return null;
}
```

### Complex business logic matching

Custom matchers excel at implementing business rules that would be awkward to express in path patterns. Consider an e-commerce site where product URLs follow different patterns based on product type:

```ts
export function productMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length === 0) return null;

  const firstSegment = segments[0].path;

  // Books: /isbn-1234567890
  if (firstSegment.startsWith('isbn-')) {
    return {
      consumed: [segments[0]],
      posParams: {
        productType: new UrlSegment('book', {}),
        identifier: new UrlSegment(firstSegment.substring(5), {})
      }
    };
  }

  // Electronics: /sku/ABC123
  if (firstSegment === 'sku' && segments.length > 1) {
    return {
      consumed: segments.slice(0, 2),
      posParams: {
        productType: new UrlSegment('electronics', {}),
        identifier: segments[1]
      }
    };
  }

  // Clothing: /style/BRAND/ITEM
  if (firstSegment === 'style' && segments.length > 2) {
    return {
      consumed: segments.slice(0, 3),
      posParams: {
        productType: new UrlSegment('clothing', {}),
        brand: segments[1],
        identifier: segments[2]
      }
    };
  }

  return null;
}
```

### Performance considerations for custom matchers

Custom matchers run for every navigation attempt until a match is found. As a result, complex matching logic can impact navigation performance, especially in applications with many routes. Keep matchers focused and efficient:

- Return early when a match is impossible
- Avoid expensive operations like API calls or complex regular expressions
- Consider caching results for repeated URL patterns

While custom matchers solve complex routing requirements elegantly, overuse can make route configuration harder to understand and maintain. Reserve custom matchers for scenarios where standard path matching genuinely falls short.
