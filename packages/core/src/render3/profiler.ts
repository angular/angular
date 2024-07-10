/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {type Profiler} from './profiler_types';

let profilerCallback: Profiler | null = null;

/**
 * Sets the callback function which will be invoked before and after performing certain actions at
 * runtime (for example, before and after running change detection).
 *
 * Warning: this function is *INTERNAL* and should not be relied upon in application's code.
 * The contract of the function might be changed in any release and/or the function can be removed
 * completely.
 *
 * @param profiler function provided by the caller or null value to disable profiling.
 */
export const setProfiler = (profiler: Profiler | null) => {
  profilerCallback = profiler;
};

/**
 * Profiler function which wraps user code executed by the runtime.
 *
 * @param event ProfilerEvent corresponding to the execution context
 * @param instance component instance
 * @param hookOrListener lifecycle hook function or output listener. The value depends on the
 *  execution context
 * @returns
 */
export const profiler: Profiler = function (event, instance, hookOrListener) {
  if (profilerCallback != null /* both `null` and `undefined` */) {
    profilerCallback(event, instance, hookOrListener);
  }
};
