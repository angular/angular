/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ProviderToken} from '../../di/provider_token';
import {QueryList} from '../../linker';
import {createSignalFromFunction, ReactiveNode, SIGNAL, Signal} from '../../signals';
import {QueryFlags} from '../interfaces/query';
import {LView} from '../interfaces/view';
import {createViewQueryInternal, loadQueryInternal, queryRefreshInternal} from '../query';
import {getLView} from '../state';

export interface InternalQuerySignal {
  bindToQuery(queryIndex: number): void;
}

abstract class QuerySignal<T> extends ReactiveNode {
  private _lView?: LView;
  private _queryIndex?: number;
  protected queryList?: QueryList<T>;

  protected override consumerAllowSignalWrites = false;

  protected override onConsumerDependencyMayHaveChanged(): void {
    // This never happens for query signals as they're not consumers.
  }
  protected override onProducerUpdateValueVersion(): void {
    if (this.queryList === undefined || !this.queryList?.dirty) {
      // The current value and its version are already up to date.
      return;
    }

    // The current value is stale. Check whether we need to produce a new one.
    // TODO: assert: I've got both the lView and queryIndex stored
    if (queryRefreshInternal(this._lView!, this._queryIndex!)) {
      this.valueVersion++;
    }
  }

  bindToQuery(queryIndex: number) {
    // TODO: assert: should bind only once, make sure it is not re-assigned again
    this._lView = getLView();
    this._queryIndex = queryIndex;
    this.queryList = loadQueryInternal(this._lView, queryIndex);

    this.queryList.onDirty(() => {
      // Notify any consumers about the potential change. Note that the onDirty callback will fire
      // only on the initial dirty marking (that is, subsequent dirty notifications are not fired -
      // until the QueryList becomes clean again).
      this.producerMayHaveChanged();
    });
  }

  protected signalInternal(): void {
    // Check if the value needs updating before returning it.
    this.onProducerUpdateValueVersion();

    // Record that someone looked at this signal.
    this.producerAccessed();
  }
}

export class ChildQuerySignalImpl<T> extends QuerySignal<T> implements InternalQuerySignal {
  signal(): T|undefined {
    this.signalInternal();
    return this.queryList?.first;
  }
}

export class ChildrenQuerySignalImpl<T> extends QuerySignal<T> implements InternalQuerySignal {
  signal(): T[] {
    this.signalInternal();
    // TODO: perf - I should not be obliged to create a new array every time we call signal()
    return this.queryList?.toArray() ?? [];
  }
}

// THINK: code duplication for predicate, flags etc.? Or would it be extracted by the compiler?
export function ɵɵviewQueryCreate<T>(
    target: Signal<T|undefined>, predicate: ProviderToken<T>|string[], flags: QueryFlags,
    read?: any) {
  const lView = getLView();
  const reactiveQueryNode = target[SIGNAL] as InternalQuerySignal;
  reactiveQueryNode.bindToQuery(createViewQueryInternal<T>(lView, predicate, flags, read));
}

// Q: assuming that the return type must be similar to InputSignal, with the write ability? (this is
// needed only from the generated code so maybe not?)
export function viewChild<T>(
    selector: ProviderToken<T>|string, opts?: {read?: any, static?: boolean}): Signal<T|undefined> {
  const node = new ChildQuerySignalImpl();
  return createSignalFromFunction<T|undefined>(node, node.signal.bind(node) as Signal<T|undefined>);
}

export function viewChildren<T>(
    selector: ProviderToken<T>|string,
    opts?: {read?: any, emitDistinctChangesOnly?: boolean}): Signal<T[]> {
  // Q: by returning a signal we are effectively "dropping" QueryList from the public API. Is there
  // anything valuable there that we would be losing?
  const node = new ChildrenQuerySignalImpl();
  return createSignalFromFunction<T[]>(node, node.signal.bind(node) as Signal<T[]>);
}
