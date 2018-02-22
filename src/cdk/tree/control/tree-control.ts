/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SelectionModel} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';

/**
 * Tree control interface. User can implement TreeControl to expand/collapse dataNodes in the tree.
 * The CDKTree will use this TreeControl to expand/collapse a node.
 * User can also use it outside the `<cdk-tree>` to control the expansion status of the tree.
 */
export interface TreeControl<T> {
  /** The saved tree nodes data for `expandAll` action. */
  dataNodes: T[];

  /** The expansion model */
  expansionModel: SelectionModel<T>;

  /** Whether the data node is expanded or collapsed. Return true if it's expanded. */
  isExpanded(dataNode: T): boolean;

  /** Get all descendants of a data node */
  getDescendants(dataNode: T): any[];

  /** Expand or collapse data node */
  toggle(dataNode: T): void;

  /** Expand one data node */
  expand(dataNode: T): void;

  /** Collapse one data node */
  collapse(dataNode: T): void;

  /** Expand all the dataNodes in the tree */
  expandAll(): void;

  /** Collapse all the dataNodes in the tree */
  collapseAll(): void;

  /** Toggle a data node by expand/collapse it and all its descendants */
  toggleDescendants(dataNode: T): void;

  /** Expand a data node and all its descendants */
  expandDescendants(dataNode: T): void;

  /** Collapse a data node and all its descendants */
  collapseDescendants(dataNode: T): void;

  /** Get depth of a given data node, return the level number. This is for flat tree node. */
  readonly getLevel: (dataNode: T) => number;

  /**
   * Whether the data node is expandable. Returns true if expandable.
   * This is for flat tree node.
   */
  readonly isExpandable: (dataNode: T) => boolean;

  /** Gets a stream that emits whenever the given data node's children change. */
  readonly getChildren: (dataNode: T) => Observable<T[]>;
}
