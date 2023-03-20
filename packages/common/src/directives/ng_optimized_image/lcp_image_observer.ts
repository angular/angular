/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, Injectable, OnDestroy, ɵformatRuntimeError as formatRuntimeError} from '@angular/core';

import {DOCUMENT} from '../../dom_tokens';
import {RuntimeErrorCode} from '../../errors';

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
@Injectable({providedIn: 'root'})
export class LCPImageObserver implements OnDestroy {
  // Map of full image URLs -> original `ngSrc` values.
  private images = new Map<string, string>();
  // Keep track of images for which `console.warn` was produced.
  private alreadyWarned = new Set<string>();

  private window: Window|null = null;
  private observer: PerformanceObserver|null = null;

  constructor() {
    assertDevMode('LCP checker');
    const win = inject(DOCUMENT).defaultView;
    if (typeof win !== 'undefined' && typeof PerformanceObserver !== 'undefined') {
      this.window = win;
      this.observer = this.initPerformanceObserver();
    }
  }

  /**
   * Inits PerformanceObserver and subscribes to LCP events.
   * Based on https://web.dev/lcp/#measure-lcp-in-javascript
   */
  private initPerformanceObserver(): PerformanceObserver {
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
      const imgSrc = (lcpElement as any).element?.src ?? '';

      // Exclude `data:` and `blob:` URLs, since they are not supported by the directive.
      if (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:')) return;

      const imgNgSrc = this.images.get(imgSrc);
      if (imgNgSrc && !this.alreadyWarned.has(imgSrc)) {
        this.alreadyWarned.add(imgSrc);
        logMissingPriorityWarning(imgSrc);
      }
    });
    observer.observe({type: 'largest-contentful-paint', buffered: true});
    return observer;
  }

  registerImage(rewrittenSrc: string, originalNgSrc: string) {
    if (!this.observer) return;
    this.images.set(getUrl(rewrittenSrc, this.window!).href, originalNgSrc);
  }

  unregisterImage(rewrittenSrc: string) {
    if (!this.observer) return;
    this.images.delete(getUrl(rewrittenSrc, this.window!).href);
  }

  ngOnDestroy() {
    if (!this.observer) return;
    this.observer.disconnect();
    this.images.clear();
    this.alreadyWarned.clear();
  }
}

function logMissingPriorityWarning(ngSrc: string) {
  const directiveDetails = imgDirectiveDetails(ngSrc);
  console.warn(formatRuntimeError(
      RuntimeErrorCode.LCP_IMG_MISSING_PRIORITY,
      `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` +
          `element but was not marked "priority". This image should be marked ` +
          `"priority" in order to prioritize its loading. ` +
          `To fix this, add the "priority" attribute.`));
}
