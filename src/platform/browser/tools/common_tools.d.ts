import { ApplicationRef } from 'angular2/src/core/application_ref';
import { ComponentRef } from 'angular2/src/core/linker/dynamic_component_loader';
/**
 * Entry point for all Angular debug tools. This object corresponds to the `ng`
 * global variable accessible in the dev console.
 */
export declare class AngularTools {
    profiler: AngularProfiler;
    constructor(ref: ComponentRef);
}
/**
 * Entry point for all Angular profiling-related debug tools. This object
 * corresponds to the `ng.profiler` in the dev console.
 */
export declare class AngularProfiler {
    appRef: ApplicationRef;
    constructor(ref: ComponentRef);
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
     * ```
     * ng.profiler.timeChangeDetection({record: true})
     * ```
     */
    timeChangeDetection(config: any): void;
}
