/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SelectionModel} from './selection';


/**
 * Interface for a class that can flatten hierarchical structured data and re-expand the flattened
 * data back into its original structure. Should be used in conjunction with the cdk-tree.
 */
export interface TreeDataNodeFlattener<T> {
  /** Transforms a set of hierarchical structured data into a flattened data array. */
  flattenNodes(structuredData: any[]): T[];

  /**
   * Expands a flattened array of data into its hierarchical form using the provided expansion
   * model.
   */
  expandFlattenedNodes(nodes: T[], expansionModel: SelectionModel<T>): T[];

  /**
   * Put node descendants of node in array.
   * If `onlyExpandable` is true, then only process expandable descendants.
   */
  nodeDescendents(node: T, nodes: T[], onlyExpandable: boolean);
}
