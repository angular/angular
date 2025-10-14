/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { IterableChangeRecord, IterableChanges, IterableDiffer, IterableDifferFactory, NgIterable, TrackByFunction } from './iterable_differs';
export declare class DefaultIterableDifferFactory implements IterableDifferFactory {
    constructor();
    supports(obj: Object | null | undefined): boolean;
    create<V>(trackByFn?: TrackByFunction<V>): DefaultIterableDiffer<V>;
}
/**
 * @deprecated v4.0.0 - Should not be part of public API.
 * @publicApi
 */
export declare class DefaultIterableDiffer<V> implements IterableDiffer<V>, IterableChanges<V> {
    readonly length: number;
    readonly collection: V[] | Iterable<V> | null;
    private _linkedRecords;
    private _unlinkedRecords;
    private _previousItHead;
    private _itHead;
    private _itTail;
    private _additionsHead;
    private _additionsTail;
    private _movesHead;
    private _movesTail;
    private _removalsHead;
    private _removalsTail;
    private _identityChangesHead;
    private _identityChangesTail;
    private _trackByFn;
    constructor(trackByFn?: TrackByFunction<V>);
    forEachItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachOperation(fn: (item: IterableChangeRecord<V>, previousIndex: number | null, currentIndex: number | null) => void): void;
    forEachPreviousItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachAddedItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachMovedItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachRemovedItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachIdentityChange(fn: (record: IterableChangeRecord_<V>) => void): void;
    diff(collection: NgIterable<V> | null | undefined): DefaultIterableDiffer<V> | null;
    onDestroy(): void;
    check(collection: NgIterable<V>): boolean;
    get isDirty(): boolean;
    /**
     * Reset the state of the change objects to show no changes. This means set previousKey to
     * currentKey, and clear all of the queues (additions, moves, removals).
     * Set the previousIndexes of moved and added items to their currentIndexes
     * Reset the list of additions, moves and removals
     *
     * @internal
     */
    _reset(): void;
    /**
     * This is the core function which handles differences between collections.
     *
     * - `record` is the record which we saw at this position last time. If null then it is a new
     *   item.
     * - `item` is the current item in the collection
     * - `index` is the position of the item in the collection
     *
     * @internal
     */
    _mismatch(record: IterableChangeRecord_<V> | null, item: V, itemTrackBy: any, index: number): IterableChangeRecord_<V>;
    /**
     * This check is only needed if an array contains duplicates. (Short circuit of nothing dirty)
     *
     * Use case: `[a, a]` => `[b, a, a]`
     *
     * If we did not have this check then the insertion of `b` would:
     *   1) evict first `a`
     *   2) insert `b` at `0` index.
     *   3) leave `a` at index `1` as is. <-- this is wrong!
     *   3) reinsert `a` at index 2. <-- this is wrong!
     *
     * The correct behavior is:
     *   1) evict first `a`
     *   2) insert `b` at `0` index.
     *   3) reinsert `a` at index 1.
     *   3) move `a` at from `1` to `2`.
     *
     *
     * Double check that we have not evicted a duplicate item. We need to check if the item type may
     * have already been removed:
     * The insertion of b will evict the first 'a'. If we don't reinsert it now it will be reinserted
     * at the end. Which will show up as the two 'a's switching position. This is incorrect, since a
     * better way to think of it is as insert of 'b' rather then switch 'a' with 'b' and then add 'a'
     * at the end.
     *
     * @internal
     */
    _verifyReinsertion(record: IterableChangeRecord_<V>, item: V, itemTrackBy: any, index: number): IterableChangeRecord_<V>;
    /**
     * Get rid of any excess {@link IterableChangeRecord_}s from the previous collection
     *
     * - `record` The first excess {@link IterableChangeRecord_}.
     *
     * @internal
     */
    _truncate(record: IterableChangeRecord_<V> | null): void;
    /** @internal */
    _reinsertAfter(record: IterableChangeRecord_<V>, prevRecord: IterableChangeRecord_<V> | null, index: number): IterableChangeRecord_<V>;
    /** @internal */
    _moveAfter(record: IterableChangeRecord_<V>, prevRecord: IterableChangeRecord_<V> | null, index: number): IterableChangeRecord_<V>;
    /** @internal */
    _addAfter(record: IterableChangeRecord_<V>, prevRecord: IterableChangeRecord_<V> | null, index: number): IterableChangeRecord_<V>;
    /** @internal */
    _insertAfter(record: IterableChangeRecord_<V>, prevRecord: IterableChangeRecord_<V> | null, index: number): IterableChangeRecord_<V>;
    /** @internal */
    _remove(record: IterableChangeRecord_<V>): IterableChangeRecord_<V>;
    /** @internal */
    _unlink(record: IterableChangeRecord_<V>): IterableChangeRecord_<V>;
    /** @internal */
    _addToMoves(record: IterableChangeRecord_<V>, toIndex: number): IterableChangeRecord_<V>;
    private _addToRemovals;
    /** @internal */
    _addIdentityChange(record: IterableChangeRecord_<V>, item: V): IterableChangeRecord_<V>;
}
export declare class IterableChangeRecord_<V> implements IterableChangeRecord<V> {
    item: V;
    trackById: any;
    currentIndex: number | null;
    previousIndex: number | null;
    /** @internal */
    _nextPrevious: IterableChangeRecord_<V> | null;
    /** @internal */
    _prev: IterableChangeRecord_<V> | null;
    /** @internal */
    _next: IterableChangeRecord_<V> | null;
    /** @internal */
    _prevDup: IterableChangeRecord_<V> | null;
    /** @internal */
    _nextDup: IterableChangeRecord_<V> | null;
    /** @internal */
    _prevRemoved: IterableChangeRecord_<V> | null;
    /** @internal */
    _nextRemoved: IterableChangeRecord_<V> | null;
    /** @internal */
    _nextAdded: IterableChangeRecord_<V> | null;
    /** @internal */
    _nextMoved: IterableChangeRecord_<V> | null;
    /** @internal */
    _nextIdentityChange: IterableChangeRecord_<V> | null;
    constructor(item: V, trackById: any);
}
