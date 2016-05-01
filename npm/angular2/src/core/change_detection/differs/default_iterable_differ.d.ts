import { ChangeDetectorRef } from '../change_detector_ref';
import { IterableDiffer, IterableDifferFactory, TrackByFn } from '../differs/iterable_differs';
export declare class DefaultIterableDifferFactory implements IterableDifferFactory {
    constructor();
    supports(obj: Object): boolean;
    create(cdRef: ChangeDetectorRef, trackByFn?: TrackByFn): DefaultIterableDiffer;
}
export declare class DefaultIterableDiffer implements IterableDiffer {
    private _trackByFn;
    private _length;
    private _collection;
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
    constructor(_trackByFn?: TrackByFn);
    collection: any;
    length: number;
    forEachItem(fn: Function): void;
    forEachPreviousItem(fn: Function): void;
    forEachAddedItem(fn: Function): void;
    forEachMovedItem(fn: Function): void;
    forEachRemovedItem(fn: Function): void;
    forEachIdentityChange(fn: Function): void;
    diff(collection: any): DefaultIterableDiffer;
    onDestroy(): void;
    check(collection: any): boolean;
    isDirty: boolean;
    toString(): string;
}
export declare class CollectionChangeRecord {
    item: any;
    trackById: any;
    currentIndex: number;
    previousIndex: number;
    constructor(item: any, trackById: any);
    toString(): string;
}
