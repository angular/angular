/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {QueryList} from '../../linker';
import {Type} from '../../type';
import {TContainerNode, TElementContainerNode, TElementNode, TNode} from './node';

/** Used for tracking queries (e.g. ViewChild, ContentChild). */
export interface LQueries {
  /**
   * The parent LQueries instance.
   *
   * When there is a content query, a new LQueries instance is created to avoid mutating any
   * existing LQueries. After we are done searching content children, the parent property allows
   * us to traverse back up to the original LQueries instance to continue to search for matches
   * in the main view.
   */
  parent: LQueries|null;

  /**
   * Ask queries to prepare copy of itself. This assures that tracking new queries on content nodes
   * doesn't mutate list of queries tracked on a parent node. We will clone LQueries before
   * constructing content queries.
   */
  clone(): LQueries;

  /**
   * Notify `LQueries` that a new `TNode` has been created and needs to be added to query results
   * if matching query predicate.
   */
  addNode(tNode: TElementNode|TContainerNode|TElementContainerNode): LQueries|null;

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
  removeView(): void;

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
      read?: Type<T>): void;
}

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
