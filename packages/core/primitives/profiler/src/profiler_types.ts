/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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

  /**
   * Corresponds to the point in time just before application bootstrap.
   */
  BootstrapApplicationStart,

  /**
   * Corresponds to the point in time after application bootstrap.
   */
  BootstrapApplicationEnd,

  /**
   * Corresponds to the point in time just before root component bootstrap.
   */
  BootstrapComponentStart,

  /**
   * Corresponds to the point in time after root component bootstrap.
   */
  BootstrapComponentEnd,

  /**
   * Corresponds to the point in time just before Angular starts a change detection tick.
   */
  ChangeDetectionStart,

  /**
   * Corresponds to the point in time after Angular ended a change detection tick.
   */
  ChangeDetectionEnd,

  /**
   * Corresponds to the point in time just before Angular starts a new synchronization pass of change detection tick.
   */
  ChangeDetectionSyncStart,

  /**
   * Corresponds to the point in time after Angular ended a synchronization pass.
   */
  ChangeDetectionSyncEnd,

  /**
   * Corresponds to the point in time just before Angular executes after render hooks.
   */
  AfterRenderHooksStart,

  /**
   * Corresponds to the point in time after Angular executed after render hooks.
   */
  AfterRenderHooksEnd,

  /**
   * Corresponds to the point in time just before Angular starts processing a component (create or update).
   */
  ComponentStart,

  /**
   * Corresponds to the point in time after Angular finished processing a component.
   */
  ComponentEnd,

  /**
   * Corresponds to the point in time just before a defer block transitions between states.
   */
  DeferBlockStateStart,

  /**
   * Corresponds to the point in time after a defer block transitioned between states.
   */
  DeferBlockStateEnd,

  /**
   * Corresponds to the point in time just before a component instance is created dynamically.
   */
  DynamicComponentStart,

  /**
   * Corresponds to the point in time after a a component instance is created dynamically.
   */
  DynamicComponentEnd,

  /**
   * Corresponds to the point in time before the runtime has called the host bindings function
   * of a directive.
   */
  HostBindingsUpdateStart,

  /**
   * Corresponds to the point in time after the runtime has called the host bindings function
   * of a directive.
   */
  HostBindingsUpdateEnd,
}

/**
 * Profiler function which the runtime will invoke before and after user code.
 */
export interface Profiler {
  (event: ProfilerEvent, instance?: {} | null, eventFn?: Function): void;
}
