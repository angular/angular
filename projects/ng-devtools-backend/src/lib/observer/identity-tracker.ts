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
  private _directiveTreeNode = new Map<any, TreeNode>();

  constructor(private _ng: DebuggingAPI) {}

  getDirectivePosition(dir: any) {
    return this._currentDirectivePosition.get(dir);
  }

  getDirectiveId(dir: any) {
    return this._currentDirectiveId.get(dir);
  }

  // It's possible to optimize this method and traverse just a subtree.
  insert(node: HTMLElement, cmpOrDirective: any | any[]): void {
    const isComponent = !Array.isArray(cmpOrDirective);
    (isComponent ? [cmpOrDirective] : cmpOrDirective).forEach((dir: any) => {
      this.index();
    });
  }

  // It's possible to optimize this method and traverse just a subtree.
  delete(_: any): void {
    this.index();
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

  private _indexNode(directive: any, position: ElementPosition, parent: TreeNode | null = null) {
    this._createdDirectives.add(directive);
    const node: TreeNode = {
      parent,
      directive,
      children: [],
    };
    this._directiveTreeNode.set(directive, node);
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
    this._directiveTreeNode = new Map<any, TreeNode>();
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
  const position = parentPosition.concat([idx]);
  return {
    position,
    element: node.element,
    component: node.component,
    directives: node.directives.map(d => ({ position, ...d })),
    children: node.children.map((n, i) => indexTree(n, i, position)),
    nativeElement: node.nativeElement,
  } as IndexedNode;
};

export const indexForest = <T extends ComponentNode<DirectiveInstanceType, ComponentInstanceType>>(
  forest: T[]
): IndexedNode[] => forest.map((n, i) => indexTree(n, i));
