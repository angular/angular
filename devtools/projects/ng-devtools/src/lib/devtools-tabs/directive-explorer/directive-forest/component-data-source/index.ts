/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DefaultIterableDiffer, TrackByFunction} from '@angular/core';
import {MatTreeFlattener} from '@angular/material/tree';
import {
  DevToolsNode,
  ControlFlowBlock,
  HydrationStatus,
  ChangeDetection,
} from '../../../../../../../protocol';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {diff} from '../../diffing';
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
  hydration: HydrationStatus;
  controlFlowBlock: ControlFlowBlock | null;
  changeDetection?: ChangeDetection;
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
  const dirIds = node.directives
    .map((d) => d.id)
    .sort((a, b) => {
      return a - b;
    });
  return prefix + '-' + dirIds.join('-');
};

export class ComponentDataSource extends DataSource<FlatNode> {
  private _differ = new DefaultIterableDiffer<FlatNode>(trackBy);
  private _expandedData = new BehaviorSubject<FlatNode[]>([]);
  private _flattenedData = new BehaviorSubject<FlatNode[]>([]);
  private _nodeToFlat = new WeakMap<IndexedNode, FlatNode>();

  private _treeFlattener = new MatTreeFlattener(
    (node: IndexedNode, level: number) => {
      if (this._nodeToFlat.has(node)) {
        return this._nodeToFlat.get(node);
      }
      const flatNode: FlatNode = {
        expandable: expandable(node),
        id: getId(node),
        // We can compare the nodes in the navigation functions above
        // based on this identifier directly, since it's a reference type
        // and the reference is preserved after transformation.
        position: node.position,
        name: node.component?.name ?? '',
        directives: node.directives.map((d) => d.name),
        original: node,
        level,
        hydration: node.hydration,
        controlFlowBlock: node.controlFlowBlock,
        changeDetection: node.changeDetection,
        hasNativeElement: node.hasNativeElement,
      };
      this._nodeToFlat.set(node, flatNode);
      return flatNode;
    },
    (node) => (node ? node.level : -1),
    (node) => (node ? node.expandable : false),
    (node) => (node ? node.children : []),
  );

  constructor(private _treeControl: FlatTreeControl<FlatNode>) {
    super();
  }

  get data(): FlatNode[] {
    return this._flattenedData.value;
  }

  get expandedDataValues(): FlatNode[] {
    return this._expandedData.value;
  }

  getFlatNodeFromIndexedNode(indexedNode: IndexedNode): FlatNode | undefined {
    return this._nodeToFlat.get(indexedNode);
  }

  getFlatNodeByPosition(position: number[]): FlatNode | undefined {
    return this.data.find(
      (node) =>
        node.position.length === position.length &&
        node.position.every((p, i) => p === position[i]),
    );
  }

  update(forest: DevToolsNode[]): {
    newItems: FlatNode[];
    movedItems: FlatNode[];
    removedItems: FlatNode[];
  } {
    if (!forest) {
      return {newItems: [], movedItems: [], removedItems: []};
    }

    let indexedForest = indexForest(forest);

    const flattenedCollection = this._treeFlattener.flattenNodes(indexedForest) as FlatNode[];

    this.data.forEach((i) => (i.newItem = false));

    const expandedNodes: Record<string, boolean> = {};
    this.data.forEach((item) => {
      expandedNodes[item.id] = this._treeControl.isExpanded(item);
    });

    const {newItems, movedItems, removedItems} = diff<FlatNode>(
      this._differ,
      this.data,
      flattenedCollection,
    );
    this._treeControl.dataNodes = this.data;
    this._flattenedData.next(this.data);

    movedItems.forEach((i) => {
      this._nodeToFlat.set(i.original, i);
      if (expandedNodes[i.id]) {
        this._treeControl.expand(i);
      }
    });
    newItems.forEach((i) => (i.newItem = true));
    removedItems.forEach((i) => this._nodeToFlat.delete(i.original));

    return {newItems, movedItems, removedItems};
  }

  override connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
    const changes = [
      collectionViewer.viewChange,
      this._treeControl.expansionModel.changed,
      this._flattenedData,
    ];
    return merge<unknown[]>(...changes).pipe(
      map(() => {
        this._expandedData.next(
          this._treeFlattener.expandFlattenedNodes(
            this.data,
            this._treeControl as FlatTreeControl<FlatNode | undefined>,
          ) as FlatNode[],
        );
        return this._expandedData.value;
      }),
    );
  }

  override disconnect(): void {}
}
