# Rendering strategies in Angular

Angular provides flexible rendering strategies that allow you to optimize different parts of your application based on their specific requirements. You can configure rendering strategies at the [route level](guide/routing/define-routes), giving you fine-grained control over how content is delivered to users.

This guide takes a progressive approach, starting with Angular's default client-side rendering and building up to more advanced server-side and hybrid strategies.

## What are rendering strategies?

Rendering strategies determine when and where your Angular application's HTML content is generated. Each strategy offers different trade-offs between initial page load performance, interactivity, SEO capabilities, and server resource usage.

Angular supports three primary rendering strategies:

- **Client-Side Rendering (CSR)** - Content is rendered entirely in the browser
- **Static Site Generation (SSG/Prerendering)** - Content is pre-rendered at build time
- **Server-Side Rendering (SSR)** - Content is rendered on the server for each request

## Client-Side Rendering (CSR) - The Default

**CSR is Angular's default rendering strategy.** When you create a new Angular application with [`ng new`](tools/cli/new), all [routes](guide/routing/define-routes) automatically use client-side rendering without any additional configuration.

### How CSR works

With your standard `app.routes.ts` file:

```typescript
import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { AboutComponent } from './about';
import { ProductListComponent } from './product-list';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'products', component: ProductListComponent },
  { path: '**', redirectTo: '/' }
];
```

All these routes automatically use CSR. Here's what happens:

1. The browser downloads the initial HTML shell
2. JavaScript bundles are loaded and executed
3. Angular bootstraps and renders the application
4. The DOM is created and managed entirely on the client
5. [Navigation between routes](guide/routing/navigate-to-routes) happens instantly without page reloads

### When CSR works well

CSR is ideal for:

- **Interactive applications** with complex user interfaces
- **Real-time applications** that need frequent updates
- **Dashboard-style applications** with heavy client-side state
- **Single-page applications** where navigation speed is crucial
- **Applications where SEO isn't critical** (internal tools, admin panels)

### CSR characteristics

| Aspect                  | Details                                                |
| :---------------------- | :----------------------------------------------------- |
| **SEO**                 | Limited - slower indexing, may miss dynamic content |
| **Initial load**        | Slower - requires JavaScript download and execution    |
| **Interactivity**       | Immediate once loaded                                  |
| **Server requirements** | Minimal - only serves static assets                    |
| **Caching**             | Excellent for static assets                            |
| **Setup complexity**    | None - works out of the box                            |

### Deploying CSR applications

CSR applications can be deployed to any static hosting service. Configure your `angular.json` for static deployment:

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "outputMode": "static"
          }
        }
      }
    }
  }
}
```

## Adding Static Site Generation (SSG)

As your application grows, you might want to **improve SEO and performance for static content** like marketing pages, blogs, or documentation. This is where Static Site Generation (SSG) comes in.

### Setting up SSG

First, add Angular SSR support to your project:

```bash
ng add @angular/ssr
```

This command adds the necessary dependencies and creates server-side configuration files.

### How SSG works

SSG pre-renders HTML content at build time. Angular creates static HTML files during the build process rather than generating pages when users request them.

To configure SSG, create an `app.routes.server.ts` file that defines [`ServerRoute`](api/ssr/ServerRoute) configurations:

```typescript
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender, // Homepage as static HTML
  },
  {
    path: 'about',
    renderMode: RenderMode.Prerender, // About page as static HTML
  },
  {
    path: 'blog',
    renderMode: RenderMode.Prerender, // Blog listing as static HTML
  },
];
```

### Building with SSG

Generate static files using the [Angular CLI](tools/cli):

```bash
ng build --prerender
```

This creates static HTML files for each specified route in your `dist/` folder.

### Dynamic routes with SSG

For [routes with parameters](guide/routing/define-routes#define-url-paths-with-route-parameters) (like blog posts), use `getPrerenderParams`:

```typescript
export const serverRoutes: ServerRoute[] = [
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      // Fetch your blog posts at build time
      const posts = await fetch('https://api.myblog.com/posts').then(res => res.json());
      return posts.map(post => ({ slug: post.slug }));
    },
  },
];
```

This generates static HTML files for each blog post: `blog/first-post/index.html`, `blog/second-post/index.html`, etc.

### SSG characteristics

| Aspect                  | Details                                       |
| :---------------------- | :-------------------------------------------- |
| **SEO**                 | Excellent - static HTML available immediately |
| **Initial load**        | Very fast - pre-generated content             |
| **Interactivity**       | Immediate after hydration                     |
| **Server requirements** | Minimal - serves static files                 |
| **Build time**          | Longer - generates all routes at build time   |
| **Content freshness**   | Updated only when you rebuild                 |

### When to use SSG

SSG is perfect for:

- **Marketing pages** that rarely change
- **Blog posts and articles**
- **Documentation sites**
- **Product catalogs** with stable content
- **Landing pages** that need excellent SEO

## Adding Server-Side Rendering (SSR)

For **dynamic, personalized content** that still needs good SEO, Server-Side Rendering (SSR) is the solution. SSR is more complex than CSR or SSG because it requires a server to generate HTML for each request.

### How SSR works

With SSR, Angular runs on the server for each request:

```typescript
export const serverRoutes: ServerRoute[] = [
  {
    path: 'profile',
    renderMode: RenderMode.Server, // Generated fresh for each request
  },
  {
    path: 'products/:id',
    renderMode: RenderMode.Server, // Dynamic product pages
  },
];
```

The SSR process:

1. User requests a page
2. Server receives the request
3. Angular renders the application on the server
4. Fully-formed HTML is sent to the browser
5. Page is visible immediately
6. Angular hydrates the client-side application for interactivity

### Server-side data access

SSR allows you to execute server-only logic and pass data to your [components](essentials/components):

```typescript
import { ChangeDetectionStrategy, Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { TransferState, makeStateKey } from '@angular/platform-browser';

const SERVER_DATA_KEY = makeStateKey<{ time: string }>('serverData');

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h1>User Profile</h1>
      <p>Rendered on: {{ renderLocation() }}</p>
      <p>Server time: {{ serverTime() }}</p>
    </div>
  `,
})
export class ProfileComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transferState = inject(TransferState);

  protected readonly renderLocation = computed(() => 
    isPlatformServer(this.platformId) ? 'Server' : 'Client'
  );
  
  protected readonly serverTime = signal(this.initializeServerTime());

  private initializeServerTime(): string {
    if (isPlatformServer(this.platformId)) {
      const time = new Date().toISOString();
      this.transferState.set(SERVER_DATA_KEY, { time });
      return time;
    } else {
      const data = this.transferState.get(SERVER_DATA_KEY, { time: 'Unknown' });
      return data.time;
    }
  }
}
```

### Building and serving SSR

Build your application with SSR using this command:

```bash
ng build --ssr
```

This creates both static assets and server files. You'll need a Node.js server to serve the application.

### SSR characteristics

| Aspect                  | Details                                             |
| :---------------------- | :-------------------------------------------------- |
| **SEO**                 | Excellent - full HTML content available to crawlers |
| **Initial load**        | Fast - content visible immediately                  |
| **Interactivity**       | Delayed until hydration completes                   |
| **Server requirements** | Higher - needs Node.js server for rendering         |
| **Personalization**     | Full access to request context and user data        |
| **Scalability**         | Requires more server resources                      |

### When to use SSR

SSR is ideal for:

- **User dashboards** that need personalization and SEO
- **E-commerce product pages** with dynamic pricing
- **Social media feeds** with personalized content
- **News sites** with frequently updated content
- **Any dynamic content** that needs search engine visibility

## Hybrid Rendering - Mixing Strategies

The real power of Angular's rendering strategies comes from **combining different approaches** for different parts of your application. This is called hybrid rendering.

### Example hybrid application

Here's how you might configure a complete application:

```typescript
import { inject } from '@angular/core';
import { RenderMode, ServerRoute, PrerenderFallback } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Marketing pages - Fast, SEO-optimized static content
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'pricing', renderMode: RenderMode.Prerender },

  // Blog - Static content with fallback for new posts
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server, // SSR for new posts
    getPrerenderParams: async () => {
      const dataService = inject(PostService);
      const posts = await dataService.getFeaturedPosts();
      return posts.map(post => ({ slug: post.slug }));
    },
  },

  // Product catalog - Dynamic content with SEO requirements
  { path: 'products', renderMode: RenderMode.Server },
  { path: 'products/:id', renderMode: RenderMode.Server },

  // User areas - Interactive, personalized content
  { path: 'dashboard', renderMode: RenderMode.Client },
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'profile', renderMode: RenderMode.Server }, // Personalized but needs SEO

  // Default fallback
  { path: '**', renderMode: RenderMode.Server },
];
```

### Configuring server routes

Add this configuration to your application using [`provideServerRendering`](api/ssr/provideServerRendering) with [`withRoutes`](api/ssr/withRoutes):

```typescript
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';

// app.config.server.ts
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // ... other providers ...
  ]
};
```

### Fallback strategies

When using SSG, you can configure fallback behavior for routes that weren't pre-rendered using [`PrerenderFallback`](api/ssr/PrerenderFallback):

| Fallback                   | Behavior                              |
| :------------------------- | :------------------------------------ |
| `PrerenderFallback.Server` | Use SSR for non-prerendered routes    |
| `PrerenderFallback.Client` | Use CSR for non-prerendered routes    |
| `PrerenderFallback.None`   | Return 404 for non-prerendered routes |

### Choosing the right strategy for each route

Consider these factors when deciding on rendering strategies:

**Use CSR when:**

- Interactivity is more important than initial load time
- SEO is not required
- Content is highly dynamic or user-specific
- You need real-time updates

**Use SSG when:**

- Content is mostly static
- SEO is critical
- You want the fastest possible load times
- Content doesn't change frequently

**Use SSR when:**

- You need both SEO and dynamic content
- Content is personalized but still needs search visibility
- You have frequently changing content that needs to be indexed

## Hydration strategies

When using SSR or SSG, Angular needs to "hydrate" the server-rendered HTML on the client side to make it interactive.

### Full hydration

The default strategy where the entire application is hydrated at once using [`provideClientHydration`](api/platform-browser/provideClientHydration):

```typescript
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig = {
  providers: [
    provideClientHydration(),
    // other providers...
  ],
};
```

### Incremental hydration

Hydrate specific parts of the application when needed using [`withIncrementalHydration`](api/platform-browser/withIncrementalHydration):

```typescript
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';

export const appConfig = {
  providers: [
    provideClientHydration(withIncrementalHydration()),
    // other providers...
  ],
};
```

Use [`@defer` blocks](guide/defer) to control when hydration occurs:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>Static header content</header>

    @defer (on interaction) {
      <interactive-widget />
    } @placeholder {
      <div>Loading widget...</div>
    }

    <footer>Static footer content</footer>
  `,
})
export class PageComponent {}
```

### Event replay

Preserve user interactions during hydration using [`withEventReplay`](api/platform-browser/withEventReplay):

```typescript
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    // other providers...
  ],
};
```

## Build configuration

Configure different rendering strategies at build time:

### Development

```json
{
  "scripts": {
    "dev": "ng serve",
    "dev:ssr": "ng serve --ssr"
  }
}
```

### Production builds

```json
{
  "scripts": {
    "build": "ng build",
    "build:ssr": "ng build --ssr",
    "build:prerender": "ng build --prerender"
  }
}
```

### Output modes

Configure the build output format in `angular.json`:

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "outputMode": "static" // or "server"
          }
        }
      }
    }
  }
}
```

| Mode       | Description                                      |
| :--------- | :----------------------------------------------- |
| `"static"` | Generates static files only (no server required) |
| `"server"` | Generates both static assets and server files    |

## Performance considerations

### Bundle size optimization

Different strategies affect bundle size:

- **CSR**: Full application bundle loaded upfront
- **SSR**: Initial bundle can be smaller with code splitting
- **SSG**: Optimal with incremental hydration and `@defer`

### Caching strategies

Optimize caching based on rendering strategy:

```typescript
// Static assets (SSG)
'Cache-Control': 'public, max-age=31536000, immutable'

// Dynamic content (SSR)
'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400'

// Client-side routes (CSR)
'Cache-Control': 'public, max-age=86400'
```

### Resource loading optimization

Use [preloading strategies](guide/routing/common-router-tasks#preloading) to optimize resource loading:

```typescript
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

export const appConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    // other providers...
  ],
};
```

## Starting recommendations

If you're new to Angular rendering strategies, follow this progression:

1. **Start with CSR** - Use Angular's default setup for initial development
2. **Add SSG for static pages** - Improve SEO for marketing pages and blogs
3. **Consider SSR for dynamic content** - When you need both SEO and personalization
4. **Optimize with hybrid strategies** - Mix approaches based on each route's needs

## Next steps

<docs-pill-row>
  <docs-pill href="/guide/ssr" title="Server-Side Rendering"/>
  <docs-pill href="/guide/hydration" title="Hydration"/>
  <docs-pill href="/guide/incremental-hydration" title="Incremental Hydration"/>
  <docs-pill href="/guide/routing/route-guards" title="Route Guards"/>
</docs-pill-row>
