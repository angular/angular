/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Note: ideally we would roll these types into the `profiler.ts`. During the update to TS 5.5
// they had to be moved out into a separate file, because `@microsoft/api-extractor` was throwing
// an error saying `Unable to follow symbol for "Profiler"`.

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
  (event: ProfilerEvent, instance: {} | null, hookOrListener?: (e?: any) => any): void;
}
