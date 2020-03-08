import { ElementPosition, DevToolsNode } from 'protocol';
import { getDirectiveForest, DirectiveInstanceType, ComponentInstanceType } from '../component-tree';
import { Type } from '@angular/core';
import { DebuggingAPI } from '../interfaces';

interface TreeNode {
  parent: TreeNode;
  directive?: Type<any>;
  children: TreeNode[];
}

export class IdentityTracker {
  private _directiveIdCounter = 0;
  private _currentDirectivePosition = new Map<any, ElementPosition>();
  private _currentDirectiveId = new Map<any, number>();

  constructor(private _ng: DebuggingAPI) {}

  getDirectivePosition(dir: any) {
    return this._currentDirectivePosition.get(dir);
  }

  getDirectiveId(dir: any) {
    return this._currentDirectiveId.get(dir);
  }

  index() {
    const componentForest = indexForest(getDirectiveForest(this._ng));
    const newNodes: IndexedNode[] = [];
    const removedNodes: IndexedNode[] = [];
    const allNodes = new Set<any>();
    componentForest.forEach(root => this._index(root, null, newNodes, allNodes));
    this._currentDirectiveId.forEach((_: number, dir: any) => {
      if (!allNodes.has(dir)) {
        removedNodes.push(dir);
        this._currentDirectiveId.delete(dir);
        this._currentDirectivePosition.delete(dir);
      }
    });
    return { newNodes, removedNodes };
  }

  private _index(node: IndexedNode, parent: TreeNode | null, newNodes: IndexedNode[], allNodes: Set<any>): void {
    if (node.component) {
      allNodes.add(node.component.instance);
      this._indexNode(node.component.instance, node.position, parent, newNodes);
    }
    (node.directives || []).forEach(dir => {
      allNodes.add(dir.instance);
      this._indexNode(dir.instance, node.position, parent, newNodes);
    });
    node.children.forEach(child => this._index(child, parent, newNodes, allNodes));
  }

  private _indexNode(directive: any, position: ElementPosition, parent: TreeNode | null, newNodes: IndexedNode[]) {
    if (!this._currentDirectiveId.has(directive)) {
      newNodes.push(directive);
    }
    this._currentDirectivePosition.set(directive, position);
    if (!this._currentDirectiveId.has(directive)) {
      this._currentDirectiveId.set(directive, this._directiveIdCounter++);
    }
  }

  hasDirective(dir: any) {
    return this._currentDirectiveId.has(dir);
  }

  destroy() {
    this._currentDirectivePosition = new Map<any, ElementPosition>();
    this._currentDirectiveId = new Map<any, number>();
  }
}

export interface IndexedNode extends DevToolsNode<DirectiveInstanceType, ComponentInstanceType> {
  position: ElementPosition;
  children: IndexedNode[];
}

const indexTree = <T extends DevToolsNode<DirectiveInstanceType, ComponentInstanceType>>(
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

export const indexForest = <T extends DevToolsNode<DirectiveInstanceType, ComponentInstanceType>>(
  forest: T[]
): IndexedNode[] => forest.map((n, i) => indexTree(n, i));
