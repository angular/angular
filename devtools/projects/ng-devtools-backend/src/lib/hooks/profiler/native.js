/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getDirectiveHostElement} from '../../directive-forest';
import {ngDebugClient} from '../../ng-debug-api/ng-debug-api';
import {runOutsideAngular} from '../../utils';
import {IdentityTracker} from '../identity-tracker';
import {getLifeCycleName, Profiler} from './shared';
/** Implementation of Profiler that utilizes framework APIs fire profiler hooks. */
export class NgProfiler extends Profiler {
  constructor(config = {}) {
    super(config);
    this._tracker = IdentityTracker.getInstance();
    this._callbacks = [];
    this._lastDirectiveInstance = null;
    this._setProfilerCallback((event, instanceOrLView, eventFn) => {
      if (this[event] === undefined) {
        return;
      }
      this[event](instanceOrLView, eventFn);
    });
    this._initialize();
  }
  _initialize() {
    ngDebugClient().ɵsetProfiler((event, instanceOrLView = null, eventFn) =>
      this._callbacks.forEach((cb) => cb(event, instanceOrLView, eventFn)),
    );
  }
  _setProfilerCallback(callback) {
    this._callbacks.push(callback);
  }
  destroy() {
    this._tracker.destroy();
  }
  onIndexForest(newNodes, removedNodes) {
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
  [8 /* ɵProfilerEvent.BootstrapApplicationStart */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [9 /* ɵProfilerEvent.BootstrapApplicationEnd */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [10 /* ɵProfilerEvent.BootstrapComponentStart */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [11 /* ɵProfilerEvent.BootstrapComponentEnd */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [12 /* ɵProfilerEvent.ChangeDetectionStart */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [13 /* ɵProfilerEvent.ChangeDetectionEnd */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [14 /* ɵProfilerEvent.ChangeDetectionSyncStart */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [15 /* ɵProfilerEvent.ChangeDetectionSyncEnd */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [16 /* ɵProfilerEvent.AfterRenderHooksStart */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [17 /* ɵProfilerEvent.AfterRenderHooksEnd */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [18 /* ɵProfilerEvent.ComponentStart */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [19 /* ɵProfilerEvent.ComponentEnd */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [20 /* ɵProfilerEvent.DeferBlockStateStart */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [21 /* ɵProfilerEvent.DeferBlockStateEnd */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [22 /* ɵProfilerEvent.DynamicComponentStart */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [23 /* ɵProfilerEvent.DynamicComponentEnd */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [24 /* ɵProfilerEvent.HostBindingsUpdateStart */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [25 /* ɵProfilerEvent.HostBindingsUpdateEnd */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [0 /* ɵProfilerEvent.TemplateCreateStart */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [1 /* ɵProfilerEvent.TemplateCreateEnd */](_directive, _eventFn) {
    // todo: implement
    return;
  }
  [2 /* ɵProfilerEvent.TemplateUpdateStart */](context, _eventFn) {
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
  [3 /* ɵProfilerEvent.TemplateUpdateEnd */](context, _eventFn) {
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
  [4 /* ɵProfilerEvent.LifecycleHookStart */](directive, hook) {
    const id = this._tracker.getDirectiveId(directive);
    const element = getDirectiveHostElement(directive);
    const lifecycleHookName = getLifeCycleName(directive, hook);
    const isComponent = !!this._tracker.isComponent.get(directive);
    this._onLifecycleHookStart(directive, lifecycleHookName, element, id, isComponent);
  }
  [5 /* ɵProfilerEvent.LifecycleHookEnd */](directive, hook) {
    const id = this._tracker.getDirectiveId(directive);
    const element = getDirectiveHostElement(directive);
    const lifecycleHookName = getLifeCycleName(directive, hook);
    const isComponent = !!this._tracker.isComponent.get(directive);
    this._onLifecycleHookEnd(directive, lifecycleHookName, element, id, isComponent);
  }
  [6 /* ɵProfilerEvent.OutputStart */](componentOrDirective, listener) {
    const isComponent = !!this._tracker.isComponent.get(componentOrDirective);
    const node = getDirectiveHostElement(componentOrDirective);
    const id = this._tracker.getDirectiveId(componentOrDirective);
    this._onOutputStart(componentOrDirective, listener.name, node, id, isComponent);
  }
  [7 /* ɵProfilerEvent.OutputEnd */](componentOrDirective, listener) {
    const isComponent = !!this._tracker.isComponent.get(componentOrDirective);
    const node = getDirectiveHostElement(componentOrDirective);
    const id = this._tracker.getDirectiveId(componentOrDirective);
    this._onOutputEnd(componentOrDirective, listener.name, node, id, isComponent);
  }
}
//# sourceMappingURL=native.js.map
