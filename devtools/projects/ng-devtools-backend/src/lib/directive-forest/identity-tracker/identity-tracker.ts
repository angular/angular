/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DevToolsNode, ElementPosition} from '../../../../../protocol';

import {buildDirectiveForest} from '../component-tree/component-tree';
import {
  ComponentInstance,
  ComponentInstanceType,
  ComponentTreeNode,
  DirectiveInstance,
  DirectiveInstanceType,
} from '../../shared/interfaces';

export declare interface Type<T> extends Function {
  new (...args: any[]): T;
}

interface TreeNode {
  parent: TreeNode;
  directive?: Type<DirectiveInstance>;
  children: TreeNode[];
}

export type NodeArray = {
  directive: DirectiveInstance;
  isComponent: boolean;
}[];

export type IndexingOutput = {
  newNodes: NodeArray;
  removedNodes: NodeArray;
  indexedForest: IndexedNode[];
  directiveForest: ComponentTreeNode[];
};

/**
 * Operating mode of the IdentityTracker.
 *
 * - `normal` (default) – normal operation; the data is kept only during the lifetime of directives
 * - `preservation` – preserve the IDs of destroyed directives for look up; changing the mode cleans the data
 */
export type IdentityTrackerOpMode = 'normal' | 'preservation';

/**
 * Indexes the directive forest by adding IDs and node positions.
 */
export class IdentityTracker {
  private static instance: IdentityTracker;

  private directiveIdCounter = 0;
  private currentDirectivePosition = new Map<DirectiveInstance, ElementPosition>();
  private currentDirectiveId = new Map<DirectiveInstance, number>();
  private mode: IdentityTrackerOpMode = 'normal';

  // References of removed/destroyed directives. Used during `preservation` mode.
  private pendingRemovals = new Set<DirectiveInstance>();

  isComponent = new Map<ComponentInstance, boolean>();

  // private constructor for Singleton Pattern
  private constructor() {}

  static getInstance(): IdentityTracker {
    if (!IdentityTracker.instance) {
      IdentityTracker.instance = new IdentityTracker();
    }
    return IdentityTracker.instance;
  }

  getDirectivePosition(dir: DirectiveInstance): ElementPosition | undefined {
    return this.currentDirectivePosition.get(dir);
  }

  getDirectiveId(dir: DirectiveInstance): number | undefined {
    return this.currentDirectiveId.get(dir);
  }

  hasDirective(dir: DirectiveInstance): boolean {
    return this.currentDirectiveId.has(dir);
  }

  /**
   * Change/select the operating mode of the `IdentityTracker`.
   *
   * Refer to `IdentityTrackerOpMode` for detailed information
   * about the different modes.
   */
  selectMode(mode: IdentityTrackerOpMode) {
    this.mode = mode;
    if (mode !== 'preservation') {
      this.flushPendingRemovals();
    }
  }

  index(): IndexingOutput {
    const directiveForest = buildDirectiveForest();
    const indexedForest = indexForest(directiveForest);
    const newNodes: NodeArray = [];
    const removedNodes: NodeArray = [];
    const allNodes = new Set<DirectiveInstance>();
    indexedForest.forEach((root) => this.indexInternal(root, null, newNodes, allNodes));
    this.currentDirectiveId.forEach((_: number, dir: DirectiveInstance) => {
      if (!allNodes.has(dir)) {
        removedNodes.push({directive: dir, isComponent: !!this.isComponent.get(dir)});
        if (this.mode === 'preservation') {
          this.pendingRemovals.add(dir);
        } else {
          this.cleanupDirective(dir);
        }
      }
    });
    return {newNodes, removedNodes, indexedForest, directiveForest};
  }

  private indexInternal(
    node: IndexedNode,
    parent: TreeNode | null,
    newNodes: {directive: DirectiveInstance; isComponent: boolean}[],
    allNodes: Set<DirectiveInstance>,
  ): void {
    if (node.component) {
      allNodes.add(node.component.instance);
      this.isComponent.set(node.component.instance, true);
      this.indexNode(node.component.instance, node.position, newNodes);
    }
    (node.directives || []).forEach((dir) => {
      allNodes.add(dir.instance);
      this.isComponent.set(dir.instance, false);
      this.indexNode(dir.instance, node.position, newNodes);
    });
    if (node.controlFlowBlock) {
      this.indexNode(node.controlFlowBlock, node.position, newNodes);
    }
    node.children.forEach((child) => this.indexInternal(child, parent, newNodes, allNodes));
  }

  private indexNode(
    directive: DirectiveInstance,
    position: ElementPosition,
    newNodes: NodeArray,
  ): void {
    this.currentDirectivePosition.set(directive, position);
    if (!this.currentDirectiveId.has(directive)) {
      newNodes.push({directive, isComponent: !!this.isComponent.get(directive)});
      this.currentDirectiveId.set(directive, this.directiveIdCounter++);
    }
  }

  private cleanupDirective(dir: DirectiveInstance): void {
    this.currentDirectiveId.delete(dir);
    this.currentDirectivePosition.delete(dir);
    this.isComponent.delete(dir);
  }

  private flushPendingRemovals(): void {
    for (const dir of this.pendingRemovals) {
      this.cleanupDirective(dir);
    }
    this.pendingRemovals.clear();
  }

  destroy(): void {
    this.currentDirectivePosition = new Map<DirectiveInstance, ElementPosition>();
    this.currentDirectiveId = new Map<DirectiveInstance, number>();
    this.isComponent = new Map<ComponentInstance, boolean>();
    this.pendingRemovals.clear();
    this.mode = 'normal';
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
    tagName: node.tagName,
    component: node.component,
    directives: node.directives?.map((d) => ({position, ...d})),
    children: node.children.map((n, i) => indexTree(n, i, position)),
    nativeElement: node.nativeElement,
    hydration: node.hydration,
    controlFlowBlock: node.controlFlowBlock,
    injector: node.injector,
    static: node.static,
  } satisfies IndexedNode;
};

export const indexForest = <T extends DevToolsNode<DirectiveInstanceType, ComponentInstanceType>>(
  forest: T[],
): IndexedNode[] => forest.map((n, i) => indexTree(n, i));
