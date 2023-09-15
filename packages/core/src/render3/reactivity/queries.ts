/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {consumerMarkDirty, producerAccessed, producerUpdateValueVersion, REACTIVE_NODE, ReactiveNode, SIGNAL} from '@angular/core/primitives/signals';

import {ProviderToken} from '../../di/provider_token';
import {QueryList} from '../../linker';
import {QueryFlags} from '../interfaces/query';
import {LView} from '../interfaces/view';
import {createContentQueryInternal, createViewQueryInternal, loadQueryInternal, queryRefreshInternal} from '../query';
import {getLView} from '../state';

import {Signal} from './api';

export interface QuerySignalNode<T> extends ReactiveNode {
  _lView?: LView;
  _queryIndex?: number;
  _queryList?: QueryList<T>;

  bindToQuery(node: this, queryIndex: number): void;
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
      if (queryRefreshInternal(node._lView!, node._queryIndex!)) {
        node.version++;
      }
    },

    // Query-specific implementations.
    bindToQuery: (node: QuerySignalNode<unknown>, queryIndex: number) => {
      // TODO: assert: should bind only once, make sure it is not re-assigned again
      node._lView = getLView();
      node._queryIndex = queryIndex;
      node._queryList = loadQueryInternal(node._lView, queryIndex);

      node._queryList.onDirty(() => {
        console.error('Dirty');
        // Mark this producer as dirty and notify live consumer about the potential change. Note
        // that the onDirty callback will fire only on the initial dirty marking (that is,
        // subsequent dirty notifications are not fired- until the QueryList becomes clean again).
        consumerMarkDirty(node);
      });
    },

    // TODO(signals): Unsubscribe - destroy?
  };
})();

function querySignalFnFirst<T>(): Signal<T|undefined> {
  const node: QuerySignalNode<T> = Object.create(QUERY_SIGNAL_NODE);

  function signalFn() {
    // Check if the value needs updating before returning it.
    producerUpdateValueVersion(node);

    // Mark this producer as accessed.
    producerAccessed(node);

    return node._queryList?.first;
  }
  (signalFn as any)[SIGNAL] = node;

  return signalFn as Signal<T|undefined>;
}

function querySignalFnAll<T>(): Signal<T[]> {
  const node: QuerySignalNode<T> = Object.create(QUERY_SIGNAL_NODE);

  function signalFn() {
    // Check if the value needs updating before returning it.
    producerUpdateValueVersion(node);

    // Mark this producer as accessed.
    producerAccessed(node);

    return node._queryList?.toArray() ?? [];
  }
  (signalFn as any)[SIGNAL] = node;

  return signalFn as Signal<T[]>;
}


// THINK: code duplication for predicate, flags etc.? Or would it be extracted by the compiler?
export function ɵɵviewQueryCreate<T>(
    target: Signal<T|undefined>, predicate: ProviderToken<T>|string[], flags: QueryFlags,
    read?: any) {
  const lView = getLView();
  const reactiveQueryNode = target[SIGNAL] as QuerySignalNode<unknown>;
  reactiveQueryNode.bindToQuery(
      reactiveQueryNode, createViewQueryInternal<T>(lView, predicate, flags, read));
}

// Q: assuming that the return type must be similar to InputSignal, with the write ability? (this is
// needed only from the generated code so maybe not?)
export function viewChild<T>(
    selector: ProviderToken<T>|string, opts?: {read?: any, static?: boolean}): Signal<T|undefined> {
  return querySignalFnFirst();
}

export function viewChildren<T>(
    selector: ProviderToken<T>|string,
    opts?: {read?: any, emitDistinctChangesOnly?: boolean}): Signal<T[]> {
  // Q: by returning a signal we are effectively "dropping" QueryList from the public API. Is there
  // anything valuable there that we would be losing?
  return querySignalFnAll();
}

export function ɵɵcontentQueryCreate<T>(
    target: Signal<T|undefined>, dirIndex: number, predicate: ProviderToken<T>|string[],
    flags: QueryFlags, read?: any) {
  const lView = getLView();
  const reactiveQueryNode = target[SIGNAL] as QuerySignalNode<unknown>;
  // Q: why do we need the directive index?
  reactiveQueryNode.bindToQuery(
      reactiveQueryNode, createContentQueryInternal<T>(lView, dirIndex, predicate, flags, read));
}

export function contentChild<T>(
    selector: ProviderToken<T>|string,
    opts?: {descendants?: boolean, read?: any, static?: boolean}): Signal<T|undefined> {
  return querySignalFnFirst();
}

export function contentChildren<T>(
    selector: ProviderToken<T>|string,
    opts?: {descendants?: boolean, read?: any, emitDistinctChangesOnly?: boolean}): Signal<T[]> {
  // Q: by returning a signal we are effectively "dropping" QueryList from the public API. Is there
  // anything valuable there that we would be loosing?
  return querySignalFnAll();
}
