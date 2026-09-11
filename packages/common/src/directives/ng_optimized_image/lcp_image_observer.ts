/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DOCUMENT,
  ɵformatRuntimeError as formatRuntimeError,
  inject,
  OnDestroy,
  Service,
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
  count: number;
}

/**
 * These soft navigation entry types are not yet included in TypeScript's DOM typings.
 *
 * WebIDL definitions:
 * - https://wicg.github.io/soft-navigations/#sec-interaction-contentful-paint-interface
 * - https://wicg.github.io/soft-navigations/#performancesoftnavigation
 */
interface InteractionContentfulPaintEntry extends PerformanceEntry {
  readonly interactionId: number;
  readonly largestContentfulPaint: LargestContentfulPaint;
}

interface PerformanceSoftNavigationEntry extends PerformanceEntry {
  readonly interactionId: number;
  getLargestInteractionContentfulPaint(): InteractionContentfulPaintEntry | null;
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
@Service()
export class LCPImageObserver implements OnDestroy {
  // Map of full image URLs -> original `ngSrc` values.
  private images = new Map<string, ObservedImageState>();

  private window: Window | null = inject(DOCUMENT).defaultView;
  private observer: PerformanceObserver | null = null;
  private currentSoftNavigationInteractionId: number | null = null;

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

      // Entries of different types may be delivered out of order, so process them by end time.
      // See https://github.com/w3c/performance-timeline/issues/224.
      entries.sort((a, b) => a.startTime + a.duration - (b.startTime + b.duration));

      let latestInitialLcp: LargestContentfulPaint | null = null;

      for (const entry of entries) {
        if (entry.entryType === 'largest-contentful-paint') {
          // We use the latest entry produced by the `PerformanceObserver` as the best
          // signal on which element is actually an LCP one. As an example, the first image to load
          // on a page, by virtue of being the only thing on the page so far, is often a LCP candidate
          // and gets reported by PerformanceObserver, but isn't necessarily the LCP element.
          latestInitialLcp = entry as LargestContentfulPaint;
        } else if (entry.entryType === 'soft-navigation') {
          this.processSoftNavigationEntry(entry as PerformanceSoftNavigationEntry);
        } else if (entry.entryType === 'interaction-contentful-paint') {
          this.processInteractionContentfulPaintEntry(entry as InteractionContentfulPaintEntry);
        }
      }

      if (latestInitialLcp) {
        this.processLcpEntry(latestInitialLcp);
      }
    });
    observer.observe({type: 'largest-contentful-paint', buffered: true});

    if (
      PerformanceObserver.supportedEntryTypes.includes('soft-navigation') &&
      PerformanceObserver.supportedEntryTypes.includes('interaction-contentful-paint')
    ) {
      observer.observe({type: 'soft-navigation', buffered: true});
      // The soft navigation getter recovers earlier candidates; only future ICP updates are needed.
      observer.observe({type: 'interaction-contentful-paint'});
    }

    return observer;
  }

  private processSoftNavigationEntry(entry: PerformanceSoftNavigationEntry): void {
    this.currentSoftNavigationInteractionId = entry.interactionId;

    // The largest candidate may have been emitted before the soft navigation was detected.
    const largestInteractionContentfulPaint = entry.getLargestInteractionContentfulPaint();
    if (largestInteractionContentfulPaint) {
      this.processLcpEntry(largestInteractionContentfulPaint.largestContentfulPaint);
    }
  }

  private processInteractionContentfulPaintEntry(entry: InteractionContentfulPaintEntry): void {
    // Interaction contentful paints are emitted for all interactions, not only soft navigations.
    if (entry.interactionId !== this.currentSoftNavigationInteractionId) return;
    this.processLcpEntry(entry.largestContentfulPaint);
  }

  private processLcpEntry(entry: LargestContentfulPaint): void {
    const imgSrc = entry.element instanceof HTMLImageElement ? entry.element.src : '';

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
  }

  registerImage(rewrittenSrc: string, isPriority: boolean) {
    if (!this.observer) return;
    const url = getUrl(rewrittenSrc, this.window!).href;
    const existingState = this.images.get(url);

    if (existingState) {
      // If any instance has priority, the URL is considered to have priority
      existingState.priority = existingState.priority || isPriority;
      existingState.count++;
    } else {
      const newObservedImageState: ObservedImageState = {
        priority: isPriority,
        modified: false,
        alreadyWarnedModified: false,
        alreadyWarnedPriority: false,
        count: 1,
      };
      this.images.set(url, newObservedImageState);
    }
  }

  unregisterImage(rewrittenSrc: string) {
    if (!this.observer) return;
    const url = getUrl(rewrittenSrc, this.window!).href;
    const existingState = this.images.get(url);

    if (existingState) {
      existingState.count--;
      if (existingState.count <= 0) {
        this.images.delete(url);
      }
    }
  }

  updateImage(originalSrc: string, newSrc: string) {
    if (!this.observer) return;
    const originalUrl = getUrl(originalSrc, this.window!).href;
    const newUrl = getUrl(newSrc, this.window!).href;

    // URL hasn't changed
    if (originalUrl === newUrl) return;

    const originalState = this.images.get(originalUrl);
    if (!originalState) return;

    // Decrement count for original URL
    originalState.count--;
    if (originalState.count <= 0) {
      this.images.delete(originalUrl);
    }

    // Add or update entry for new URL
    const newState = this.images.get(newUrl);
    if (newState) {
      // Merge if original had priority, new should too
      newState.priority = newState.priority || originalState.priority;
      newState.modified = true;
      // Preserve warning flags from the original state to avoid duplicate warnings
      newState.alreadyWarnedPriority =
        newState.alreadyWarnedPriority || originalState.alreadyWarnedPriority;
      newState.alreadyWarnedModified =
        newState.alreadyWarnedModified || originalState.alreadyWarnedModified;
      newState.count++;
    } else {
      // Create new entry, preserving state from the image that moved
      this.images.set(newUrl, {
        priority: originalState.priority,
        modified: true,
        alreadyWarnedModified: originalState.alreadyWarnedModified,
        alreadyWarnedPriority: originalState.alreadyWarnedPriority,
        count: 1,
      });
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
