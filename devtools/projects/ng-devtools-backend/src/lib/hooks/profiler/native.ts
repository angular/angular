/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵProfilerEvent} from '@angular/core';

import {getDirectiveHostElement} from '../../directive-forest';
import {ngDebugClient} from '../../ng-debug-api/ng-debug-api';
import {runOutsideAngular} from '../../utils';
import {IdentityTracker, NodeArray} from '../identity-tracker';

import {getLifeCycleName, Hooks, Profiler} from './shared';

type ProfilerCallback = (event: ɵProfilerEvent, instanceOrLView: {} | null, eventFn: any) => void;

/** Implementation of Profiler that utilizes framework APIs fire profiler hooks. */
export class NgProfiler extends Profiler {
  private _tracker = IdentityTracker.getInstance();
  private _callbacks: ProfilerCallback[] = [];
  private _lastDirectiveInstance: {} | null = null;

  constructor(config: Partial<Hooks> = {}) {
    super(config);
    this._setProfilerCallback((event: ɵProfilerEvent, instanceOrLView: {} | null, eventFn: any) => {
      if (this[event] === undefined) {
        return;
      }

      this[event](instanceOrLView, eventFn);
    });
    this._initialize();
  }

  private _initialize(): void {
    ngDebugClient().ɵsetProfiler!(
      (event: ɵProfilerEvent, instanceOrLView: {} | null = null, eventFn: any) =>
        this._callbacks.forEach((cb) => cb(event, instanceOrLView, eventFn)),
    );
  }

  private _setProfilerCallback(callback: ProfilerCallback): void {
    this._callbacks.push(callback);
  }

  override destroy(): void {
    this._tracker.destroy();
  }

  override onIndexForest(newNodes: NodeArray, removedNodes: NodeArray): void {
    newNodes.forEach((node) => {
      const {directive, isComponent} = node;

      const position = this._tracker.getDirectivePosition(directive);
      const id = this._tracker.getDirectiveId(directive);
      this._onCreate(directive, getDirectiveHostElement(directive), id, isComponent, position);
    });

    removedNodes.forEach((node) => {
      const {directive, isComponent} = node;

      const position = this._tracker.getDirectivePosition(directive);
      const id = this._tracker.getDirectiveId(directive);
      this._onDestroy(directive, getDirectiveHostElement(directive), id, isComponent, position);
    });
  }

  [ɵProfilerEvent.BootstrapApplicationStart](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.BootstrapApplicationEnd](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.BootstrapComponentStart](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.BootstrapComponentEnd](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.ChangeDetectionStart](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.ChangeDetectionEnd](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.ChangeDetectionSyncStart](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.ChangeDetectionSyncEnd](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.AfterRenderHooksStart](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.AfterRenderHooksEnd](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.ComponentStart](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.ComponentEnd](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.DeferBlockStateStart](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.DeferBlockStateEnd](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.DynamicComponentStart](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.DynamicComponentEnd](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.HostBindingsUpdateStart](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.HostBindingsUpdateEnd](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.TemplateCreateStart](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.TemplateCreateEnd](_directive: any, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.TemplateUpdateStart](context: any, _eventFn: any): void {
    if (!this._inChangeDetection) {
      this._inChangeDetection = true;
      runOutsideAngular(() => {
        Promise.resolve().then(() => {
          this.changeDetection$.next();
          this._inChangeDetection = false;
        });
      });
    }

    const position = this._tracker.getDirectivePosition(context);
    const id = this._tracker.getDirectiveId(context);

    // If we can find the position and the ID we assume that this is a component instance.
    // Alternatively, if we can't find the ID or the position, we assume that this is a
    // context of an embedded view (for example, NgForOfContext, NgIfContext, or a custom one).
    if (position !== undefined && id !== undefined) {
      this._lastDirectiveInstance = context;
    }

    if (id !== undefined && position !== undefined) {
      this._onChangeDetectionStart(context, getDirectiveHostElement(context), id, position);
      return;
    }

    this._onChangeDetectionStart(
      this._lastDirectiveInstance,
      getDirectiveHostElement(this._lastDirectiveInstance),
      this._tracker.getDirectiveId(this._lastDirectiveInstance),
      this._tracker.getDirectivePosition(this._lastDirectiveInstance),
    );
  }

  [ɵProfilerEvent.TemplateUpdateEnd](context: any, _eventFn: any): void {
    const position = this._tracker.getDirectivePosition(context);
    const id = this._tracker.getDirectiveId(context);

    if (this._tracker.hasDirective(context) && id !== undefined && position !== undefined) {
      this._onChangeDetectionEnd(context, getDirectiveHostElement(context), id, position);
      return;
    }

    this._onChangeDetectionEnd(
      this._lastDirectiveInstance,
      getDirectiveHostElement(this._lastDirectiveInstance),
      this._tracker.getDirectiveId(this._lastDirectiveInstance),
      this._tracker.getDirectivePosition(this._lastDirectiveInstance),
    );
  }

  [ɵProfilerEvent.LifecycleHookStart](directive: any, hook: any): void {
    const id = this._tracker.getDirectiveId(directive);
    const element = getDirectiveHostElement(directive);
    const lifecycleHookName = getLifeCycleName(directive, hook);
    const isComponent = !!this._tracker.isComponent.get(directive);

    this._onLifecycleHookStart(directive, lifecycleHookName, element, id, isComponent);
  }

  [ɵProfilerEvent.LifecycleHookEnd](directive: any, hook: any): void {
    const id = this._tracker.getDirectiveId(directive);
    const element = getDirectiveHostElement(directive);
    const lifecycleHookName = getLifeCycleName(directive, hook);
    const isComponent = !!this._tracker.isComponent.get(directive);

    this._onLifecycleHookEnd(directive, lifecycleHookName, element, id, isComponent);
  }

  [ɵProfilerEvent.OutputStart](componentOrDirective: any, listener: () => void): void {
    const isComponent = !!this._tracker.isComponent.get(componentOrDirective);
    const node = getDirectiveHostElement(componentOrDirective);
    const id = this._tracker.getDirectiveId(componentOrDirective);
    this._onOutputStart(componentOrDirective, listener.name, node, id, isComponent);
  }

  [ɵProfilerEvent.OutputEnd](componentOrDirective: any, listener: () => void): void {
    const isComponent = !!this._tracker.isComponent.get(componentOrDirective);
    const node = getDirectiveHostElement(componentOrDirective);
    const id = this._tracker.getDirectiveId(componentOrDirective);
    this._onOutputEnd(componentOrDirective, listener.name, node, id, isComponent);
  }
}
