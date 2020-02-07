import { Node as ComponentNode, ElementID } from 'protocol';
import { DirectiveInstanceType, ComponentInstanceType, getComponentForest } from '../component-tree';
import { componentMetadata } from '../utils';

export type CreationCallback = (component: RecorderComponent) => void;
export type ChangeDetectionCallback = (component: RecorderComponent, duration: number) => void;
export type DestroyCallback = (component: RecorderComponent) => void;

export interface RecorderComponent {
  id: ElementID;
  component: any;
}

interface TreeNode {
  parent: TreeNode;
  component: any;
  children: TreeNode[];
}

declare const ng: any;

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
  private _elementComponent = new Map<Node, any>();
  private _patched = new Map<any, () => void>();
  private _currentComponentID = new Map<any, ElementID>();
  private _lastChangeDetection = new Map<any, number>();
  private _createdComponents = new Set<any>();
  private _forest: TreeNode[] = [];
  private _componentTreeNode = new Map<any, TreeNode>();

  constructor(
    private _onCreation: CreationCallback,
    private _onChangeDetection: ChangeDetectionCallback,
    private _onDestroy: DestroyCallback
  ) {}

  initialize() {
    this._mutationObserver.observe(document, {
      subtree: true,
      childList: true,
    });
    this._initializeChangeDetectionObserver();
    this._indexTree();
    this._createOriginalTree();
  }

  destroy() {
    this._mutationObserver.disconnect();
    this._elementComponent = new Map<Node, any>();
    this._currentComponentID = new Map<any, ElementID>();
    this._lastChangeDetection = new Map<any, number>();
    this._createdComponents = new Set<any>();
    this._forest = [];
    this._componentTreeNode = new Map<any, TreeNode>();

    for (const [cmp, template] of this._patched) {
      const meta = componentMetadata(cmp);
      meta.template = template;
      meta.tView.template = template;
    }
  }

  private _onMutation(mutations: MutationRecord[]) {
    mutations.forEach(v => {
      v.addedNodes.forEach(node => {
        const component = ng.getComponent(node);
        if (component) {
          this._elementComponent.set(node, component);
          this._observeComponent(component);

          let current = node;
          let parent = null;
          while (current.parentElement) {
            current = current.parentElement;
            const parentComponent = ng.getComponent(current);
            if (parentComponent) {
              parent = parentComponent;
              break;
            }
          }
          this._updateInsertionID(component, parent);
          this._createdComponents.add(component);

          this._onCreation({
            component,
            id: this._currentComponentID.get(component),
          });

          if (this._lastChangeDetection.has(component)) {
            this._onChangeDetection(
              {
                component,
                id: this._currentComponentID.get(component),
              },
              this._lastChangeDetection.get(component)
            );
            this._lastChangeDetection.delete(component);
          }
        }
      });

      v.removedNodes.forEach(node => {
        const component = this._elementComponent.get(node);
        if (component) {
          this._elementComponent.delete(node);
          this._updateDeletionID(component);
          this._onDestroy({
            component,
            id: this._currentComponentID.get(component),
          });
        }
      });
    });
  }

  private _updateInsertionID(cmp: any, parent: any) {
    const updateNestedNodeIds = (p: TreeNode, level: number) => {
      p.children.forEach(c => {
        const id = this._currentComponentID.get(c.component);
        id[level] = id[level] + 1;
        updateNestedNodeIds(c, level);
      });
    };

    let parentTreeNode = null;
    let parentID = [];
    let childIdx = 0;
    let siblingsArray = this._forest;
    if (parent) {
      const parentElement = ng.getHostElement(parent || document.documentElement);
      const children = getComponentForest(parentElement)[0].children;

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < children.length; i++) {
        if (children[i].component.instance === cmp) {
          break;
        }
        if (this._componentTreeNode.has(children[i].component.instance)) {
          childIdx++;
        }
      }
      parentID = this._currentComponentID.get(parent);
      parentTreeNode = this._componentTreeNode.get(parent);
      siblingsArray = parentTreeNode.children;
    }

    const treeNode: TreeNode = {
      parent: parentTreeNode,
      children: [],
      component: cmp,
    };
    siblingsArray.splice(childIdx, 0, treeNode);
    this._currentComponentID.set(cmp, parentID.concat([childIdx]));
    this._componentTreeNode.set(cmp, treeNode);

    for (let i = childIdx + 1; i < siblingsArray.length; i++) {
      const sibling = siblingsArray[i];
      const siblingId = this._currentComponentID.get(sibling.component);
      siblingId[siblingId.length - 1] = siblingId[siblingId.length - 1] + 1;
      updateNestedNodeIds(sibling, siblingId.length - 1);
    }
  }

  private _updateDeletionID(cmp: any) {
    const updateNestedNodeIds = (p: TreeNode, level: number) => {
      p.children.forEach(c => {
        const id = this._currentComponentID.get(c.component);
        id[level] = id[level] - 1;
        updateNestedNodeIds(c, level);
      });
    };
    const node = this._componentTreeNode.get(cmp);
    const parent = node.parent;
    let childrenArray = this._forest;
    if (parent) {
      childrenArray = parent.children;
    }

    const childIdx = childrenArray.indexOf(node);
    childrenArray.splice(childIdx, 1);

    for (let i = childIdx; i < childrenArray.length; i++) {
      const sibling = childrenArray[i].component;
      const siblingId = this._currentComponentID.get(sibling);
      // We removed the sibling node, so we need to decrease the position
      siblingId[siblingId.length - 1] = siblingId[siblingId.length - 1] - 1;
      updateNestedNodeIds(childrenArray[i], siblingId.length - 1);
    }
  }

  private _initializeChangeDetectionObserver(root: Element = document.documentElement) {
    if (!(root instanceof HTMLElement)) {
      return;
    }
    const cmp = ng.getComponent(root);
    if (cmp) {
      this._elementComponent.set(root, cmp);
      this._observeComponent(cmp);
    }
    // tslint:disable:prefer-for-of
    for (let i = 0; i < root.children.length; i++) {
      this._initializeChangeDetectionObserver(root.children[i]);
    }
  }

  private _observeComponent(cmp: any) {
    const declarations = componentMetadata(cmp);
    const original = declarations.template;
    const self = this;
    if (original.patched) {
      return;
    }
    declarations.tView.template = function(_, component: any) {
      const start = performance.now();
      original.apply(this, arguments);
      if (self._createdComponents.has(component)) {
        self._onChangeDetection(
          {
            component,
            id: self._currentComponentID.get(component),
          },
          performance.now() - start
        );
      } else {
        self._lastChangeDetection.set(component, performance.now() - start);
      }
    };
    declarations.tView.template.patched = true;
    this._patched.set(cmp, original);
  }

  private _indexTree() {
    const componentForest = indexForest(getComponentForest(document.documentElement));
    const setIndexes = (root: IndexedNode, parent: TreeNode | null) => {
      if (root.component) {
        this._createdComponents.add(root.component.instance);
        const node = {
          component: root.component.instance,
          parent,
          children: [],
        };
        this._componentTreeNode.set(root.component.instance, node);
        if (parent) {
          parent.children.push(node);
        } else {
          this._forest.push(node);
        }
        parent = node;
        this._currentComponentID.set(root.component.instance, root.id);
      }
      root.children.forEach(c => setIndexes(c, parent));
    };
    componentForest.forEach(r => setIndexes(r, null));
  }

  private _createOriginalTree() {
    const forest = getComponentForest();

    const setIndexes = (root: IndexedNode) => {
      if (root.component) {
        this._onCreation({
          component: root.component.instance,
          id: this._currentComponentID.get(root.component.instance),
        });
      }
      root.children.forEach(setIndexes);
    };
    forest.forEach(setIndexes);
  }
}

export interface IndexedNode extends ComponentNode<DirectiveInstanceType, ComponentInstanceType> {
  id: ElementID;
  children: IndexedNode[];
}

const indexTree = (node: ComponentNode, idx: number, parentId = []): IndexedNode => {
  let id = parentId;
  if (node.component) {
    id = parentId.concat([idx]);
  }
  return {
    id,
    element: node.element,
    component: node.component,
    directives: node.directives.map((d, i) => ({ name: d.name })),
    children: node.children.map((n, i) => indexTree(n, i, id)),
    nativeElement: node.nativeElement,
  } as IndexedNode;
};

export const indexForest = (forest: ComponentNode[]) => forest.map((n, i) => indexTree(n, i));
