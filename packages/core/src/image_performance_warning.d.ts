/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { OnDestroy } from './interface/lifecycle_hooks';
export declare class ImagePerformanceWarning implements OnDestroy {
    private window;
    private observer;
    private options;
    private lcpImageUrl?;
    start(): void;
    ngOnDestroy(): void;
    private initPerformanceObserver;
    private scanImages;
    private isOversized;
}
