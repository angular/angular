# Setting up `NgOptimizedImage`

<div class="alert is-important">

The `NgOptimizedImage` directive is available for [developer preview](https://angular.io/guide/releases#developer-preview).
It's ready for you to try, but it might change before it is stable.

</div>

This tutorial explains how to set up the `NgOptimizedImage`. For information on using `NgOptimizedImage`, see [Getting Started with NgOptimizedImage](/guide/image-directive).

## Import `NgOptimizedImage`

You can import `NgOptimizedImage` from the `@angular/common` module. The directive is defined as a [standalone directive](/guide/standalone-components), so components should import it directly.

## Configure an `ImageLoader`

A "loader" is a function that generates the [image transformation URL](https://web.dev/image-cdns/#how-image-cdns-use-urls-to-indicate-optimization-options) for a given image file. When appropriate, `NgOptimizedImage` sets the size, format, and image quality transformations for an image.

`NgOptimizedImage` provides a generic loader as well as loaders for various third-party image services; it also supports writing your own custom loader.

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

You must configure an image loader to use `NgOptimizedImage`.

These instructions explain how to set up an image loader for use with the `NgOptimizedImage`. 

1. Import the `NgOptimizedImage` directive into the application by adding it to the `imports` section of an NgModule or a standalone Component.

<code-example format="typescript" language="typescript">
import { NgOptimizedImage } from '@angular/common';
// Include NgOptimizedImage in the appropriate NgModule
@NgModule({
  imports: [
    // ... other imports
    NgOptimizedImage,
  ],
})

class AppModule {}
</code-example>

<code-example format="typescript" language="typescript">
@Component({
  standalone: true,
  imports: [
    // ... other imports
    NgOptimizedImage,
  ],
})

class MyStandaloneComponent {}
</code-example>

2. Configure a loader that you want to use.

To use the **generic loader**: no additional code changes are necessary.

To use an existing loader for a **third-party image service**: add the provider factory for your chosen service to the `providers` array. In the example below, the Imgix loader is used:

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

To use a **custom loader**: provide your loader function as a value for the `IMAGE_LOADER` DI token. In the example below, the custom loader function returns a URL starting with `https://example.com` that includes `src` and `width` as URL parameters.

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

A loader function for the `NgOptimizedImage` directive takes an object with the `ImageLoaderConfig` type (from `@angular/common`) as its argument and returns the absolute URL of the image asset. The `ImageLoaderConfig` object contains the `src`and `width` properties.

Note: a custom loader must support requesting images at various widths in order for `ngSrcset` to work properly.
