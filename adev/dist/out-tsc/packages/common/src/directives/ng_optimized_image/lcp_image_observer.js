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
import {assertDevMode} from './asserts';
import {imgDirectiveDetails} from './error_helper';
import {getUrl} from './url';
/**
 * Observer that detects whether an image with `NgOptimizedImage`
 * is treated as a Largest Contentful Paint (LCP) element. If so,
 * asserts that the image has the `priority` attribute.
 *
 * Note: this is a dev-mode only class and it does not appear in prod bundles,
 * thus there is no `ngDevMode` use in the code.
 *
 * Based on https://web.dev/lcp/#measure-lcp-in-javascript.
 */
let LCPImageObserver = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var LCPImageObserver = class {
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
      LCPImageObserver = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // Map of full image URLs -> original `ngSrc` values.
    images = new Map();
    window = inject(DOCUMENT).defaultView;
    observer = null;
    constructor() {
      assertDevMode('LCP checker');
      if (
        (typeof ngServerMode === 'undefined' || !ngServerMode) &&
        typeof PerformanceObserver !== 'undefined'
      ) {
        this.observer = this.initPerformanceObserver();
      }
    }
    /**
     * Inits PerformanceObserver and subscribes to LCP events.
     * Based on https://web.dev/lcp/#measure-lcp-in-javascript
     */
    initPerformanceObserver() {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length === 0) return;
        // We use the latest entry produced by the `PerformanceObserver` as the best
        // signal on which element is actually an LCP one. As an example, the first image to load on
        // a page, by virtue of being the only thing on the page so far, is often a LCP candidate
        // and gets reported by PerformanceObserver, but isn't necessarily the LCP element.
        const lcpElement = entries[entries.length - 1];
        // Cast to `any` due to missing `element` on the `LargestContentfulPaint` type of entry.
        // See https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint
        const imgSrc = lcpElement.element?.src ?? '';
        // Exclude `data:` and `blob:` URLs, since they are not supported by the directive.
        if (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:')) return;
        const img = this.images.get(imgSrc);
        if (!img) return;
        if (!img.priority && !img.alreadyWarnedPriority) {
          img.alreadyWarnedPriority = true;
          logMissingPriorityError(imgSrc);
        }
        if (img.modified && !img.alreadyWarnedModified) {
          img.alreadyWarnedModified = true;
          logModifiedWarning(imgSrc);
        }
      });
      observer.observe({type: 'largest-contentful-paint', buffered: true});
      return observer;
    }
    registerImage(rewrittenSrc, originalNgSrc, isPriority) {
      if (!this.observer) return;
      const newObservedImageState = {
        priority: isPriority,
        modified: false,
        alreadyWarnedModified: false,
        alreadyWarnedPriority: false,
      };
      this.images.set(getUrl(rewrittenSrc, this.window).href, newObservedImageState);
    }
    unregisterImage(rewrittenSrc) {
      if (!this.observer) return;
      this.images.delete(getUrl(rewrittenSrc, this.window).href);
    }
    updateImage(originalSrc, newSrc) {
      if (!this.observer) return;
      const originalUrl = getUrl(originalSrc, this.window).href;
      const img = this.images.get(originalUrl);
      if (img) {
        img.modified = true;
        this.images.set(getUrl(newSrc, this.window).href, img);
        this.images.delete(originalUrl);
      }
    }
    ngOnDestroy() {
      if (!this.observer) return;
      this.observer.disconnect();
      this.images.clear();
    }
  };
  return (LCPImageObserver = _classThis);
})();
export {LCPImageObserver};
function logMissingPriorityError(ngSrc) {
  const directiveDetails = imgDirectiveDetails(ngSrc);
  console.error(
    formatRuntimeError(
      2955 /* RuntimeErrorCode.LCP_IMG_MISSING_PRIORITY */,
      `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` +
        `element but was not marked "priority". This image should be marked ` +
        `"priority" in order to prioritize its loading. ` +
        `To fix this, add the "priority" attribute.`,
    ),
  );
}
function logModifiedWarning(ngSrc) {
  const directiveDetails = imgDirectiveDetails(ngSrc);
  console.warn(
    formatRuntimeError(
      2964 /* RuntimeErrorCode.LCP_IMG_NGSRC_MODIFIED */,
      `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` +
        `element and has had its "ngSrc" attribute modified. This can cause ` +
        `slower loading performance. It is recommended not to modify the "ngSrc" ` +
        `property on any image which could be the LCP element.`,
    ),
  );
}
//# sourceMappingURL=lcp_image_observer.js.map
