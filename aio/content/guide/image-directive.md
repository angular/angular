# Getting started with NgOptimizedImage

The `NgOptimizedImage` directive makes it easy to adopt performance best practices for loading images.

The directive ensures that the loading of the [Largest Contentful Paint (LCP)](http://web.dev/lcp) image is prioritized by:

*   Automatically setting the `fetchpriority` attribute on the `<img>` tag
*   Lazy loading other images by default
*   Asserting that there is a corresponding preconnect link tag in the document head
*   Automatically generating a `srcset` attribute
*   Generating a [preload hint](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload) if app is using SSR

In addition to optimizing the loading of the LCP image, `NgOptimizedImage` enforces a number of image best practices, such as:

*   Using [image CDN URLs to apply image optimizations](https://web.dev/image-cdns/#how-image-cdns-use-urls-to-indicate-optimization-options)
*   Preventing layout shift by requiring `width` and `height`
*   Warning if `width` or `height` have been set incorrectly
*   Warning if the image will be visually distorted when rendered

## Getting Started

#### Step 1: Import NgOptimizedImage

<code-example format="typescript" language="typescript">

import { NgOptimizedImage } from '@angular/common'

</code-example>

The directive is defined as a [standalone directive](/guide/standalone-components), so components should import it directly.

#### Step 2: (Optional) Set up a Loader

An image loader is not **required** in order to use NgOptimizedImage, but using one with an image CDN enables powerful performance features, including automatic `srcset`s for your images.

A brief guide for setting up a loader can be found in the [Configuring an Image Loader](#configuring-an-image-loader-for-ngoptimizedimage) section at the end of this page.

#### Step 3: Enable the directive

To activate the `NgOptimizedImage` directive, replace your image's `src` attribute with `ngSrc`.

<code-example format="typescript" language="typescript">

&lt;img ngSrc="cat.jpg"&gt;

</code-example>

If you're using a [built-in third-party loader](#built-in-loaders), make sure to omit the base URL path from `src`, as that will be prepended automatically by the loader.

#### Step 4: Mark images as `priority`

Always mark the [LCP image](https://web.dev/lcp/#what-elements-are-considered) on your page as `priority` to prioritize its loading.

<code-example format="typescript" language="typescript">

&lt;img ngSrc="cat.jpg" width="400" height="200" priority&gt;

</code-example>

Marking an image as `priority` applies the following optimizations:

*   Sets `fetchpriority=high` (read more about priority hints [here](https://web.dev/priority-hints))
*   Sets `loading=eager` (read more about native lazy loading [here](https://web.dev/browser-level-image-lazy-loading))
*   Automatically generates a [preload link element](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload) if [rendering on the server](/guide/universal).

Angular displays a warning during development if the LCP element is an image that does not have the `priority` attribute. A page’s LCP element can vary based on a number of factors - such as the dimensions of a user's screen, so a page may have multiple images that should be marked `priority`. See [CSS for Web Vitals](https://web.dev/css-web-vitals/#images-and-largest-contentful-paint-lcp) for more details.

#### Step 5: Include Height and Width

In order to prevent [image-related layout shifts](https://web.dev/css-web-vitals/#images-and-layout-shifts), NgOptimizedImage requires that you specify a height and width for your image, as follows:

<code-example format="typescript" language="typescript">

&lt;img ngSrc="cat.jpg" width="400" height="200"&gt;

</code-example>

For **responsive images** (images which you've styled to grow and shrink relative to the viewport), the `width` and `height` attributes should be the instrinsic size of the image file.

For **fixed size images**, the `width` and `height` attributes should reflect the desired rendered size of the image. The aspect ratio of these attributes should always match the intrinsic aspect ratio of the image.

Note: If you don't know the size of your images, consider using "fill mode" to inherit the size of the parent container, as described below:

### Using `fill` mode

In cases where you want to have an image fill a containing element, you can use the `fill` attribute. This is often useful when you want to achieve a "background image" behavior. It can also be helpful when you don't know the exact width and height of your image, but you do have a parent container with a known size that you'd like to fit your image into (see "object-fit" below).

When you add the `fill` attribute to your image, you do not need and should not include a `width` and `height`, as in this example:

<code-example format="typescript" language="typescript">

&lt;img ngSrc="cat.jpg" fill&gt;

</code-example>

You can use the [object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) CSS property to change how the image will fill its container. If you style your image with `object-fit: "contain"`, the image will maintain its aspect ratio and be "letterboxed" to fit the element. If you set `object-fit: "cover"`, the element will retain its aspect ratio, fully fill the element, and some content may be "cropped" off. 

See visual examples of the above at the [MDN object-fit documentation.](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)

You can also style your image with the [object-position property](https://developer.mozilla.org/en-US/docs/Web/CSS/object-position) to adjust its position within its containing element.

**Important note:** For the "fill" image to render properly, its parent element **must** be styled with `position: "relative"`, `position: "fixed"`, or `position: "absolute"`. 

### Adjusting image styling

Depending on the image's styling, adding `width` and `height` attributes may cause the image to render differently. `NgOptimizedImage` warns you if your image styling renders the image at a distorted aspect ratio.

You can typically fix this by adding `height: auto` or `width: auto` to your image styles. For more information, see the [web.dev article on the `<img>` tag](https://web.dev/patterns/web-vitals-patterns/images/img-tag).

If the `height` and `width` attribute on the image are preventing you from sizing the image the way you want with CSS, consider using "fill" mode instead, and styling the image's parent element.

## Performance Features

NgOptimizedImage includes a number of features designed to improve loading performance in your app. These features are described in this section.

### Add resource hints

You can add a [`preconnect` resource hint](https://web.dev/preconnect-and-dns-prefetch) for your image origin to ensure that the LCP image loads as quickly as possible. Always put resource hints in the `<head>` of the document.

<code-example format="html" language="html">

&lt;link rel="preconnect" href="https://my.cdn.origin" /&gt;

</code-example>

By default, if you use a loader for a third-party image service, the `NgOptimizedImage` directive will warn during development if it detects that there is no `preconnect` resource hint for the origin that serves the LCP image.

To disable these warnings, inject the `PRECONNECT_CHECK_BLOCKLIST` token:

<code-example format="typescript" language="typescript">

providers: [
  {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://your-domain.com'}
],

</code-example>

### Request images at the correct size with automatic `srcset`

Defining a [`srcset` attribute](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset) ensures that the browser requests an image at the right size for your user's viewport, so it doesn't waste time downloading an image that's too large. `NgOptimizedImage` generates an appropriate `srcset` for the image, based on the presence and value of the [`sizes` attribute](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes) on the image tag.

#### Fixed-size images

If your image should be "fixed" in size  (i.e. the same size across devices, except for [pixel density](https://web.dev/codelab-density-descriptors/)), there is no need to set a `sizes` attribute. A `srcset` can be generated automatically from the image's width and height attributes with no further input required. 

Example srcset generated: `<img ... srcset="image-400w.jpg 1x, image-800w.jpg 2x">`

#### Responsive images

If your image should be responsive (i.e. grow and shrink according to viewport size), then you will need to define a [`sizes` attribute](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes) to generate the `srcset`.

If you haven't used `sizes` before, a good place to start is to set it based on viewport width. For example, if your CSS causes the image to fill 100% of viewport width, set `sizes` to `100vw` and the browser will select the image in the `srcset` that is closest to the viewport width (after accounting for pixel density). If your image is only likely to take up half the screen (ex: in a sidebar), set `sizes` to `50vw` to ensure the browser selects a smaller image. And so on.

If you find that the above does not cover your desired image behavior, see the documentation on [advanced sizes values](#advanced-sizes-values).

By default, the responsive breakpoints are:

`[16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]`

If you would like to customize these breakpoints, you can do so using the `IMAGE_CONFIG` provider:

<code-example format="typescript" language="typescript">
providers: [
  {
    provide: IMAGE_CONFIG,
    useValue: {
      breakpoints: [16, 48, 96, 128, 384, 640, 750, 828, 1080, 1200, 1920]
    }
  },
],
</code-example>

If you would like to manually define a `srcset` attribute, you can provide your own using the `ngSrcset` attribute:

<code-example format="html" language="html">

&lt;img ngSrc="hero.jpg" ngSrcset="100w, 200w, 300w"&gt;

</code-example>

If the `ngSrcset` attribute is present, `NgOptimizedImage` generates and sets the `srcset` based on the sizes included. Do not include image file names in `ngSrcset` - the directive infers this information from `ngSrc`. The directive supports both width descriptors (e.g. `100w`) and density descriptors (e.g. `1x`).

<code-example format="html" language="html">

&lt;img ngSrc="hero.jpg" ngSrcset="100w, 200w, 300w" sizes="50vw"&gt;

</code-example>

### Disabling automatic srcset generation

To disable srcset generation for a single image, you can add the `disableOptimizedSrcset` attribute on the image:

<code-example format="html" language="html">

&lt;img ngSrc="about.jpg" disableOptimizedSrcset&gt;

</code-example>

### Disabling image lazy loading

By default, `NgOptimizedImage` sets `loading=lazy` for all images that are not marked `priority`. You can disable this behavior for non-priority images by setting the `loading` attribute. This attribute accepts values: `eager`, `auto`, and `lazy`. [See the documentation for the standard image `loading` attribute for details](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading#value).

<code-example format="html" language="html">

&lt;img ngSrc="cat.jpg" width="400" height="200" loading="eager"&gt;

</code-example>

### Advanced 'sizes' values

You may want to have images displayed at varying widths on differently-sized screens. A common example of this pattern is a grid- or column-based layout that renders a single column on mobile devices, and two columns on larger devices. You can capture this behavior in the `sizes` attribute, using a "media query" syntax, such as the following:

<code-example format="html" language="html">

&lt;img ngSrc="cat.jpg" width="400" height="200" sizes="(max-width: 768px) 100vw, 50vw"&gt;

</code-example>

The `sizes` attribute in the above example says "I expect this image to be 100 percent of the screen width on devices under 768px wide. Otherwise, I expect it to be 50 percent of the screen width.

For additional information about the `sizes` attribute, see [web.dev](https://web.dev/learn/design/responsive-images/#sizes) or [mdn](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes).

## Configuring an image loader for `NgOptimizedImage`

A "loader" is a function that generates an [image transformation URL](https://web.dev/image-cdns/#how-image-cdns-use-urls-to-indicate-optimization-options) for a given image file. When appropriate, `NgOptimizedImage` sets the size, format, and image quality transformations for an image.

`NgOptimizedImage` provides both a generic loader that applies no transformations, as well as loaders for various third-party image services. It also supports writing your own custom loader.

| Loader type| Behavior |
|:--- |:--- |
| Generic loader | The URL returned by the generic loader will always match the value of `src`. In other words, this loader applies no transformations. Sites that use Angular to serve images are the primary intended use case for this loader.|
| Loaders for third-party image services | The URL returned by the loaders for third-party image services will follow API conventions used by that particular image service. |
| Custom loaders | A custom loader's behavior is defined by its developer. You should use a custom loader if your image service isn't supported by the loaders that come preconfigured with `NgOptimizedImage`.|

Based on the image services commonly used with Angular applications, `NgOptimizedImage` provides loaders preconfigured to work with the following image services:

| Image Service | Angular API | Documentation |
|:--- |:--- |:--- |
| Cloudflare Image Resizing | `provideCloudflareLoader` | [Documentation](https://developers.cloudflare.com/images/image-resizing/) |
| Cloudinary | `provideCloudinaryLoader` | [Documentation](https://cloudinary.com/documentation/resizing_and_cropping) |
| ImageKit | `provideImageKitLoader` | [Documentation](https://docs.imagekit.io/) |
| Imgix | `provideImgixLoader` | [Documentation](https://docs.imgix.com/) |

To use the **generic loader** no additional code changes are necessary. This is the default behavior.

### Built-in Loaders

To use an existing loader for a **third-party image service**, add the provider factory for your chosen service to the `providers` array. In the example below, the Imgix loader is used:

<code-example format="typescript" language="typescript">
providers: [
  provideImgixLoader('https://my.base.url/'),
],
</code-example>

The base URL for your image assets should be passed to the provider factory as an argument. For most sites, this base URL should match one of the following patterns:

*   https://yoursite.yourcdn.com
*   https://subdomain.yoursite.com
*   https://subdomain.yourcdn.com/yoursite

You can learn more about the base URL structure in the docs of a corresponding CDN provider.

### Custom Loaders

To use a **custom loader**, provide your loader function as a value for the `IMAGE_LOADER` DI token. In the example below, the custom loader function returns a URL starting with `https://example.com` that includes `src` and `width` as URL parameters.

<code-example format="typescript" language="typescript">
providers: [
  {
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) => {
      return `https://example.com/images?src=${config.src}&width=${config.width}`;
    },
  },
],
</code-example>

A loader function for the `NgOptimizedImage` directive takes an object with the `ImageLoaderConfig` type (from `@angular/common`) as its argument and returns the absolute URL of the image asset. The `ImageLoaderConfig` object contains the `src` property, and optional `width` and `loaderParams` properties.

Note: even though the `width` property may not always be present, a custom loader must use it to support requesting images at various widths in order for `ngSrcset` to work properly.

### The `loaderParams` Property

There is an additional attribute supported by the `NgOptimizedImage` directive, called `loaderParams`, which is specifically designed to support the use of custom loaders. The `loaderParams` attribute take an object with any properties as a value, and does not do anything on its own. The data in `loaderParams` is added to the `ImageLoaderConfig` object passed to your custom loader, and can be used to control the behavior of the loader.

A common use for `loaderParams` is controlling advanced image CDN features.

### Example custom loader

The following shows an example of a custom loader function. This example function concatenates `src` and `width`, and uses `loaderParams` to control a custom CDN feature for rounded corners:

<code-example format="typescript" language="typescript">
const myCustomLoader = (config: ImageLoaderConfig) => {
  let url = `https://example.com/images/${config.src}?`;
  let queryParams = [];
  if (config.width) {
    queryParams.push(`w=${config.width}`);
  }
  if (config.loaderParams?.roundedCorners) {
    queryParams.push('mask=corners&corner-radius=5');
  }
  return url + queryParams.join('&');
};
</code-example>

Note that in the above example, we've invented the 'roundedCorners' property name to control a feature of our custom loader. We could then use this feature when creating an image, as follows:

<code-example format="html" language="html">

&lt;img ngSrc="profile.jpg" width="300" height="300" [loaderParams]="{roundedCorners: true}"&gt;

</code-example>

<!-- links -->

<!-- external links -->

<!--end links -->

@reviewed 2022-11-07
