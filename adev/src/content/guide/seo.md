# Search Engine Optimization (SEO)

Angular's `Meta` manages HTML [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta) tags for SEO, social media sharing, and browser configuration. Combined with proper [page titles](guide/routing/define-routes#page-titles) and [server-side rendering](guide/ssr), meta tags help search engines index your content and create rich previews when shared on social platforms.

```ts
import {Injectable, inject} from '@angular/core';
import {Meta} from '@angular/platform-browser';

export interface SeoData {
  description: string;
  keywords: string;
}

@Injectable({providedIn: 'root'})
export class SeoService {
  private readonly meta = inject(Meta);

  updateTags(seoData: SeoData): void {
    // Update or create meta tags
    this.meta.updateTag({name: 'description', content: seoData.description});
    this.meta.updateTag({name: 'keywords', content: seoData.keywords});
  }

  addTag(name: string, content: string): void {
    // Add a single meta tag
    this.meta.addTag({name, content});
  }

  addMultipleTags(): void {
    // Add multiple meta tags at once
    this.meta.addTags([
      {name: 'author', content: 'Angular'},
      {name: 'robots', content: 'index, follow'},
    ]);
  }

  getTag(name: string): HTMLMetaElement | null {
    // Retrieve a single meta tag
    return this.meta.getTag(`name="${name}"`);
  }

  getAllTags(name: string): HTMLMetaElement[] {
    // Retrieve all meta tags matching a selector
    return this.meta.getTags(`name="${name}"`);
  }

  removeTag(name: string): void {
    // Remove a meta tag by selector
    this.meta.removeTag(`name="${name}"`);
  }

  removeTagElement(element: HTMLMetaElement): void {
    // Remove a specific meta tag element
    this.meta.removeTagElement(element);
  }
}
```

Use the service with a custom `TitleStrategy` to synchronize page titles and meta tags on every route navigation:

```ts
import {Injectable, inject} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy} from '@angular/router';
import {SeoService} from './seo.service';

@Injectable({providedIn: 'root'})
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);

    if (title !== undefined) {
      this.title.setTitle(title);

      // Get the deepest route for additional meta tags
      let route: ActivatedRouteSnapshot = snapshot.root;
      while (route.firstChild) {
        route = route.firstChild;
      }

      this.seo.updateTags({
        description: route.data['description'] || '',
        keywords: route.data['keywords'] || ''
      });

    }
  }
}
```

HELPFUL: For more information about `TitleStrategy`, see the [Using TitleStrategy for page titles](guide/routing/define-routes#using-titlestrategy-for-page-titles).

Alternatively, use a resolver for route-specific meta tags:

```ts
import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {SeoService} from './seo.service';

export const productSeoResolver: ResolveFn<void> = (route : ActivatedRouteSnapshot ) => {
  const seo = inject(SeoService);

  seo.updateTags({
    description: route.data['description'] || '',
    keywords: route.data['keywords'] || ''
  });
};
```

## Testing your implementation

Inspect the [`<head>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/head) section in your browser’s Elements panel to verify meta tags and ensure no duplicates.

### Social media debuggers

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Google SEO tools

- [Search Console](https://search.google.com/search-console)
- [Meta tags Google supports](https://developers.google.com/search/docs/crawling-indexing/special-tags)
- [Write effective meta descriptions](https://developers.google.com/search/docs/appearance/snippet)
- [Robots meta tag specification](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/seo/meta-description)

<docs-pill-row>
  <docs-pill href="api/platform-browser/Meta" title="Meta API Reference"/>
  <docs-pill href="guide/routing/define-routes" title="Page Titles"/>
  <docs-pill href="guide/ssr" title="Server-Side Rendering"/>
</docs-pill-row>
