/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseTreeControl} from './base-tree-control';

/** Flat tree control. Able to expand/collapse a subtree recursively for flattened tree. */
export class FlatTreeControl<T> extends BaseTreeControl<T> {

  /** Construct with flat tree data node functions getLevel and isExpandable. */
  constructor(public getLevel: (dataNode: T) => number,
              public isExpandable: (dataNode: T) => boolean) {
    super();
  }

  /**
   * Gets a list of the data node's subtree of descendent data nodes.
   *
   * To make this working, the `dataNodes` of the TreeControl must be flattened tree nodes
   * with correct levels.
   */
  getDescendants(dataNode: T): T[] {
    const startIndex = this.dataNodes.indexOf(dataNode);
    const results: T[] = [];

    // Goes through flattened tree nodes in the `dataNodes` array, and get all descendants.
    // The level of descendants of a tree node must be greater than the level of the given
    // tree node.
    // If we reach a node whose level is equal to the level of the tree node, we hit a sibling.
    // If we reach a node whose level is greater than the level of the tree node, we hit a
    // sibling of an ancestor.
    for (let i = startIndex + 1;
        i < this.dataNodes.length && this.getLevel(dataNode) < this.getLevel(this.dataNodes[i]);
        i++) {
      results.push(this.dataNodes[i]);
    }
    return results;
  }

  /**
   * Expands all data nodes in the tree.
   *
   * To make this working, the `dataNodes` variable of the TreeControl must be set to all flattened
   * data nodes of the tree.
   */
  expandAll(): void {
    this.expansionModel.select(...this.dataNodes);
  }
}
