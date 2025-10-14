/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TrackByFunction } from '../change_detection';
/**
 * A type representing the live collection to be reconciled with any new (incoming) collection. This
 * is an adapter class that makes it possible to work with different internal data structures,
 * regardless of the actual values of the incoming collection.
 */
export declare abstract class LiveCollection<T, V> {
    abstract get length(): number;
    abstract at(index: number): V;
    abstract attach(index: number, item: T): void;
    abstract detach(index: number, skipLeaveAnimations?: boolean): T;
    abstract create(index: number, value: V): T;
    destroy(item: T): void;
    updateValue(index: number, value: V): void;
    swap(index1: number, index2: number): void;
    move(prevIndex: number, newIdx: number): void;
}
/**
 * The live collection reconciliation algorithm that perform various in-place operations, so it
 * reflects the content of the new (incoming) collection.
 *
 * The reconciliation algorithm has 2 code paths:
 * - "fast" path that don't require any memory allocation;
 * - "slow" path that requires additional memory allocation for intermediate data structures used to
 * collect additional information about the live collection.
 * It might happen that the algorithm switches between the two modes in question in a single
 * reconciliation path - generally it tries to stay on the "fast" path as much as possible.
 *
 * The overall complexity of the algorithm is O(n + m) for speed and O(n) for memory (where n is the
 * length of the live collection and m is the length of the incoming collection). Given the problem
 * at hand the complexity / performance constraints makes it impossible to perform the absolute
 * minimum of operation to reconcile the 2 collections. The algorithm makes different tradeoffs to
 * stay within reasonable performance bounds and may apply sub-optimal number of operations in
 * certain situations.
 *
 * @param liveCollection the current, live collection;
 * @param newCollection the new, incoming collection;
 * @param trackByFn key generation function that determines equality between items in the life and
 *     incoming collection;
 */
export declare function reconcile<T, V>(liveCollection: LiveCollection<T, V>, newCollection: Iterable<V> | undefined | null, trackByFn: TrackByFunction<V>): void;
/**
 * A specific, partial implementation of the Map interface with the following characteristics:
 * - allows multiple values for a given key;
 * - maintain FIFO order for multiple values corresponding to a given key;
 * - assumes that all values are unique.
 *
 * The implementation aims at having the minimal overhead for cases where keys are _not_ duplicated
 * (the most common case in the list reconciliation algorithm). To achieve this, the first value for
 * a given key is stored in a regular map. Then, when more values are set for a given key, we
 * maintain a form of linked list in a separate map. To maintain this linked list we assume that all
 * values (in the entire collection) are unique.
 */
export declare class UniqueValueMultiKeyMap<K, V> {
    private kvMap;
    private _vMap;
    has(key: K): boolean;
    delete(key: K): boolean;
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    forEach(cb: (v: V, k: K) => void): void;
}
