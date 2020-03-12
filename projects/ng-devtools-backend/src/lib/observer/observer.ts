import { ElementPosition, LifecycleProfile } from 'protocol';
import { componentMetadata } from '../utils';
import { IdentityTracker, IndexedNode } from './identity-tracker';
import { getLViewFromDirectiveOrElementInstance, getDirectiveHostElement } from '../lview-transform';
import { DEV_TOOLS_HIGHLIGHT_NODE_ID } from '../highlighter';

export type CreationCallback = (
  componentOrDirective: any,
  node: Node,
  id: number,
  isComponent: boolean,
  position: ElementPosition
) => void;

export type LifecycleCallback = (
  componentOrDirective: any,
  node: Node,
  id: number,
  isComponent: boolean,
  hook: keyof LifecycleProfile | 'unknown',
  duration: number
) => void;

export type ChangeDetectionCallback = (
  component: any,
  node: Node,
  id: number,
  position: ElementPosition,
  duration: number
) => void;

export type DestroyCallback = (
  componentOrDirective: any,
  node: Node,
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

const hookMethodNames = new Set(hookNames.map(hook => `ng${hook}`));

const hookTViewProperties = [
  'preOrderHooks',
  'preOrderCheckHooks',
  'contentHooks',
  'contentCheckHooks',
  'viewHooks',
  'viewCheckHooks',
  'destroyHooks',
];

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
  return 'unknown';
};

/**
 * This is a temporal "polyfill" until we receive more comprehensive framework
 * debugging APIs. This observer checks for new elements added. When it detects
 * this has happened, it checks if any of the elements in the tree with root
 * the added element is a component. If it is, it throws a creation event.
 * The polyfill also patches the tView template function reference to allow
 * tracking of how much time we spend in the particular component in change detection.
 */
export class DirectiveForestObserver {
  private _mutationObserver = new MutationObserver(this._onMutation.bind(this));
  private _patched = new Map<any, () => void>();
  private _undoLifecyclePatch: (() => void)[] = [];
  private _lastChangeDetection = new Map<any, number>();
  private _tracker = new IdentityTracker((window as any).ng);
  private _forest: IndexedNode[] = [];

  constructor(private _config: Partial<Config>) {}

  getDirectivePosition(dir: any): ElementPosition {
    return this._tracker.getDirectivePosition(dir);
  }

  getDirectiveId(dir: any): number {
    return this._tracker.getDirectiveId(dir);
  }

  getDirectiveForest(): IndexedNode[] {
    return this._forest;
  }

  initialize(): void {
    this._mutationObserver.observe(document, {
      subtree: true,
      childList: true,
    });
    this.indexForest();
  }

  destroy(): void {
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

  indexForest(): void {
    const { newNodes, removedNodes, indexedForest } = this._tracker.index();
    this._forest = indexedForest;
    newNodes.forEach(node => {
      if (this._config.onLifecycleHook) {
        this._observeLifecycle(node.directive, node.isComponent);
      }
      if (node.isComponent && this._config.onChangeDetection) {
        this._observeComponent(node.directive);
      }
      this._fireCreationCallback(node.directive, node.isComponent);
    });
    removedNodes.forEach(node => {
      this._patched.delete(node.directive);
      this._fireDestroyCallback(node.directive, node.isComponent);
    });
  }

  private _onMutation(records: MutationRecord[]): void {
    if (this._isDevToolsMutation(records)) {
      return;
    }
    this.indexForest();
  }

  private _fireCreationCallback(component: any, isComponent: boolean): void {
    if (!this._config.onCreate) {
      return;
    }
    const position = this._tracker.getDirectivePosition(component);
    this._config.onCreate(
      component,
      getDirectiveHostElement(component),
      this._tracker.getDirectiveId(component),
      isComponent,
      position
    );
  }

  private _fireDestroyCallback(component: any, isComponent: boolean): void {
    if (!this._config.onDestroy) {
      return;
    }
    const position = this._tracker.getDirectivePosition(component);
    this._config.onDestroy(
      component,
      getDirectiveHostElement(component),
      this._tracker.getDirectiveId(component),
      isComponent,
      position
    );
  }

  private _observeComponent(cmp: any): void {
    const declarations = componentMetadata(cmp);
    const original = declarations.template;
    const self = this;
    if (original.patched) {
      return;
    }
    declarations.tView.template = function(_: any, component: any): void {
      const start = performance.now();
      original.apply(this, arguments);
      if (self._tracker.hasDirective(component)) {
        self._config.onChangeDetection(
          component,
          getDirectiveHostElement(component),
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

  private _observeLifecycle(directive: any, isComponent: boolean): void {
    const ctx = getLViewFromDirectiveOrElementInstance(directive);
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
          current[idx] = function(): any {
            const start = performance.now();
            const result = el.apply(this, arguments);
            if (self._tracker.hasDirective(this)) {
              self._config.onLifecycleHook(
                this,
                getDirectiveHostElement(this),
                self._tracker.getDirectiveId(this),
                isComponent,
                getLifeCycleName(this, el),
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

  private _isDevToolsMutation(records: MutationRecord[]): boolean {
    for (const record of records) {
      if (containsInternalElements(record.addedNodes)) {
        return true;
      }
      if (containsInternalElements(record.removedNodes)) {
        return true;
      }
    }
    return false;
  }
}

const containsInternalElements = (nodes: NodeList): boolean => {
  // tslint:disable prefer-for-of
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!(node instanceof Element)) {
      continue;
    }
    const attr = node.getAttribute('id');
    if (attr === DEV_TOOLS_HIGHLIGHT_NODE_ID) {
      return true;
    }
  }
  return false;
};
