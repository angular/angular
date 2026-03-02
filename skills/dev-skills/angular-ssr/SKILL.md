---
name: angular-ssr
description: Implement server-side rendering and hydration in Angular v20+ using @angular/ssr. Use for SSR setup, hydration strategies, prerendering static pages, and handling browser-only APIs. Triggers on SSR configuration, fixing hydration mismatches, prerendering routes, or making code SSR-compatible.
license: MIT
compatibility: Requires node, npm, and access to the internet
metadata:
  author: Brandon Roberts
  version: '1.0'
---

# Angular SSR

Implement server-side rendering, hydration, and prerendering in Angular v20+.

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
import {ApplicationConfig, mergeApplicationConfig} from '@angular/core';
import {provideServerRendering} from '@angular/platform-server';
import {provideServerRoutesConfig} from '@angular/ssr';
import {appConfig} from './app.config';
import {serverRoutes} from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), provideServerRoutesConfig(serverRoutes)],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

### Server Routes Configuration

```typescript
// app.routes.server.ts
import {RenderMode, ServerRoute} from '@angular/ssr';

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

| Mode                   | Description               | Use Case                 |
| ---------------------- | ------------------------- | ------------------------ |
| `RenderMode.Prerender` | Static HTML at build time | Marketing pages, blogs   |
| `RenderMode.Server`    | Dynamic SSR per request   | User-specific content    |
| `RenderMode.Client`    | Client-side only (SPA)    | Authenticated dashboards |

## Hydration

### Default Hydration

Hydration is enabled by default with `provideClientHydration()`:

```typescript
// app.config.ts
import {provideClientHydration} from '@angular/platform-browser';

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

| Trigger                  | Description                  |
| ------------------------ | ---------------------------- |
| `hydrate on viewport`    | When element enters viewport |
| `hydrate on interaction` | On click, focus, or input    |
| `hydrate on idle`        | When browser is idle         |
| `hydrate on immediate`   | Immediately after load       |
| `hydrate on timer(ms)`   | After specified delay        |
| `hydrate when condition` | When expression is true      |
| `hydrate never`          | Never hydrate (static)       |

### Event Replay

Capture user events before hydration completes:

```typescript
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideClientHydration(withEventReplay())],
};
```

## Browser-Only Code

### Platform Detection

```typescript
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({...})
export class My {
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Browser-only code
      window.addEventListener('scroll', this.onScroll);
    }
  }
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

  private initChart() {
    // Safe to use DOM APIs here
    const canvas = document.getElementById('chart');
    new Chart(canvas, this.config);
  }
}
```

### Inject Browser APIs Safely

```typescript
// tokens.ts
import {InjectionToken, PLATFORM_ID, inject} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

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
@Injectable({providedIn: 'root'})
export class Storage {
  private storage = inject(LOCAL_STORAGE);

  get(key: string): string | null {
    return this.storage?.getItem(key) ?? null;
  }

  set(key: string, value: string): void {
    this.storage?.setItem(key, value);
  }
}
```

## Prerendering

### Static Routes

```typescript
// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  {path: '', renderMode: RenderMode.Prerender},
  {path: 'about', renderMode: RenderMode.Prerender},
  {path: 'contact', renderMode: RenderMode.Prerender},
  {path: 'blog', renderMode: RenderMode.Prerender},
];
```

### Dynamic Routes with getPrerenderParams

```typescript
// app.routes.server.ts
import {RenderMode, ServerRoute, PrerenderFallback} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      // Fetch product IDs to prerender
      const response = await fetch('https://api.example.com/products');
      const products = await response.json();
      return products.map((p: Product) => ({id: p.id}));
    },
    fallback: PrerenderFallback.Server, // SSR for non-prerendered
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const posts = await fetchBlogPosts();
      return posts.map((post) => ({slug: post.slug}));
    },
    fallback: PrerenderFallback.Client, // SPA for non-prerendered
  },
];
```

### Prerender Fallback Options

| Fallback                   | Description                    |
| -------------------------- | ------------------------------ |
| `PrerenderFallback.Server` | SSR for non-prerendered routes |
| `PrerenderFallback.Client` | Client-side rendering          |
| `PrerenderFallback.None`   | 404 for non-prerendered routes |

## HTTP Caching

### TransferState

Automatically transfer HTTP responses from server to client:

```typescript
import {provideClientHydration, withHttpTransferCacheOptions} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(
      withHttpTransferCacheOptions({
        includePostRequests: true,
        includeRequestsWithAuthHeaders: false,
        filter: (req) => !req.url.includes('/api/realtime'),
      }),
    ),
  ],
};
```

### Manual TransferState

```typescript
import {TransferState, makeStateKey} from '@angular/core';

const PRODUCTS_KEY = makeStateKey<Product[]>('products');

@Injectable({providedIn: 'root'})
export class Product {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);

  getProducts(): Observable<Product[]> {
    // Check if data was transferred from server
    if (this.transferState.hasKey(PRODUCTS_KEY)) {
      const products = this.transferState.get(PRODUCTS_KEY, []);
      this.transferState.remove(PRODUCTS_KEY);
      return of(products);
    }

    return this.http.get<Product[]>('/api/products').pipe(
      tap((products) => {
        // Store for transfer on server
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(PRODUCTS_KEY, products);
        }
      }),
    );
  }
}
```

## Build and Deploy

### Build Commands

```bash
# Build with SSR
ng build

# Output structure
dist/
├── my-app/
│   ├── browser/      # Client assets
│   └── server/       # Server bundle
```

### Run SSR Server

```bash
# Development
npm run serve:ssr:my-app

# Production
node dist/my-app/server/server.mjs
```

### Deploy to Node.js Host

```javascript
// server.ts (generated)
import {APP_BASE_HREF} from '@angular/common';
import {CommonEngine} from '@angular/ssr/node';
import express from 'express';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import bootstrap from './src/main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

app.get('*', express.static(browserDistFolder, {maxAge: '1y', index: false}));

app.get('*', (req, res, next) => {
  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: req.originalUrl,
      publicPath: browserDistFolder,
      providers: [{provide: APP_BASE_HREF, useValue: req.baseUrl}],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

app.listen(4000, () => {
  console.log('Server listening on http://localhost:4000');
});
```

For advanced patterns, see [references/ssr-patterns.md](references/ssr-patterns.md).
