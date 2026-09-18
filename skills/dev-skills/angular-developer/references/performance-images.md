# Image Performance with NgOptimizedImage

`NgOptimizedImage` is Angular's built-in directive for performant images. It improves LCP by adding `fetchpriority` and `<link rel="preload">` for the LCP candidate, and prevents CLS by requiring explicit dimensions.

## Setup

```ts
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  template: `<img ngSrc="hero.webp" width="1200" height="600" priority />`
})
```

Replace `src` with `ngSrc`. The directive automatically sets `loading="lazy"` on non-priority images and `fetchpriority="high"` on the priority image.

## `priority` Attribute

Add `priority` to the single LCP image (typically the hero image or first product photo). This:

- Sets `fetchpriority="high"` on the `<img>` tag
- Injects a `<link rel="preload">` in the `<head>` (in SSR/SSG)
- Disables `loading="lazy"`

```html
<img ngSrc="hero.webp" width="1200" height="600" priority />
```

Do not add `priority` to more than one image per page. Multiple high-priority preloads compete with each other and dilute the benefit.

## Required Dimensions

`width` and `height` are required to prevent CLS. The browser reserves the exact space before the image loads.

```html
<!-- CORRECT -->
<img ngSrc="product.jpg" width="400" height="300" />

<!-- WRONG: will trigger a dev warning and cause CLS -->
<img ngSrc="product.jpg" />
```

## `fill` Mode

For CSS-driven containers where you cannot specify fixed pixel dimensions, use `fill`. The image fills its positioned parent.

```html
<div style="position: relative; width: 100%; height: 400px;">
  <img ngSrc="banner.webp" fill style="object-fit: cover" />
</div>
```

The parent must have `position: relative`, `absolute`, or `fixed`.

## Responsive Images with `ngSrcset` and `sizes`

```html
<img
  ngSrc="product.jpg"
  width="800"
  height="600"
  ngSrcset="400w, 800w, 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

The directive generates the `srcset` attribute automatically. `sizes` tells the browser what proportion of the viewport the image occupies at each breakpoint.

## Image CDN Loaders

CDN loaders transform `ngSrc` values into CDN-specific URLs with automatic format negotiation (WebP/AVIF) and responsive variants.

```ts
// app.config.ts
import { provideImageKitLoader } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideImageKitLoader('https://ik.imagekit.io/your-id')
  ]
};
```

Available loaders: `provideImageKitLoader`, `provideCloudinaryLoader`, `provideImgixLoader`, `provideNetlifyImageLoader`.

With a loader, use the image path relative to your CDN base URL:

```html
<img ngSrc="hero.jpg" width="1200" height="600" priority />
<!-- renders as: https://ik.imagekit.io/your-id/hero.jpg?tr=w-1200,h-600,f-auto -->
```

## Dev Warnings

In development mode `NgOptimizedImage` logs warnings for:

- Missing `width`/`height` (CLS risk)
- Missing `priority` on the LCP image (detected via `IntersectionObserver`)
- `priority` used without a preconnect to the image origin
- Image rendered at a size significantly larger than its intrinsic dimensions

## Anti-Patterns

**Using `<img src>` for hero or above-the-fold images.** Without `NgOptimizedImage`, there is no automatic `fetchpriority`, no preload, and no CLS protection.

```html
<!-- WRONG -->
<img src="hero.webp" />

<!-- CORRECT -->
<img ngSrc="hero.webp" width="1200" height="600" priority />
```

**Adding `priority` to every image.** Only the LCP candidate benefits. Additional priority attributes add unnecessary preload `<link>` tags that compete with each other.

**Using `fill` without a positioned parent.** The image will collapse or overflow unpredictably.
