/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {createContentQuery, createViewQuery} from '../queries/query';
import {bindQueryToSignal} from '../queries/query_reactive';
import {getCurrentQueryIndex, setCurrentQueryIndex} from '../state';
/**
 * Creates a new content query and binds it to a signal created by an authoring function.
 *
 * @param directiveIndex Current directive index
 * @param target The target signal to which the query should be bound
 * @param predicate The type for which the query will search
 * @param flags Flags associated with the query
 * @param read What to save in the query
 *
 * @codeGenApi
 */
export function ɵɵcontentQuerySignal(directiveIndex, target, predicate, flags, read) {
  bindQueryToSignal(target, createContentQuery(directiveIndex, predicate, flags, read));
}
/**
 * Creates a new view query by initializing internal data structures and binding a new query to the
 * target signal.
 *
 * @param target The target signal to assign the query results to.
 * @param predicate The type or label that should match a given query
 * @param flags Flags associated with the query
 * @param read What to save in the query
 *
 * @codeGenApi
 */
export function ɵɵviewQuerySignal(target, predicate, flags, read) {
  bindQueryToSignal(target, createViewQuery(predicate, flags, read));
}
/**
 * Advances the current query index by a specified offset.
 *
 * Adjusting the current query index is necessary in cases where a given directive has a mix of
 * zone-based and signal-based queries. The signal-based queries don't require tracking of the
 * current index (those are refreshed on demand and not during change detection) so this instruction
 * is only necessary for backward-compatibility.
 *
 * @param index offset to apply to the current query index (defaults to 1)
 *
 * @codeGenApi
 */
export function ɵɵqueryAdvance(indexOffset = 1) {
  setCurrentQueryIndex(getCurrentQueryIndex() + indexOffset);
}
//# sourceMappingURL=queries_signals.js.map
