/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../../di/injection_token';
import {Type} from '../../interface/type';
import {QueryList} from '../../linker/query_list';

import {TNode} from './node';
import {TView} from './view';

/**
 * An object representing query metadata extracted from query annotations.
 */
export interface TQueryMetadata {
  predicate: Type<any>|InjectionToken<unknown>|string[];
  read: any;
  flags: QueryFlags;
}

/**
 * A set of flags to be used with Queries.
 *
 * NOTE: Ensure changes here are reflected in `packages/compiler/src/render3/view/compiler.ts`
 */
export const enum QueryFlags {
  /**
   * No flags
   */
  none = 0b0000,

  /**
   * Whether or not the query should descend into children.
   */
  descendants = 0b0001,

  /**
   * The query can be computed statically and hence can be assigned eagerly.
   *
   * NOTE: Backwards compatibility with ViewEngine.
   */
  isStatic = 0b0010,

  /**
   * If the `QueryList` should fire change event only if actual change to query was computed (vs old
   * behavior where the change was fired whenever the query was recomputed, even if the recomputed
   * query resulted in the same list.)
   */
  emitDistinctChangesOnly = 0b0100,
}

/**
 * TQuery objects represent all the query-related data that remain the same from one view instance
 * to another and can be determined on the very first template pass. Most notably TQuery holds all
 * the matches for a given view.
 */
export interface TQuery {
  /**
   * Query metadata extracted from query annotations.
   */
  metadata: TQueryMetadata;

  /**
   * Index of a query in a declaration view in case of queries propagated to en embedded view, -1
   * for queries declared in a given view. We are storing this index so we can find a parent query
   * to clone for an embedded view (when an embedded view is created).
   */
  indexInDeclarationView: number;

  /**
   * Matches collected on the first template pass. Each match is a pair of:
   * - TNode index;
   * - match index;
   *
   * A TNode index can be either:
   * - a positive number (the most common case) to indicate a matching TNode;
   * - a negative number to indicate that a given query is crossing a <ng-template> element and
   * results from views created based on TemplateRef should be inserted at this place.
   *
   * A match index is a number used to find an actual value (for a given node) when query results
   * are materialized. This index can have one of the following values:
   * - -2 - indicates that we need to read a special token (TemplateRef, ViewContainerRef etc.);
   * - -1 - indicates that we need to read a default value based on the node type (TemplateRef for
   * ng-template and ElementRef for other elements);
   * - a positive number - index of an injectable to be read from the element injector.
   */
  matches: number[]|null;

  /**
   * A flag indicating if a given query crosses an <ng-template> element. This flag exists for
   * performance reasons: we can notice that queries not crossing any <ng-template> elements will
   * have matches from a given view only (and adapt processing accordingly).
   */
  crossesNgTemplate: boolean;

  /**
   * A method call when a given query is crossing an element (or element container). This is where a
   * given TNode is matched against a query predicate.
   * @param tView
   * @param tNode
   */
  elementStart(tView: TView, tNode: TNode): void;

  /**
   * A method called when processing the elementEnd instruction - this is mostly useful to determine
   * if a given content query should match any nodes past this point.
   * @param tNode
   */
  elementEnd(tNode: TNode): void;

  /**
   * A method called when processing the template instruction. This is where a
   * given TContainerNode is matched against a query predicate.
   * @param tView
   * @param tNode
   */
  template(tView: TView, tNode: TNode): void;

  /**
   * A query-related method called when an embedded TView is created based on the content of a
   * <ng-template> element. We call this method to determine if a given query should be propagated
   * to the embedded view and if so - return a cloned TQuery for this embedded view.
   * @param tNode
   * @param childQueryIndex
   */
  embeddedTView(tNode: TNode, childQueryIndex: number): TQuery|null;
}

/**
 * TQueries represent a collection of individual TQuery objects tracked in a given view. Most of the
 * methods on this interface are simple proxy methods to the corresponding functionality on TQuery.
 */
export interface TQueries {
  /**
   * Adds a new TQuery to a collection of queries tracked in a given view.
   * @param tQuery
   */
  track(tQuery: TQuery): void;

  /**
   * Returns a TQuery instance for at the given index  in the queries array.
   * @param index
   */
  getByIndex(index: number): TQuery;

  /**
   * Returns the number of queries tracked in a given view.
   */
  length: number;

  /**
   * A proxy method that iterates over all the TQueries in a given TView and calls the corresponding
   * `elementStart` on each and every TQuery.
   * @param tView
   * @param tNode
   */
  elementStart(tView: TView, tNode: TNode): void;

  /**
   * A proxy method that iterates over all the TQueries in a given TView and calls the corresponding
   * `elementEnd` on each and every TQuery.
   * @param tNode
   */
  elementEnd(tNode: TNode): void;

  /**
   * A proxy method that iterates over all the TQueries in a given TView and calls the corresponding
   * `template` on each and every TQuery.
   * @param tView
   * @param tNode
   */
  template(tView: TView, tNode: TNode): void;

  /**
   * A proxy method that iterates over all the TQueries in a given TView and calls the corresponding
   * `embeddedTView` on each and every TQuery.
   * @param tNode
   */
  embeddedTView(tNode: TNode): TQueries|null;
}

/**
 * An interface that represents query-related information specific to a view instance. Most notably
 * it contains:
 * - materialized query matches;
 * - a pointer to a QueryList where materialized query results should be reported.
 */
export interface LQuery<T> {
  /**
   * Materialized query matches for a given view only (!). Results are initialized lazily so the
   * array of matches is set to `null` initially.
   */
  matches: (T|null)[]|null;

  /**
   * A QueryList where materialized query results should be reported.
   */
  queryList: QueryList<T>;

  /**
   * Clones an LQuery for an embedded view. A cloned query shares the same `QueryList` but has a
   * separate collection of materialized matches.
   */
  clone(): LQuery<T>;

  /**
   * Called when an embedded view, impacting results of this query, is inserted or removed.
   */
  setDirty(): void;
}

/**
 * lQueries represent a collection of individual LQuery objects tracked in a given view.
 */
export interface LQueries {
  /**
   * A collection of queries tracked in a given view.
   */
  queries: LQuery<any>[];

  /**
   * A method called when a new embedded view is created. As a result a set of LQueries applicable
   * for a new embedded view is instantiated (cloned) from the declaration view.
   * @param tView
   */
  createEmbeddedView(tView: TView): LQueries|null;

  /**
   * A method called when an embedded view is inserted into a container. As a result all impacted
   * `LQuery` objects (and associated `QueryList`) are marked as dirty.
   * @param tView
   */
  insertView(tView: TView): void;

  /**
   * A method called when an embedded view is detached from a container. As a result all impacted
   * `LQuery` objects (and associated `QueryList`) are marked as dirty.
   * @param tView
   */
  detachView(tView: TView): void;
}


// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
