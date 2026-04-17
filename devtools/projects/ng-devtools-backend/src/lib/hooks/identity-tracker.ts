/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DevToolsNode, ElementPosition} from '../../../../protocol';

import {buildDirectiveForest} from '../component-tree/component-tree';
import {ComponentInstanceType, ComponentTreeNode, DirectiveInstanceType} from '../interfaces';

export declare interface Type<T> extends Function {
  new (...args: any[]): T;
}

interface TreeNode {
  parent: TreeNode;
  directive?: Type<any>;
  children: TreeNode[];
}

export type NodeArray = {
  directive: any;
  isComponent: boolean;
}[];

export class IdentityTracker {
  private static _instance: IdentityTracker;

  private _directiveIdCounter = 0;
  private _currentDirectivePosition = new Map<any, ElementPosition>();
  private _currentDirectiveId = new Map<any, number>();
  isComponent = new Map<any, boolean>();

  /**
   * Directives that were removed while profiling was active.
   * Cleanup is deferred until profiling stops so that the profiler
   * can still look up IDs / positions of destroyed components.
   */
  private _pendingRemovals = new Set<any>();
  private _isProfiling = false;

  // private constructor for Singleton Pattern
  private constructor() {}

  static getInstance(): IdentityTracker {
    if (!IdentityTracker._instance) {
      IdentityTracker._instance = new IdentityTracker();
    }
    return IdentityTracker._instance;
  }

  getDirectivePosition(dir: any): ElementPosition | undefined {
    return this._currentDirectivePosition.get(dir);
  }

  getDirectiveId(dir: any): number | undefined {
    return this._currentDirectiveId.get(dir);
  }

  hasDirective(dir: any): boolean {
    return this._currentDirectiveId.has(dir);
  }

  /**
   * Toggle profiling state. While profiling is active, removed directive
   * entries are kept so the profiler can still resolve IDs and positions.
   * When profiling stops, deferred removals are flushed.
   */
  setProfilingActive(active: boolean): void {
    this._isProfiling = active;
    if (!active) {
      this._flushPendingRemovals();
    }
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
        removedNodes.push({directive: dir, isComponent: !!this.isComponent.get(dir)});
        if (this._isProfiling) {
          this._pendingRemovals.add(dir);
        } else {
          this._cleanupDirective(dir);
        }
      }
    });
    return {newNodes, removedNodes, indexedForest, directiveForest};
  }

  private _index(
    node: IndexedNode,
    parent: TreeNode | null,
    newNodes: {directive: any; isComponent: boolean}[],
    allNodes: Set<any>,
  ): void {
    if (node.component) {
      allNodes.add(node.component.instance);
      this.isComponent.set(node.component.instance, true);
      this._indexNode(node.component.instance, node.position, newNodes);
    }
    (node.directives || []).forEach((dir) => {
      allNodes.add(dir.instance);
      this.isComponent.set(dir.instance, false);
      this._indexNode(dir.instance, node.position, newNodes);
    });
    if (node.controlFlowBlock) {
      this._indexNode(node.controlFlowBlock, node.position, newNodes);
    }
    node.children.forEach((child) => this._index(child, parent, newNodes, allNodes));
  }

  private _indexNode(directive: any, position: ElementPosition, newNodes: NodeArray): void {
    this._currentDirectivePosition.set(directive, position);
    if (!this._currentDirectiveId.has(directive)) {
      newNodes.push({directive, isComponent: !!this.isComponent.get(directive)});
      this._currentDirectiveId.set(directive, this._directiveIdCounter++);
    }
  }

  private _cleanupDirective(dir: any): void {
    this._currentDirectiveId.delete(dir);
    this._currentDirectivePosition.delete(dir);
    this.isComponent.delete(dir);
  }

  private _flushPendingRemovals(): void {
    for (const dir of this._pendingRemovals) {
      this._cleanupDirective(dir);
    }
    this._pendingRemovals.clear();
  }

  destroy(): void {
    this._currentDirectivePosition = new Map<any, ElementPosition>();
    this._currentDirectiveId = new Map<any, number>();
    this.isComponent = new Map<any, boolean>();
    this._pendingRemovals.clear();
    this._isProfiling = false;
  }
}

export interface IndexedNode extends DevToolsNode<DirectiveInstanceType, ComponentInstanceType> {
  position: ElementPosition;
  children: IndexedNode[];
}

const indexTree = <T extends DevToolsNode<DirectiveInstanceType, ComponentInstanceType>>(
  node: T,
  idx: number,
  parentPosition: number[] = [],
): IndexedNode => {
  const position = parentPosition.concat([idx]);
  return {
    position,
    element: node.element,
    component: node.component,
    directives: node.directives?.map((d) => ({position, ...d})),
    children: node.children.map((n, i) => indexTree(n, i, position)),
    nativeElement: node.nativeElement,
    hydration: node.hydration,
    controlFlowBlock: node.controlFlowBlock,
  } as IndexedNode;
};

export const indexForest = <T extends DevToolsNode<DirectiveInstanceType, ComponentInstanceType>>(
  forest: T[],
): IndexedNode[] => forest.map((n, i) => indexTree(n, i));
