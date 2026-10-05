/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runOutsideAngular} from '../../shared/utils/general';
import {IdentityTracker, NodeArray} from '../../directive-forest/identity-tracker/identity-tracker';
import {getLifeCycleName, Profiler} from './shared';
import {ComponentInstance, DirectiveInstance} from '../../shared/interfaces';
import {
  getDirectiveHostElement,
  getLViewFromDirectiveOrElementInstance,
  METADATA_PROPERTY_NAME,
} from '../../directive-forest/tree-strategies/ltree';

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
const componentMetadata = (instance: ComponentInstance) => instance?.constructor?.ɵcmp;

/**
 * Implementation of Profiler that uses monkey patching of directive templates and lifecycle
 * methods to fire profiler hooks.
 */
export class PatchingProfiler extends Profiler {
  private patched = new Map<ComponentInstance, () => void>();
  private undoLifecyclePatch: (() => void)[] = [];
  private tracker = IdentityTracker.getInstance();

  override destroy(): void {
    this.tracker.destroy();

    for (const [cmp, template] of this.patched) {
      const meta = componentMetadata(cmp);
      meta.template = template;
      meta.tView.template = template;
    }

    this.patched = new Map<ComponentInstance, () => void>();
    this.undoLifecyclePatch.forEach((p) => p());
    this.undoLifecyclePatch = [];
  }

  override onIndexForest(newNodes: NodeArray, removedNodes: NodeArray): void {
    newNodes.forEach((node) => {
      this.observeLifecycle(node.directive, node.isComponent);
      this.observeComponent(node.directive);
      this.fireCreationCallback(node.directive, node.isComponent);
    });
    removedNodes.forEach((node) => {
      this.patched.delete(node.directive);
      this.fireDestroyCallback(node.directive, node.isComponent);
    });
  }

  private fireCreationCallback(component: ComponentInstance, isComponent: boolean): void {
    const position = this.tracker.getDirectivePosition(component);
    const id = this.tracker.getDirectiveId(component);
    this.onCreate(component, getDirectiveHostElement(component), id, isComponent, position);
  }

  private fireDestroyCallback(component: ComponentInstance, isComponent: boolean): void {
    const position = this.tracker.getDirectivePosition(component);
    const id = this.tracker.getDirectiveId(component);
    this.onDestroy(component, getDirectiveHostElement(component), id, isComponent, position);
  }

  private observeComponent(cmp: ComponentInstance): void {
    const declarations = componentMetadata(cmp);
    if (!declarations) {
      return;
    }
    const original = declarations.template;
    const self = this;
    if (original.patched) {
      return;
    }
    declarations.tView.template = function (_: any, component: ComponentInstance): void {
      if (!self.inChangeDetection) {
        self.inChangeDetection = true;
        runOutsideAngular(() => {
          Promise.resolve().then(() => {
            self.changeDetection$.next();
            self.inChangeDetection = false;
          });
        });
      }
      const position = self.tracker.getDirectivePosition(component);
      const id = self.tracker.getDirectiveId(component);

      self.onChangeDetectionStart(component, getDirectiveHostElement(component), id, position);
      original.apply(this, arguments);
      if (self.tracker.hasDirective(component) && id !== undefined && position !== undefined) {
        self.onChangeDetectionEnd(component, getDirectiveHostElement(component), id, position);
      }
    };
    declarations.tView.template.patched = true;
    this.patched.set(cmp, original);
  }

  private observeLifecycle(directive: DirectiveInstance, isComponent: boolean): void {
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
            if (!(this as any)[METADATA_PROPERTY_NAME]) {
              return;
            }
            const id = self.tracker.getDirectiveId(this);
            const lifecycleHookName = getLifeCycleName(this, el);
            const element = getDirectiveHostElement(this);
            self.onLifecycleHookStart(this, lifecycleHookName, element, id, isComponent);
            const result = el.apply(this, arguments);
            self.onLifecycleHookEnd(this, lifecycleHookName, element, id, isComponent);
            return result;
          };
          current[idx].patched = true;
          this.undoLifecyclePatch.push(() => {
            current[idx] = el;
          });
        }
      });
    });
  }
}
