/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getDirectiveHostElement, getLViewFromDirectiveOrElementInstance, METADATA_PROPERTY_NAME,} from '../../directive-forest';
import {runOutsideAngular} from '../../utils';
import {IdentityTracker, NodeArray} from '../identity-tracker';

import {getLifeCycleName, Profiler} from './shared';

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

/**
 * Implementation of Profiler that uses monkey patching of directive templates and lifecycle
 * methods to fire profiler hooks.
 */
export class PatchingProfiler extends Profiler {
  private _patched = new Map<any, () => void>();
  private _undoLifecyclePatch: (() => void)[] = [];
  private _tracker = IdentityTracker.getInstance();

  override destroy(): void {
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

  override onIndexForest(newNodes: NodeArray, removedNodes: NodeArray): void {
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
    declarations.tView.template = function(_: any, component: any): void {
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
          current[idx] = function(): any {
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
