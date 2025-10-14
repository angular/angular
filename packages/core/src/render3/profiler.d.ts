/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { type Profiler } from './profiler_types';
/**
 * Adds a callback function which will be invoked before and after performing certain actions at
 * runtime (for example, before and after running change detection). Multiple profiler callbacks can be set:
 * in this case profiling events are reported to every registered callback.
 *
 * Warning: this function is *INTERNAL* and should not be relied upon in application's code.
 * The contract of the function might be changed in any release and/or the function can be removed
 * completely.
 *
 * @param profiler function provided by the caller or null value to disable all profilers.
 * @returns a cleanup function that, when invoked, removes a given profiler callback.
 */
export declare function setProfiler(profiler: Profiler | null): () => void;
/**
 * Profiler function which wraps user code executed by the runtime.
 *
 * @param event ProfilerEvent corresponding to the execution context
 * @param instance component instance
 * @param eventFn function associated with event.
 *    For example a template function, lifecycle hook, or output listener.
 *    The value depends on the execution context
 */
export declare const profiler: Profiler;
