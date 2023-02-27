/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, Injectable, Renderer2, ɵRuntimeError as RuntimeError} from '@angular/core';

import {DOCUMENT} from '../../dom_tokens';
import {RuntimeErrorCode} from '../../errors';

import {DEFAULT_PRELOADED_IMAGES_LIMIT, PRELOADED_IMAGES} from './tokens';

/**
 * @description Contains the logic needed to track and add preload link tags to the `<head>` tag. It
 * will also track what images have already had preload link tags added so as to not duplicate link
 * tags.
 *
 * In dev mode this service will validate that the number of preloaded images does not exceed the
 * configured default preloaded images limit: {@link DEFAULT_PRELOADED_IMAGES_LIMIT}.
 */
@Injectable({providedIn: 'root'})
export class PreloadLinkCreator {
  private readonly preloadedImages = inject(PRELOADED_IMAGES);
  private readonly document = inject(DOCUMENT);

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
  createPreloadLinkTag(renderer: Renderer2, src: string, srcset?: string, sizes?: string): void {
    if (ngDevMode) {
      if (this.preloadedImages.size >= DEFAULT_PRELOADED_IMAGES_LIMIT) {
        throw new RuntimeError(
            RuntimeErrorCode.TOO_MANY_PRELOADED_IMAGES,
            ngDevMode &&
                `The \`NgOptimizedImage\` directive has detected that more than ` +
                    `${DEFAULT_PRELOADED_IMAGES_LIMIT} images were marked as priority. ` +
                    `This might negatively affect an overall performance of the page. ` +
                    `To fix this, remove the "priority" attribute from images with less priority.`);
      }
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
}
