import { ComponentRef } from 'angular2/src/core/linker/component_factory';
/**
 * Enabled Angular 2 debug tools that are accessible via your browser's
 * developer console.
 *
 * Usage:
 *
 * 1. Open developer console (e.g. in Chrome Ctrl + Shift + j)
 * 1. Type `ng.` (usually the console will show auto-complete suggestion)
 * 1. Try the change detection profiler `ng.profiler.timeChangeDetection()`
 *    then hit Enter.
 */
export declare function enableDebugTools(ref: ComponentRef<any>): void;
/**
 * Disables Angular 2 tools.
 */
export declare function disableDebugTools(): void;
