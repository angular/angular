/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';
import {QueryList} from '../../linker';

import {TContainerNode, TElementContainerNode, TElementNode, TNode} from './node';

/**
 * A predicate which determines if a given element/directive should be included in the query
 * results.
 */
export interface QueryPredicate<T> {
  /**
   * If looking for directives then it contains the directive type.
   */
  type: Type<T>|null;

  /**
   * If selector then contains local names to query for.
   */
  selector: string[]|null;

  /**
   * Indicates which token should be read from DI for this query.
   */
  read: Type<T>|null;
}

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
   * The index of the node on which this LQueries instance was created / cloned in a given LView.
   *
   * This index is stored to minimize LQueries cloning: we can observe that LQueries can be mutated
   * only under 2 conditions:
   * - we are crossing an element that has directives with content queries (new queries are added);
   * - we are descending into element hierarchy (creating a child element of an existing element)
   * and the current LQueries object is tracking shallow queries (shallow queries are removed).
   *
   * Since LQueries are not cloned systematically we need to know exactly where (on each element)
   * cloning occurred, so we can properly restore the set of tracked queries when going up the
   * elements hierarchy.
   *
   * Always set to -1 for view queries as view queries are created before we process any node in a
   * given view.
   */
  nodeIndex: number;

  /**
   * Ask queries to prepare a copy of itself. This ensures that:
   * - tracking new queries on content nodes doesn't mutate list of queries tracked on a parent
   * node;
   * - we don't track shallow queries when descending into elements hierarchy.
   *
   * We will clone LQueries before constructing content queries
   */
  clone(tNode: TNode): LQueries;

  /**
   * Notify `LQueries` that a new `TNode` has been created and needs to be added to query results
   * if matching query predicate.
   */
  addNode(tNode: TElementNode|TContainerNode|TElementContainerNode): void;

  /**
   * Notify `LQueries` that a new `TNode` has been created and needs to be added to query results
   * if matching query predicate. This is a special mode invoked if the query container has to
   * be created out of order (e.g. view created in the constructor of a directive).
   */
  insertNodeBeforeViews(tNode: TElementNode|TContainerNode|TElementContainerNode): void;

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
   * @param predicate A predicate which determines if a given element/directive should be included
   * in the query results.
   * @param descend If true the query will recursively apply to the children.
   */
  track<T>(queryList: QueryList<T>, predicate: QueryPredicate<T>, descend?: boolean): void;
}

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
