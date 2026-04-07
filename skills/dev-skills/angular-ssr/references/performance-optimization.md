# Performance Optimization

## Lazy Hydration Strategy

```typescript
@Component({
  template: `
    <!-- Critical content - hydrate immediately -->
    <header>
      <app-navigation />
    </header>

    <!-- Main content - hydrate on viewport -->
    <main>
      @defer (hydrate on viewport) {
        <app-product-grid [products]="products()" />
      }
    </main>

    <!-- Below fold - hydrate on idle -->
    @defer (hydrate on idle) {
      <app-reviews [productId]="productId()" />
    }

    <!-- Interactive only - hydrate on interaction -->
    @defer (hydrate on interaction) {
      <app-chat-widget />
    }

    <!-- Static footer - never hydrate -->
    @defer (hydrate never) {
      <app-footer />
    }
  `,
})
export class ProductPage {}
```

## Preload Critical Data

```typescript
// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:id',
    renderMode: RenderMode.Server,
    async getPrerenderParams() {
      // Prerender top 100 products
      const topProducts = await fetchTopProducts(100);
      return topProducts.map(p => ({ id: p.id }));
    },
  },
];
```

## Streaming SSR (Experimental)

```typescript
// Enable streaming for faster TTFB
import { provideServerRendering } from '@angular/platform-server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // Streaming is automatic with @defer blocks
  ],
};
```
