/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {DefaultIterableDiffer, TrackByFunction} from '@angular/core';
import {
  DevToolsNode,
  ControlFlowBlock,
  HydrationStatus,
  ChangeDetection,
} from '../../../../../../../protocol';
import {BehaviorSubject, merge, Observable, map} from 'rxjs';

import {diff} from '../../diffing';
import {ExpansionModel} from '../expansion-model';
import {IndexedNode, indexForest} from '../index-forest';

/** Flat node with expandable and level information */
export interface FlatNode {
  id: string;
  expandable: boolean;
  name: string;
  directives: string[];
  position: number[];
  level: number;
  original: IndexedNode;
  newItem?: boolean;
  hydration?: HydrationStatus;
  controlFlowBlock: ControlFlowBlock | null;
  changeDetection?: ChangeDetection;
  collapsedByDefault: boolean;
  static: boolean;
  hasNativeElement: boolean;
}

const expandable = (node: IndexedNode) => !!node.children && node.children.length > 0;

const trackBy: TrackByFunction<FlatNode> = (_: number, item: FlatNode) =>
  `${item.id}#${item.expandable}`;

const getId = (node: IndexedNode) => {
  if (node.controlFlowBlock) {
    return node.controlFlowBlock.id;
  } else if (node.hydration?.status === 'dehydrated') {
    return node.position.join('-');
  }

  let prefix = '';
  if (node.component) {
    prefix = node.component.id.toString();
  }
  const dirIds =
    node.directives
      ?.map((d) => d.id)
      .sort((a, b) => {
        return a - b;
      }) ?? [];
  return prefix + '-' + dirIds.join('-');
};

/**
 * Takes an `IndexedNode` forest and returns a transformed forest without `#comment` nodes.
 * The algorithm has linear complexity and O(depth(forest)) memory complexity.
 *
 * @param nodes indexed nodes, which have already have associated positions within the original
 *  tree and associated indices.
 * @returns forest with filtered `#comment` nodes.
 */
const filterCommentNodes = (nodes: IndexedNode[]) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.tagName !== '#comment') {
      continue;
    }
    nodes.splice(i, 1, ...node.children);
    i--;
  }
  for (const node of nodes) {
    filterCommentNodes(node.children);
  }
  return nodes;
};

/**
 * Returns the nodes of a flattened tree that are visible, i.e. whose ancestors are all expanded.
 *
 * @param nodes flat nodes in depth-first order.
 * @param isExpanded whether the given node is expanded.
 */
const getVisibleNodes = (nodes: FlatNode[], isExpanded: (node: FlatNode) => boolean) => {
  const visibleNodes: FlatNode[] = [];
  // Whether all ancestors are expanded, indexed by level.
  const expandedAtLevel: boolean[] = [true];
  for (const node of nodes) {
    let visible = true;
    for (let i = 0; i <= node.level; i++) {
      visible = visible && !!expandedAtLevel[i];
    }
    if (visible) {
      visibleNodes.push(node);
    }
    if (node.expandable) {
      expandedAtLevel[node.level + 1] = isExpanded(node);
    }
  }
  return visibleNodes;
};

export class ComponentDataSource extends DataSource<FlatNode> {
  private differ = new DefaultIterableDiffer<FlatNode>(trackBy);
  private expandedData = new BehaviorSubject<FlatNode[]>([]);
  private flattenedData = new BehaviorSubject<FlatNode[]>([]);
  private nodeToFlat = new WeakMap<IndexedNode, FlatNode>();

  constructor(private expansionModel: ExpansionModel<FlatNode>) {
    super();
  }

  /** Flattens the forest into a list of nodes in depth-first order. */
  private flattenNodes(nodes: IndexedNode[], level = 0, result: FlatNode[] = []): FlatNode[] {
    for (const node of nodes) {
      const flatNode = this.toFlatNode(node, level);
      result.push(flatNode);
      if (flatNode.expandable) {
        this.flattenNodes(node.children, level + 1, result);
      }
    }
    return result;
  }

  private toFlatNode(node: IndexedNode, level: number): FlatNode {
    const existingNode = this.nodeToFlat.get(node);
    if (existingNode) {
      return existingNode;
    }
    const flatNode: FlatNode = {
      expandable: expandable(node),
      id: getId(node),
      position: node.position,
      name: node.component ? node.component.name : (node.tagName ?? ''),
      directives: node.directives?.map((d) => d.name) ?? [],
      original: node,
      level,
      hydration: node.hydration,
      controlFlowBlock: node.controlFlowBlock,
      static: node.static,
      changeDetection: node.changeDetection,
      hasNativeElement: node.hasNativeElement,
      collapsedByDefault: node.children.every((n) => n.static),
    };
    this.nodeToFlat.set(node, flatNode);
    return flatNode;
  }

  get data(): FlatNode[] {
    return this.flattenedData.value;
  }

  get expandedDataValues(): FlatNode[] {
    return this.expandedData.value;
  }

  getFlatNodeFromIndexedNode(indexedNode: IndexedNode): FlatNode | undefined {
    return this.nodeToFlat.get(indexedNode);
  }

  getFlatNodeByPosition(position: number[]): FlatNode | undefined {
    return this.data.find(
      (node) =>
        node.position.length === position.length &&
        node.position.every((p, i) => p === position[i]),
    );
  }

  update(
    forest: DevToolsNode[],
    showCommentNodes: boolean,
  ): {newItems: FlatNode[]; movedItems: FlatNode[]; removedItems: FlatNode[]} {
    if (!forest) {
      return {newItems: [], movedItems: [], removedItems: []};
    }

    let indexedForest = indexForest(forest);

    // We filter comment nodes here because we need to preserve the positions within the component
    // tree.
    //
    // For example:
    // ```
    // - #comment
    //   - bar
    // ```
    //
    // #comment's position will be [0] and bar's will be [0, 0]. If we trim #comment nodes earlier
    // before indexing, bar's position will be [0] which will be inaccurate and will make the
    // backend enable to find the corresponding node when we request its properties.
    if (!showCommentNodes) {
      indexedForest = filterCommentNodes(indexedForest);
    }

    const flattenedCollection = this.flattenNodes(indexedForest);

    this.data.forEach((i) => (i.newItem = false));

    const expandedNodes: Record<string, boolean> = {};
    this.data.forEach((item) => {
      expandedNodes[item.id] = this.expansionModel.isExpanded(item);
    });

    const {newItems, movedItems, removedItems} = diff<FlatNode>(
      this.differ,
      this.data,
      flattenedCollection,
    );
    this.flattenedData.next(this.data);

    movedItems.forEach((i) => {
      this.nodeToFlat.set(i.original, i);
      if (expandedNodes[i.id]) {
        this.expansionModel.expand(i);
      }
    });
    newItems.forEach((i) => (i.newItem = true));
    removedItems.forEach((i) => this.nodeToFlat.delete(i.original));

    return {newItems, movedItems, removedItems};
  }

  override connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
    const changes = [collectionViewer.viewChange, this.expansionModel.changed, this.flattenedData];
    return merge<unknown[]>(...changes).pipe(
      map(() => {
        this.expandedData.next(
          getVisibleNodes(this.data, (node) => this.expansionModel.isExpanded(node)),
        );
        return this.expandedData.value;
      }),
    );
  }

  override disconnect(): void {}
}
