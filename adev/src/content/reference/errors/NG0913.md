# Runtime Performance Warnings

### Oversized images
When images are loaded, the **intrinsic size** of the downloaded file is checked against the actual size of the image on the page. The actual size is calculated using the **rendered size** of the image with CSS applied, multiplied by the [pixel device ratio](https://web.dev/codelab-density-descriptors/#pixel-density). If the downloaded image is much larger (more than 1200px too large in either dimension), this warning is triggered. Downloading oversized images can slow down page loading and have a negative effect on [Core Web Vitals](https://web.dev/vitals/).

### Lazy-loaded LCP element
The largest contentful element on a page during load is considered the "LCP Element", which relates to [Largest Contentful Paint](https://web.dev/lcp/), one of the Core Web Vitals. Lazy loading an LCP element will have a strong negative effect on page performance. With this strategy, the browser has to complete layout calculations to determine whether the element is in the viewport before starting the image download. As a result, a warning is triggered when Angular detects that the LCP element has been given the `loading="lazy"` attribute.

@debugging
Use the image URL provided in the console warning to find the `<img>` element in question. 
### Ways to fix oversized images
* Use a smaller source image
* Add a [`srcset`](https://web.dev/learn/design/responsive-images/#responsive-images-with-srcset) if multiple sizes are needed for different layouts. 
* Switch to use Angular's built-in image directive ([`NgOptimizedImage`](https://angular.io/api/common/NgOptimizedImage)), which generates [srcsets automatically](https://angular.io/guide/image-directive#request-images-at-the-correct-size-with-automatic-srcset).
### Ways to fix lazy-loaded LCP element
 
* Change the `loading` attribute to a different value such as `"eager"`.
* Switch to use Angular's built-in image directive ([`NgOptimizedImage`](https://angular.io/api/common/NgOptimizedImage)), which allows for easily [prioritizing LCP images](https://angular.io/guide/image-directive#step-4-mark-images-as-priority).

### Disabling Image Performance Warnings
Both warnings can be disabled individually, site-wide, using a provider at the root of your application:

```typescript
providers: [
  {
    provide: IMAGE_CONFIG,
    useValue: {
      disableImageSizeWarning: true, 
      disableImageLazyLoadWarning: true
    }
  },
],
```