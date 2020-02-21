import { DevToolsNode } from 'protocol';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { map } from 'rxjs/operators';
import { DefaultIterableDiffer } from '@angular/core';
import { IndexedNode, indexForest } from './index-forest';
import { diff } from '../../diffing';

/** Flat node with expandable and level information */
export interface FlatNode {
  id: string;
  expandable: boolean;
  name: string;
  directives: string;
  position: number[];
  level: number;
  original: IndexedNode;
  newItem?: boolean;
}

const expandable = (node: IndexedNode) => !!node.children && node.children.length > 0;

const trackBy = (_: number, item: FlatNode) => {
  return item.id;
};

const getId = (node: IndexedNode) => {
  let prefix = '';
  if (node.component) {
    prefix = node.component.id.toString();
  }
  const dirIds = node.directives
    .map(d => d.id)
    .sort((a, b) => {
      return a - b;
    });
  return prefix + '-' + dirIds.join('-');
};

export class ComponentDataSource extends DataSource<FlatNode> {
  private _differ = new DefaultIterableDiffer(trackBy);
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
        id: getId(node),
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

  get expandedDataValues() {
    return this._expandedData.value;
  }

  update(forest: DevToolsNode[]) {
    if (!forest) {
      return;
    }

    const indexedForest = indexForest(forest);
    const flattenedCollection = this._treeFlattener.flattenNodes(indexedForest);

    this.data.forEach(i => (i.newItem = false));

    const { newItems } = diff(this._differ, this.data, flattenedCollection);
    this._treeControl.dataNodes = this.data;
    this._flattenedData.next(this.data);

    newItems.forEach(i => (i.newItem = true));

    return newItems;
  }

  connect(): Observable<FlatNode[]> {
    return this._flattenedData.pipe(
      map(() => {
        this._expandedData.next(this.data);
        return this._expandedData.value;
      })
    );
  }

  disconnect() {}
}
