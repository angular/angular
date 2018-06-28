/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FlatTreeControl, NestedTreeControl} from '@angular/cdk/tree';
import {Component} from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeNestedDataSource
} from '@angular/material/tree';
import {FileDatabase, FileFlatNode, FileNode} from './file-database';


@Component({
  moduleId: module.id,
  selector: 'tree-demo',
  templateUrl: 'tree-demo.html',
  styleUrls: ['tree-demo.css'],
  providers: [FileDatabase]
})
export class TreeDemo {
  // Flat tree control
  treeControl: FlatTreeControl<FileFlatNode>;

  // Nested tree control
  nestedTreeControl: NestedTreeControl<FileNode>;

  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;

  // Flat tree data source
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;

  // Nested tree data source
  nestedDataSource: MatTreeNestedDataSource<FileNode>;

  constructor(database: FileDatabase) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
                                              this.isExpandable, this.getChildren);
    // For flat tree
    this.treeControl = new FlatTreeControl<FileFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    // For nested tree
    this.nestedTreeControl = new NestedTreeControl<FileNode>(this.getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();

    database.dataChange.subscribe(data => {
      this.dataSource.data = data;
      this.nestedDataSource.data = data;
    });
  }

  transformer = (node: FileNode, level: number) => {
    const flatNode = new FileFlatNode();
    flatNode.filename = node.filename;
    flatNode.type = node.type;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    return flatNode;
  }

  getLevel = (node: FileFlatNode) => { return node.level; };

  isExpandable = (node: FileFlatNode) => { return node.expandable; };

  getChildren = (node: FileNode): FileNode[] => { return node.children; };

  hasChild = (_: number, _nodeData: FileFlatNode) => { return _nodeData.expandable; };

  hasNestedChild = (_: number, nodeData: FileNode) => {return !(nodeData.type); };
}
