# SEO Optimization

## Meta Tags Service

```typescript
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class Seo {
  #meta = inject(Meta);
  #title = inject(Title);
  #document = inject(DOCUMENT);

  updateMetaTags(config: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
  }) {
    // Basic meta
    this.#title.setTitle(config.title);
    this.#meta.updateTag({ name: 'description', content: config.description });

    // Open Graph
    this.#meta.updateTag({ property: 'og:title', content: config.title });
    this.#meta.updateTag({ property: 'og:description', content: config.description });
    this.#meta.updateTag({ property: 'og:type', content: config.type || 'website' });

    if (config.image) {
      this.#meta.updateTag({ property: 'og:image', content: config.image });
    }

    if (config.url) {
      this.#meta.updateTag({ property: 'og:url', content: config.url });
      this.#updateCanonicalUrl(config.url);
    }

    // Twitter Card
    this.#meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.#meta.updateTag({ name: 'twitter:title', content: config.title });
    this.#meta.updateTag({ name: 'twitter:description', content: config.description });

    if (config.image) {
      this.#meta.updateTag({ name: 'twitter:image', content: config.image });
    }
  }

  #updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = this.#document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = this.#document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.#document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  setJsonLd(data: object) {
    let script: HTMLScriptElement | null = this.#document.querySelector('script[type="application/ld+json"]');

    if (!script) {
      script = this.#document.createElement('script');
      script.type = 'application/ld+json';
      this.#document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);
  }
}

// Usage in component
@Component({...})
export class Product {
  #seo = inject(Seo);
  product = input.required<Product>();

  constructor() {
    effect(() => {
      const product = this.product();
      this.#seo.updateMetaTags({
        title: `${product.name} | My Store`,
        description: product.description,
        image: product.imageUrl,
        url: `https://mystore.com/products/${product.id}`,
        type: 'product',
      });

      this.#seo.setJsonLd({
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

## Route-Based SEO with Resolvers

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
  #seo = inject(Seo);
  seoData = input.required<SeoData>(); // From resolver

  constructor() {
    effect(() => {
      this.#seo.updateMetaTags(this.seoData());
    });
  }
}
```
