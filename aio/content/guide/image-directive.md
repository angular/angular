# Getting started with NgOptimizedImage

Note: the `NgOptimizedImage` directive is currently in the [“Developer Preview” mode](https://angular.io/guide/releases#developer-preview). The Angular team will stabilize the APIs based on the feedback and will make an announcement once the APIs are fully stable.

The `NgOptimizedImage` directive makes it easy to adopt performance best practices for loading images.

The `NgOptimizedImage` directive ensures that the loading of the [Largest Contentful Paint](http://web.dev/lcp) image is prioritized by:

*   Automatically setting the `fetchpriority` attribute on the `<img>` tag
*   Lazy loading other images by default
*   Asserting that there is a corresponding preconnect link tag in the document head

In addition to optimizing the loading of the LCP image, `NgOptimizedImage` enforces a number of image best practices:

*   Using [image URLs to apply image optimizations](https://web.dev/image-cdns/#how-image-cdns-use-urls-to-indicate-optimization-options)
*   Requires that `width` and `height` are set
*   Warns if `width` or `height` have been set incorrectly
*   Warns if the image will be visually distorted when rendered

## Prerequisites

You will need to import the directive into your application. In addition, you will need to setup an image loader. These steps are explained in the [Setting up `NgOptimizedImage`](/guide/image-directive-setup) tutorial.

## Usage in a template

### Overview

To activate the `NgOptimizedImage` directive, replace your image's `src` attribute with `rawSrc`.

<code-example format="html" language="html">
  &lt;img rawSrc=”cat.jpg" width="400" height="200"&gt;
</code-example>

The built-in third-party loaders prepend a shared base URL to `src`. If you're using one of these loaders (or any other loader that does this), make sure to omit the shared base URL path from `src` to prevent unnecessary duplication.

You must also set the `width` and `height` attributes. This is done to prevent [image-related layout shifts](https://web.dev/css-web-vitals/#images-and-layout-shifts).  The `width` and `height` attributes should reflect the [intrinsic size](https://developer.mozilla.org/en-US/docs/Glossary/Intrinsic_Size) of the image. During development, the `NgOptimizedImage` warns if it detects that the `width` and `height` attributes have been set incorrectly.

### Marking images as `priority`

Always mark the [LCP image](https://web.dev/lcp/#what-elements-are-considered) on your page as `priority` to prioritize its loading.

<code-example format="html" language="html">
  &lt;img rawSrc="cat.jpg" width="400" height="200" priority&gt;
</code-example>

Marking an image as `priority` applies the following optimizations:

*   Sets `fetchpriority=high` (read more about priority hints [here](https://web.dev/priority-hints/))
*   Sets `loading=eager` (read more about native lazy loading [here](https://web.dev/browser-level-image-lazy-loading/))

Angular displays a warning during development if the LCP element is an image that does not have the `priority` attribute. A page’s LCP element can vary based on a number of factors - such as the dimensions of a user's screen. A page may have multiple images that should be marked `priority`. See [CSS for Web Vitals](https://web.dev/css-web-vitals/#images-and-largest-contentful-paint-lcp) for more details.

### Adding resource hints

You can add a [`preconnect` resource hint](https://web.dev/preconnect-and-dns-prefetch/) for your image origin to ensure that the LCP image loads as quickly as possible. Always put resource hints in the `<head>` of the document.

<code-example format="html" language="html">
  &lt;link rel="preconnect" href="https://my.cdn.origin" &gt;
</code-example>

By default, if you use a loader for a third-party image service, the `NgOptimizedImage` directive will warn during development if it detects that there is no `preconnect` resource hint for the origin that serves the LCP image.

To disable these warnings, add `{ensurePreconnect: false}` to the arguments passed to the provider factory for your chosen image service:

<code-example format="typescript" language="typescript">
providers: [
  provideImgixLoader('https://my.base.url', {ensurePreconnect: false})
],
</code-example>

### Adjusting image styling

Depending on the image's styling, adding `width` and `height` attributes may cause the image to render differently. `NgOptimizedImage` warns you if your image styling renders the image at a distorted aspect ratio.

You can typically fix this by adding `height: auto` or `width: auto` to your image styles. For more information, see the [web.dev article on the `<img>` tag](https://web.dev/patterns/web-vitals-patterns/images/img-tag/).

### Handling `srcset` attributes

If your `<img>` tag defines a `srcset` attribute, replace it with `rawSrcset`.

<code-example format="html" language="html">
  &lt;img rawSrc="hero.jpg" rawSrcset="100w, 200w, 300w"&gt;
</code-example>

If the `rawSrcset` attribute is present, `NgOptimizedImage` generates and sets the [`srcset` attribute](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset) using the configured image loader. Do not include image file names in `rawSrcset` - the directive infers this information from `rawSrc`. The directive supports both width descriptors (e.g. `100w`) and density descriptors (e.g. `1x`) are supported.

You can also use `rawSrcset` with the standard image [`sizes` attribute](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes).

<code-example format="html" language="html">
  &lt;img rawSrc="hero.jpg" rawSrcset="100w, 200w, 300w" sizes=”50vw”&gt;
</code-example>

### Disabling image lazy loading

By default, `NgOptimizedImage` sets `loading=lazy` for all images that are not marked `priority`. You can disable this behavior for non-priority images by setting the `loading` attribute. This attribute accepts values: `eager`, `auto`, and `lazy`. [See the documentation for the standard image `loading` attribute for details](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading#value).

<code-example format="html" language="html">
  &lt;img rawSrc="cat.jpg" width="400" height="200" loading="eager"&gt;
</code-example>
