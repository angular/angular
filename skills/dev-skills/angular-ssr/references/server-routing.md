# SSR Server Routing

Server routing controls how each route is rendered. Configure in `app.routes.server.ts`.

## Choosing the Right Render Mode

| Mode | When to use | Example routes |
|------|-------------|----------------|
| `RenderMode.Server` | Dynamic, user/request-specific data | `product/:id`, `profile`, `search` |
| `RenderMode.Prerender` | Content known at build time | `about`, `blog/:slug` (with `getPrerenderParams`) |
| `RenderMode.Client` | Fully client-side, no SEO needed | `dashboard`, `settings` |

## Parameterized Routes with SSR

Use `RenderMode.Server` for routes with dynamic parameters that depend on request-time data:

```typescript
// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'product/:id',        // Each product rendered on the server per request
    renderMode: RenderMode.Server,
  },
  {
    path: 'category/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'user/:userId/orders',
    renderMode: RenderMode.Server,
  },
];
```

## Parameterized Routes with Pre-rendering

Use `RenderMode.Prerender` with `getPrerenderParams` when all parameter values are known at build time:

```typescript
// app.routes.server.ts
import { RenderMode, ServerRoute, PrerenderFallback } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'product/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const productService = inject(ProductService);
      const ids = await productService.getAllIds(); // e.g. ['1', '2', '3']
      return ids.map((id) => ({ id }));
      // Generates: /product/1, /product/2, /product/3
    },
    fallback: PrerenderFallback.Server, // SSR fallback for unknown IDs
  },
];
```

> **IMPORTANT:** `inject()` inside `getPrerenderParams` must be called synchronously — it cannot be used after any `await` statement.

## Catch-All Routes with Parameters

Use `**` for catch-all segments. The parameter name is `'**'` and the value is the full remaining path:

```typescript
{
  path: 'docs/:version/**',
  renderMode: RenderMode.Prerender,
  async getPrerenderParams() {
    return [
      { version: 'v20', '**': 'getting-started/setup' },
      { version: 'v20', '**': 'api/core' },
      { version: 'v19', '**': 'migration-guide' },
    ];
    // Generates: /docs/v20/getting-started/setup, /docs/v20/api/core, /docs/v19/migration-guide
  },
},
```

## Setting Headers and Status Codes

Set custom HTTP headers and status codes per route:

```typescript
export const serverRoutes: ServerRoute[] = [
  {
    path: 'product/:id',
    renderMode: RenderMode.Server,
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'index, follow',
    },
    status: 200,
  },
  {
    path: 'legacy-page',
    renderMode: RenderMode.Server,
    status: 301,
    headers: {
      'Location': '/new-page',
    },
  },
];
```

## Redirect Behavior

Angular handles `redirectTo` differently depending on render mode:

- **SSR (`RenderMode.Server`)** — redirects use standard HTTP redirects (301/302)
- **Prerender (`RenderMode.Prerender`)** — redirects use `<meta http-equiv="refresh">` tags in prerendered HTML

## Accessing Request and Response in SSR Routes

Use DI tokens from `@angular/core` to access the incoming request during server rendering:

```typescript
import { inject, REQUEST, RESPONSE_INIT } from '@angular/core';

@Component({...})
export class ProductDetail {
  #request = inject(REQUEST, { optional: true });

  constructor() {
    // Access request URL, headers, cookies during SSR
    if (this.#request) {
      const userAgent = this.#request.headers.get('user-agent');
      console.log('Request URL:', this.#request.url);
    }
  }
}
```

> **Note:** `REQUEST`, `RESPONSE_INIT`, and `REQUEST_CONTEXT` are `null` during CSR, SSG, and build processes.

## Route Order

Routes are matched top-to-bottom. Always place specific routes before the catch-all `**`:

```typescript
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },           // Homepage
  { path: 'about', renderMode: RenderMode.Prerender },      // Static pages
  { path: 'product/:id', renderMode: RenderMode.Server },   // Dynamic SSR
  { path: 'dashboard', renderMode: RenderMode.Client },     // Client-only
  { path: '**', renderMode: RenderMode.Server },            // Catch-all (last)
];
```

## Wiring Up in app.config.server.ts

Register server routes using `provideServerRendering` with `withRoutes`:

```typescript
// app.config.server.ts
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```
