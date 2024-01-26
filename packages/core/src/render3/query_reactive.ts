/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {consumerMarkDirty, producerAccessed, producerUpdateValueVersion, REACTIVE_NODE, ReactiveNode, SIGNAL} from '@angular/core/primitives/signals';

import {RuntimeError} from '../errors';
import {unwrapElementRef} from '../linker/element_ref';
import {QueryList} from '../linker/query_list';
import {EMPTY_ARRAY} from '../util/empty';

import {LView, TVIEW} from './interfaces/view';
import {collectQueryResults, getTQuery, loadQueryInternal, materializeViewResults} from './query';
import {Signal} from './reactivity/api';
import {getLView} from './state';

function createQuerySignalFn<V>(firstOnly: true, required: true): Signal<V>;
function createQuerySignalFn<V>(firstOnly: true, required: false): Signal<V|undefined>;
function createQuerySignalFn<V>(firstOnly: false, required: false): Signal<ReadonlyArray<V>>;
function createQuerySignalFn<V>(firstOnly: boolean, required: boolean) {
  const node: QuerySignalNode<V> = Object.create(QUERY_SIGNAL_NODE);
  function signalFn() {
    // Check if the value needs updating before returning it.
    producerUpdateValueVersion(node);

    // Mark this producer as accessed.
    producerAccessed(node);

    if (firstOnly) {
      const firstValue = node._queryList?.first;
      if (firstValue === undefined && required) {
        // TODO: add error code
        // TODO: add proper message
        throw new RuntimeError(0, 'no query results yet!');
      }
      return firstValue;
    } else {
      // TODO(perf): make sure that I'm not creating new arrays when returning results. The other
      // consideration here is the referential stability of results.
      return node._queryList?.toArray() ?? EMPTY_ARRAY;
    }
  }
  (signalFn as any)[SIGNAL] = node;

  if (ngDevMode) {
    signalFn.toString = () => `[Query Signal]`;
  }

  return signalFn;
}

export function createSingleResultOptionalQuerySignalFn<ReadT>(): Signal<ReadT|undefined> {
  return createQuerySignalFn(/* firstOnly */ true, /* required */ false);
}

export function createSingleResultRequiredQuerySignalFn<ReadT>(): Signal<ReadT> {
  return createQuerySignalFn(/* firstOnly */ true, /* required */ true);
}

export function createMultiResultQuerySignalFn<ReadT>(): Signal<ReadonlyArray<ReadT>> {
  return createQuerySignalFn(/* firstOnly */ false, /* required */ false);
}

export interface QuerySignalNode<T> extends ReactiveNode {
  _lView?: LView;
  _queryIndex?: number;
  _queryList?: QueryList<T>;
}

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `COMPUTED_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
export const QUERY_SIGNAL_NODE: QuerySignalNode<unknown> = /* @__PURE__ */ (() => {
  return {
    ...REACTIVE_NODE,

    // Base reactive node.overrides
    producerMustRecompute: (node: QuerySignalNode<unknown>) => {
      return !!node._queryList?.dirty;
    },

    producerRecomputeValue: (node: QuerySignalNode<unknown>) => {
      // The current value is stale. Check whether we need to produce a new one.
      // TODO: assert: I've got both the lView and queryIndex stored
      // TODO(perf): I'm assuming that the signal value changes when the list of matches changes.
      // But this is not correct for the single-element queries since we should also compare (===)
      // the value of the first element.
      // TODO: error handling - should we guard against exceptions thrown from refreshSignalQuery -
      // normally it should never
      if (refreshSignalQuery(node._lView!, node._queryIndex!)) {
        node.version++;
      }
    }
  };
})();

export function bindQueryToSignal(target: Signal<unknown>, queryIndex: number): void {
  const node = target[SIGNAL] as QuerySignalNode<unknown>;
  node._lView = getLView();
  node._queryIndex = queryIndex;
  node._queryList = loadQueryInternal(node._lView, queryIndex);
  node._queryList.onDirty(() => {
    // Mark this producer as dirty and notify live consumer about the potential change. Note
    // that the onDirty callback will fire only on the initial dirty marking (that is,
    // subsequent dirty notifications are not fired- until the QueryList becomes clean again).
    consumerMarkDirty(node);
  });
}

// TODO(refactor): some code duplication with queryRefresh
export function refreshSignalQuery(lView: LView<unknown>, queryIndex: number): boolean {
  const queryList = loadQueryInternal<unknown>(lView, queryIndex);
  const tView = lView[TVIEW];
  const tQuery = getTQuery(tView, queryIndex);

  // TODO(test): operation of refreshing a signal query could be invoked during the first
  // creation pass, while results are still being collected; we should NOT mark such query as
  // "clean" as we might not have any view add / remove operations that would make it dirty again.
  // Leaning towards exiting early for calls to refreshSignalQuery before the first creation pass
  // finished
  if (queryList.dirty && tQuery.matches !== null) {
    const result = tQuery.crossesNgTemplate ?
        collectQueryResults(tView, lView, queryIndex, []) :
        materializeViewResults(tView, lView, tQuery, queryIndex);

    queryList.reset(result, unwrapElementRef);

    // TODO(test): don't mark signal as dirty when a query was marked as dirty but there
    // was no actual change
    // TODO: change the reset logic so it returns the value
    return true;
  }
  return false;
}
