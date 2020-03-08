import { ElementPosition, LifecycleProfile } from 'protocol';
import { ComponentTreeNode, getDirectiveForest } from '../component-tree';
import { componentMetadata } from '../utils';
import { IdentityTracker } from './identity-tracker';

export type CreationCallback = (
  componentOrDirective: any,
  id: number,
  isComponent: boolean,
  position: ElementPosition
) => void;

export type LifecycleCallback = (
  componentOrDirective: any,
  id: number,
  isComponent: boolean,
  hook: keyof LifecycleProfile | 'unknown',
  duration: number
) => void;

export type ChangeDetectionCallback = (component: any, id: number, position: ElementPosition, duration: number) => void;

export type DestroyCallback = (
  componentOrDirective: any,
  id: number,
  isComponent: boolean,
  position: ElementPosition
) => void;

declare const ng: any;

export interface Config {
  onCreate: CreationCallback;
  onDestroy: DestroyCallback;
  onChangeDetection: ChangeDetectionCallback;
  onLifecycleHook: LifecycleCallback;
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

const hookTViewProperties = [
  'preOrderHooks',
  'preOrderCheckHooks',
  'contentHooks',
  'contentCheckHooks',
  'viewHooks',
  'viewCheckHooks',
  'destroyHooks',
];

const getLifeCycleName = (fnName: string): keyof LifecycleProfile | 'unknown' => {
  fnName = fnName.toLowerCase();
  return (
    (hookNames.filter(hook => fnName.indexOf(hook.toLowerCase()) >= 0).pop() as keyof LifecycleProfile) || 'unknown'
  );
};

/**
 * This is a temporal "polyfill" until we receive more comprehensive framework
 * debugging APIs. This observer checks for new elements added. When it detects
 * this has happened, it checks if any of the elements in the tree with root
 * the added element is a component. If it is, it throws a creation event.
 * The polyfill also patches the tView template function reference to allow
 * tracking of how much time we spend in the particular component in change detection.
 */
export class ComponentTreeObserver {
  private _mutationObserver = new MutationObserver(this._onMutation.bind(this));
  private _patched = new Map<any, () => void>();
  private _undoLifecyclePatch: (() => void)[] = [];
  private _lastChangeDetection = new Map<any, number>();
  private _tracker = new IdentityTracker((window as any).ng);

  constructor(private _config: Partial<Config>) {}

  getDirectivePosition(dir: any) {
    return this._tracker.getDirectivePosition(dir);
  }

  getDirectiveId(dir: any) {
    return this._tracker.getDirectiveId(dir);
  }

  initialize(): void {
    this._mutationObserver.observe(document, {
      subtree: true,
      childList: true,
    });
    this._observeUpdates();
  }

  destroy() {
    this._mutationObserver.disconnect();
    this._lastChangeDetection = new Map<any, number>();
    this._tracker.destroy();

    for (const [cmp, template] of this._patched) {
      const meta = componentMetadata(cmp);
      meta.template = template;
      meta.tView.template = template;
    }

    this._patched = new Map<any, () => void>();
    this._undoLifecyclePatch.forEach(p => p());
    this._undoLifecyclePatch = [];
  }

  private _observeUpdates() {
    const updates = this._tracker.index();
    updates.newNodes.forEach(node => {
      if (node.component) {
        if (this._config.onLifecycleHook) {
          this._observeLifecycle(node.component, true);
        }
        if (this._config.onChangeDetection) {
          this._observeComponent(node.component);
        }
        this._fireCreationCallback(node.component, true);
      }
      if (node.directives && node.directives.length) {
        node.directives.forEach(dir => {
          if (this._config.onLifecycleHook) {
            this._observeLifecycle(dir, true);
          }
          this._fireCreationCallback(dir, false);
        });
      }
    });
    updates.removedNodes.forEach(node => {
      if (node.component) {
        this._patched.delete(node.component);
        this._fireDestroyCallback(node.component, true);
      }
      if (node.directives && node.directives.length) {
        node.directives.forEach(dir => {
          this._fireDestroyCallback(dir, false);
        });
      }
    });
  }

  private _onMutation(): void {
    this._observeUpdates();
  }

  private _fireCreationCallback(component: any, isComponent: boolean): void {
    if (!this._config.onCreate) {
      return;
    }
    const position = this._tracker.getDirectivePosition(component);
    this._config.onCreate(component, this._tracker.getDirectiveId(component), isComponent, position);
  }

  private _fireDestroyCallback(component: any, isComponent: boolean): void {
    if (!this._config.onDestroy) {
      return;
    }
    const position = this._tracker.getDirectivePosition(component);
    this._config.onDestroy(component, this._tracker.getDirectiveId(component), isComponent, position);
  }

  private _observeComponent(cmp: any): void {
    const declarations = componentMetadata(cmp);
    const original = declarations.template;
    const self = this;
    if (original.patched) {
      return;
    }
    declarations.tView.template = function(_: any, component: any) {
      const start = performance.now();
      original.apply(this, arguments);
      if (self._tracker.hasDirective(component)) {
        self._config.onChangeDetection(
          component,
          self._tracker.getDirectiveId(component),
          self._tracker.getDirectivePosition(component),
          performance.now() - start
        );
      } else {
        self._lastChangeDetection.set(component, performance.now() - start);
      }
    };
    declarations.tView.template.patched = true;
    this._patched.set(cmp, original);
  }

  private _observeLifecycle(directive: any, isComponent: boolean) {
    const ctx = directive.__ngContext__;
    const tview = ctx[1];
    hookTViewProperties.forEach(hook => {
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
          current[idx] = function() {
            const start = performance.now();
            const result = el.apply(this, arguments);
            if (self._tracker.hasDirective(this)) {
              self._config.onLifecycleHook(
                this,
                self._tracker.getDirectiveId(this),
                isComponent,
                getLifeCycleName(el.name),
                performance.now() - start
              );
            }
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
