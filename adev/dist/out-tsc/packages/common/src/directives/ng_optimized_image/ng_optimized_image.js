/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  ApplicationRef,
  booleanAttribute,
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  ElementRef,
  ɵformatRuntimeError as formatRuntimeError,
  ɵIMAGE_CONFIG as IMAGE_CONFIG,
  ɵIMAGE_CONFIG_DEFAULTS as IMAGE_CONFIG_DEFAULTS,
  inject,
  Injector,
  Input,
  NgZone,
  numberAttribute,
  ɵperformanceMarkFeature as performanceMarkFeature,
  Renderer2,
  ɵRuntimeError as RuntimeError,
  ɵunwrapSafeValue as unwrapSafeValue,
} from '@angular/core';
import {imgDirectiveDetails} from './error_helper';
import {cloudinaryLoaderInfo} from './image_loaders/cloudinary_loader';
import {IMAGE_LOADER, noopImageLoader} from './image_loaders/image_loader';
import {imageKitLoaderInfo} from './image_loaders/imagekit_loader';
import {imgixLoaderInfo} from './image_loaders/imgix_loader';
import {netlifyLoaderInfo} from './image_loaders/netlify_loader';
import {LCPImageObserver} from './lcp_image_observer';
import {PreconnectLinkChecker} from './preconnect_link_checker';
import {PreloadLinkCreator} from './preload-link-creator';
/**
 * When a Base64-encoded image is passed as an input to the `NgOptimizedImage` directive,
 * an error is thrown. The image content (as a string) might be very long, thus making
 * it hard to read an error message if the entire string is included. This const defines
 * the number of characters that should be included into the error message. The rest
 * of the content is truncated.
 */
const BASE64_IMG_MAX_LENGTH_IN_ERROR = 50;
/**
 * RegExpr to determine whether a src in a srcset is using width descriptors.
 * Should match something like: "100w, 200w".
 */
const VALID_WIDTH_DESCRIPTOR_SRCSET = /^((\s*\d+w\s*(,|$)){1,})$/;
/**
 * RegExpr to determine whether a src in a srcset is using density descriptors.
 * Should match something like: "1x, 2x, 50x". Also supports decimals like "1.5x, 1.50x".
 */
const VALID_DENSITY_DESCRIPTOR_SRCSET = /^((\s*\d+(\.\d+)?x\s*(,|$)){1,})$/;
/**
 * Srcset values with a density descriptor higher than this value will actively
 * throw an error. Such densities are not permitted as they cause image sizes
 * to be unreasonably large and slow down LCP.
 */
export const ABSOLUTE_SRCSET_DENSITY_CAP = 3;
/**
 * Used only in error message text to communicate best practices, as we will
 * only throw based on the slightly more conservative ABSOLUTE_SRCSET_DENSITY_CAP.
 */
export const RECOMMENDED_SRCSET_DENSITY_CAP = 2;
/**
 * Used in generating automatic density-based srcsets
 */
const DENSITY_SRCSET_MULTIPLIERS = [1, 2];
/**
 * Used to determine which breakpoints to use on full-width images
 */
const VIEWPORT_BREAKPOINT_CUTOFF = 640;
/**
 * Used to determine whether two aspect ratios are similar in value.
 */
const ASPECT_RATIO_TOLERANCE = 0.1;
/**
 * Used to determine whether the image has been requested at an overly
 * large size compared to the actual rendered image size (after taking
 * into account a typical device pixel ratio). In pixels.
 */
const OVERSIZED_IMAGE_TOLERANCE = 1000;
/**
 * Used to limit automatic srcset generation of very large sources for
 * fixed-size images. In pixels.
 */
const FIXED_SRCSET_WIDTH_LIMIT = 1920;
const FIXED_SRCSET_HEIGHT_LIMIT = 1080;
/**
 * Placeholder dimension (height or width) limit in pixels. Angular produces a warning
 * when this limit is crossed.
 */
const PLACEHOLDER_DIMENSION_LIMIT = 1000;
/**
 * Used to warn or error when the user provides an overly large dataURL for the placeholder
 * attribute.
 * Character count of Base64 images is 1 character per byte, and base64 encoding is approximately
 * 33% larger than base images, so 4000 characters is around 3KB on disk and 10000 characters is
 * around 7.7KB. Experimentally, 4000 characters is about 20x20px in PNG or medium-quality JPEG
 * format, and 10,000 is around 50x50px, but there's quite a bit of variation depending on how the
 * image is saved.
 */
export const DATA_URL_WARN_LIMIT = 4000;
export const DATA_URL_ERROR_LIMIT = 10000;
/** Info about built-in loaders we can test for. */
export const BUILT_IN_LOADERS = [
  imgixLoaderInfo,
  imageKitLoaderInfo,
  cloudinaryLoaderInfo,
  netlifyLoaderInfo,
];
/**
 * Threshold for the PRIORITY_TRUE_COUNT
 */
const PRIORITY_COUNT_THRESHOLD = 10;
/**
 * This count is used to log a devMode warning
 * when the count of directive instances with priority=true
 * exceeds the threshold PRIORITY_COUNT_THRESHOLD
 */
let IMGS_WITH_PRIORITY_ATTR_COUNT = 0;
/**
 * This function is for testing purpose.
 */
export function resetImagePriorityCount() {
  IMGS_WITH_PRIORITY_ATTR_COUNT = 0;
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
let NgOptimizedImage = (() => {
  let _classDecorators = [
    Directive({
      selector: 'img[ngSrc]',
      host: {
        '[style.position]': 'fill ? "absolute" : null',
        '[style.width]': 'fill ? "100%" : null',
        '[style.height]': 'fill ? "100%" : null',
        '[style.inset]': 'fill ? "0" : null',
        '[style.background-size]': 'placeholder ? "cover" : null',
        '[style.background-position]': 'placeholder ? "50% 50%" : null',
        '[style.background-repeat]': 'placeholder ? "no-repeat" : null',
        '[style.background-image]': 'placeholder ? generatePlaceholder(placeholder) : null',
        '[style.filter]':
          'placeholder && shouldBlurPlaceholder(placeholderConfig) ? "blur(15px)" : null',
      },
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _ngSrc_decorators;
  let _ngSrc_initializers = [];
  let _ngSrc_extraInitializers = [];
  let _ngSrcset_decorators;
  let _ngSrcset_initializers = [];
  let _ngSrcset_extraInitializers = [];
  let _sizes_decorators;
  let _sizes_initializers = [];
  let _sizes_extraInitializers = [];
  let _width_decorators;
  let _width_initializers = [];
  let _width_extraInitializers = [];
  let _height_decorators;
  let _height_initializers = [];
  let _height_extraInitializers = [];
  let _decoding_decorators;
  let _decoding_initializers = [];
  let _decoding_extraInitializers = [];
  let _loading_decorators;
  let _loading_initializers = [];
  let _loading_extraInitializers = [];
  let _priority_decorators;
  let _priority_initializers = [];
  let _priority_extraInitializers = [];
  let _loaderParams_decorators;
  let _loaderParams_initializers = [];
  let _loaderParams_extraInitializers = [];
  let _disableOptimizedSrcset_decorators;
  let _disableOptimizedSrcset_initializers = [];
  let _disableOptimizedSrcset_extraInitializers = [];
  let _fill_decorators;
  let _fill_initializers = [];
  let _fill_extraInitializers = [];
  let _placeholder_decorators;
  let _placeholder_initializers = [];
  let _placeholder_extraInitializers = [];
  let _placeholderConfig_decorators;
  let _placeholderConfig_initializers = [];
  let _placeholderConfig_extraInitializers = [];
  let _src_decorators;
  let _src_initializers = [];
  let _src_extraInitializers = [];
  let _srcset_decorators;
  let _srcset_initializers = [];
  let _srcset_extraInitializers = [];
  var NgOptimizedImage = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _ngSrc_decorators = [Input({required: true, transform: unwrapSafeUrl})];
      _ngSrcset_decorators = [Input()];
      _sizes_decorators = [Input()];
      _width_decorators = [Input({transform: numberAttribute})];
      _height_decorators = [Input({transform: numberAttribute})];
      _decoding_decorators = [Input()];
      _loading_decorators = [Input()];
      _priority_decorators = [Input({transform: booleanAttribute})];
      _loaderParams_decorators = [Input()];
      _disableOptimizedSrcset_decorators = [Input({transform: booleanAttribute})];
      _fill_decorators = [Input({transform: booleanAttribute})];
      _placeholder_decorators = [Input({transform: booleanOrUrlAttribute})];
      _placeholderConfig_decorators = [Input()];
      _src_decorators = [Input()];
      _srcset_decorators = [Input()];
      __esDecorate(
        null,
        null,
        _ngSrc_decorators,
        {
          kind: 'field',
          name: 'ngSrc',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngSrc' in obj,
            get: (obj) => obj.ngSrc,
            set: (obj, value) => {
              obj.ngSrc = value;
            },
          },
          metadata: _metadata,
        },
        _ngSrc_initializers,
        _ngSrc_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _ngSrcset_decorators,
        {
          kind: 'field',
          name: 'ngSrcset',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngSrcset' in obj,
            get: (obj) => obj.ngSrcset,
            set: (obj, value) => {
              obj.ngSrcset = value;
            },
          },
          metadata: _metadata,
        },
        _ngSrcset_initializers,
        _ngSrcset_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _sizes_decorators,
        {
          kind: 'field',
          name: 'sizes',
          static: false,
          private: false,
          access: {
            has: (obj) => 'sizes' in obj,
            get: (obj) => obj.sizes,
            set: (obj, value) => {
              obj.sizes = value;
            },
          },
          metadata: _metadata,
        },
        _sizes_initializers,
        _sizes_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _width_decorators,
        {
          kind: 'field',
          name: 'width',
          static: false,
          private: false,
          access: {
            has: (obj) => 'width' in obj,
            get: (obj) => obj.width,
            set: (obj, value) => {
              obj.width = value;
            },
          },
          metadata: _metadata,
        },
        _width_initializers,
        _width_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _height_decorators,
        {
          kind: 'field',
          name: 'height',
          static: false,
          private: false,
          access: {
            has: (obj) => 'height' in obj,
            get: (obj) => obj.height,
            set: (obj, value) => {
              obj.height = value;
            },
          },
          metadata: _metadata,
        },
        _height_initializers,
        _height_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _decoding_decorators,
        {
          kind: 'field',
          name: 'decoding',
          static: false,
          private: false,
          access: {
            has: (obj) => 'decoding' in obj,
            get: (obj) => obj.decoding,
            set: (obj, value) => {
              obj.decoding = value;
            },
          },
          metadata: _metadata,
        },
        _decoding_initializers,
        _decoding_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _loading_decorators,
        {
          kind: 'field',
          name: 'loading',
          static: false,
          private: false,
          access: {
            has: (obj) => 'loading' in obj,
            get: (obj) => obj.loading,
            set: (obj, value) => {
              obj.loading = value;
            },
          },
          metadata: _metadata,
        },
        _loading_initializers,
        _loading_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _priority_decorators,
        {
          kind: 'field',
          name: 'priority',
          static: false,
          private: false,
          access: {
            has: (obj) => 'priority' in obj,
            get: (obj) => obj.priority,
            set: (obj, value) => {
              obj.priority = value;
            },
          },
          metadata: _metadata,
        },
        _priority_initializers,
        _priority_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _loaderParams_decorators,
        {
          kind: 'field',
          name: 'loaderParams',
          static: false,
          private: false,
          access: {
            has: (obj) => 'loaderParams' in obj,
            get: (obj) => obj.loaderParams,
            set: (obj, value) => {
              obj.loaderParams = value;
            },
          },
          metadata: _metadata,
        },
        _loaderParams_initializers,
        _loaderParams_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _disableOptimizedSrcset_decorators,
        {
          kind: 'field',
          name: 'disableOptimizedSrcset',
          static: false,
          private: false,
          access: {
            has: (obj) => 'disableOptimizedSrcset' in obj,
            get: (obj) => obj.disableOptimizedSrcset,
            set: (obj, value) => {
              obj.disableOptimizedSrcset = value;
            },
          },
          metadata: _metadata,
        },
        _disableOptimizedSrcset_initializers,
        _disableOptimizedSrcset_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _fill_decorators,
        {
          kind: 'field',
          name: 'fill',
          static: false,
          private: false,
          access: {
            has: (obj) => 'fill' in obj,
            get: (obj) => obj.fill,
            set: (obj, value) => {
              obj.fill = value;
            },
          },
          metadata: _metadata,
        },
        _fill_initializers,
        _fill_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _placeholder_decorators,
        {
          kind: 'field',
          name: 'placeholder',
          static: false,
          private: false,
          access: {
            has: (obj) => 'placeholder' in obj,
            get: (obj) => obj.placeholder,
            set: (obj, value) => {
              obj.placeholder = value;
            },
          },
          metadata: _metadata,
        },
        _placeholder_initializers,
        _placeholder_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _placeholderConfig_decorators,
        {
          kind: 'field',
          name: 'placeholderConfig',
          static: false,
          private: false,
          access: {
            has: (obj) => 'placeholderConfig' in obj,
            get: (obj) => obj.placeholderConfig,
            set: (obj, value) => {
              obj.placeholderConfig = value;
            },
          },
          metadata: _metadata,
        },
        _placeholderConfig_initializers,
        _placeholderConfig_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _src_decorators,
        {
          kind: 'field',
          name: 'src',
          static: false,
          private: false,
          access: {
            has: (obj) => 'src' in obj,
            get: (obj) => obj.src,
            set: (obj, value) => {
              obj.src = value;
            },
          },
          metadata: _metadata,
        },
        _src_initializers,
        _src_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _srcset_decorators,
        {
          kind: 'field',
          name: 'srcset',
          static: false,
          private: false,
          access: {
            has: (obj) => 'srcset' in obj,
            get: (obj) => obj.srcset,
            set: (obj, value) => {
              obj.srcset = value;
            },
          },
          metadata: _metadata,
        },
        _srcset_initializers,
        _srcset_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      NgOptimizedImage = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    imageLoader = inject(IMAGE_LOADER);
    config = processConfig(inject(IMAGE_CONFIG));
    renderer = inject(Renderer2);
    imgElement = inject(ElementRef).nativeElement;
    injector = inject(Injector);
    // An LCP image observer should be injected only in development mode.
    // Do not assign it to `null` to avoid having a redundant property in the production bundle.
    lcpObserver;
    /**
     * Calculate the rewritten `src` once and store it.
     * This is needed to avoid repetitive calculations and make sure the directive cleanup in the
     * `ngOnDestroy` does not rely on the `IMAGE_LOADER` logic (which in turn can rely on some other
     * instance that might be already destroyed).
     */
    _renderedSrc = null;
    /**
     * Name of the source image.
     * Image name will be processed by the image loader and the final URL will be applied as the `src`
     * property of the image.
     */
    ngSrc = __runInitializers(this, _ngSrc_initializers, void 0);
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
    ngSrcset =
      (__runInitializers(this, _ngSrc_extraInitializers),
      __runInitializers(this, _ngSrcset_initializers, void 0));
    /**
     * The base `sizes` attribute passed through to the `<img>` element.
     * Providing sizes causes the image to create an automatic responsive srcset.
     */
    sizes =
      (__runInitializers(this, _ngSrcset_extraInitializers),
      __runInitializers(this, _sizes_initializers, void 0));
    /**
     * For responsive images: the intrinsic width of the image in pixels.
     * For fixed size images: the desired rendered width of the image in pixels.
     */
    width =
      (__runInitializers(this, _sizes_extraInitializers),
      __runInitializers(this, _width_initializers, void 0));
    /**
     * For responsive images: the intrinsic height of the image in pixels.
     * For fixed size images: the desired rendered height of the image in pixels.
     */
    height =
      (__runInitializers(this, _width_extraInitializers),
      __runInitializers(this, _height_initializers, void 0));
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
    decoding =
      (__runInitializers(this, _height_extraInitializers),
      __runInitializers(this, _decoding_initializers, void 0));
    /**
     * The desired loading behavior (lazy, eager, or auto). Defaults to `lazy`,
     * which is recommended for most images.
     *
     * Warning: Setting images as loading="eager" or loading="auto" marks them
     * as non-priority images and can hurt loading performance. For images which
     * may be the LCP element, use the `priority` attribute instead of `loading`.
     */
    loading =
      (__runInitializers(this, _decoding_extraInitializers),
      __runInitializers(this, _loading_initializers, void 0));
    /**
     * Indicates whether this image should have a high priority.
     */
    priority =
      (__runInitializers(this, _loading_extraInitializers),
      __runInitializers(this, _priority_initializers, false));
    /**
     * Data to pass through to custom loaders.
     */
    loaderParams =
      (__runInitializers(this, _priority_extraInitializers),
      __runInitializers(this, _loaderParams_initializers, void 0));
    /**
     * Disables automatic srcset generation for this image.
     */
    disableOptimizedSrcset =
      (__runInitializers(this, _loaderParams_extraInitializers),
      __runInitializers(this, _disableOptimizedSrcset_initializers, false));
    /**
     * Sets the image to "fill mode", which eliminates the height/width requirement and adds
     * styles such that the image fills its containing element.
     */
    fill =
      (__runInitializers(this, _disableOptimizedSrcset_extraInitializers),
      __runInitializers(this, _fill_initializers, false));
    /**
     * A URL or data URL for an image to be used as a placeholder while this image loads.
     */
    placeholder =
      (__runInitializers(this, _fill_extraInitializers),
      __runInitializers(this, _placeholder_initializers, void 0));
    /**
     * Configuration object for placeholder settings. Options:
     *   * blur: Setting this to false disables the automatic CSS blur.
     */
    placeholderConfig =
      (__runInitializers(this, _placeholder_extraInitializers),
      __runInitializers(this, _placeholderConfig_initializers, void 0));
    /**
     * Value of the `src` attribute if set on the host `<img>` element.
     * This input is exclusively read to assert that `src` is not set in conflict
     * with `ngSrc` and that images don't start to load until a lazy loading strategy is set.
     * @internal
     */
    src =
      (__runInitializers(this, _placeholderConfig_extraInitializers),
      __runInitializers(this, _src_initializers, void 0));
    /**
     * Value of the `srcset` attribute if set on the host `<img>` element.
     * This input is exclusively read to assert that `srcset` is not set in conflict
     * with `ngSrcset` and that images don't start to load until a lazy loading strategy is set.
     * @internal
     */
    srcset =
      (__runInitializers(this, _src_extraInitializers),
      __runInitializers(this, _srcset_initializers, void 0));
    constructor() {
      __runInitializers(this, _srcset_extraInitializers);
      if (ngDevMode) {
        this.lcpObserver = this.injector.get(LCPImageObserver);
        // Using `DestroyRef` to avoid having an empty `ngOnDestroy` method since this
        // is only run in development mode.
        const destroyRef = inject(DestroyRef);
        destroyRef.onDestroy(() => {
          if (!this.priority && this._renderedSrc !== null) {
            this.lcpObserver.unregisterImage(this._renderedSrc);
          }
        });
      }
    }
    /** @docs-private */
    ngOnInit() {
      performanceMarkFeature('NgOptimizedImage');
      if (ngDevMode) {
        const ngZone = this.injector.get(NgZone);
        assertNonEmptyInput(this, 'ngSrc', this.ngSrc);
        assertValidNgSrcset(this, this.ngSrcset);
        assertNoConflictingSrc(this);
        if (this.ngSrcset) {
          assertNoConflictingSrcset(this);
        }
        assertNotBase64Image(this);
        assertNotBlobUrl(this);
        if (this.fill) {
          assertEmptyWidthAndHeight(this);
          // This leaves the Angular zone to avoid triggering unnecessary change detection cycles when
          // `load` tasks are invoked on images.
          ngZone.runOutsideAngular(() =>
            assertNonZeroRenderedHeight(this, this.imgElement, this.renderer),
          );
        } else {
          assertNonEmptyWidthAndHeight(this);
          if (this.height !== undefined) {
            assertGreaterThanZero(this, this.height, 'height');
          }
          if (this.width !== undefined) {
            assertGreaterThanZero(this, this.width, 'width');
          }
          // Only check for distorted images when not in fill mode, where
          // images may be intentionally stretched, cropped or letterboxed.
          ngZone.runOutsideAngular(() =>
            assertNoImageDistortion(this, this.imgElement, this.renderer),
          );
        }
        assertValidLoadingInput(this);
        assertValidDecodingInput(this);
        if (!this.ngSrcset) {
          assertNoComplexSizes(this);
        }
        assertValidPlaceholder(this, this.imageLoader);
        assertNotMissingBuiltInLoader(this.ngSrc, this.imageLoader);
        assertNoNgSrcsetWithoutLoader(this, this.imageLoader);
        assertNoLoaderParamsWithoutLoader(this, this.imageLoader);
        ngZone.runOutsideAngular(() => {
          this.lcpObserver.registerImage(this.getRewrittenSrc(), this.ngSrc, this.priority);
        });
        if (this.priority) {
          const checker = this.injector.get(PreconnectLinkChecker);
          checker.assertPreconnect(this.getRewrittenSrc(), this.ngSrc);
          if (typeof ngServerMode !== 'undefined' && !ngServerMode) {
            const applicationRef = this.injector.get(ApplicationRef);
            assetPriorityCountBelowThreshold(applicationRef);
          }
        }
      }
      if (this.placeholder) {
        this.removePlaceholderOnLoad(this.imgElement);
      }
      this.setHostAttributes();
    }
    setHostAttributes() {
      // Must set width/height explicitly in case they are bound (in which case they will
      // only be reflected and not found by the browser)
      if (this.fill) {
        this.sizes ||= '100vw';
      } else {
        this.setHostAttribute('width', this.width.toString());
        this.setHostAttribute('height', this.height.toString());
      }
      this.setHostAttribute('loading', this.getLoadingBehavior());
      this.setHostAttribute('fetchpriority', this.getFetchPriority());
      this.setHostAttribute('decoding', this.getDecoding());
      // The `data-ng-img` attribute flags an image as using the directive, to allow
      // for analysis of the directive's performance.
      this.setHostAttribute('ng-img', 'true');
      // The `src` and `srcset` attributes should be set last since other attributes
      // could affect the image's loading behavior.
      const rewrittenSrcset = this.updateSrcAndSrcset();
      if (this.sizes) {
        if (this.getLoadingBehavior() === 'lazy') {
          this.setHostAttribute('sizes', 'auto, ' + this.sizes);
        } else {
          this.setHostAttribute('sizes', this.sizes);
        }
      } else {
        if (
          this.ngSrcset &&
          VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.ngSrcset) &&
          this.getLoadingBehavior() === 'lazy'
        ) {
          this.setHostAttribute('sizes', 'auto, 100vw');
        }
      }
      if (typeof ngServerMode !== 'undefined' && ngServerMode && this.priority) {
        const preloadLinkCreator = this.injector.get(PreloadLinkCreator);
        preloadLinkCreator.createPreloadLinkTag(
          this.renderer,
          this.getRewrittenSrc(),
          rewrittenSrcset,
          this.sizes,
        );
      }
    }
    /** @docs-private */
    ngOnChanges(changes) {
      if (ngDevMode) {
        assertNoPostInitInputChange(this, changes, [
          'ngSrcset',
          'width',
          'height',
          'priority',
          'fill',
          'loading',
          'sizes',
          'loaderParams',
          'disableOptimizedSrcset',
        ]);
      }
      if (changes['ngSrc'] && !changes['ngSrc'].isFirstChange()) {
        const oldSrc = this._renderedSrc;
        this.updateSrcAndSrcset(true);
        if (ngDevMode) {
          const newSrc = this._renderedSrc;
          if (oldSrc && newSrc && oldSrc !== newSrc) {
            const ngZone = this.injector.get(NgZone);
            ngZone.runOutsideAngular(() => {
              this.lcpObserver.updateImage(oldSrc, newSrc);
            });
          }
        }
      }
      if (
        ngDevMode &&
        changes['placeholder']?.currentValue &&
        typeof ngServerMode !== 'undefined' &&
        !ngServerMode
      ) {
        assertPlaceholderDimensions(this, this.imgElement);
      }
    }
    callImageLoader(configWithoutCustomParams) {
      let augmentedConfig = configWithoutCustomParams;
      if (this.loaderParams) {
        augmentedConfig.loaderParams = this.loaderParams;
      }
      return this.imageLoader(augmentedConfig);
    }
    getLoadingBehavior() {
      if (!this.priority && this.loading !== undefined) {
        return this.loading;
      }
      return this.priority ? 'eager' : 'lazy';
    }
    getFetchPriority() {
      return this.priority ? 'high' : 'auto';
    }
    getDecoding() {
      if (this.priority) {
        // `sync` means the image is decoded immediately when it's loaded,
        // reducing the risk of content shifting later (important for LCP).
        // If we're marking an image as priority, we want it decoded and
        // painted as early as possible.
        return 'sync';
      }
      // Returns the value of the `decoding` attribute, defaulting to `auto`
      // if not explicitly provided. This mimics native browser behavior and
      // avoids breaking changes when no decoding strategy is specified.
      return this.decoding ?? 'auto';
    }
    getRewrittenSrc() {
      // ImageLoaderConfig supports setting a width property. However, we're not setting width here
      // because if the developer uses rendered width instead of intrinsic width in the HTML width
      // attribute, the image requested may be too small for 2x+ screens.
      if (!this._renderedSrc) {
        const imgConfig = {src: this.ngSrc};
        // Cache calculated image src to reuse it later in the code.
        this._renderedSrc = this.callImageLoader(imgConfig);
      }
      return this._renderedSrc;
    }
    getRewrittenSrcset() {
      const widthSrcSet = VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.ngSrcset);
      const finalSrcs = this.ngSrcset
        .split(',')
        .filter((src) => src !== '')
        .map((srcStr) => {
          srcStr = srcStr.trim();
          const width = widthSrcSet ? parseFloat(srcStr) : parseFloat(srcStr) * this.width;
          return `${this.callImageLoader({src: this.ngSrc, width})} ${srcStr}`;
        });
      return finalSrcs.join(', ');
    }
    getAutomaticSrcset() {
      if (this.sizes) {
        return this.getResponsiveSrcset();
      } else {
        return this.getFixedSrcset();
      }
    }
    getResponsiveSrcset() {
      const {breakpoints} = this.config;
      let filteredBreakpoints = breakpoints;
      if (this.sizes?.trim() === '100vw') {
        // Since this is a full-screen-width image, our srcset only needs to include
        // breakpoints with full viewport widths.
        filteredBreakpoints = breakpoints.filter((bp) => bp >= VIEWPORT_BREAKPOINT_CUTOFF);
      }
      const finalSrcs = filteredBreakpoints.map(
        (bp) => `${this.callImageLoader({src: this.ngSrc, width: bp})} ${bp}w`,
      );
      return finalSrcs.join(', ');
    }
    updateSrcAndSrcset(forceSrcRecalc = false) {
      if (forceSrcRecalc) {
        // Reset cached value, so that the followup `getRewrittenSrc()` call
        // will recalculate it and update the cache.
        this._renderedSrc = null;
      }
      const rewrittenSrc = this.getRewrittenSrc();
      this.setHostAttribute('src', rewrittenSrc);
      let rewrittenSrcset = undefined;
      if (this.ngSrcset) {
        rewrittenSrcset = this.getRewrittenSrcset();
      } else if (this.shouldGenerateAutomaticSrcset()) {
        rewrittenSrcset = this.getAutomaticSrcset();
      }
      if (rewrittenSrcset) {
        this.setHostAttribute('srcset', rewrittenSrcset);
      }
      return rewrittenSrcset;
    }
    getFixedSrcset() {
      const finalSrcs = DENSITY_SRCSET_MULTIPLIERS.map(
        (multiplier) =>
          `${this.callImageLoader({
            src: this.ngSrc,
            width: this.width * multiplier,
          })} ${multiplier}x`,
      );
      return finalSrcs.join(', ');
    }
    shouldGenerateAutomaticSrcset() {
      let oversizedImage = false;
      if (!this.sizes) {
        oversizedImage =
          this.width > FIXED_SRCSET_WIDTH_LIMIT || this.height > FIXED_SRCSET_HEIGHT_LIMIT;
      }
      return (
        !this.disableOptimizedSrcset &&
        !this.srcset &&
        this.imageLoader !== noopImageLoader &&
        !oversizedImage
      );
    }
    /**
     * Returns an image url formatted for use with the CSS background-image property. Expects one of:
     * * A base64 encoded image, which is wrapped and passed through.
     * * A boolean. If true, calls the image loader to generate a small placeholder url.
     */
    generatePlaceholder(placeholderInput) {
      const {placeholderResolution} = this.config;
      if (placeholderInput === true) {
        return `url(${this.callImageLoader({
          src: this.ngSrc,
          width: placeholderResolution,
          isPlaceholder: true,
        })})`;
      } else if (typeof placeholderInput === 'string') {
        return `url(${placeholderInput})`;
      }
      return null;
    }
    /**
     * Determines if blur should be applied, based on an optional boolean
     * property `blur` within the optional configuration object `placeholderConfig`.
     */
    shouldBlurPlaceholder(placeholderConfig) {
      if (!placeholderConfig || !placeholderConfig.hasOwnProperty('blur')) {
        return true;
      }
      return Boolean(placeholderConfig.blur);
    }
    removePlaceholderOnLoad(img) {
      const callback = () => {
        const changeDetectorRef = this.injector.get(ChangeDetectorRef);
        removeLoadListenerFn();
        removeErrorListenerFn();
        this.placeholder = false;
        changeDetectorRef.markForCheck();
      };
      const removeLoadListenerFn = this.renderer.listen(img, 'load', callback);
      const removeErrorListenerFn = this.renderer.listen(img, 'error', callback);
      callOnLoadIfImageIsLoaded(img, callback);
    }
    setHostAttribute(name, value) {
      this.renderer.setAttribute(this.imgElement, name, value);
    }
  };
  return (NgOptimizedImage = _classThis);
})();
export {NgOptimizedImage};
/***** Helpers *****/
/**
 * Sorts provided config breakpoints and uses defaults.
 */
function processConfig(config) {
  let sortedBreakpoints = {};
  if (config.breakpoints) {
    sortedBreakpoints.breakpoints = config.breakpoints.sort((a, b) => a - b);
  }
  return Object.assign({}, IMAGE_CONFIG_DEFAULTS, config, sortedBreakpoints);
}
/***** Assert functions *****/
/**
 * Verifies that there is no `src` set on a host element.
 */
function assertNoConflictingSrc(dir) {
  if (dir.src) {
    throw new RuntimeError(
      2950 /* RuntimeErrorCode.UNEXPECTED_SRC_ATTR */,
      `${imgDirectiveDetails(dir.ngSrc)} both \`src\` and \`ngSrc\` have been set. ` +
        `Supplying both of these attributes breaks lazy loading. ` +
        `The NgOptimizedImage directive sets \`src\` itself based on the value of \`ngSrc\`. ` +
        `To fix this, please remove the \`src\` attribute.`,
    );
  }
}
/**
 * Verifies that there is no `srcset` set on a host element.
 */
function assertNoConflictingSrcset(dir) {
  if (dir.srcset) {
    throw new RuntimeError(
      2951 /* RuntimeErrorCode.UNEXPECTED_SRCSET_ATTR */,
      `${imgDirectiveDetails(dir.ngSrc)} both \`srcset\` and \`ngSrcset\` have been set. ` +
        `Supplying both of these attributes breaks lazy loading. ` +
        `The NgOptimizedImage directive sets \`srcset\` itself based on the value of ` +
        `\`ngSrcset\`. To fix this, please remove the \`srcset\` attribute.`,
    );
  }
}
/**
 * Verifies that the `ngSrc` is not a Base64-encoded image.
 */
function assertNotBase64Image(dir) {
  let ngSrc = dir.ngSrc.trim();
  if (ngSrc.startsWith('data:')) {
    if (ngSrc.length > BASE64_IMG_MAX_LENGTH_IN_ERROR) {
      ngSrc = ngSrc.substring(0, BASE64_IMG_MAX_LENGTH_IN_ERROR) + '...';
    }
    throw new RuntimeError(
      2952 /* RuntimeErrorCode.INVALID_INPUT */,
      `${imgDirectiveDetails(dir.ngSrc, false)} \`ngSrc\` is a Base64-encoded string ` +
        `(${ngSrc}). NgOptimizedImage does not support Base64-encoded strings. ` +
        `To fix this, disable the NgOptimizedImage directive for this element ` +
        `by removing \`ngSrc\` and using a standard \`src\` attribute instead.`,
    );
  }
}
/**
 * Verifies that the 'sizes' only includes responsive values.
 */
function assertNoComplexSizes(dir) {
  let sizes = dir.sizes;
  if (sizes?.match(/((\)|,)\s|^)\d+px/)) {
    throw new RuntimeError(
      2952 /* RuntimeErrorCode.INVALID_INPUT */,
      `${imgDirectiveDetails(dir.ngSrc, false)} \`sizes\` was set to a string including ` +
        `pixel values. For automatic \`srcset\` generation, \`sizes\` must only include responsive ` +
        `values, such as \`sizes="50vw"\` or \`sizes="(min-width: 768px) 50vw, 100vw"\`. ` +
        `To fix this, modify the \`sizes\` attribute, or provide your own \`ngSrcset\` value directly.`,
    );
  }
}
function assertValidPlaceholder(dir, imageLoader) {
  assertNoPlaceholderConfigWithoutPlaceholder(dir);
  assertNoRelativePlaceholderWithoutLoader(dir, imageLoader);
  assertNoOversizedDataUrl(dir);
}
/**
 * Verifies that placeholderConfig isn't being used without placeholder
 */
function assertNoPlaceholderConfigWithoutPlaceholder(dir) {
  if (dir.placeholderConfig && !dir.placeholder) {
    throw new RuntimeError(
      2952 /* RuntimeErrorCode.INVALID_INPUT */,
      `${imgDirectiveDetails(dir.ngSrc, false)} \`placeholderConfig\` options were provided for an ` +
        `image that does not use the \`placeholder\` attribute, and will have no effect.`,
    );
  }
}
/**
 * Warns if a relative URL placeholder is specified, but no loader is present to provide the small
 * image.
 */
function assertNoRelativePlaceholderWithoutLoader(dir, imageLoader) {
  if (dir.placeholder === true && imageLoader === noopImageLoader) {
    throw new RuntimeError(
      2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */,
      `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to true but ` +
        `no image loader is configured (i.e. the default one is being used), ` +
        `which would result in the same image being used for the primary image and its placeholder. ` +
        `To fix this, provide a loader or remove the \`placeholder\` attribute from the image.`,
    );
  }
}
/**
 * Warns or throws an error if an oversized dataURL placeholder is provided.
 */
function assertNoOversizedDataUrl(dir) {
  if (
    dir.placeholder &&
    typeof dir.placeholder === 'string' &&
    dir.placeholder.startsWith('data:')
  ) {
    if (dir.placeholder.length > DATA_URL_ERROR_LIMIT) {
      throw new RuntimeError(
        2965 /* RuntimeErrorCode.OVERSIZED_PLACEHOLDER */,
        `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to a data URL which is longer ` +
          `than ${DATA_URL_ERROR_LIMIT} characters. This is strongly discouraged, as large inline placeholders ` +
          `directly increase the bundle size of Angular and hurt page load performance. To fix this, generate ` +
          `a smaller data URL placeholder.`,
      );
    }
    if (dir.placeholder.length > DATA_URL_WARN_LIMIT) {
      console.warn(
        formatRuntimeError(
          2965 /* RuntimeErrorCode.OVERSIZED_PLACEHOLDER */,
          `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to a data URL which is longer ` +
            `than ${DATA_URL_WARN_LIMIT} characters. This is discouraged, as large inline placeholders ` +
            `directly increase the bundle size of Angular and hurt page load performance. For better loading performance, ` +
            `generate a smaller data URL placeholder.`,
        ),
      );
    }
  }
}
/**
 * Verifies that the `ngSrc` is not a Blob URL.
 */
function assertNotBlobUrl(dir) {
  const ngSrc = dir.ngSrc.trim();
  if (ngSrc.startsWith('blob:')) {
    throw new RuntimeError(
      2952 /* RuntimeErrorCode.INVALID_INPUT */,
      `${imgDirectiveDetails(dir.ngSrc)} \`ngSrc\` was set to a blob URL (${ngSrc}). ` +
        `Blob URLs are not supported by the NgOptimizedImage directive. ` +
        `To fix this, disable the NgOptimizedImage directive for this element ` +
        `by removing \`ngSrc\` and using a regular \`src\` attribute instead.`,
    );
  }
}
/**
 * Verifies that the input is set to a non-empty string.
 */
function assertNonEmptyInput(dir, name, value) {
  const isString = typeof value === 'string';
  const isEmptyString = isString && value.trim() === '';
  if (!isString || isEmptyString) {
    throw new RuntimeError(
      2952 /* RuntimeErrorCode.INVALID_INPUT */,
      `${imgDirectiveDetails(dir.ngSrc)} \`${name}\` has an invalid value ` +
        `(\`${value}\`). To fix this, change the value to a non-empty string.`,
    );
  }
}
/**
 * Verifies that the `ngSrcset` is in a valid format, e.g. "100w, 200w" or "1x, 2x".
 */
export function assertValidNgSrcset(dir, value) {
  if (value == null) return;
  assertNonEmptyInput(dir, 'ngSrcset', value);
  const stringVal = value;
  const isValidWidthDescriptor = VALID_WIDTH_DESCRIPTOR_SRCSET.test(stringVal);
  const isValidDensityDescriptor = VALID_DENSITY_DESCRIPTOR_SRCSET.test(stringVal);
  if (isValidDensityDescriptor) {
    assertUnderDensityCap(dir, stringVal);
  }
  const isValidSrcset = isValidWidthDescriptor || isValidDensityDescriptor;
  if (!isValidSrcset) {
    throw new RuntimeError(
      2952 /* RuntimeErrorCode.INVALID_INPUT */,
      `${imgDirectiveDetails(dir.ngSrc)} \`ngSrcset\` has an invalid value (\`${value}\`). ` +
        `To fix this, supply \`ngSrcset\` using a comma-separated list of one or more width ` +
        `descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x").`,
    );
  }
}
function assertUnderDensityCap(dir, value) {
  const underDensityCap = value
    .split(',')
    .every((num) => num === '' || parseFloat(num) <= ABSOLUTE_SRCSET_DENSITY_CAP);
  if (!underDensityCap) {
    throw new RuntimeError(
      2952 /* RuntimeErrorCode.INVALID_INPUT */,
      `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` contains an unsupported image density:` +
        `\`${value}\`. NgOptimizedImage generally recommends a max image density of ` +
        `${RECOMMENDED_SRCSET_DENSITY_CAP}x but supports image densities up to ` +
        `${ABSOLUTE_SRCSET_DENSITY_CAP}x. The human eye cannot distinguish between image densities ` +
        `greater than ${RECOMMENDED_SRCSET_DENSITY_CAP}x - which makes them unnecessary for ` +
        `most use cases. Images that will be pinch-zoomed are typically the primary use case for ` +
        `${ABSOLUTE_SRCSET_DENSITY_CAP}x images. Please remove the high density descriptor and try again.`,
    );
  }
}
/**
 * Creates a `RuntimeError` instance to represent a situation when an input is set after
 * the directive has initialized.
 */
function postInitInputChangeError(dir, inputName) {
  let reason;
  if (inputName === 'width' || inputName === 'height') {
    reason =
      `Changing \`${inputName}\` may result in different attribute value ` +
      `applied to the underlying image element and cause layout shifts on a page.`;
  } else {
    reason =
      `Changing the \`${inputName}\` would have no effect on the underlying ` +
      `image element, because the resource loading has already occurred.`;
  }
  return new RuntimeError(
    2953 /* RuntimeErrorCode.UNEXPECTED_INPUT_CHANGE */,
    `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` was updated after initialization. ` +
      `The NgOptimizedImage directive will not react to this input change. ${reason} ` +
      `To fix this, either switch \`${inputName}\` to a static value ` +
      `or wrap the image element in an @if that is gated on the necessary value.`,
  );
}
/**
 * Verify that none of the listed inputs has changed.
 */
function assertNoPostInitInputChange(dir, changes, inputs) {
  inputs.forEach((input) => {
    const isUpdated = changes.hasOwnProperty(input);
    if (isUpdated && !changes[input].isFirstChange()) {
      if (input === 'ngSrc') {
        // When the `ngSrc` input changes, we detect that only in the
        // `ngOnChanges` hook, thus the `ngSrc` is already set. We use
        // `ngSrc` in the error message, so we use a previous value, but
        // not the updated one in it.
        dir = {ngSrc: changes[input].previousValue};
      }
      throw postInitInputChangeError(dir, input);
    }
  });
}
/**
 * Verifies that a specified input is a number greater than 0.
 */
function assertGreaterThanZero(dir, inputValue, inputName) {
  const validNumber = typeof inputValue === 'number' && inputValue > 0;
  const validString =
    typeof inputValue === 'string' && /^\d+$/.test(inputValue.trim()) && parseInt(inputValue) > 0;
  if (!validNumber && !validString) {
    throw new RuntimeError(
      2952 /* RuntimeErrorCode.INVALID_INPUT */,
      `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` has an invalid value. ` +
        `To fix this, provide \`${inputName}\` as a number greater than 0.`,
    );
  }
}
/**
 * Verifies that the rendered image is not visually distorted. Effectively this is checking:
 * - Whether the "width" and "height" attributes reflect the actual dimensions of the image.
 * - Whether image styling is "correct" (see below for a longer explanation).
 */
function assertNoImageDistortion(dir, img, renderer) {
  const callback = () => {
    removeLoadListenerFn();
    removeErrorListenerFn();
    const computedStyle = window.getComputedStyle(img);
    let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
    let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
    const boxSizing = computedStyle.getPropertyValue('box-sizing');
    if (boxSizing === 'border-box') {
      const paddingTop = computedStyle.getPropertyValue('padding-top');
      const paddingRight = computedStyle.getPropertyValue('padding-right');
      const paddingBottom = computedStyle.getPropertyValue('padding-bottom');
      const paddingLeft = computedStyle.getPropertyValue('padding-left');
      renderedWidth -= parseFloat(paddingRight) + parseFloat(paddingLeft);
      renderedHeight -= parseFloat(paddingTop) + parseFloat(paddingBottom);
    }
    const renderedAspectRatio = renderedWidth / renderedHeight;
    const nonZeroRenderedDimensions = renderedWidth !== 0 && renderedHeight !== 0;
    const intrinsicWidth = img.naturalWidth;
    const intrinsicHeight = img.naturalHeight;
    const intrinsicAspectRatio = intrinsicWidth / intrinsicHeight;
    const suppliedWidth = dir.width;
    const suppliedHeight = dir.height;
    const suppliedAspectRatio = suppliedWidth / suppliedHeight;
    // Tolerance is used to account for the impact of subpixel rendering.
    // Due to subpixel rendering, the rendered, intrinsic, and supplied
    // aspect ratios of a correctly configured image may not exactly match.
    // For example, a `width=4030 height=3020` image might have a rendered
    // size of "1062w, 796.48h". (An aspect ratio of 1.334... vs. 1.333...)
    const inaccurateDimensions =
      Math.abs(suppliedAspectRatio - intrinsicAspectRatio) > ASPECT_RATIO_TOLERANCE;
    const stylingDistortion =
      nonZeroRenderedDimensions &&
      Math.abs(intrinsicAspectRatio - renderedAspectRatio) > ASPECT_RATIO_TOLERANCE;
    if (inaccurateDimensions) {
      console.warn(
        formatRuntimeError(
          2952 /* RuntimeErrorCode.INVALID_INPUT */,
          `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the image does not match ` +
            `the aspect ratio indicated by the width and height attributes. ` +
            `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` +
            `(aspect-ratio: ${round(intrinsicAspectRatio)}). \nSupplied width and height attributes: ` +
            `${suppliedWidth}w x ${suppliedHeight}h (aspect-ratio: ${round(suppliedAspectRatio)}). ` +
            `\nTo fix this, update the width and height attributes.`,
        ),
      );
    } else if (stylingDistortion) {
      console.warn(
        formatRuntimeError(
          2952 /* RuntimeErrorCode.INVALID_INPUT */,
          `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the rendered image ` +
            `does not match the image's intrinsic aspect ratio. ` +
            `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` +
            `(aspect-ratio: ${round(intrinsicAspectRatio)}). \nRendered image size: ` +
            `${renderedWidth}w x ${renderedHeight}h (aspect-ratio: ` +
            `${round(renderedAspectRatio)}). \nThis issue can occur if "width" and "height" ` +
            `attributes are added to an image without updating the corresponding ` +
            `image styling. To fix this, adjust image styling. In most cases, ` +
            `adding "height: auto" or "width: auto" to the image styling will fix ` +
            `this issue.`,
        ),
      );
    } else if (!dir.ngSrcset && nonZeroRenderedDimensions) {
      // If `ngSrcset` hasn't been set, sanity check the intrinsic size.
      const recommendedWidth = RECOMMENDED_SRCSET_DENSITY_CAP * renderedWidth;
      const recommendedHeight = RECOMMENDED_SRCSET_DENSITY_CAP * renderedHeight;
      const oversizedWidth = intrinsicWidth - recommendedWidth >= OVERSIZED_IMAGE_TOLERANCE;
      const oversizedHeight = intrinsicHeight - recommendedHeight >= OVERSIZED_IMAGE_TOLERANCE;
      if (oversizedWidth || oversizedHeight) {
        console.warn(
          formatRuntimeError(
            2960 /* RuntimeErrorCode.OVERSIZED_IMAGE */,
            `${imgDirectiveDetails(dir.ngSrc)} the intrinsic image is significantly ` +
              `larger than necessary. ` +
              `\nRendered image size: ${renderedWidth}w x ${renderedHeight}h. ` +
              `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h. ` +
              `\nRecommended intrinsic image size: ${recommendedWidth}w x ${recommendedHeight}h. ` +
              `\nNote: Recommended intrinsic image size is calculated assuming a maximum DPR of ` +
              `${RECOMMENDED_SRCSET_DENSITY_CAP}. To improve loading time, resize the image ` +
              `or consider using the "ngSrcset" and "sizes" attributes.`,
          ),
        );
      }
    }
  };
  const removeLoadListenerFn = renderer.listen(img, 'load', callback);
  // We only listen to the `error` event to remove the `load` event listener because it will not be
  // fired if the image fails to load. This is done to prevent memory leaks in development mode
  // because image elements aren't garbage-collected properly. It happens because zone.js stores the
  // event listener directly on the element and closures capture `dir`.
  const removeErrorListenerFn = renderer.listen(img, 'error', () => {
    removeLoadListenerFn();
    removeErrorListenerFn();
  });
  callOnLoadIfImageIsLoaded(img, callback);
}
/**
 * Verifies that a specified input is set.
 */
function assertNonEmptyWidthAndHeight(dir) {
  let missingAttributes = [];
  if (dir.width === undefined) missingAttributes.push('width');
  if (dir.height === undefined) missingAttributes.push('height');
  if (missingAttributes.length > 0) {
    throw new RuntimeError(
      2954 /* RuntimeErrorCode.REQUIRED_INPUT_MISSING */,
      `${imgDirectiveDetails(dir.ngSrc)} these required attributes ` +
        `are missing: ${missingAttributes.map((attr) => `"${attr}"`).join(', ')}. ` +
        `Including "width" and "height" attributes will prevent image-related layout shifts. ` +
        `To fix this, include "width" and "height" attributes on the image tag or turn on ` +
        `"fill" mode with the \`fill\` attribute.`,
    );
  }
}
/**
 * Verifies that width and height are not set. Used in fill mode, where those attributes don't make
 * sense.
 */
function assertEmptyWidthAndHeight(dir) {
  if (dir.width || dir.height) {
    throw new RuntimeError(
      2952 /* RuntimeErrorCode.INVALID_INPUT */,
      `${imgDirectiveDetails(dir.ngSrc)} the attributes \`height\` and/or \`width\` are present ` +
        `along with the \`fill\` attribute. Because \`fill\` mode causes an image to fill its containing ` +
        `element, the size attributes have no effect and should be removed.`,
    );
  }
}
/**
 * Verifies that the rendered image has a nonzero height. If the image is in fill mode, provides
 * guidance that this can be caused by the containing element's CSS position property.
 */
function assertNonZeroRenderedHeight(dir, img, renderer) {
  const callback = () => {
    removeLoadListenerFn();
    removeErrorListenerFn();
    const renderedHeight = img.clientHeight;
    if (dir.fill && renderedHeight === 0) {
      console.warn(
        formatRuntimeError(
          2952 /* RuntimeErrorCode.INVALID_INPUT */,
          `${imgDirectiveDetails(dir.ngSrc)} the height of the fill-mode image is zero. ` +
            `This is likely because the containing element does not have the CSS 'position' ` +
            `property set to one of the following: "relative", "fixed", or "absolute". ` +
            `To fix this problem, make sure the container element has the CSS 'position' ` +
            `property defined and the height of the element is not zero.`,
        ),
      );
    }
  };
  const removeLoadListenerFn = renderer.listen(img, 'load', callback);
  // See comments in the `assertNoImageDistortion`.
  const removeErrorListenerFn = renderer.listen(img, 'error', () => {
    removeLoadListenerFn();
    removeErrorListenerFn();
  });
  callOnLoadIfImageIsLoaded(img, callback);
}
/**
 * Verifies that the `loading` attribute is set to a valid input &
 * is not used on priority images.
 */
function assertValidLoadingInput(dir) {
  if (dir.loading && dir.priority) {
    throw new RuntimeError(
      2952 /* RuntimeErrorCode.INVALID_INPUT */,
      `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute ` +
        `was used on an image that was marked "priority". ` +
        `Setting \`loading\` on priority images is not allowed ` +
        `because these images will always be eagerly loaded. ` +
        `To fix this, remove the “loading” attribute from the priority image.`,
    );
  }
  const validInputs = ['auto', 'eager', 'lazy'];
  if (typeof dir.loading === 'string' && !validInputs.includes(dir.loading)) {
    throw new RuntimeError(
      2952 /* RuntimeErrorCode.INVALID_INPUT */,
      `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute ` +
        `has an invalid value (\`${dir.loading}\`). ` +
        `To fix this, provide a valid value ("lazy", "eager", or "auto").`,
    );
  }
}
/**
 * Verifies that the `decoding` attribute is set to a valid input.
 */
function assertValidDecodingInput(dir) {
  const validInputs = ['sync', 'async', 'auto'];
  if (typeof dir.decoding === 'string' && !validInputs.includes(dir.decoding)) {
    throw new RuntimeError(
      2952 /* RuntimeErrorCode.INVALID_INPUT */,
      `${imgDirectiveDetails(dir.ngSrc)} the \`decoding\` attribute ` +
        `has an invalid value (\`${dir.decoding}\`). ` +
        `To fix this, provide a valid value ("sync", "async", or "auto").`,
    );
  }
}
/**
 * Warns if NOT using a loader (falling back to the generic loader) and
 * the image appears to be hosted on one of the image CDNs for which
 * we do have a built-in image loader. Suggests switching to the
 * built-in loader.
 *
 * @param ngSrc Value of the ngSrc attribute
 * @param imageLoader ImageLoader provided
 */
function assertNotMissingBuiltInLoader(ngSrc, imageLoader) {
  if (imageLoader === noopImageLoader) {
    let builtInLoaderName = '';
    for (const loader of BUILT_IN_LOADERS) {
      if (loader.testUrl(ngSrc)) {
        builtInLoaderName = loader.name;
        break;
      }
    }
    if (builtInLoaderName) {
      console.warn(
        formatRuntimeError(
          2962 /* RuntimeErrorCode.MISSING_BUILTIN_LOADER */,
          `NgOptimizedImage: It looks like your images may be hosted on the ` +
            `${builtInLoaderName} CDN, but your app is not using Angular's ` +
            `built-in loader for that CDN. We recommend switching to use ` +
            `the built-in by calling \`provide${builtInLoaderName}Loader()\` ` +
            `in your \`providers\` and passing it your instance's base URL. ` +
            `If you don't want to use the built-in loader, define a custom ` +
            `loader function using IMAGE_LOADER to silence this warning.`,
        ),
      );
    }
  }
}
/**
 * Warns if ngSrcset is present and no loader is configured (i.e. the default one is being used).
 */
function assertNoNgSrcsetWithoutLoader(dir, imageLoader) {
  if (dir.ngSrcset && imageLoader === noopImageLoader) {
    console.warn(
      formatRuntimeError(
        2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */,
        `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` attribute is present but ` +
          `no image loader is configured (i.e. the default one is being used), ` +
          `which would result in the same image being used for all configured sizes. ` +
          `To fix this, provide a loader or remove the \`ngSrcset\` attribute from the image.`,
      ),
    );
  }
}
/**
 * Warns if loaderParams is present and no loader is configured (i.e. the default one is being
 * used).
 */
function assertNoLoaderParamsWithoutLoader(dir, imageLoader) {
  if (dir.loaderParams && imageLoader === noopImageLoader) {
    console.warn(
      formatRuntimeError(
        2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */,
        `${imgDirectiveDetails(dir.ngSrc)} the \`loaderParams\` attribute is present but ` +
          `no image loader is configured (i.e. the default one is being used), ` +
          `which means that the loaderParams data will not be consumed and will not affect the URL. ` +
          `To fix this, provide a custom loader or remove the \`loaderParams\` attribute from the image.`,
      ),
    );
  }
}
/**
 * Warns if the priority attribute is used too often on page load
 */
async function assetPriorityCountBelowThreshold(appRef) {
  if (IMGS_WITH_PRIORITY_ATTR_COUNT === 0) {
    IMGS_WITH_PRIORITY_ATTR_COUNT++;
    await appRef.whenStable();
    if (IMGS_WITH_PRIORITY_ATTR_COUNT > PRIORITY_COUNT_THRESHOLD) {
      console.warn(
        formatRuntimeError(
          2966 /* RuntimeErrorCode.TOO_MANY_PRIORITY_ATTRIBUTES */,
          `NgOptimizedImage: The "priority" attribute is set to true more than ${PRIORITY_COUNT_THRESHOLD} times (${IMGS_WITH_PRIORITY_ATTR_COUNT} times). ` +
            `Marking too many images as "high" priority can hurt your application's LCP (https://web.dev/lcp). ` +
            `"Priority" should only be set on the image expected to be the page's LCP element.`,
        ),
      );
    }
  } else {
    IMGS_WITH_PRIORITY_ATTR_COUNT++;
  }
}
/**
 * Warns if placeholder's dimension are over a threshold.
 *
 * This assert function is meant to only run on the browser.
 */
function assertPlaceholderDimensions(dir, imgElement) {
  const computedStyle = window.getComputedStyle(imgElement);
  let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
  let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
  if (renderedWidth > PLACEHOLDER_DIMENSION_LIMIT || renderedHeight > PLACEHOLDER_DIMENSION_LIMIT) {
    console.warn(
      formatRuntimeError(
        2967 /* RuntimeErrorCode.PLACEHOLDER_DIMENSION_LIMIT_EXCEEDED */,
        `${imgDirectiveDetails(dir.ngSrc)} it uses a placeholder image, but at least one ` +
          `of the dimensions attribute (height or width) exceeds the limit of ${PLACEHOLDER_DIMENSION_LIMIT}px. ` +
          `To fix this, use a smaller image as a placeholder.`,
      ),
    );
  }
}
function callOnLoadIfImageIsLoaded(img, callback) {
  // https://html.spec.whatwg.org/multipage/embedded-content.html#dom-img-complete
  // The spec defines that `complete` is truthy once its request state is fully available.
  // The image may already be available if it’s loaded from the browser cache.
  // In that case, the `load` event will not fire at all, meaning that all setup
  // callbacks listening for the `load` event will not be invoked.
  // In Safari, there is a known behavior where the `complete` property of an
  // `HTMLImageElement` may sometimes return `true` even when the image is not fully loaded.
  // Checking both `img.complete` and `img.naturalWidth` is the most reliable way to
  // determine if an image has been fully loaded, especially in browsers where the
  // `complete` property may return `true` prematurely.
  if (img.complete && img.naturalWidth) {
    callback();
  }
}
function round(input) {
  return Number.isInteger(input) ? input : input.toFixed(2);
}
// Transform function to handle SafeValue input for ngSrc. This doesn't do any sanitization,
// as that is not needed for img.src and img.srcset. This transform is purely for compatibility.
function unwrapSafeUrl(value) {
  if (typeof value === 'string') {
    return value;
  }
  return unwrapSafeValue(value);
}
// Transform function to handle inputs which may be booleans, strings, or string representations
// of boolean values. Used for the placeholder attribute.
export function booleanOrUrlAttribute(value) {
  if (typeof value === 'string' && value !== 'true' && value !== 'false' && value !== '') {
    return value;
  }
  return booleanAttribute(value);
}
//# sourceMappingURL=ng_optimized_image.js.map
