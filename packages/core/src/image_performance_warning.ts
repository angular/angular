/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {IMAGE_CONFIG, ImageConfig} from './application/application_tokens';
import {Injectable} from './di';
import {inject} from './di/injector_compatibility';
import {formatRuntimeError, RuntimeErrorCode} from './errors';
import {OnDestroy} from './interface/lifecycle_hooks';
import {getDocument} from './render3/interfaces/document';

// A delay in milliseconds before the scan is run after onLoad, to avoid any
// potential race conditions with other LCP-related functions. This delay
// happens outside of the main JavaScript execution and will only effect the timing
// on when the warning becomes visible in the console.
const SCAN_DELAY = 200;

const OVERSIZED_IMAGE_TOLERANCE = 1200;

@Injectable({providedIn: 'root'})
export class ImagePerformanceWarning implements OnDestroy {
  // Map of full image URLs -> original `ngSrc` values.
  private window: Window | null = null;
  private observer: PerformanceObserver | null = null;
  private options: ImageConfig = inject(IMAGE_CONFIG);
  private lcpImageUrl?: string;

  public start() {
    if (
      (typeof ngServerMode !== 'undefined' && ngServerMode) ||
      typeof PerformanceObserver === 'undefined' ||
      (this.options?.disableImageSizeWarning && this.options?.disableImageLazyLoadWarning)
    ) {
      return;
    }
    this.observer = this.initPerformanceObserver();
    const doc = getDocument();
    const win = doc.defaultView;
    if (win) {
      this.window = win;
      // Wait to avoid race conditions where LCP image triggers
      // load event before it's recorded by the performance observer
      const waitToScan = () => {
        setTimeout(this.scanImages.bind(this), SCAN_DELAY);
      };
      const setup = () => {
        // Consider the case when the application is created and destroyed multiple times.
        // Typically, applications are created instantly once the page is loaded, and the
        // `window.load` listener is always triggered. However, the `window.load` event will never
        // be fired if the page is loaded, and the application is created later. Checking for
        // `readyState` is the easiest way to determine whether the page has been loaded or not.
        if (doc.readyState === 'complete') {
          waitToScan();
        } else {
          this.window?.addEventListener('load', waitToScan, {once: true});
        }
      };
      // Angular doesn't have to run change detection whenever any asynchronous tasks are invoked in
      // the scope of this functionality.
      if (typeof Zone !== 'undefined') {
        Zone.root.run(() => setup());
      } else {
        setup();
      }
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private initPerformanceObserver(): PerformanceObserver | null {
    if (typeof PerformanceObserver === 'undefined') {
      return null;
    }
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

      // Exclude `data:` and `blob:` URLs, since they are fetched resources.
      if (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:')) return;
      this.lcpImageUrl = imgSrc;
    });
    observer.observe({type: 'largest-contentful-paint', buffered: true});
    return observer;
  }

  private scanImages(): void {
    const images = getDocument().querySelectorAll('img');
    let lcpElementFound,
      lcpElementLoadedCorrectly = false;
    images.forEach((image) => {
      if (!this.options?.disableImageSizeWarning) {
        // Image elements using the NgOptimizedImage directive are excluded,
        // as that directive has its own version of this check.
        if (!image.getAttribute('ng-img') && this.isOversized(image)) {
          logOversizedImageWarning(image.src);
        }
      }
      if (!this.options?.disableImageLazyLoadWarning && this.lcpImageUrl) {
        if (image.src === this.lcpImageUrl) {
          lcpElementFound = true;
          if (image.loading !== 'lazy' || image.getAttribute('ng-img')) {
            // This variable is set to true and never goes back to false to account
            // for the case where multiple images have the same src url, and some
            // have lazy loading while others don't.
            // Also ignore NgOptimizedImage because there's a different warning for that.
            lcpElementLoadedCorrectly = true;
          }
        }
      }
    });
    if (
      lcpElementFound &&
      !lcpElementLoadedCorrectly &&
      this.lcpImageUrl &&
      !this.options?.disableImageLazyLoadWarning
    ) {
      logLazyLCPWarning(this.lcpImageUrl);
    }
  }

  private isOversized(image: HTMLImageElement): boolean {
    if (!this.window) {
      return false;
    }

    // The `isOversized` check may not be applicable or may require adjustments
    // for several types of image formats or scenarios. Currently, we specify only
    // `svg`, but this may also include `gif` since their quality isn’t tied to
    // dimensions in the same way as raster images.
    const nonOversizedImageExtentions = [
      // SVG images are vector-based, which means they can scale
      // to any size without losing quality.
      '.svg',
    ];

    // Convert it to lowercase because this may have uppercase
    // extensions, such as `IMAGE.SVG`.
    // We fallback to an empty string because `src` may be `undefined`
    // if it is explicitly set to `null` by some third-party code
    // (e.g., `image.src = null`).
    const imageSource = (image.src || '').toLowerCase();

    if (nonOversizedImageExtentions.some((extension) => imageSource.endsWith(extension))) {
      return false;
    }

    const computedStyle = this.window.getComputedStyle(image);
    let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
    let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
    const boxSizing = computedStyle.getPropertyValue('box-sizing');
    const objectFit = computedStyle.getPropertyValue('object-fit');

    if (objectFit === `cover`) {
      // Object fit cover may indicate a use case such as a sprite sheet where
      // this warning does not apply.
      return false;
    }

    if (boxSizing === 'border-box') {
      // If the image `box-sizing` is set to `border-box`, we adjust the rendered
      // dimensions by subtracting padding values.
      const paddingTop = computedStyle.getPropertyValue('padding-top');
      const paddingRight = computedStyle.getPropertyValue('padding-right');
      const paddingBottom = computedStyle.getPropertyValue('padding-bottom');
      const paddingLeft = computedStyle.getPropertyValue('padding-left');
      renderedWidth -= parseFloat(paddingRight) + parseFloat(paddingLeft);
      renderedHeight -= parseFloat(paddingTop) + parseFloat(paddingBottom);
    }

    const intrinsicWidth = image.naturalWidth;
    const intrinsicHeight = image.naturalHeight;

    const recommendedWidth = this.window.devicePixelRatio * renderedWidth;
    const recommendedHeight = this.window.devicePixelRatio * renderedHeight;
    const oversizedWidth = intrinsicWidth - recommendedWidth >= OVERSIZED_IMAGE_TOLERANCE;
    const oversizedHeight = intrinsicHeight - recommendedHeight >= OVERSIZED_IMAGE_TOLERANCE;
    return oversizedWidth || oversizedHeight;
  }
}

function logLazyLCPWarning(src: string) {
  console.warn(
    formatRuntimeError(
      RuntimeErrorCode.IMAGE_PERFORMANCE_WARNING,
      `An image with src ${src} is the Largest Contentful Paint (LCP) element ` +
        `but was given a "loading" value of "lazy", which can negatively impact ` +
        `application loading performance. This warning can be addressed by ` +
        `changing the loading value of the LCP image to "eager", or by using the ` +
        `NgOptimizedImage directive's prioritization utilities. For more ` +
        `information about addressing or disabling this warning, see ` +
        `https://angular.dev/errors/NG0913`,
    ),
  );
}

function logOversizedImageWarning(src: string) {
  console.warn(
    formatRuntimeError(
      RuntimeErrorCode.IMAGE_PERFORMANCE_WARNING,
      `An image with src ${src} has intrinsic file dimensions much larger than its ` +
        `rendered size. This can negatively impact application loading performance. ` +
        `For more information about addressing or disabling this warning, see ` +
        `https://angular.dev/errors/NG0913`,
    ),
  );
}
