/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ɵProfilerEvent } from '@angular/core';
import { NodeArray } from '../identity-tracker';
import { Hooks, Profiler } from './shared';
/** Implementation of Profiler that utilizes framework APIs fire profiler hooks. */
export declare class NgProfiler extends Profiler {
    private _tracker;
    private _callbacks;
    private _lastDirectiveInstance;
    constructor(config?: Partial<Hooks>);
    private _initialize;
    private _setProfilerCallback;
    destroy(): void;
    onIndexForest(newNodes: NodeArray, removedNodes: NodeArray): void;
    [ɵProfilerEvent.BootstrapApplicationStart](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.BootstrapApplicationEnd](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.BootstrapComponentStart](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.BootstrapComponentEnd](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.ChangeDetectionStart](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.ChangeDetectionEnd](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.ChangeDetectionSyncStart](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.ChangeDetectionSyncEnd](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.AfterRenderHooksStart](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.AfterRenderHooksEnd](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.ComponentStart](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.ComponentEnd](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.DeferBlockStateStart](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.DeferBlockStateEnd](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.DynamicComponentStart](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.DynamicComponentEnd](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.HostBindingsUpdateStart](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.HostBindingsUpdateEnd](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.TemplateCreateStart](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.TemplateCreateEnd](_directive: any, _eventFn: any): void;
    [ɵProfilerEvent.TemplateUpdateStart](context: any, _eventFn: any): void;
    [ɵProfilerEvent.TemplateUpdateEnd](context: any, _eventFn: any): void;
    [ɵProfilerEvent.LifecycleHookStart](directive: any, hook: any): void;
    [ɵProfilerEvent.LifecycleHookEnd](directive: any, hook: any): void;
    [ɵProfilerEvent.OutputStart](componentOrDirective: any, listener: () => void): void;
    [ɵProfilerEvent.OutputEnd](componentOrDirective: any, listener: () => void): void;
}
