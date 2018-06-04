/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {QueryList} from '../../linker';
import {Type} from '../../type';
import {LNode} from './node';

/** Used for tracking queries (e.g. ViewChild, ContentChild). */
export interface LQueries {
  /**
   * Used to ask queries if those should be cloned to the child element.
   *
   * For example in the case of deep queries the `child()` returns
   * queries for the child node. In case of shallow queries it returns
   * `null`.
   */
  child(): LQueries|null;

  /**
   * Notify `LQueries` that a new `LNode` has been created and needs to be added to query results
   * if matching query predicate.
   */
  addNode(node: LNode): void;

  /**
   * Notify `LQueries` that a new LContainer was added to ivy data structures. As a result we need
   * to prepare room for views that might be inserted into this container.
   */
  container(): LQueries|null;

  /**
   * Notify `LQueries` that a new `LView` has been created. As a result we need to prepare room
   * and collect nodes that match query predicate.
   */
  createView(): LQueries|null;

  /**
   * Notify `LQueries` that a new `LView` has been added to `LContainer`. As a result all
   * the matching nodes from this view should be added to container's queries.
   */
  insertView(newViewIndex: number): void;

  /**
   * Notify `LQueries` that an `LView` has been removed from `LContainer`. As a result all
   * the matching nodes from this view should be removed from container's queries.
   */
  removeView(removeIndex: number): void;

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
      read?: QueryReadType<T>|Type<T>): void;
}

export class QueryReadType<T> { private defeatStructuralTyping: any; }

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
