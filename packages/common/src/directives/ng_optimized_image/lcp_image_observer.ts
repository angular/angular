/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, OnDestroy, ɵformatRuntimeError as formatRuntimeError} from '@angular/core';

import {DOCUMENT} from '../../dom_tokens';
import {RuntimeErrorCode} from '../../errors';

import {assertDevMode} from './asserts';
import {getUrl, imgDirectiveDetails} from './util';

/**
 * Contains the logic to detect whether an image with the `NgOptimizedImage` directive
 * is treated as an LCP element. If so, verifies that the image is marked as a priority,
 * using the `priority` attribute.
 *
 * Note: this is a dev-mode only class, which should not appear in prod bundles,
 * thus there is no `ngDevMode` use in the code.
 *
 * Based on https://web.dev/lcp/#measure-lcp-in-javascript.
 */
@Injectable({providedIn: 'root'})
export class LCPImageObserver implements OnDestroy {
  // Map of full image URLs -> original `rawSrc` values.
  private images = new Map<string, string>();
  // Keep track of images for which `console.warn` was produced.
  private alreadyWarned = new Set<string>();

  private window: Window|null = null;
  private observer: PerformanceObserver|null = null;

  constructor(@Inject(DOCUMENT) doc: Document) {
    assertDevMode('LCP checker');
    const win = doc.defaultView;
    if (typeof win !== 'undefined' && typeof PerformanceObserver !== 'undefined') {
      this.window = win;
      this.observer = this.initPerformanceObserver();
    }
  }

  // Inits PerformanceObserver and subscribes to LCP events.
  // Based on https://web.dev/lcp/#measure-lcp-in-javascript
  private initPerformanceObserver(): PerformanceObserver {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length === 0) return;
      // Note: we use the latest entry produced by the `PerformanceObserver` as the best
      // signal on which element is actually an LCP one. As an example, the first image to load on
      // a page, by virtue of being the only thing on the page so far, is often a LCP candidate
      // and gets reported by PerformanceObserver, but isn't necessarily the LCP element.
      const lcpElement = entries[entries.length - 1];
      // Cast to `any` due to missing `element` on observed type of entry.
      const imgSrc = (lcpElement as any).element?.src ?? '';

      // Exclude `data:` and `blob:` URLs, since they are not supported by the directive.
      if (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:')) return;

      const imgRawSrc = this.images.get(imgSrc);
      if (imgRawSrc && !this.alreadyWarned.has(imgSrc)) {
        this.alreadyWarned.add(imgSrc);
        const directiveDetails = imgDirectiveDetails(imgRawSrc);
        console.warn(formatRuntimeError(
            RuntimeErrorCode.LCP_IMG_MISSING_PRIORITY,
            `${directiveDetails}: the image was detected as the Largest Contentful Paint (LCP) ` +
                `element, so its loading should be prioritized for optimal performance. Please ` +
                `add the "priority" attribute if this image is above the fold.`));
      }
    });
    observer.observe({type: 'largest-contentful-paint', buffered: true});
    return observer;
  }

  registerImage(rewrittenSrc: string, rawSrc: string) {
    if (!this.observer) return;
    this.images.set(getUrl(rewrittenSrc, this.window!).href, rawSrc);
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
