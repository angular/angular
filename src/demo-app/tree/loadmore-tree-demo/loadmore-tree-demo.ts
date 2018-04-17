/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FlatTreeControl} from '@angular/cdk/tree';
import {Component} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {Observable} from 'rxjs';
import {LoadmoreDatabase, LoadmoreFlatNode, LoadmoreNode} from './loadmore-database';


const LOAD_MORE = 'LOAD_MORE';

/**
 * When a node has a large number of children, only load part of the children, and display a
 * `Load more...` button to manually request for more data in the tree.
 */
@Component({
  moduleId: module.id,
  selector: 'loadmore-tree-demo',
  templateUrl: 'loadmore-tree-demo.html',
  styleUrls: ['loadmore-tree-demo.css'],
  providers: [LoadmoreDatabase]
})
export class LoadmoreTreeDemo {

  nodeMap: Map<string, LoadmoreFlatNode> = new Map<string, LoadmoreFlatNode>();

  treeControl: FlatTreeControl<LoadmoreFlatNode>;

  treeFlattener: MatTreeFlattener<LoadmoreNode, LoadmoreFlatNode>;

  // Flat tree data source
  dataSource: MatTreeFlatDataSource<LoadmoreNode, LoadmoreFlatNode>;

  constructor(private database: LoadmoreDatabase) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);

    this.treeControl = new FlatTreeControl<LoadmoreFlatNode>(this.getLevel, this.isExpandable);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });

    database.initialize();
  }

  getChildren = (node: LoadmoreNode): Observable<LoadmoreNode[]> => { return node.childrenChange; };

  transformer = (node: LoadmoreNode, level: number) => {
    if (this.nodeMap.has(node.item)) {
      return this.nodeMap.get(node.item)!;
    }
    const newNode =
        new LoadmoreFlatNode(node.item, level, node.hasChildren, node.loadMoreParentItem);
    this.nodeMap.set(node.item, newNode);
    return newNode;
  }

  getLevel = (node: LoadmoreFlatNode) => { return node.level; };

  isExpandable = (node: LoadmoreFlatNode) => { return node.expandable; };

  hasChild = (_: number, _nodeData: LoadmoreFlatNode) => { return _nodeData.expandable; };

  isLoadMore = (_: number, _nodeData: LoadmoreFlatNode) => { return _nodeData.item === LOAD_MORE; };

  /** Load more nodes from data source */
  loadMore(item: string) {
    this.database.loadMore(item);
  }

  loadChildren(node: LoadmoreFlatNode) {
    this.database.loadMore(node.item, true);
  }
}
