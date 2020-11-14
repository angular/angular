import { ComponentTreeNode } from './../component-tree';
import { ElementPosition, DevToolsNode } from 'protocol';
import { buildDirectiveForest, DirectiveInstanceType, ComponentInstanceType } from '../component-tree';
import { Type } from '@angular/core';

interface TreeNode {
  parent: TreeNode;
  directive?: Type<any>;
  children: TreeNode[];
}

type NodeArray = {
  directive: any;
  isComponent: boolean;
}[];

export class IdentityTracker {
  private _directiveIdCounter = 0;
  private _currentDirectivePosition = new Map<any, ElementPosition>();
  private _currentDirectiveId = new Map<any, number>();
  private _isComponent = new Map<any, boolean>();

  getDirectivePosition(dir: any): ElementPosition | undefined {
    return this._currentDirectivePosition.get(dir);
  }

  getDirectiveId(dir: any): number | undefined {
    return this._currentDirectiveId.get(dir);
  }

  hasDirective(dir: any): boolean {
    return this._currentDirectiveId.has(dir);
  }

  index(): {
    newNodes: NodeArray;
    removedNodes: NodeArray;
    indexedForest: IndexedNode[];
    directiveForest: ComponentTreeNode[];
  } {
    const directiveForest = buildDirectiveForest();
    const indexedForest = indexForest(directiveForest);
    const newNodes: NodeArray = [];
    const removedNodes: NodeArray = [];
    const allNodes = new Set<any>();
    indexedForest.forEach((root) => this._index(root, null, newNodes, allNodes));
    this._currentDirectiveId.forEach((_: number, dir: any) => {
      if (!allNodes.has(dir)) {
        removedNodes.push({ directive: dir, isComponent: !!this._isComponent.get(dir) });
        // We can't clean these up because during profiling
        // they might be requested for removed components
        // this._currentDirectiveId.delete(dir);
        // this._currentDirectivePosition.delete(dir);
      }
    });
    return { newNodes, removedNodes, indexedForest, directiveForest };
  }

  private _index(
    node: IndexedNode,
    parent: TreeNode | null,
    newNodes: { directive: any; isComponent: boolean }[],
    allNodes: Set<any>
  ): void {
    if (node.component) {
      allNodes.add(node.component.instance);
      this._isComponent.set(node.component.instance, true);
      this._indexNode(node.component.instance, node.position, newNodes);
    }
    (node.directives || []).forEach((dir) => {
      allNodes.add(dir.instance);
      this._isComponent.set(dir.instance, false);
      this._indexNode(dir.instance, node.position, newNodes);
    });
    node.children.forEach((child) => this._index(child, parent, newNodes, allNodes));
  }

  private _indexNode(directive: any, position: ElementPosition, newNodes: NodeArray): void {
    this._currentDirectivePosition.set(directive, position);
    if (!this._currentDirectiveId.has(directive)) {
      newNodes.push({ directive, isComponent: !!this._isComponent.get(directive) });
      this._currentDirectiveId.set(directive, this._directiveIdCounter++);
    }
  }

  destroy(): void {
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
  parentPosition: number[] = []
): IndexedNode => {
  const position = parentPosition.concat([idx]);
  return {
    position,
    element: node.element,
    component: node.component,
    directives: node.directives.map((d) => ({ position, ...d })),
    children: node.children.map((n, i) => indexTree(n, i, position)),
    nativeElement: node.nativeElement,
  } as IndexedNode;
};

export const indexForest = <T extends DevToolsNode<DirectiveInstanceType, ComponentInstanceType>>(
  forest: T[]
): IndexedNode[] => forest.map((n, i) => indexTree(n, i));
