/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ApplicationRef, ComponentRef } from '@angular/core';
export declare class ChangeDetectionPerfRecord {
    msPerTick: number;
    numTicks: number;
    constructor(msPerTick: number, numTicks: number);
}
/**
 * Entry point for all Angular profiling-related debug tools. This object
 * corresponds to the `ng.profiler` in the dev console.
 */
export declare class AngularProfiler {
    appRef: ApplicationRef;
    constructor(ref: ComponentRef<any>);
    /**
     * Exercises change detection in a loop and then prints the average amount of
     * time in milliseconds how long a single round of change detection takes for
     * the current state of the UI. It runs a minimum of 5 rounds for a minimum
     * of 500 milliseconds.
     *
     * Optionally, a user may pass a `config` parameter containing a map of
     * options. Supported options are:
     *
     * `record` (boolean) - causes the profiler to record a CPU profile while
     * it exercises the change detector. Example:
     *
     * ```ts
     * ng.profiler.timeChangeDetection({record: true})
     * ```
     */
    timeChangeDetection(config: any): ChangeDetectionPerfRecord;
}
