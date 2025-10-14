/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare const PERFORMANCE_MARK_PREFIX = "\uD83C\uDD70\uFE0F";
/**
 * Function that will start measuring against the performance API
 * Should be used in pair with stopMeasuring
 */
export declare function startMeasuring<T>(label: string): void;
/**
 * Function that will stop measuring against the performance API
 * Should be used in pair with startMeasuring
 */
export declare function stopMeasuring(label: string): void;
export declare function labels(label: string): {
    labelName: string;
    startLabel: string;
    endLabel: string;
};
/**
 * This enables an internal performance profiler
 *
 * It should not be imported in application code
 */
export declare function enableProfiling(): void;
export declare function disableProfiling(): void;
