/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  inject,
  Injectable,
  OnDestroy,
  ɵformatRuntimeError as formatRuntimeError,
  DOCUMENT,
} from '@angular/core';

import {RuntimeErrorCode} from '../../errors';

import {assertDevMode} from './asserts';
import {imgDirectiveDetails} from './error_helper';
import {getUrl} from './url';

interface ObservedImageState {
  priority: boolean;
  modified: boolean;
  alreadyWarnedPriority: boolean;
  alreadyWarnedModified: boolean;
}

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
  private images = new Map<string, ObservedImageState>();

  private window: Window | null = inject(DOCUMENT).defaultView;
  private observer: PerformanceObserver | null = null;

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

  registerImage(rewrittenSrc: string, originalNgSrc: string, isPriority: boolean) {
    if (!this.observer) return;
    const newObservedImageState: ObservedImageState = {
      priority: isPriority,
      modified: false,
      alreadyWarnedModified: false,
      alreadyWarnedPriority: false,
    };
    this.images.set(getUrl(rewrittenSrc, this.window!).href, newObservedImageState);
  }

  unregisterImage(rewrittenSrc: string) {
    if (!this.observer) return;
    this.images.delete(getUrl(rewrittenSrc, this.window!).href);
  }

  updateImage(originalSrc: string, newSrc: string) {
    if (!this.observer) return;
    const originalUrl = getUrl(originalSrc, this.window!).href;
    const img = this.images.get(originalUrl);
    if (img) {
      img.modified = true;
      this.images.set(getUrl(newSrc, this.window!).href, img);
      this.images.delete(originalUrl);
    }
  }

  ngOnDestroy() {
    if (!this.observer) return;
    this.observer.disconnect();
    this.images.clear();
  }
}

function logMissingPriorityError(ngSrc: string) {
  const directiveDetails = imgDirectiveDetails(ngSrc);
  console.error(
    formatRuntimeError(
      RuntimeErrorCode.LCP_IMG_MISSING_PRIORITY,
      `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` +
        `element but was not marked "priority". This image should be marked ` +
        `"priority" in order to prioritize its loading. ` +
        `To fix this, add the "priority" attribute.`,
    ),
  );
}

function logModifiedWarning(ngSrc: string) {
  const directiveDetails = imgDirectiveDetails(ngSrc);
  console.warn(
    formatRuntimeError(
      RuntimeErrorCode.LCP_IMG_NGSRC_MODIFIED,
      `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` +
        `element and has had its "ngSrc" attribute modified. This can cause ` +
        `slower loading performance. It is recommended not to modify the "ngSrc" ` +
        `property on any image which could be the LCP element.`,
    ),
  );
}
