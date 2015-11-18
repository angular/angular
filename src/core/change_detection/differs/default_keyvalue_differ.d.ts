import { ChangeDetectorRef } from '../change_detector_ref';
import { KeyValueDiffer, KeyValueDifferFactory } from '../differs/keyvalue_differs';
export declare class DefaultKeyValueDifferFactory implements KeyValueDifferFactory {
    supports(obj: any): boolean;
    create(cdRef: ChangeDetectorRef): KeyValueDiffer;
}
export declare class DefaultKeyValueDiffer implements KeyValueDiffer {
    private _records;
    private _mapHead;
    private _previousMapHead;
    private _changesHead;
    private _changesTail;
    private _additionsHead;
    private _additionsTail;
    private _removalsHead;
    private _removalsTail;
    isDirty: boolean;
    forEachItem(fn: Function): void;
    forEachPreviousItem(fn: Function): void;
    forEachChangedItem(fn: Function): void;
    forEachAddedItem(fn: Function): void;
    forEachRemovedItem(fn: Function): void;
    diff(map: Map<any, any>): any;
    onDestroy(): void;
    check(map: Map<any, any>): boolean;
    toString(): string;
}
export declare class KVChangeRecord {
    key: any;
    previousValue: any;
    currentValue: any;
    constructor(key: any);
    toString(): string;
}
