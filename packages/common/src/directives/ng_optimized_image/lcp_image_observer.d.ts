/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { OnDestroy } from '@angular/core';
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
export declare class LCPImageObserver implements OnDestroy {
    private images;
    private window;
    private observer;
    constructor();
    /**
     * Inits PerformanceObserver and subscribes to LCP events.
     * Based on https://web.dev/lcp/#measure-lcp-in-javascript
     */
    private initPerformanceObserver;
    registerImage(rewrittenSrc: string, originalNgSrc: string, isPriority: boolean): void;
    unregisterImage(rewrittenSrc: string): void;
    updateImage(originalSrc: string, newSrc: string): void;
    ngOnDestroy(): void;
}
