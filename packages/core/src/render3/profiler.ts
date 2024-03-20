/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Profiler events is an enum used by the profiler to distinguish between different calls of user
 * code invoked throughout the application lifecycle.
 */
export const enum ProfilerEvent {
  /**
   * Corresponds to the point in time before the runtime has called the template function of a
   * component with `RenderFlags.Create`.
   */
  TemplateCreateStart,

  /**
   * Corresponds to the point in time after the runtime has called the template function of a
   * component with `RenderFlags.Create`.
   */
  TemplateCreateEnd,

  /**
   * Corresponds to the point in time before the runtime has called the template function of a
   * component with `RenderFlags.Update`.
   */
  TemplateUpdateStart,

  /**
   * Corresponds to the point in time after the runtime has called the template function of a
   * component with `RenderFlags.Update`.
   */
  TemplateUpdateEnd,

  /**
   * Corresponds to the point in time before the runtime has called a lifecycle hook of a component
   * or directive.
   */
  LifecycleHookStart,

  /**
   * Corresponds to the point in time after the runtime has called a lifecycle hook of a component
   * or directive.
   */
  LifecycleHookEnd,

  /**
   * Corresponds to the point in time before the runtime has evaluated an expression associated with
   * an event or an output.
   */
  OutputStart,

  /**
   * Corresponds to the point in time after the runtime has evaluated an expression associated with
   * an event or an output.
   */
  OutputEnd,
}

/**
 * Profiler function which the runtime will invoke before and after user code.
 */
export interface Profiler {
  (event: ProfilerEvent, instance: {}|null, hookOrListener?: (e?: any) => any): void;
}


let profilerCallback: Profiler|null = null;

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
export const setProfiler = (profiler: Profiler|null) => {
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
export const profiler: Profiler = function(
    event: ProfilerEvent, instance: {}|null, hookOrListener?: (e?: any) => any) {
  if (profilerCallback != null /* both `null` and `undefined` */) {
    profilerCallback(event, instance, hookOrListener);
  }
};
