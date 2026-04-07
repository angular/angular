---
name: angular-ssr
description: Implement server-side rendering and hydration in Angular v20+ using @angular/ssr. Use for SSR setup, hydration strategies, prerendering static pages, and handling browser-only APIs. Triggers on SSR configuration, fixing hydration mismatches, prerendering routes, or making code SSR-compatible. Do not use for client-only SPAs that do not require server rendering or SEO.
license: MIT
metadata:
  author: Copyright 2026 Google LLC
  version: '1.0'
---

# Angular SSR


Implement server-side rendering, hydration, and prerendering in Angular v20+.

## Choosing a Rendering Strategy

Before adding SSR, consider whether your app needs it. Angular supports CSR (default), SSG (prerendering at build time), and SSR (per-request rendering). See `references/rendering-strategies.md` for the decision matrix comparing use cases, pros/cons, and hydration options.

## Setup

### Add SSR to Existing Project

```bash
ng add @angular/ssr
```

This adds:
- `@angular/ssr` package
- `server.ts` - Express server
- `src/main.server.ts` - Server bootstrap
- `src/app/app.config.server.ts` - Server providers
- Updates `angular.json` with SSR configuration

### Project Structure

```
src/
├── app/
│   ├── app.config.ts          # Browser config
│   ├── app.config.server.ts   # Server config
│   └── app.routes.ts
├── main.ts                     # Browser bootstrap
├── main.server.ts              # Server bootstrap
server.ts                       # Express server
```

## Configuration

### app.config.server.ts

```typescript
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRoutesConfig } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRoutesConfig(serverRoutes),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

### Server Routes Configuration

```typescript
// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender, // Static at build time
  },
  {
    path: 'products',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'products/:id',
    renderMode: RenderMode.Server, // Dynamic SSR
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client, // Client-only (SPA)
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
```

### Render Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `RenderMode.Prerender` | Static HTML at build time | Marketing pages, blogs |
| `RenderMode.Server` | Dynamic SSR per request | User-specific content |
| `RenderMode.Client` | Client-side only (SPA) | Authenticated dashboards |

## Server Routing

Configure server routing in `app.routes.server.ts`. Map each path to a `RenderMode`:
- `RenderMode.Server` — dynamic SSR per request (user-specific data, parameterized routes)
- `RenderMode.Prerender` — static HTML at build time (use `getPrerenderParams` for parameterized routes)
- `RenderMode.Client` — client-side only, no SSR (dashboards, authenticated pages)

Register with `provideServerRendering(withRoutes(serverRoutes))` in `app.config.server.ts`. Place specific routes before the catch-all `**`. SSR accessibility: ensure ARIA attributes in initial render; use `hydrate on interaction` for complex interactive components.

Refer to `references/server-routing.md` for parameterized routes, catch-all patterns, headers/status codes, redirect behavior, and request/response access.

## Hydration

### Default Hydration

Hydration is enabled by default with `provideClientHydration()`:

```typescript
// app.config.ts
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    // ...
  ],
};
```

### Incremental Hydration

Defer hydration of specific components:

```typescript
@Component({
  template: `
    <!-- Hydrate when visible -->
    @defer (hydrate on viewport) {
      <app-comments [postId]="postId" />
    } @placeholder {
      <div class="comments-placeholder">Loading comments...</div>
    }
    
    <!-- Hydrate on interaction -->
    @defer (hydrate on interaction) {
      <app-interactive-chart [data]="chartData" />
    }
    
    <!-- Hydrate on idle -->
    @defer (hydrate on idle) {
      <app-recommendations />
    }
    
    <!-- Never hydrate (static only) -->
    @defer (hydrate never) {
      <app-static-footer />
    }
  `,
})
export class Post {
  postId = input.required<string>();
  chartData = input.required<ChartData>();
}
```

### Hydration Triggers

| Trigger | Description |
|---------|-------------|
| `hydrate on viewport` | When element enters viewport |
| `hydrate on interaction` | On click, focus, or input |
| `hydrate on idle` | When browser is idle |
| `hydrate on immediate` | Immediately after load |
| `hydrate on timer(ms)` | After specified delay |
| `hydrate when condition` | When expression is true |
| `hydrate never` | Never hydrate (static) |

### Event Replay

Capture user events before hydration completes:

```typescript
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
  ],
};
```

## Browser-Only Code

### Platform Detection

```typescript
import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({...})
export class MyComponent {
  // Use inject() for platform detection
  #platformId = inject(PLATFORM_ID);
  #isBrowser = isPlatformBrowser(this.#platformId);

  constructor() {
    if (this.#isBrowser) {
      // Browser-only initialization
      window.addEventListener('scroll', this.#onScroll);
    }
  }

  #onScroll = () => {
    // Handle scroll
  };
}
```

### afterNextRender / afterRender

Run code only in browser after rendering:

```typescript
import { afterNextRender, afterRender } from '@angular/core';

@Component({...})
export class Chart {
  constructor() {
    // Runs once after first render (browser only)
    afterNextRender(() => {
      this.initChart();
    });
    
    // Runs after every render (browser only)
    afterRender(() => {
      this.updateChart();
    });
  }
  
  #initChart() {
    // Safe to use DOM APIs here
    const canvas = document.getElementById('chart');
    new Chart(canvas, this.config);
  }
}
```

### Inject Browser APIs Safely

```typescript
// tokens.ts
import { InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const WINDOW = new InjectionToken<Window | null>('Window', {
  providedIn: 'root',
  factory: () => {
    const platformId = inject(PLATFORM_ID);
    return isPlatformBrowser(platformId) ? window : null;
  },
});

export const LOCAL_STORAGE = new InjectionToken<Storage | null>('LocalStorage', {
  providedIn: 'root',
  factory: () => {
    const platformId = inject(PLATFORM_ID);
    return isPlatformBrowser(platformId) ? localStorage : null;
  },
});

// Usage
@Injectable({ providedIn: 'root' })
export class Storage {
  #storage = inject(LOCAL_STORAGE);

  get(key: string): string | null {
    return this.#storage?.getItem(key) ?? null;
  }

  set(key: string, value: string): void {
    this.#storage?.setItem(key, value);
  }
}
```

## Prerendering

Use `RenderMode.Prerender` for static pages. For dynamic routes, implement `getPrerenderParams()` to return all parameter combinations at build time. Configure `fallback` (`PrerenderFallback.Server`, `.Client`, or `.None`) for routes not prerendered.

Refer to `references/prerendering.md` for static route config, dynamic getPrerenderParams examples, and fallback options.

## HTTP Caching

Use `withHttpTransferCacheOptions()` in `provideClientHydration()` to automatically transfer HTTP responses from server to client. For manual control, use `TransferState` with `makeStateKey<T>()` — store on server with `isPlatformServer()`, retrieve and remove on client.

Refer to `references/caching-strategies.md` for HTTP cache headers, CDN Vary, and stale-while-revalidate strategies.

## Build and Deploy

Build with `ng build` (outputs `dist/my-app/browser/` and `dist/my-app/server/`). Run dev server with `npm run serve:ssr:my-app`. Run production with `node dist/my-app/server/server.mjs`.

Refer to `references/build-deploy.md` for the complete Express server setup and deployment configuration.

## Advanced Patterns

- Refer to `references/hydration-debugging.md` for common mismatches, `ngSkipHydration`, and debug mode
- Refer to `references/seo-optimization.md` for meta tags, Open Graph, JSON-LD, and route resolvers
- Refer to `references/authentication-ssr.md` for cookie-based auth and skipping SSR for auth routes
- Refer to `references/caching-strategies.md` for HTTP cache headers, CDN Vary, and stale-while-revalidate
- Refer to `references/error-handling.md` for SSR error boundaries and graceful degradation
- Refer to `references/performance-optimization.md` for lazy hydration, preloading, and streaming SSR
- Refer to `references/testing-ssr.md` for server rendering tests and hydration tests
