/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {createComputed, SIGNAL} from '../../../primitives/signals';
import {RuntimeError} from '../../errors';
import {unwrapElementRef} from '../../linker/element_ref';
import {EMPTY_ARRAY} from '../../util/empty';
import {FLAGS} from '../interfaces/view';
import {signal} from '../reactivity/signal';
import {getLView} from '../state';
import {getQueryResults, loadQueryInternal} from './query';
/**
 * A signal factory function in charge of creating a new computed signal capturing query
 * results. This centralized creation function is used by all types of queries (child / children,
 * required / optional).
 *
 * @param firstOnly indicates if all or only the first result should be returned
 * @param required indicates if at least one result is required
 * @returns a read-only signal with query results
 */
function createQuerySignalFn(firstOnly, required, opts) {
  let node;
  const signalFn = createComputed(() => {
    // A dedicated signal that increments its value every time a query changes its dirty status. By
    // using this signal we can implement a query as computed and avoid creation of a specialized
    // reactive node type. Please note that a query gets marked dirty under the following
    // circumstances:
    // - a view (where a query is active) finished its first creation pass;
    // - a new view is inserted / deleted and it impacts query results.
    node._dirtyCounter();
    const value = refreshSignalQuery(node, firstOnly);
    if (required && value === undefined) {
      throw new RuntimeError(
        -951 /* RuntimeErrorCode.REQUIRED_QUERY_NO_VALUE */,
        ngDevMode && 'Child query result is required but no value is available.',
      );
    }
    return value;
  });
  node = signalFn[SIGNAL];
  node._dirtyCounter = signal(0);
  node._flatValue = undefined;
  if (ngDevMode) {
    signalFn.toString = () => `[Query Signal]`;
    node.debugName = opts?.debugName;
  }
  return signalFn;
}
export function createSingleResultOptionalQuerySignalFn(opts) {
  return createQuerySignalFn(/* firstOnly */ true, /* required */ false, opts);
}
export function createSingleResultRequiredQuerySignalFn(opts) {
  return createQuerySignalFn(/* firstOnly */ true, /* required */ true, opts);
}
export function createMultiResultQuerySignalFn(opts) {
  return createQuerySignalFn(/* firstOnly */ false, /* required */ false, opts);
}
export function bindQueryToSignal(target, queryIndex) {
  const node = target[SIGNAL];
  node._lView = getLView();
  node._queryIndex = queryIndex;
  node._queryList = loadQueryInternal(node._lView, queryIndex);
  node._queryList.onDirty(() => node._dirtyCounter.update((v) => v + 1));
}
function refreshSignalQuery(node, firstOnly) {
  const lView = node._lView;
  const queryIndex = node._queryIndex;
  // There are 2 conditions under which we want to return "empty" results instead of the ones
  // collected by a query:
  //
  // 1) a given query wasn't created yet (this is a period of time between the directive creation
  // and execution of the query creation function) - in this case a query doesn't exist yet and we
  // don't have any results to return.
  //
  // 2) we are in the process of constructing a view (the first
  // creation pass didn't finish) and a query might have partial results, but we don't want to
  // return those - instead we do delay results collection until all nodes had a chance of matching
  // and we can present consistent, "atomic" (on a view level) results.
  if (
    lView === undefined ||
    queryIndex === undefined ||
    lView[FLAGS] & 4 /* LViewFlags.CreationMode */
  ) {
    return firstOnly ? undefined : EMPTY_ARRAY;
  }
  const queryList = loadQueryInternal(lView, queryIndex);
  const results = getQueryResults(lView, queryIndex);
  queryList.reset(results, unwrapElementRef);
  if (firstOnly) {
    return queryList.first;
  } else {
    // TODO: remove access to the private _changesDetected field by abstracting / removing usage of
    // QueryList in the signal-based queries (perf follow-up)
    const resultChanged = queryList._changesDetected;
    if (resultChanged || node._flatValue === undefined) {
      return (node._flatValue = queryList.toArray());
    }
    return node._flatValue;
  }
}
//# sourceMappingURL=query_reactive.js.map
