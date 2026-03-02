# Angular SSR Patterns

## Table of Contents

- [Hydration Debugging](#hydration-debugging)
- [SEO Optimization](#seo-optimization)
- [Authentication with SSR](#authentication-with-ssr)
- [Caching Strategies](#caching-strategies)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)

## Hydration Debugging

### Common Hydration Mismatches

```typescript
// Problem: Different content on server vs client
@Component({
  template: `<p>Current time: {{ currentTime }}</p>`,
})
export class Time {
  // BAD: Different value on server and client
  currentTime = new Date().toLocaleTimeString();
}

// Solution: Use afterNextRender or skip SSR
@Component({
  template: `<p>Current time: {{ currentTime() }}</p>`,
})
export class Time {
  currentTime = signal('');

  constructor() {
    afterNextRender(() => {
      this.currentTime.set(new Date().toLocaleTimeString());
    });
  }
}
```

### Skip Hydration for Dynamic Content

```typescript
@Component({
  template: `
    <!-- Skip hydration for this subtree -->
    <div ngSkipHydration>
      <app-dynamic-widget />
    </div>
  `,
})
export class Page {}
```

### Debug Hydration Issues

```typescript
// Enable hydration debugging in development
import {provideClientHydration, withNoDomReuse} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(
      // Disable DOM reuse to see hydration errors clearly
      ...(isDevMode() ? [withNoDomReuse()] : []),
    ),
  ],
};
```

## SEO Optimization

### Meta Tags Service

```typescript
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class Seo {
  private meta = inject(Meta);
  private title = inject(Title);
  private document = inject(DOCUMENT);

  updateMetaTags(config: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
  }) {
    // Basic meta
    this.title.setTitle(config.title);
    this.meta.updateTag({ name: 'description', content: config.description });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });

    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
    }

    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
      this.updateCanonicalUrl(config.url);
    }

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });

    if (config.image) {
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }
  }

  private updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  setJsonLd(data: object) {
    let script: HTMLScriptElement | null = this.document.querySelector('script[type="application/ld+json"]');

    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);
  }
}

// Usage in component
@Component({...})
export class Product {
  private seo = inject(Seo);
  product = input.required<Product>();

  constructor() {
    effect(() => {
      const product = this.product();
      this.seo.updateMetaTags({
        title: `${product.name} | My Store`,
        description: product.description,
        image: product.imageUrl,
        url: `https://mystore.com/products/${product.id}`,
        type: 'product',
      });

      this.seo.setJsonLd({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.imageUrl,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
        },
      });
    });
  }
}
```

### Route-Based SEO with Resolvers

```typescript
// seo.resolver.ts
export const seoResolver: ResolveFn<SeoData> = async (route) => {
  const productId = route.paramMap.get('id')!;
  const productService = inject(Product);
  const product = await productService.getById(productId);

  return {
    title: `${product.name} | My Store`,
    description: product.description,
    image: product.imageUrl,
  };
};

// Routes
{
  path: 'products/:id',
  component: Product,
  resolve: { seo: seoResolver },
}

// Component
@Component({...})
export class Product {
  private seo = inject(Seo);
  seoData = input.required<SeoData>(); // From resolver

  constructor() {
    effect(() => {
      this.seo.updateMetaTags(this.seoData());
    });
  }
}
```

## Authentication with SSR

### Cookie-Based Auth

```typescript
// Server-side cookie reading
import {REQUEST} from '@angular/ssr/tokens';

@Injectable({providedIn: 'root'})
export class Auth {
  private request = inject(REQUEST, {optional: true});
  private platformId = inject(PLATFORM_ID);

  getToken(): string | null {
    if (isPlatformServer(this.platformId) && this.request) {
      // Read from request cookies on server
      const cookies = this.request.headers.cookie || '';
      const match = cookies.match(/auth_token=([^;]+)/);
      return match ? match[1] : null;
    }

    if (isPlatformBrowser(this.platformId)) {
      // Read from document cookies on client
      const match = document.cookie.match(/auth_token=([^;]+)/);
      return match ? match[1] : null;
    }

    return null;
  }
}
```

### Skip SSR for Authenticated Routes

```typescript
// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  // Public routes - prerender
  {path: '', renderMode: RenderMode.Prerender},
  {path: 'products', renderMode: RenderMode.Prerender},

  // Authenticated routes - client only
  {path: 'dashboard', renderMode: RenderMode.Client},
  {path: 'profile', renderMode: RenderMode.Client},
  {path: 'settings', renderMode: RenderMode.Client},
];
```

## Caching Strategies

### HTTP Cache Headers

```typescript
// server.ts
import { REQUEST, RESPONSE_INIT } from '@angular/ssr/tokens';

// In route configuration or component
@Component({...})
export class ProductList {
  private responseInit = inject(RESPONSE_INIT, { optional: true });

  constructor() {
    // Set cache headers for SSR response
    if (this.responseInit) {
      this.responseInit.headers = {
        ...this.responseInit.headers,
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      };
    }
  }
}
```

### CDN Caching with Vary Headers

```typescript
// server.ts - Express middleware
app.use((req, res, next) => {
  // Vary by cookie for authenticated content
  res.setHeader('Vary', 'Cookie');
  next();
});
```

### Stale-While-Revalidate

```typescript
// Set SWR headers for dynamic content
this.responseInit.headers = {
  'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600',
};
```

## Error Handling

### SSR Error Boundaries

```typescript
// error-handler.ts
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

@Injectable()
export class SsrError implements ErrorHandler {
  private platformId = inject(PLATFORM_ID);

  handleError(error: Error) {
    if (isPlatformServer(this.platformId)) {
      // Log server errors
      console.error('SSR Error:', error);
      // Could send to monitoring service
    } else {
      // Client-side error handling
      console.error('Client Error:', error);
    }
  }
}

// Provide in app.config.ts
{ provide: ErrorHandler, useClass: SsrError }
```

### Graceful Degradation

```typescript
@Component({
  template: `
    @if (dataError()) {
      <!-- Fallback content that works without data -->
      <app-fallback-content />
    } @else {
      <app-data-content [data]="data()" />
    }
  `,
})
export class PageCmpt {
  private dataService = inject(Data);

  data = signal<Data | null>(null);
  dataError = signal(false);

  constructor() {
    this.loadData();
  }

  private async loadData() {
    try {
      const data = await this.dataService.getData();
      this.data.set(data);
    } catch {
      this.dataError.set(true);
    }
  }
}
```

## Performance Optimization

### Lazy Hydration Strategy

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

### Preload Critical Data

```typescript
// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:id',
    renderMode: RenderMode.Server,
    async getPrerenderParams() {
      // Prerender top 100 products
      const topProducts = await fetchTopProducts(100);
      return topProducts.map((p) => ({id: p.id}));
    },
  },
];
```

### Streaming SSR (Experimental)

```typescript
// Enable streaming for faster TTFB
import {provideServerRendering} from '@angular/platform-server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // Streaming is automatic with @defer blocks
  ],
};
```

## Testing SSR

### Test Server Rendering

```typescript
import {renderApplication} from '@angular/platform-server';
import {App} from './app.component';
import {config} from './app.config.server';

describe('SSR', () => {
  it('should render home page', async () => {
    const html = await renderApplication(App, {
      appId: 'my-app',
      providers: config.providers,
      url: '/',
    });

    expect(html).toContain('<h1>Welcome</h1>');
    expect(html).toContain('</app-root>');
  });

  it('should render product page with data', async () => {
    const html = await renderApplication(App, {
      appId: 'my-app',
      providers: config.providers,
      url: '/products/123',
    });

    expect(html).toContain('Product Name');
    expect(html).not.toContain('Loading...');
  });
});
```

### Test Hydration

```typescript
import {TestBed} from '@angular/core/testing';
import {provideClientHydration} from '@angular/platform-browser';

describe('Hydration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideClientHydration()],
    });
  });

  it('should hydrate without errors', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // No hydration mismatch errors should be thrown
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```
