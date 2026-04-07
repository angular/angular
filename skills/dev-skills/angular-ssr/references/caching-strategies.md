# Caching Strategies

## HTTP Cache Headers

```typescript
// server.ts
import { REQUEST, RESPONSE_INIT } from '@angular/ssr/tokens';

// In route configuration or component
@Component({...})
export class ProductList {
  #responseInit = inject(RESPONSE_INIT, { optional: true });

  constructor() {
    // Set cache headers for SSR response
    if (this.#responseInit) {
      this.#responseInit.headers = {
        ...this.#responseInit.headers,
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      };
    }
  }
}
```

## CDN Caching with Vary Headers

```typescript
// server.ts - Express middleware
app.use((req, res, next) => {
  // Vary by cookie for authenticated content
  res.setHeader('Vary', 'Cookie');
  next();
});
```

## Stale-While-Revalidate

```typescript
// Set SWR headers for dynamic content
this.responseInit.headers = {
  'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600',
};
```
