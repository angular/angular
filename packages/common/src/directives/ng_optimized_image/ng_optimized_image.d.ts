/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { OnChanges, OnInit, SimpleChanges } from '@angular/core';
/**
 * Srcset values with a density descriptor higher than this value will actively
 * throw an error. Such densities are not permitted as they cause image sizes
 * to be unreasonably large and slow down LCP.
 */
export declare const ABSOLUTE_SRCSET_DENSITY_CAP = 3;
/**
 * Used only in error message text to communicate best practices, as we will
 * only throw based on the slightly more conservative ABSOLUTE_SRCSET_DENSITY_CAP.
 */
export declare const RECOMMENDED_SRCSET_DENSITY_CAP = 2;
/**
 * Used to warn or error when the user provides an overly large dataURL for the placeholder
 * attribute.
 * Character count of Base64 images is 1 character per byte, and base64 encoding is approximately
 * 33% larger than base images, so 4000 characters is around 3KB on disk and 10000 characters is
 * around 7.7KB. Experimentally, 4000 characters is about 20x20px in PNG or medium-quality JPEG
 * format, and 10,000 is around 50x50px, but there's quite a bit of variation depending on how the
 * image is saved.
 */
export declare const DATA_URL_WARN_LIMIT = 4000;
export declare const DATA_URL_ERROR_LIMIT = 10000;
/** Info about built-in loaders we can test for. */
export declare const BUILT_IN_LOADERS: import("./image_loaders/image_loader").ImageLoaderInfo[];
/**
 * This function is for testing purpose.
 */
export declare function resetImagePriorityCount(): void;
/**
 * Config options used in rendering placeholder images.
 *
 * @see {@link NgOptimizedImage}
 * @publicApi
 */
export interface ImagePlaceholderConfig {
    blur?: boolean;
}
/**
 * Directive that improves image loading performance by enforcing best practices.
 *
 * `NgOptimizedImage` ensures that the loading of the Largest Contentful Paint (LCP) image is
 * prioritized by:
 * - Automatically setting the `fetchpriority` attribute on the `<img>` tag
 * - Lazy loading non-priority images by default
 * - Automatically generating a preconnect link tag in the document head
 *
 * In addition, the directive:
 * - Generates appropriate asset URLs if a corresponding `ImageLoader` function is provided
 * - Automatically generates a srcset
 * - Requires that `width` and `height` are set
 * - Warns if `width` or `height` have been set incorrectly
 * - Warns if the image will be visually distorted when rendered
 *
 * @usageNotes
 * The `NgOptimizedImage` directive is marked as [standalone](guide/components/importing) and can
 * be imported directly.
 *
 * Follow the steps below to enable and use the directive:
 * 1. Import it into the necessary NgModule or a standalone Component.
 * 2. Optionally provide an `ImageLoader` if you use an image hosting service.
 * 3. Update the necessary `<img>` tags in templates and replace `src` attributes with `ngSrc`.
 * Using a `ngSrc` allows the directive to control when the `src` gets set, which triggers an image
 * download.
 *
 * Step 1: import the `NgOptimizedImage` directive.
 *
 * ```ts
 * import { NgOptimizedImage } from '@angular/common';
 *
 * // Include it into the necessary NgModule
 * @NgModule({
 *   imports: [NgOptimizedImage],
 * })
 * class AppModule {}
 *
 * // ... or a standalone Component
 * @Component({
 *   imports: [NgOptimizedImage],
 * })
 * class MyStandaloneComponent {}
 * ```
 *
 * Step 2: configure a loader.
 *
 * To use the **default loader**: no additional code changes are necessary. The URL returned by the
 * generic loader will always match the value of "src". In other words, this loader applies no
 * transformations to the resource URL and the value of the `ngSrc` attribute will be used as is.
 *
 * To use an existing loader for a **third-party image service**: add the provider factory for your
 * chosen service to the `providers` array. In the example below, the Imgix loader is used:
 *
 * ```ts
 * import {provideImgixLoader} from '@angular/common';
 *
 * // Call the function and add the result to the `providers` array:
 * providers: [
 *   provideImgixLoader("https://my.base.url/"),
 * ],
 * ```
 *
 * The `NgOptimizedImage` directive provides the following functions:
 * - `provideCloudflareLoader`
 * - `provideCloudinaryLoader`
 * - `provideImageKitLoader`
 * - `provideImgixLoader`
 *
 * If you use a different image provider, you can create a custom loader function as described
 * below.
 *
 * To use a **custom loader**: provide your loader function as a value for the `IMAGE_LOADER` DI
 * token.
 *
 * ```ts
 * import {IMAGE_LOADER, ImageLoaderConfig} from '@angular/common';
 *
 * // Configure the loader using the `IMAGE_LOADER` token.
 * providers: [
 *   {
 *      provide: IMAGE_LOADER,
 *      useValue: (config: ImageLoaderConfig) => {
 *        return `https://example.com/${config.src}-${config.width}.jpg`;
 *      }
 *   },
 * ],
 * ```
 *
 * Step 3: update `<img>` tags in templates to use `ngSrc` instead of `src`.
 *
 * ```html
 * <img ngSrc="logo.png" width="200" height="100">
 * ```
 *
 * @publicApi
 */
export declare class NgOptimizedImage implements OnInit, OnChanges {
    private imageLoader;
    private config;
    private renderer;
    private imgElement;
    private injector;
    private lcpObserver?;
    /**
     * Calculate the rewritten `src` once and store it.
     * This is needed to avoid repetitive calculations and make sure the directive cleanup in the
     * `ngOnDestroy` does not rely on the `IMAGE_LOADER` logic (which in turn can rely on some other
     * instance that might be already destroyed).
     */
    private _renderedSrc;
    /**
     * Name of the source image.
     * Image name will be processed by the image loader and the final URL will be applied as the `src`
     * property of the image.
     */
    ngSrc: string;
    /**
     * A comma separated list of width or density descriptors.
     * The image name will be taken from `ngSrc` and combined with the list of width or density
     * descriptors to generate the final `srcset` property of the image.
     *
     * Example:
     * ```html
     * <img ngSrc="hello.jpg" ngSrcset="100w, 200w" />  =>
     * <img src="path/hello.jpg" srcset="path/hello.jpg?w=100 100w, path/hello.jpg?w=200 200w" />
     * ```
     */
    ngSrcset: string;
    /**
     * The base `sizes` attribute passed through to the `<img>` element.
     * Providing sizes causes the image to create an automatic responsive srcset.
     */
    sizes?: string;
    /**
     * For responsive images: the intrinsic width of the image in pixels.
     * For fixed size images: the desired rendered width of the image in pixels.
     */
    width: number | undefined;
    /**
     * For responsive images: the intrinsic height of the image in pixels.
     * For fixed size images: the desired rendered height of the image in pixels.
     */
    height: number | undefined;
    /**
     * The desired decoding behavior for the image. Defaults to `auto`
     * if not explicitly set, matching native browser behavior.
     *
     * Use `async` to decode the image off the main thread (non-blocking),
     * `sync` for immediate decoding (blocking), or `auto` to let the
     * browser decide the optimal strategy.
     *
     * [Spec](https://html.spec.whatwg.org/multipage/images.html#image-decoding-hint)
     */
    decoding?: 'sync' | 'async' | 'auto';
    /**
     * The desired loading behavior (lazy, eager, or auto). Defaults to `lazy`,
     * which is recommended for most images.
     *
     * Warning: Setting images as loading="eager" or loading="auto" marks them
     * as non-priority images and can hurt loading performance. For images which
     * may be the LCP element, use the `priority` attribute instead of `loading`.
     */
    loading?: 'lazy' | 'eager' | 'auto';
    /**
     * Indicates whether this image should have a high priority.
     */
    priority: boolean;
    /**
     * Data to pass through to custom loaders.
     */
    loaderParams?: {
        [key: string]: any;
    };
    /**
     * Disables automatic srcset generation for this image.
     */
    disableOptimizedSrcset: boolean;
    /**
     * Sets the image to "fill mode", which eliminates the height/width requirement and adds
     * styles such that the image fills its containing element.
     */
    fill: boolean;
    /**
     * A URL or data URL for an image to be used as a placeholder while this image loads.
     */
    placeholder?: string | boolean;
    /**
     * Configuration object for placeholder settings. Options:
     *   * blur: Setting this to false disables the automatic CSS blur.
     */
    placeholderConfig?: ImagePlaceholderConfig;
    /**
     * Value of the `src` attribute if set on the host `<img>` element.
     * This input is exclusively read to assert that `src` is not set in conflict
     * with `ngSrc` and that images don't start to load until a lazy loading strategy is set.
     * @internal
     */
    src?: string;
    /**
     * Value of the `srcset` attribute if set on the host `<img>` element.
     * This input is exclusively read to assert that `srcset` is not set in conflict
     * with `ngSrcset` and that images don't start to load until a lazy loading strategy is set.
     * @internal
     */
    srcset?: string;
    constructor();
    /** @docs-private */
    ngOnInit(): void;
    private setHostAttributes;
    /** @docs-private */
    ngOnChanges(changes: SimpleChanges): void;
    private callImageLoader;
    private getLoadingBehavior;
    private getFetchPriority;
    private getDecoding;
    private getRewrittenSrc;
    private getRewrittenSrcset;
    private getAutomaticSrcset;
    private getResponsiveSrcset;
    private updateSrcAndSrcset;
    private getFixedSrcset;
    private shouldGenerateAutomaticSrcset;
    /**
     * Returns an image url formatted for use with the CSS background-image property. Expects one of:
     * * A base64 encoded image, which is wrapped and passed through.
     * * A boolean. If true, calls the image loader to generate a small placeholder url.
     */
    protected generatePlaceholder(placeholderInput: string | boolean): string | boolean | null;
    /**
     * Determines if blur should be applied, based on an optional boolean
     * property `blur` within the optional configuration object `placeholderConfig`.
     */
    protected shouldBlurPlaceholder(placeholderConfig?: ImagePlaceholderConfig): boolean;
    private removePlaceholderOnLoad;
    private setHostAttribute;
}
/**
 * Verifies that the `ngSrcset` is in a valid format, e.g. "100w, 200w" or "1x, 2x".
 */
export declare function assertValidNgSrcset(dir: NgOptimizedImage, value: unknown): void;
export declare function booleanOrUrlAttribute(value: boolean | string): boolean | string;
