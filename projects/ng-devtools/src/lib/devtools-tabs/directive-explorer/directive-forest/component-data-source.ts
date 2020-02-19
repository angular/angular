import { Node } from 'protocol';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, merge, of } from 'rxjs';
import { MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { map } from 'rxjs/operators';
import { DefaultIterableDiffer } from '@angular/core';
import { IndexedNode, indexForest } from './index-forest';
import { diff } from '../../diffing';

/** Flat node with expandable and level information */
export interface FlatNode {
  expandable: boolean;
  name: string;
  directives: string;
  position: number[];
  level: number;
  original: IndexedNode;
}

const expandable = (node: IndexedNode) => !!node.children && node.children.length > 0;

const trackBy = (idx: number, item: FlatNode) =>
  `#${idx}#${item.name}#${item.directives}#${item.position.join(',')}#${(item.original.children || []).length === 0}`;

export class ComponentDataSource extends DataSource<FlatNode> {
  private _differ = new DefaultIterableDiffer(trackBy);
  private _data = new BehaviorSubject<IndexedNode[]>([]);
  private _expandedData = new BehaviorSubject<FlatNode[]>([]);
  private _flattenedData = new BehaviorSubject<FlatNode[]>([]);
  private _nodeToFlat = new Map<IndexedNode, FlatNode>();

  private _treeFlattener = new MatTreeFlattener(
    (node: IndexedNode, level: number) => {
      if (this._nodeToFlat.has(node)) {
        return this._nodeToFlat.get(node);
      }
      const flatNode: FlatNode = {
        expandable: expandable(node),
        // We can compare the nodes in the navigation functions above
        // based on this identifier directly, since it's a reference type
        // and the reference is preserved after transformation.
        position: node.position,
        name: node.component ? node.component.name : node.element,
        directives: node.directives.map(d => d.name).join(', '),
        original: node,
        level,
      };
      this._nodeToFlat.set(node, flatNode);
      return flatNode;
    },
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  constructor(private _treeControl: FlatTreeControl<FlatNode>) {
    super();
  }

  get data(): FlatNode[] {
    return this._flattenedData.value;
  }

  get data$(): BehaviorSubject<IndexedNode[]> {
    return this._data;
  }

  get expandedDataValues() {
    return this._expandedData.value;
  }

  update(forest: Node[]) {
    if (!forest) {
      return;
    }

    const indexedForest = indexForest(forest);
    const flattenedCollection = this._treeFlattener.flattenNodes(indexedForest);

    const newItems = diff(this._differ, this.data, flattenedCollection);

    this._treeControl.dataNodes = this.data;
    this._flattenedData.next(this.data);

    this._data.next(indexedForest);

    return newItems;
  }

  connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
    return merge(collectionViewer.viewChange, this._treeControl.expansionModel.changed, this._flattenedData).pipe(
      map(() => {
        this._expandedData.next(this._treeFlattener.expandFlattenedNodes(this._flattenedData.value, this._treeControl));
        return this._expandedData.value;
      })
    );
  }

  disconnect() {}
}
