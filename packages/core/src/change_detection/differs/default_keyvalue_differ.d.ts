/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { KeyValueChangeRecord, KeyValueChanges, KeyValueDiffer, KeyValueDifferFactory } from './keyvalue_differs';
export declare class DefaultKeyValueDifferFactory<K, V> implements KeyValueDifferFactory {
    constructor();
    supports(obj: any): boolean;
    create<K, V>(): KeyValueDiffer<K, V>;
}
export declare class DefaultKeyValueDiffer<K, V> implements KeyValueDiffer<K, V>, KeyValueChanges<K, V> {
    private _records;
    private _mapHead;
    private _appendAfter;
    private _previousMapHead;
    private _changesHead;
    private _changesTail;
    private _additionsHead;
    private _additionsTail;
    private _removalsHead;
    private _removalsTail;
    get isDirty(): boolean;
    forEachItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachPreviousItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachChangedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachAddedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachRemovedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    diff(map?: Map<any, any> | {
        [k: string]: any;
    } | null): any;
    onDestroy(): void;
    /**
     * Check the current state of the map vs the previous.
     * The algorithm is optimised for when the keys do no change.
     */
    check(map: Map<any, any> | {
        [k: string]: any;
    }): boolean;
    /**
     * Inserts a record before `before` or append at the end of the list when `before` is null.
     *
     * Notes:
     * - This method appends at `this._appendAfter`,
     * - This method updates `this._appendAfter`,
     * - The return value is the new value for the insertion pointer.
     */
    private _insertBeforeOrAppend;
    private _getOrCreateRecordForKey;
    /** @internal */
    _reset(): void;
    private _maybeAddToChanges;
    private _addToAdditions;
    private _addToChanges;
    /** @internal */
    private _forEach;
}
