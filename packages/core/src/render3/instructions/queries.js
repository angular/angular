/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {unwrapElementRef} from '../../linker/element_ref';
import {
  createContentQuery,
  createViewQuery,
  getQueryResults,
  getTQuery,
  loadQueryInternal,
} from '../queries/query';
import {getCurrentQueryIndex, getLView, getTView, setCurrentQueryIndex} from '../state';
import {isCreationMode} from '../util/view_utils';
/**
 * Registers a QueryList, associated with a content query, for later refresh (part of a view
 * refresh).
 *
 * @param directiveIndex Current directive index
 * @param predicate The type for which the query will search
 * @param flags Flags associated with the query
 * @param read What to save in the query
 * @returns QueryList<T>
 *
 * @codeGenApi
 */
export function ɵɵcontentQuery(directiveIndex, predicate, flags, read) {
  createContentQuery(directiveIndex, predicate, flags, read);
}
/**
 * Creates a new view query by initializing internal data structures.
 *
 * @param predicate The type for which the query will search
 * @param flags Flags associated with the query
 * @param read What to save in the query
 *
 * @codeGenApi
 */
export function ɵɵviewQuery(predicate, flags, read) {
  createViewQuery(predicate, flags, read);
}
/**
 * Refreshes a query by combining matches from all active views and removing matches from deleted
 * views.
 *
 * @returns `true` if a query got dirty during change detection or if this is a static query
 * resolving in creation mode, `false` otherwise.
 *
 * @codeGenApi
 */
export function ɵɵqueryRefresh(queryList) {
  const lView = getLView();
  const tView = getTView();
  const queryIndex = getCurrentQueryIndex();
  setCurrentQueryIndex(queryIndex + 1);
  const tQuery = getTQuery(tView, queryIndex);
  if (
    queryList.dirty &&
    isCreationMode(lView) ===
      ((tQuery.metadata.flags & 2) /* QueryFlags.isStatic */ === 2) /* QueryFlags.isStatic */
  ) {
    if (tQuery.matches === null) {
      queryList.reset([]);
    } else {
      const result = getQueryResults(lView, queryIndex);
      queryList.reset(result, unwrapElementRef);
      queryList.notifyOnChanges();
    }
    return true;
  }
  return false;
}
/**
 * Loads a QueryList corresponding to the current view or content query.
 *
 * @codeGenApi
 */
export function ɵɵloadQuery() {
  return loadQueryInternal(getLView(), getCurrentQueryIndex());
}
//# sourceMappingURL=queries.js.map
