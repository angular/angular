/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵProfilerEvent} from '@angular/core';
import {ngDebugClient} from '../../shared/ng-debug-api/ng-debug-api';
import {runOutsideAngular} from '../../shared/utils/general';
import {IdentityTracker, NodeArray} from '../../directive-forest/identity-tracker/identity-tracker';

import {getLifeCycleName, Hooks, Profiler} from './shared';
import {DirectiveInstance} from '../../shared/interfaces';
import {getDirectiveHostElement} from '../../directive-forest/tree-strategies/ltree';

type ProfilerCallback = (event: ɵProfilerEvent, instanceOrLView: {} | null, eventFn: any) => void;

/** Implementation of Profiler that utilizes framework APIs fire profiler hooks. */
export class NgProfiler extends Profiler {
  private tracker = IdentityTracker.getInstance();
  private callbacks: ProfilerCallback[] = [];
  private lastDirectiveInstance: {} | null = null;

  constructor(config: Partial<Hooks> = {}) {
    super(config);
    this.setProfilerCallback((event: ɵProfilerEvent, instanceOrLView: {} | null, eventFn: any) => {
      if (this[event] === undefined) {
        return;
      }

      this[event](instanceOrLView, eventFn);
    });
    this.initialize();
  }

  private initialize(): void {
    ngDebugClient().ɵsetProfiler!(
      (event: ɵProfilerEvent, instanceOrLView: {} | null = null, eventFn: any) =>
        this.callbacks.forEach((cb) => cb(event, instanceOrLView, eventFn)),
    );
  }

  private setProfilerCallback(callback: ProfilerCallback): void {
    this.callbacks.push(callback);
  }

  override destroy(): void {
    this.tracker.destroy();
  }

  override onIndexForest(newNodes: NodeArray, removedNodes: NodeArray): void {
    newNodes.forEach((node) => {
      const {directive, isComponent} = node;

      const position = this.tracker.getDirectivePosition(directive);
      const id = this.tracker.getDirectiveId(directive);
      this.onCreate(directive, getDirectiveHostElement(directive), id, isComponent, position);
    });

    removedNodes.forEach((node) => {
      const {directive, isComponent} = node;

      const position = this.tracker.getDirectivePosition(directive);
      const id = this.tracker.getDirectiveId(directive);
      this.onDestroy(directive, getDirectiveHostElement(directive), id, isComponent, position);
    });
  }

  [ɵProfilerEvent.BootstrapApplicationStart](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.BootstrapApplicationEnd](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.BootstrapComponentStart](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.BootstrapComponentEnd](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.ChangeDetectionStart](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.ChangeDetectionEnd](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.ChangeDetectionSyncStart](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.ChangeDetectionSyncEnd](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.AfterRenderHooksStart](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.AfterRenderHooksEnd](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.ComponentStart](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.ComponentEnd](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.DeferBlockStateStart](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.DeferBlockStateEnd](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.DynamicComponentStart](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.DynamicComponentEnd](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.HostBindingsUpdateStart](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.HostBindingsUpdateEnd](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.TemplateCreateStart](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.TemplateCreateEnd](_directive: DirectiveInstance, _eventFn: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.TemplateUpdateStart](context: DirectiveInstance, _eventFn: any): void {
    if (!this.inChangeDetection) {
      this.inChangeDetection = true;
      runOutsideAngular(() => {
        Promise.resolve().then(() => {
          this.changeDetection$.next();
          this.inChangeDetection = false;
        });
      });
    }

    const position = this.tracker.getDirectivePosition(context);
    const id = this.tracker.getDirectiveId(context);

    // If we can find the position and the ID we assume that this is a component instance.
    // Alternatively, if we can't find the ID or the position, we assume that this is a
    // context of an embedded view (for example, NgForOfContext, NgIfContext, or a custom one).
    if (position !== undefined && id !== undefined) {
      this.lastDirectiveInstance = context;
    }

    if (id !== undefined && position !== undefined) {
      this.onChangeDetectionStart(context, getDirectiveHostElement(context), id, position);
      return;
    }

    this.onChangeDetectionStart(
      this.lastDirectiveInstance,
      getDirectiveHostElement(this.lastDirectiveInstance),
      this.tracker.getDirectiveId(this.lastDirectiveInstance),
      this.tracker.getDirectivePosition(this.lastDirectiveInstance),
    );
  }

  [ɵProfilerEvent.TemplateUpdateEnd](context: any, _eventFn: any): void {
    const position = this.tracker.getDirectivePosition(context);
    const id = this.tracker.getDirectiveId(context);

    if (this.tracker.hasDirective(context) && id !== undefined && position !== undefined) {
      this.onChangeDetectionEnd(context, getDirectiveHostElement(context), id, position);
      return;
    }

    this.onChangeDetectionEnd(
      this.lastDirectiveInstance,
      getDirectiveHostElement(this.lastDirectiveInstance),
      this.tracker.getDirectiveId(this.lastDirectiveInstance),
      this.tracker.getDirectivePosition(this.lastDirectiveInstance),
    );
  }

  [ɵProfilerEvent.LifecycleHookStart](directive: DirectiveInstance, hook: any): void {
    const id = this.tracker.getDirectiveId(directive);
    const element = getDirectiveHostElement(directive);
    const lifecycleHookName = getLifeCycleName(directive, hook);
    const isComponent = !!this.tracker.isComponent.get(directive);

    this.onLifecycleHookStart(directive, lifecycleHookName, element, id, isComponent);
  }

  [ɵProfilerEvent.LifecycleHookEnd](directive: DirectiveInstance, hook: any): void {
    const id = this.tracker.getDirectiveId(directive);
    const element = getDirectiveHostElement(directive);
    const lifecycleHookName = getLifeCycleName(directive, hook);
    const isComponent = !!this.tracker.isComponent.get(directive);

    this.onLifecycleHookEnd(directive, lifecycleHookName, element, id, isComponent);
  }

  [ɵProfilerEvent.OutputStart](
    componentOrDirective: DirectiveInstance,
    listener: () => void,
  ): void {
    const isComponent = !!this.tracker.isComponent.get(componentOrDirective);
    const node = getDirectiveHostElement(componentOrDirective);
    const id = this.tracker.getDirectiveId(componentOrDirective);
    this.onOutputStart(componentOrDirective, listener.name, node, id, isComponent);
  }

  [ɵProfilerEvent.OutputEnd](componentOrDirective: DirectiveInstance, listener: () => void): void {
    const isComponent = !!this.tracker.isComponent.get(componentOrDirective);
    const node = getDirectiveHostElement(componentOrDirective);
    const id = this.tracker.getDirectiveId(componentOrDirective);
    this.onOutputEnd(componentOrDirective, listener.name, node, id, isComponent);
  }
}
