import { ɵProfilerEvent } from '@angular/core';
import { ElementPosition, LifecycleProfile } from 'protocol';
import { Subject } from 'rxjs';
import {
  getDirectiveHostElement,
  getLViewFromDirectiveOrElementInstance,
  METADATA_PROPERTY_NAME,
} from '../directive-forest';
import { runOutsideAngular } from '../utils';
import { IdentityTracker, NodeArray } from './identity-tracker';

type CreationHook = (
  componentOrDirective: any,
  node: Node,
  id: number,
  isComponent: boolean,
  position: ElementPosition
) => void;

type LifecycleStartHook = (
  componentOrDirective: any,
  hook: keyof LifecycleProfile | 'unknown',
  node: Node,
  id: number,
  isComponent: boolean
) => void;

type LifecycleEndHook = (
  componentOrDirective: any,
  hook: keyof LifecycleProfile | 'unknown',
  node: Node,
  id: number,
  isComponent: boolean
) => void;

type ChangeDetectionStartHook = (component: any, node: Node, id: number, position: ElementPosition) => void;

type ChangeDetectionEndHook = (component: any, node: Node, id: number, position: ElementPosition) => void;

type DestroyHook = (
  componentOrDirective: any,
  node: Node,
  id: number,
  isComponent: boolean,
  position: ElementPosition
) => void;

export interface Hooks {
  onCreate: CreationHook;
  onDestroy: DestroyHook;
  onChangeDetectionStart: ChangeDetectionStartHook;
  onChangeDetectionEnd: ChangeDetectionEndHook;
  onLifecycleHookStart: LifecycleStartHook;
  onLifecycleHookEnd: LifecycleEndHook;
}

const ngProfilerCallbacks: ((event: ɵProfilerEvent, instanceOrLView: {}, hookOrListener: any) => void)[] = [];
export const setProfilerCallback = (cb: (event: ɵProfilerEvent, instanceOrLView: {}, hookOrListener: any) => void) => {
  ngProfilerCallbacks.push(cb);
};

/**
 * Factory method for creating profiler object.
 * Gives priority to NgProfiler, falls back on PatchingProfiler if framework APIs are not present.
 */
export const selectProfilerStrategy = (): Profiler => {
  const ng = (window as any).ng;
  if (typeof ng?.ɵsetProfiler === 'function') {
    ng.ɵsetProfiler((event: ɵProfilerEvent, instanceOrLView: {}, hookOrListener: any) =>
      ngProfilerCallbacks.forEach((cb) => cb(event, instanceOrLView, hookOrListener))
    );
    return new NgProfiler();
  }

  return new PatchingProfiler();
};

/**
 *  Class for profiling angular applications. Handles hook subscriptions and emitting change detection events.
 */
export abstract class Profiler {
  protected _inChangeDetection = false;
  changeDetection$ = new Subject<void>();

  private _hooks: Partial<Hooks>[] = [];

  constructor(config: Partial<Hooks> = {}) {
    this._hooks.push(config);
  }

  abstract destroy(): void;

  abstract onIndexForest(newNodes: NodeArray, removedNodes: NodeArray): void;

  subscribe(config: Partial<Hooks>): void {
    this._hooks.push(config);
  }

  unsubscribe(config: Partial<Hooks>): void {
    this._hooks.splice(this._hooks.indexOf(config), 1);
  }

  protected _onCreate(
    _: any,
    __: Node,
    id: number | undefined,
    ___: boolean,
    position: ElementPosition | undefined
  ): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onCreate', arguments);
  }

  protected _onDestroy(
    _: any,
    __: Node,
    id: number | undefined,
    ___: boolean,
    position: ElementPosition | undefined
  ): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onDestroy', arguments);
  }

  protected _onChangeDetectionStart(
    _: any,
    __: Node,
    id: number | undefined,
    position: ElementPosition | undefined
  ): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onChangeDetectionStart', arguments);
  }

  protected _onChangeDetectionEnd(
    _: any,
    __: Node,
    id: number | undefined,
    position: ElementPosition | undefined
  ): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onChangeDetectionEnd', arguments);
  }

  protected _onLifecycleHookStart(
    _: any,
    __: keyof LifecycleProfile | 'unknown',
    ___: Node,
    id: number | undefined,
    ____: boolean
  ): void {
    if (id === undefined) {
      return;
    }
    this._invokeCallback('onLifecycleHookStart', arguments);
  }

  protected _onLifecycleHookEnd(
    _: any,
    __: keyof LifecycleProfile | 'unknown',
    ___: Node,
    id: number | undefined,
    ____: boolean
  ): void {
    if (id === undefined) {
      return;
    }
    this._invokeCallback('onLifecycleHookEnd', arguments);
  }

  private _invokeCallback(name: keyof Hooks, args: IArguments): void {
    this._hooks.forEach((config) => {
      const cb = config[name];
      if (cb) {
        cb.apply(null, args);
      }
    });
  }
}

const hookNames = [
  'OnInit',
  'OnDestroy',
  'OnChanges',
  'DoCheck',
  'AfterContentInit',
  'AfterContentChecked',
  'AfterViewInit',
  'AfterViewChecked',
];

const hookMethodNames = new Set(hookNames.map((hook) => `ng${hook}`));

const hookTViewProperties = [
  'preOrderHooks',
  'preOrderCheckHooks',
  'contentHooks',
  'contentCheckHooks',
  'viewHooks',
  'viewCheckHooks',
  'destroyHooks',
];

// Only used in older Angular versions prior to the introduction of `getDirectiveMetadata`
const componentMetadata = (instance: any) => instance?.constructor?.ɵcmp;

const getLifeCycleName = (obj: {}, fn: any): keyof LifecycleProfile | 'unknown' => {
  const proto = Object.getPrototypeOf(obj);
  const keys = Object.getOwnPropertyNames(proto);
  for (const propName of keys) {
    // We don't want to touch random get accessors.
    if (!hookMethodNames.has(propName)) {
      continue;
    }
    if (proto[propName] === fn) {
      return propName as keyof LifecycleProfile;
    }
  }
  const fnName = fn.name;
  if (typeof fnName !== 'string') {
    return 'unknown';
  }
  for (const hookName of hookNames) {
    if (fnName.indexOf(hookName) >= 0) {
      return `ng${hookName}` as keyof LifecycleProfile;
    }
  }
  return 'unknown';
};

/** Implemenation of Profiler that uses monkey patching of directive templates and lifecycle methods to fire profiler hooks. */
class PatchingProfiler extends Profiler {
  private _patched = new Map<any, () => void>();
  private _undoLifecyclePatch: (() => void)[] = [];
  private _tracker = IdentityTracker.getInstance();

  destroy(): void {
    this._tracker.destroy();

    for (const [cmp, template] of this._patched) {
      const meta = componentMetadata(cmp);
      meta.template = template;
      meta.tView.template = template;
    }

    this._patched = new Map<any, () => void>();
    this._undoLifecyclePatch.forEach((p) => p());
    this._undoLifecyclePatch = [];
  }

  onIndexForest(newNodes: NodeArray, removedNodes: NodeArray): void {
    newNodes.forEach((node) => {
      this._observeLifecycle(node.directive, node.isComponent);
      this._observeComponent(node.directive);
      this._fireCreationCallback(node.directive, node.isComponent);
    });
    removedNodes.forEach((node) => {
      this._patched.delete(node.directive);
      this._fireDestroyCallback(node.directive, node.isComponent);
    });
  }

  private _fireCreationCallback(component: any, isComponent: boolean): void {
    const position = this._tracker.getDirectivePosition(component);
    const id = this._tracker.getDirectiveId(component);
    this._onCreate(component, getDirectiveHostElement(component), id, isComponent, position);
  }

  private _fireDestroyCallback(component: any, isComponent: boolean): void {
    const position = this._tracker.getDirectivePosition(component);
    const id = this._tracker.getDirectiveId(component);
    this._onDestroy(component, getDirectiveHostElement(component), id, isComponent, position);
  }

  private _observeComponent(cmp: any): void {
    const declarations = componentMetadata(cmp);
    if (!declarations) {
      return;
    }
    const original = declarations.template;
    const self = this;
    if (original.patched) {
      return;
    }
    declarations.tView.template = function (_: any, component: any): void {
      if (!self._inChangeDetection) {
        self._inChangeDetection = true;
        runOutsideAngular(() => {
          Promise.resolve().then(() => {
            self.changeDetection$.next();
            self._inChangeDetection = false;
          });
        });
      }
      const position = self._tracker.getDirectivePosition(component);
      const id = self._tracker.getDirectiveId(component);

      self._onChangeDetectionStart(component, getDirectiveHostElement(component), id, position);
      original.apply(this, arguments);
      if (self._tracker.hasDirective(component) && id !== undefined && position !== undefined) {
        self._onChangeDetectionEnd(component, getDirectiveHostElement(component), id, position);
      }
    };
    declarations.tView.template.patched = true;
    this._patched.set(cmp, original);
  }

  private _observeLifecycle(directive: any, isComponent: boolean): void {
    const ctx = getLViewFromDirectiveOrElementInstance(directive);
    if (!ctx) {
      return;
    }
    const tview = ctx[1];
    hookTViewProperties.forEach((hook) => {
      const current = tview[hook];
      if (!Array.isArray(current)) {
        return;
      }
      current.forEach((el: any, idx: number) => {
        if (el.patched) {
          return;
        }
        if (typeof el === 'function') {
          const self = this;
          current[idx] = function (): any {
            // We currently don't want to notify the consumer
            // for execution of lifecycle hooks of services and pipes.
            // These two abstractions don't have `__ngContext__`, and
            // currently we won't be able to extract the required
            // metadata by the UI.
            if (!this[METADATA_PROPERTY_NAME]) {
              return;
            }
            const id = self._tracker.getDirectiveId(this);
            const lifecycleHookName = getLifeCycleName(this, el);
            const element = getDirectiveHostElement(this);
            self._onLifecycleHookStart(this, lifecycleHookName, element, id, isComponent);
            const result = el.apply(this, arguments);
            self._onLifecycleHookEnd(this, lifecycleHookName, element, id, isComponent);
            return result;
          };
          current[idx].patched = true;
          this._undoLifecyclePatch.push(() => {
            current[idx] = el;
          });
        }
      });
    });
  }
}

/** Implemenation of Profiler that utilizes framework APIs fire profiler hooks. */
class NgProfiler extends Profiler {
  private _tracker = IdentityTracker.getInstance();

  constructor(config: Partial<Hooks> = {}) {
    super(config);
    setProfilerCallback((event: ɵProfilerEvent, instanceOrLView: {}, hookOrListener: any) => {
      if (this[event] === undefined) {
        return;
      }

      this[event](instanceOrLView, hookOrListener);
    });
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
