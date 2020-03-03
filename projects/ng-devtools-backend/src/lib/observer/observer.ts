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
    if (this._config.onChangeDetection) {
      this._initializeChangeDetectionObserver();
    }
    if (this._config.onLifecycleHook) {
      this._initializeLifecycleObserver();
    }
    this._tracker.index();
    this._createOriginalTree();
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

  private _onMutation(mutations: MutationRecord[]): void {
    mutations.forEach((v: MutationRecord) => {
      v.addedNodes.forEach(node => this._onAddedNodesMutation(node));
      v.removedNodes.forEach(node => this._onDeletedNodesMutation(node));
    });
  }

  private _onAddedNodesMutation(node: Node): void {
    const components = this._getAllNestedComponentsWithinDomNode(node);
    if (components.length > 0) {
      components.forEach(component => this._onAddedComponent(component));
    }

    const directives = this._getAllNestedDirectivesWithinDomNode(node);
    if (directives.length) {
      directives.forEach(dir => this._onAddedDirective(dir));
    }

    if (components.length + directives.length > 0) {
      this._tracker.index();
    }
  }

  private _onAddedComponent(addedComponent): void {
    if (this._config.onChangeDetection) {
      this._observeComponent(addedComponent);
    }
    if (this._config.onLifecycleHook) {
      this._observeLifecycle(addedComponent, true);
    }
    this._fireCreationCallback(addedComponent, true);

    if (this._lastChangeDetection.has(addedComponent)) {
      this._fireChangeDetectionCallback(addedComponent);
      this._lastChangeDetection.delete(addedComponent);
    }
  }

  private _onAddedDirective(addedDirective): void {
    if (this._config.onLifecycleHook) {
      this._observeLifecycle(addedDirective, false);
    }
    this._fireCreationCallback(addedDirective, false);
  }

  private _getAllNestedComponentsWithinDomNode(node, componentAccumulator = []) {
    const component = node instanceof HTMLElement && ng.getComponent(node);

    if (component) {
      componentAccumulator.push(component);
    } else {
      Array.from(node.children).forEach(child =>
        this._getAllNestedComponentsWithinDomNode(child, componentAccumulator)
      );
    }

    return componentAccumulator;
  }

  private _getAllNestedDirectivesWithinDomNode(node) {
    let directives = [];
    try {
      directives = ng.getDirectives(node);
    } catch {}

    Array.from(node.children).forEach(
      child => (directives = directives.concat(this._getAllNestedDirectivesWithinDomNode(child)))
    );
    return directives;
  }

  private _fireCreationCallback(component: any, isComponent: boolean): void {
    if (!this._config.onCreate) {
      return;
    }
    const position = this._tracker.getDirectivePosition(component);
    this._config.onCreate(component, this._tracker.getDirectiveId(component), isComponent, position);
  }

  private _fireChangeDetectionCallback(component: any): void {
    if (!this._config.onChangeDetection) {
      return;
    }
    this._config.onChangeDetection(
      component,
      this._tracker.getDirectiveId(component),
      this._tracker.getDirectivePosition(component),
      this._lastChangeDetection.get(component)
    );
  }

  private _onDeletedNodesMutation(node: Node): void {
    const component = node instanceof HTMLElement && ng.getComponent(node);
    if (component) {
      // We first want to notify for removal
      // after that remove the component from the tracker
      // this way consumers have access to the component's position and ID.
      this._fireDestroyCallback(component, true);
      this._tracker.delete(component);
    }

    let directives = [];
    try {
      directives = ng.getDirectives(node);
    } catch {}

    if (directives && directives.length) {
      directives.forEach(dir => {
        this._fireDestroyCallback(dir, false);
      });
      this._tracker.delete(directives[0]);
    }
  }

  private _fireDestroyCallback(component: any, isComponent: boolean): void {
    if (!this._config.onDestroy) {
      return;
    }
    const position = this._tracker.getDirectivePosition(component);
    this._config.onDestroy(component, this._tracker.getDirectiveId(component), isComponent, position);
  }

  private _initializeChangeDetectionObserver(root: Element = document.documentElement): void {
    const cmp = root instanceof HTMLElement && ng.getComponent(root);
    if (cmp) {
      this._observeComponent(cmp);
    }
    // tslint:disable:prefer-for-of
    for (let i = 0; i < root.children.length; i++) {
      this._initializeChangeDetectionObserver(root.children[i]);
    }
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

  private _createOriginalTree(): void {
    getDirectiveForest(document.documentElement, (window as any).ng).forEach(root =>
      this._fireInitialTreeCallbacks(root)
    );
  }

  private _fireInitialTreeCallbacks(root: ComponentTreeNode) {
    if (root.component) {
      this._fireCreationCallback(root.component.instance, true);
    }
    (root.directives || []).forEach(dir => {
      this._fireCreationCallback(dir.instance, false);
    });
    root.children.forEach(child => this._fireInitialTreeCallbacks(child));
  }

  private _initializeLifecycleObserver(root: Node = document.documentElement): void {
    if (root instanceof HTMLElement) {
      const cmp = ng.getComponent(root);
      if (cmp) {
        this._observeLifecycle(cmp, true);
      }
    }
    let dirs: any[] = [];
    try {
      dirs = ng.getDirectives(root);
    } catch {}
    dirs.forEach((dir: any) => {
      this._observeLifecycle(dir, false);
    });
    for (let i = 0; i < root.childNodes.length; i++) {
      this._initializeLifecycleObserver(root.childNodes[i]);
    }
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
