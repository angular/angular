/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DynamicDataSource, DynamicFlatNode, DynamicDatabase} from './dynamic-database';


@Component({
  moduleId: module.id,
  selector: 'dynamic-tree-demo',
  templateUrl: 'dynamic-tree-demo.html',
  styleUrls: ['dynamic-tree-demo.css'],
  providers: [DynamicDatabase]
})
export class DynamicTreeDemo {

  constructor(database: DynamicDatabase) {
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database);

    this.dataSource.data = database.initialData();
  }

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: DynamicFlatNode) => { return node.level; };

  isExpandable = (node: DynamicFlatNode) => { return node.expandable; };

  hasChild = (_: number, _nodeData: DynamicFlatNode) => { return _nodeData.expandable; };
}
