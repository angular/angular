import { ElementPosition, LifecycleProfile } from 'protocol';
import { componentMetadata, runOutsideAngular } from '../utils';
import { IdentityTracker, IndexedNode } from './identity-tracker';
import {
  getLViewFromDirectiveOrElementInstance,
  getDirectiveHostElement,
  METADATA_PROPERTY_NAME,
} from '../lview-transform';
import { DEV_TOOLS_HIGHLIGHT_NODE_ID } from '../highlighter';
import { Subject } from 'rxjs';

export type CreationHook = (
  componentOrDirective: any,
  node: Node,
  id: number,
  isComponent: boolean,
  position: ElementPosition
) => void;

export type LifecycleStartHook = (
  componentOrDirective: any,
  hook: keyof LifecycleProfile | 'unknown',
  node: Node,
  id: number,
  isComponent: boolean
) => void;

export type LifecycleEndHook = (
  componentOrDirective: any,
  hook: keyof LifecycleProfile | 'unknown',
  node: Node,
  id: number,
  isComponent: boolean
) => void;

export type ChangeDetectionStartHook = (component: any, node: Node, id: number, position: ElementPosition) => void;

export type ChangeDetectionEndHook = (component: any, node: Node, id: number, position: ElementPosition) => void;

export type DestroyHook = (
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
  private _tracker = new IdentityTracker();
  private _forest: IndexedNode[] = [];
  private _inChangeDetection = false;
  private _changeDetection$ = new Subject<void>();

  private _hooks: Partial<Hooks>[] = [];

  constructor(config: Partial<Hooks>) {
    this._hooks.push(config);
  }

  get changeDetection$(): Subject<void> {
    return this._changeDetection$;
  }

  getDirectivePosition(dir: any): ElementPosition | undefined {
    const result = this._tracker.getDirectivePosition(dir);
    if (result === undefined) {
      console.warn('Unable to find position of', dir);
    }
    return result;
  }

  getDirectiveId(dir: any): number | undefined {
    const result = this._tracker.getDirectiveId(dir);
    if (result === undefined) {
      console.warn('Unable to find ID of', result);
    }
    return result;
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
    this._undoLifecyclePatch.forEach((p) => p());
    this._undoLifecyclePatch = [];
  }

  indexForest(): void {
    const { newNodes, removedNodes, indexedForest } = this._tracker.index();
    this._forest = indexedForest;
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

  subscribe(config: Partial<Hooks>): void {
    this._hooks.push(config);
  }

  unsubscribe(config: Partial<Hooks>): void {
    this._hooks.splice(this._hooks.indexOf(config), 1);
  }

  private _onMutation(records: MutationRecord[]): void {
    if (this._isDevToolsMutation(records)) {
      return;
    }
    this.indexForest();
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
            self._changeDetection$.next();
            self._inChangeDetection = false;
          });
        });
      }
      const position = self._tracker.getDirectivePosition(component);
      const start = performance.now();
      const id = self._tracker.getDirectiveId(component);

      self._onChangeDetectionStart(component, getDirectiveHostElement(component), id, position);
      original.apply(this, arguments);
      if (self._tracker.hasDirective(component) && id !== undefined && position !== undefined) {
        self._onChangeDetectionEnd(component, getDirectiveHostElement(component), id, position);
      } else {
        self._lastChangeDetection.set(component, performance.now() - start);
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

  private _onCreate(
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

  private _onDestroy(
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

  private _onChangeDetectionStart(
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

  private _onChangeDetectionEnd(_: any, __: Node, id: number | undefined, position: ElementPosition | undefined): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onChangeDetectionEnd', arguments);
  }

  private _onLifecycleHookStart(
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

  private _onLifecycleHookEnd(
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
