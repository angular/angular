# SSR Prerendering

Prerendering generates static HTML at build time for known routes.

## Static Routes

```typescript
// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'blog', renderMode: RenderMode.Prerender },
];
```

## Dynamic Routes with getPrerenderParams

```typescript
// app.routes.server.ts
import { RenderMode, ServerRoute, PrerenderFallback } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      // Fetch product IDs to prerender
      const response = await fetch('https://api.example.com/products');
      const products = await response.json();
      return products.map((p: Product) => ({ id: p.id }));
    },
    fallback: PrerenderFallback.Server, // SSR for non-prerendered
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const posts = await fetchBlogPosts();
      return posts.map(post => ({ slug: post.slug }));
    },
    fallback: PrerenderFallback.Client, // SPA for non-prerendered
  },
];
```

## Prerender Fallback Options

| Fallback | Description |
|----------|-------------|
| `PrerenderFallback.Server` | SSR for non-prerendered routes |
| `PrerenderFallback.Client` | Client-side rendering |
| `PrerenderFallback.None` | 404 for non-prerendered routes |
