import { Descriptor, Node } from 'protocol';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, merge, of } from 'rxjs';
import { MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { map } from 'rxjs/operators';
import { DefaultIterableDiffer } from '@angular/core';
import { IndexedNode, indexForest } from './index-forest';

/** Flat node with expandable and level information */
export interface FlatNode {
  expandable: boolean;
  name: string;
  directives: string;
  id: number[];
  level: number;
  original: IndexedNode;
}

const expandable = (node: IndexedNode) => !!node.children && node.children.length > 0;

const trackBy = (idx: number, item: FlatNode) =>
  `#${idx}#${item.name}#${item.directives}#${(item.original.children || []).length === 0}`;

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
        id: node.id,
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

  get data() {
    return this._flattenedData.value;
  }

  get data$() {
    return this._data;
  }

  update(forest: Node[]) {
    if (!forest) {
      return;
    }

    const indexedForest = indexForest(forest);
    const flattenedCollection = this._treeFlattener.flattenNodes(indexedForest);

    this._differ.diff(this.data);
    this._differ.diff(flattenedCollection);

    this._differ.forEachOperation(record => {
      this.data[record.currentIndex] = record.item;
    });
    this._differ.forEachRemovedItem(record => {
      const idx = this.data.indexOf(record.item);
      if (idx >= 0) {
        this.data.splice(idx, 1);
      }
    });

    this._treeControl.dataNodes = this.data;
    this._flattenedData.next(this.data);

    this._data.next(indexedForest);
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
