/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Profiler events is an enum used by the profiler to distinguish between different calls of user
 * code invoked throughout the application lifecycle.
 */
export declare const enum ProfilerEvent {
    /**
     * Corresponds to the point in time before the runtime has called the template function of a
     * component with `RenderFlags.Create`.
     */
    TemplateCreateStart = 0,
    /**
     * Corresponds to the point in time after the runtime has called the template function of a
     * component with `RenderFlags.Create`.
     */
    TemplateCreateEnd = 1,
    /**
     * Corresponds to the point in time before the runtime has called the template function of a
     * component with `RenderFlags.Update`.
     */
    TemplateUpdateStart = 2,
    /**
     * Corresponds to the point in time after the runtime has called the template function of a
     * component with `RenderFlags.Update`.
     */
    TemplateUpdateEnd = 3,
    /**
     * Corresponds to the point in time before the runtime has called a lifecycle hook of a component
     * or directive.
     */
    LifecycleHookStart = 4,
    /**
     * Corresponds to the point in time after the runtime has called a lifecycle hook of a component
     * or directive.
     */
    LifecycleHookEnd = 5,
    /**
     * Corresponds to the point in time before the runtime has evaluated an expression associated with
     * an event or an output.
     */
    OutputStart = 6,
    /**
     * Corresponds to the point in time after the runtime has evaluated an expression associated with
     * an event or an output.
     */
    OutputEnd = 7,
    /**
     * Corresponds to the point in time just before application bootstrap.
     */
    BootstrapApplicationStart = 8,
    /**
     * Corresponds to the point in time after application bootstrap.
     */
    BootstrapApplicationEnd = 9,
    /**
     * Corresponds to the point in time just before root component bootstrap.
     */
    BootstrapComponentStart = 10,
    /**
     * Corresponds to the point in time after root component bootstrap.
     */
    BootstrapComponentEnd = 11,
    /**
     * Corresponds to the point in time just before Angular starts a change detection tick.
     */
    ChangeDetectionStart = 12,
    /**
     * Corresponds to the point in time after Angular ended a change detection tick.
     */
    ChangeDetectionEnd = 13,
    /**
     * Corresponds to the point in time just before Angular starts a new synchronization pass of change detection tick.
     */
    ChangeDetectionSyncStart = 14,
    /**
     * Corresponds to the point in time after Angular ended a synchronization pass.
     */
    ChangeDetectionSyncEnd = 15,
    /**
     * Corresponds to the point in time just before Angular executes after render hooks.
     */
    AfterRenderHooksStart = 16,
    /**
     * Corresponds to the point in time after Angular executed after render hooks.
     */
    AfterRenderHooksEnd = 17,
    /**
     * Corresponds to the point in time just before Angular starts processing a component (create or update).
     */
    ComponentStart = 18,
    /**
     * Corresponds to the point in time after Angular finished processing a component.
     */
    ComponentEnd = 19,
    /**
     * Corresponds to the point in time just before a defer block transitions between states.
     */
    DeferBlockStateStart = 20,
    /**
     * Corresponds to the point in time after a defer block transitioned between states.
     */
    DeferBlockStateEnd = 21,
    /**
     * Corresponds to the point in time just before a component instance is created dynamically.
     */
    DynamicComponentStart = 22,
    /**
     * Corresponds to the point in time after a a component instance is created dynamically.
     */
    DynamicComponentEnd = 23,
    /**
     * Corresponds to the point in time before the runtime has called the host bindings function
     * of a directive.
     */
    HostBindingsUpdateStart = 24,
    /**
     * Corresponds to the point in time after the runtime has called the host bindings function
     * of a directive.
     */
    HostBindingsUpdateEnd = 25
}
/**
 * Profiler function which the runtime will invoke before and after user code.
 */
export interface Profiler {
    (event: ProfilerEvent, instance?: {} | null, eventFn?: Function): void;
}
