/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {QueryList} from '../../linker';
import {Type} from '../../type';

import {LContainerNode, LNode, LViewNode} from './node';


/** Used for tracking queries (e.g. ViewChild, ContentChild). */
export interface LQuery {
  /**
   * Used to ask query if it should be cloned to the child element.
   *
   * For example in the case of deep queries the `child()` returns
   * query for the child node. In case of shallow queries it returns
   * `null`.
   */
  child(): LQuery|null;

  /**
   * Notify `LQuery` that a  `LNode` has been created.
   */
  addNode(node: LNode): void;

  /**
   * Notify `LQuery` that an `LViewNode` has been added to `LContainerNode`.
   */
  insertView(container: LContainerNode, view: LViewNode, insertIndex: number): void;

  /**
   * Notify `LQuery` that an `LViewNode` has been removed from `LContainerNode`.
   */
  removeView(container: LContainerNode, view: LViewNode, removeIndex: number): void;

  /**
   * Add additional `QueryList` to track.
   *
   * @param queryList `QueryList` to update with changes.
   * @param predicate Either `Type` or selector array of [key, value] predicates.
   * @param descend If true the query will recursively apply to the children.
   * @param read Indicates which token should be read from DI for this query.
   */
  track<T>(
      queryList: QueryList<T>, predicate: Type<any>|string[], descend?: boolean,
      read?: QueryReadType|Type<T>): void;
}

/** An enum representing possible values of the "read" option for queries. */
export const enum QueryReadType {
  ElementRef = 0,
  ViewContainerRef = 1,
  TemplateRef = 2,
}

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
