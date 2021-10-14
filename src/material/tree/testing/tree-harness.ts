/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, parallel} from '@angular/cdk/testing';
import {MatTreeNodeHarness} from './node-harness';
import {TreeHarnessFilters, TreeNodeHarnessFilters} from './tree-harness-filters';

export type TextTree = {
  text?: string;
  children?: TextTree[];
};

/** Harness for interacting with a standard mat-tree in tests. */
export class MatTreeHarness extends ComponentHarness {
  /** The selector for the host element of a `MatTableHarness` instance. */
  static hostSelector = '.mat-tree';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tree with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TreeHarnessFilters = {}): HarnessPredicate<MatTreeHarness> {
    return new HarnessPredicate(MatTreeHarness, options);
  }

  /** Gets all of the nodes in the tree. */
  async getNodes(filter: TreeNodeHarnessFilters = {}): Promise<MatTreeNodeHarness[]> {
    return this.locatorForAll(MatTreeNodeHarness.with(filter))();
  }

  /**
   * Gets an object representation for the visible tree structure
   * If a node is under an unexpanded node it will not be included.
   * Eg.
   * Tree (all nodes expanded):
   * `
   * <mat-tree>
   *   <mat-tree-node>Node 1<mat-tree-node>
   *   <mat-nested-tree-node>
   *     Node 2
   *     <mat-nested-tree-node>
   *       Node 2.1
   *       <mat-tree-node>
   *         Node 2.1.1
   *       <mat-tree-node>
   *     <mat-nested-tree-node>
   *     <mat-tree-node>
   *       Node 2.2
   *     <mat-tree-node>
   *   <mat-nested-tree-node>
   * </mat-tree>`
   *
   * Tree structure:
   * {
   *  children: [
   *    {
   *      text: 'Node 1',
   *      children: [
   *        {
   *          text: 'Node 2',
   *          children: [
   *            {
   *              text: 'Node 2.1',
   *              children: [{text: 'Node 2.1.1'}]
   *            },
   *            {text: 'Node 2.2'}
   *          ]
   *        }
   *      ]
   *    }
   *  ]
   * };
   */
  async getTreeStructure(): Promise<TextTree> {
    const nodes = await this.getNodes();
    const nodeInformation = await parallel(() =>
      nodes.map(node => {
        return parallel(() => [node.getLevel(), node.getText(), node.isExpanded()]);
      }),
    );
    return this._getTreeStructure(nodeInformation, 1, true);
  }

  /**
   * Recursively collect the structured text of the tree nodes.
   * @param nodes A list of tree nodes
   * @param level The level of nodes that are being accounted for during this iteration
   * @param parentExpanded Whether the parent of the first node in param nodes is expanded
   */
  private _getTreeStructure(
    nodes: [number, string, boolean][],
    level: number,
    parentExpanded: boolean,
  ): TextTree {
    const result: TextTree = {};
    for (let i = 0; i < nodes.length; i++) {
      const [nodeLevel, text, expanded] = nodes[i];
      const nextNodeLevel = nodes[i + 1]?.[0] ?? -1;

      // Return the accumulated value for the current level once we reach a shallower level node
      if (nodeLevel < level) {
        return result;
      }
      // Skip deeper level nodes during this iteration, they will be picked up in a later iteration
      if (nodeLevel > level) {
        continue;
      }
      // Only add to representation if it is visible (parent is expanded)
      if (parentExpanded) {
        // Collect the data under this node according to the following rules:
        // 1. If the next node in the list is a sibling of the current node add it to the child list
        // 2. If the next node is a child of the current node, get the sub-tree structure for the
        //    child and add it under this node
        // 3. If the next node has a shallower level, we've reached the end of the child nodes for
        //    the current parent.
        if (nextNodeLevel === level) {
          this._addChildToNode(result, {text});
        } else if (nextNodeLevel > level) {
          let children = this._getTreeStructure(
            nodes.slice(i + 1),
            nextNodeLevel,
            expanded,
          )?.children;
          let child = children ? {text, children} : {text};
          this._addChildToNode(result, child);
        } else {
          this._addChildToNode(result, {text});
          return result;
        }
      }
    }
    return result;
  }

  private _addChildToNode(result: TextTree, child: TextTree) {
    result.children ? result.children.push(child) : (result.children = [child]);
  }
}
