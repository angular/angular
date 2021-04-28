import { ɵProfilerEvent } from '@angular/core';
import { getDirectiveHostElement } from '../../directive-forest';
import { runOutsideAngular } from '../../utils';
import { IdentityTracker, NodeArray } from '../identity-tracker';
import { getLifeCycleName, Hooks, Profiler } from './shared';

type ProfilerCallback = (event: ɵProfilerEvent, instanceOrLView: {}, hookOrListener: any) => void;

/** Implementation of Profiler that utilizes framework APIs fire profiler hooks. */
export class NgProfiler extends Profiler {
  private _tracker = IdentityTracker.getInstance();
  private _callbacks: ProfilerCallback[] = [];

  constructor(config: Partial<Hooks> = {}) {
    super(config);
    this._setProfilerCallback((event: ɵProfilerEvent, instanceOrLView: {}, hookOrListener: any) => {
      if (this[event] === undefined) {
        return;
      }

      this[event](instanceOrLView, hookOrListener);
    });
    this._initialize();
  }

  private _initialize() {
    const ng = (window as any).ng;
    ng.ɵsetProfiler((event: ɵProfilerEvent, instanceOrLView: {}, hookOrListener: any) =>
      this._callbacks.forEach((cb) => cb(event, instanceOrLView, hookOrListener))
    );
  }

  private _setProfilerCallback(callback: ProfilerCallback) {
    this._callbacks.push(callback);
  }

  destroy(): void {
    this._tracker.destroy();
  }

  onIndexForest(newNodes: NodeArray, removedNodes: NodeArray): void {
    newNodes.forEach((node) => {
      const { directive, isComponent } = node;

      const position = this._tracker.getDirectivePosition(directive);
      const id = this._tracker.getDirectiveId(directive);
      this._onCreate(directive, getDirectiveHostElement(directive), id, isComponent, position);
    });

    removedNodes.forEach((node) => {
      const { directive, isComponent } = node;

      const position = this._tracker.getDirectivePosition(directive);
      const id = this._tracker.getDirectiveId(directive);
      this._onDestroy(directive, getDirectiveHostElement(directive), id, isComponent, position);
    });
  }

  [ɵProfilerEvent.TemplateCreateStart](_directive: any, _hookOrListener: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.TemplateCreateEnd](_directive: any, _hookOrListener: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.TemplateUpdateStart](directive: any, _hookOrListener: any): void {
    if (!this._inChangeDetection) {
      this._inChangeDetection = true;
      runOutsideAngular(() => {
        Promise.resolve().then(() => {
          this.changeDetection$.next();
          this._inChangeDetection = false;
        });
      });
    }

    const position = this._tracker.getDirectivePosition(directive);
    const id = this._tracker.getDirectiveId(directive);

    this._onChangeDetectionStart(directive, getDirectiveHostElement(directive), id, position);
  }

  [ɵProfilerEvent.TemplateUpdateEnd](directive: any, _hookOrListener: any): void {
    const position = this._tracker.getDirectivePosition(directive);
    const id = this._tracker.getDirectiveId(directive);

    if (this._tracker.hasDirective(directive) && id !== undefined && position !== undefined) {
      this._onChangeDetectionEnd(directive, getDirectiveHostElement(directive), id, position);
    }
  }

  [ɵProfilerEvent.LifecycleHookStart](directive: any, hookOrListener: any): void {
    const id = this._tracker.getDirectiveId(directive);
    const element = getDirectiveHostElement(directive);
    const lifecycleHookName = getLifeCycleName(directive, hookOrListener);
    const isComponent = !!this._tracker.isComponent.get(directive);

    this._onLifecycleHookStart(directive, lifecycleHookName, element, id, isComponent);
  }

  [ɵProfilerEvent.LifecycleHookEnd](directive: any, hookOrListener: any): void {
    const id = this._tracker.getDirectiveId(directive);
    const element = getDirectiveHostElement(directive);
    const lifecycleHookName = getLifeCycleName(directive, hookOrListener);
    const isComponent = !!this._tracker.isComponent.get(directive);

    this._onLifecycleHookEnd(directive, lifecycleHookName, element, id, isComponent);
  }

  [ɵProfilerEvent.OutputStart](_directive: any, _hookOrListener: any): void {
    // todo: implement
    return;
  }

  [ɵProfilerEvent.OutputEnd](_directive: any, _hookOrListener: any): void {
    // todo: implement
    return;
  }
}
