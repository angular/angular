import { ElementPosition, Node as ComponentNode } from 'protocol';
import { ComponentInstanceType, ComponentTreeNode, DirectiveInstanceType, getComponentForest } from '../component-tree';
import { componentMetadata } from '../utils';
import { IdentityTracker } from './identity-tracker';

export type LifecyleHook =
  | 'ngOnInit'
  | 'ngOnDestroy'
  | 'ngOnChanges'
  | 'ngDoCheck'
  | 'ngAfterContentInit'
  | 'ngAfterContentChecked'
  | 'ngAfterViewInit'
  | 'ngAfterViewChecked';

export type CreationCallback = (component: any, position: ElementPosition) => void;
export type LifecycleCallback = (component: any, hook: LifecyleHook, duration: any) => void;
export type ChangeDetectionCallback = (component: any, position: ElementPosition, duration: number) => void;
export type DestroyCallback = (component: any, position: ElementPosition) => void;

declare const ng: any;

export interface Config {
  onCreate: CreationCallback;
  onDestroy: DestroyCallback;
  onChangeDetection: ChangeDetectionCallback;
  onLifecycleHook: LifecycleCallback;
}

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
  private _lastChangeDetection = new Map<any, number>();
  private _tracker = new IdentityTracker((window as any).ng);

  constructor(private _config: Partial<Config>) {}

  initialize(): void {
    this._mutationObserver.observe(document, {
      subtree: true,
      childList: true,
    });
    if (this._config.onChangeDetection) {
      this._initializeChangeDetectionObserver();
    }
    this._indexTree();
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
  }

  private _onMutation(mutations: MutationRecord[]): void {
    mutations.forEach((v: MutationRecord) => {
      v.addedNodes.forEach(node => this._onAddedNodesMutation(node));
      v.removedNodes.forEach(node => this._onDeletedNodesMutation(node));
    });
  }

  private _onAddedNodesMutation(node: Node): void {
    if (!(node instanceof HTMLElement)) {
      return;
    }
    const component = ng.getComponent(node);
    if (component) {
      if (this._config.onChangeDetection) {
        this._observeComponent(component);
      }

      this._tracker.insert(node, component);

      this._fireCreationCallback(component);

      if (this._lastChangeDetection.has(component)) {
        this._fireChangeDetectionCallback(component);
        this._lastChangeDetection.delete(component);
      }
    }

    let directives = [];
    try {
      directives = ng.getDirectives(node);
    } catch {}
    if (directives.length) {
      this._tracker.insert(node, directives);
      directives.forEach(dir => {
        this._fireCreationCallback(dir);
      });
    }
  }

  private _fireCreationCallback(component: any): void {
    const position = this._tracker.getDirectivePosition(component);
    this._config.onCreate(component, position);
  }

  private _fireChangeDetectionCallback(component): void {
    this._config.onChangeDetection(
      component,
      this._tracker.getDirectivePosition(component),
      this._lastChangeDetection.get(component)
    );
  }

  private _onDeletedNodesMutation(node: Node): void {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const component = ng.getComponent(node);
    if (component) {
      this._tracker.delete(component);
      this._fireDestroyCallback(component);
    }

    let directives = [];
    try {
      directives = ng.getDirectives(node);
    } catch {}

    if (directives && directives.length) {
      this._tracker.delete(directives[0]);
      directives.forEach(dir => {
        this._fireDestroyCallback(dir);
      });
    }
  }

  private _fireDestroyCallback(component: any): void {
    const position = this._tracker.getDirectivePosition(component);
    this._config.onDestroy(component, position);
  }

  private _initializeChangeDetectionObserver(root: Element = document.documentElement): void {
    if (!(root instanceof HTMLElement)) {
      return;
    }
    const cmp = ng.getComponent(root);
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
    declarations.tView.template = function(_, component: any) {
      const start = performance.now();
      original.apply(this, arguments);
      if (self._tracker.hasDirective(component)) {
        self._config.onChangeDetection(
          component,
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

  private _indexTree(): void {
    const componentForest = indexForest(getComponentForest(document.documentElement, (window as any).ng));
    componentForest.forEach(root => this._tracker.index(root));
  }

  private _createOriginalTree(): void {
    getComponentForest(document.documentElement, (window as any).ng).forEach(root =>
      this._fireInitialTreeCallbacks(root)
    );
  }

  private _fireInitialTreeCallbacks(root: ComponentTreeNode) {
    if (root.component) {
      this._fireCreationCallback(root.component.instance);
    }
    root.children.forEach(child => this._fireInitialTreeCallbacks(child));
  }
}

export interface IndexedNode extends ComponentNode<DirectiveInstanceType, ComponentInstanceType> {
  position: ElementPosition;
  children: IndexedNode[];
}

const indexTree = (node: ComponentNode, idx: number, parentPosition = []): IndexedNode => {
  let position = parentPosition;
  if (node.component) {
    position = parentPosition.concat([idx]);
  }
  return {
    position,
    element: node.element,
    component: node.component,
    directives: node.directives.map(d => ({ name: d.name })),
    children: node.children.map((n, i) => indexTree(n, i, position)),
    nativeElement: node.nativeElement,
  } as IndexedNode;
};

export const indexForest = (forest: ComponentNode[]): IndexedNode[] => forest.map((n, i) => indexTree(n, i));
