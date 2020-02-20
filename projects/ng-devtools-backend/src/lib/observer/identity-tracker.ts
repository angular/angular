import { ElementPosition, Node as ComponentNode, ComponentType } from 'protocol';
import { getDirectiveForest, DirectiveInstanceType, ComponentInstanceType } from '../component-tree';
import { Type } from '@angular/core';
import { DebuggingAPI } from '../interfaces';

interface TreeNode {
  parent: TreeNode;
  directive?: Type<any>;
  children: TreeNode[];
}

export class IdentityTracker {
  private _counter = 0;
  private _elementDirective = new Map<Node, any>();
  private _currentDirectivePosition = new Map<any, ElementPosition>();
  private _currentDirectiveId = new Map<any, number>();
  private _createdDirectives = new Set<any>();
  private _forest: TreeNode[] = [];
  private _componentTreeNode = new Map<any, TreeNode>();

  constructor(private _ng: DebuggingAPI) {}

  getDirectivePosition(dir: any) {
    return this._currentDirectivePosition.get(dir);
  }

  getDirectiveId(dir: any) {
    return this._currentDirectiveId.get(dir);
  }

  insert(node: HTMLElement, cmpOrDirective: any | any[]): void {
    const isComponent = !Array.isArray(cmpOrDirective);
    (isComponent ? [cmpOrDirective] : cmpOrDirective).forEach((dir: any) => {
      this._insertDirective(node, dir);
    });
  }

  private _insertDirective(node: HTMLElement, directive: any) {
    const parent = getParentComponentFromDomNode(node, this._ng);

    this._elementDirective.set(node, directive);
    this._createdDirectives.add(directive);

    let parentTreeNode = null;
    let parentPosition = [];
    let childIdx = 0;
    let siblingsArray = this._forest;
    if (parent) {
      const parentElement = this._ng.getHostElement(parent) || document.documentElement;

      const children = getDirectiveForest(parentElement, this._ng)[0].children;

      parentPosition = this._currentDirectivePosition.get(parent);
      parentTreeNode = this._componentTreeNode.get(parent);
      siblingsArray = parentTreeNode.children;

      for (const child of children) {
        if (
          (child.component && child.component.instance === directive) ||
          (child.directives && child.directives.some(d => d === directive))
        ) {
          break;
        }
        childIdx++;
      }
    }

    const treeNode: TreeNode = {
      parent: parentTreeNode,
      children: [],
      directive,
    };
    siblingsArray.splice(childIdx, 0, treeNode);
    this._currentDirectivePosition.set(directive, parentPosition.concat([childIdx]));
    this._currentDirectiveId.set(directive, this._counter++);
    this._componentTreeNode.set(directive, treeNode);

    for (let i = childIdx + 1; i < siblingsArray.length; i++) {
      const sibling = siblingsArray[i];
      const siblingId = this._currentDirectivePosition.get(sibling.directive);
      siblingId[siblingId.length - 1] = siblingId[siblingId.length - 1] + 1;
      this._updateNestedNodeIds(sibling, siblingId.length - 1, 1);
    }
  }

  delete(cmp: any): void {
    const node = this._componentTreeNode.get(cmp);
    const parent = node.parent;
    let childrenArray = this._forest;
    if (parent) {
      childrenArray = parent.children;
    }

    const childIdx = childrenArray.indexOf(node);
    childrenArray.splice(childIdx, 1);

    for (let i = childIdx; i < childrenArray.length; i++) {
      const sibling = childrenArray[i].directive;
      const siblingId = this._currentDirectivePosition.get(sibling);
      // We removed the sibling node, so we need to decrease the position
      siblingId[siblingId.length - 1] = siblingId[siblingId.length - 1] - 1;
      this._updateNestedNodeIds(childrenArray[i], siblingId.length - 1, -1);
    }
  }

  index(rootElement = document.documentElement) {
    const componentForest = indexForest(getDirectiveForest(rootElement, this._ng));
    componentForest.forEach(root => this._index(root));
  }

  private _index(root: IndexedNode, parent: TreeNode | null = null): void {
    if (root.component) {
      this._indexNode(root.component.instance, root.position, parent);
    }
    (root.directives || []).forEach(dir => {
      this._indexNode(dir.instance, root.position, parent);
    });
    root.children.forEach(child => this._index(child, parent));
  }

  private _indexNode(directive: any, position: number[], parent: TreeNode | null = null) {
    this._createdDirectives.add(directive);
    const node: TreeNode = {
      parent,
      directive,
      children: [],
    };
    this._componentTreeNode.set(directive, node);
    if (parent) {
      parent.children.push(node);
    } else {
      this._forest.push(node);
    }
    parent = node;
    this._currentDirectivePosition.set(directive, position);
    if (!this._currentDirectiveId.has(directive)) {
      this._currentDirectiveId.set(directive, this._counter++);
    }
  }

  hasDirective(dir: any) {
    return this._createdDirectives.has(dir);
  }

  destroy() {
    this._elementDirective = new Map<Node, any>();
    this._currentDirectivePosition = new Map<any, ElementPosition>();
    this._currentDirectiveId = new Map<any, number>();
    this._createdDirectives = new Set<any>();
    this._forest = [];
    this._componentTreeNode = new Map<any, TreeNode>();
  }

  private _updateNestedNodeIds(p: TreeNode, level: number, incrementBy: number): void {
    p.children.forEach(c => {
      const position = this._currentDirectivePosition.get(c.directive);
      position[level] = position[level] + incrementBy;
      this._updateNestedNodeIds(c, level, incrementBy);
    });
  }
}

const getParentComponentFromDomNode = (node: Node, ng: DebuggingAPI) => {
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
  return parent;
};

export interface IndexedNode extends ComponentNode<DirectiveInstanceType, ComponentInstanceType> {
  position: ElementPosition;
  children: IndexedNode[];
}

const indexTree = <T extends ComponentNode<DirectiveInstanceType, ComponentInstanceType>>(
  node: T,
  idx: number,
  parentPosition = []
): IndexedNode => {
  let position = parentPosition;
  if (node.component) {
    position = parentPosition.concat([idx]);
  }
  return {
    position,
    element: node.element,
    component: node.component,
    directives: node.directives,
    children: node.children.map((n, i) => indexTree(n, i, position)),
    nativeElement: node.nativeElement,
  } as IndexedNode;
};

export const indexForest = <T extends ComponentNode<DirectiveInstanceType, ComponentInstanceType>>(
  forest: T[]
): IndexedNode[] => forest.map((n, i) => indexTree(n, i));
