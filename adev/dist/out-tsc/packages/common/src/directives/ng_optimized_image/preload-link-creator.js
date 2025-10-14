/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  inject,
  Injectable,
  ɵformatRuntimeError as formatRuntimeError,
  DOCUMENT,
} from '@angular/core';
import {DEFAULT_PRELOADED_IMAGES_LIMIT, PRELOADED_IMAGES} from './tokens';
/**
 * @description Contains the logic needed to track and add preload link tags to the `<head>` tag. It
 * will also track what images have already had preload link tags added so as to not duplicate link
 * tags.
 *
 * In dev mode this service will validate that the number of preloaded images does not exceed the
 * configured default preloaded images limit: {@link DEFAULT_PRELOADED_IMAGES_LIMIT}.
 */
let PreloadLinkCreator = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var PreloadLinkCreator = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      PreloadLinkCreator = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    preloadedImages = inject(PRELOADED_IMAGES);
    document = inject(DOCUMENT);
    errorShown = false;
    /**
     * @description Add a preload `<link>` to the `<head>` of the `index.html` that is served from the
     * server while using Angular Universal and SSR to kick off image loads for high priority images.
     *
     * The `sizes` (passed in from the user) and `srcset` (parsed and formatted from `ngSrcset`)
     * properties used to set the corresponding attributes, `imagesizes` and `imagesrcset`
     * respectively, on the preload `<link>` tag so that the correctly sized image is preloaded from
     * the CDN.
     *
     * {@link https://web.dev/preload-responsive-images/#imagesrcset-and-imagesizes}
     *
     * @param renderer The `Renderer2` passed in from the directive
     * @param src The original src of the image that is set on the `ngSrc` input.
     * @param srcset The parsed and formatted srcset created from the `ngSrcset` input
     * @param sizes The value of the `sizes` attribute passed in to the `<img>` tag
     */
    createPreloadLinkTag(renderer, src, srcset, sizes) {
      if (
        ngDevMode &&
        !this.errorShown &&
        this.preloadedImages.size >= DEFAULT_PRELOADED_IMAGES_LIMIT
      ) {
        this.errorShown = true;
        console.warn(
          formatRuntimeError(
            2961 /* RuntimeErrorCode.TOO_MANY_PRELOADED_IMAGES */,
            `The \`NgOptimizedImage\` directive has detected that more than ` +
              `${DEFAULT_PRELOADED_IMAGES_LIMIT} images were marked as priority. ` +
              `This might negatively affect an overall performance of the page. ` +
              `To fix this, remove the "priority" attribute from images with less priority.`,
          ),
        );
      }
      if (this.preloadedImages.has(src)) {
        return;
      }
      this.preloadedImages.add(src);
      const preload = renderer.createElement('link');
      renderer.setAttribute(preload, 'as', 'image');
      renderer.setAttribute(preload, 'href', src);
      renderer.setAttribute(preload, 'rel', 'preload');
      renderer.setAttribute(preload, 'fetchpriority', 'high');
      if (sizes) {
        renderer.setAttribute(preload, 'imageSizes', sizes);
      }
      if (srcset) {
        renderer.setAttribute(preload, 'imageSrcset', srcset);
      }
      renderer.appendChild(this.document.head, preload);
    }
  };
  return (PreloadLinkCreator = _classThis);
})();
export {PreloadLinkCreator};
//# sourceMappingURL=preload-link-creator.js.map
