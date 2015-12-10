var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { isListLikeIterable, iterateListLike } from 'angular2/src/facade/collection';
import { isBlank, isPresent, stringify, getMapKey, looseIdentical, isArray } from 'angular2/src/facade/lang';
export let DefaultIterableDifferFactory = class {
    supports(obj) { return isListLikeIterable(obj); }
    create(cdRef) { return new DefaultIterableDiffer(); }
};
DefaultIterableDifferFactory = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [])
], DefaultIterableDifferFactory);
export class DefaultIterableDiffer {
    constructor() {
        this._collection = null;
        this._length = null;
        // Keeps track of the used records at any point in time (during & across `_check()` calls)
        this._linkedRecords = null;
        // Keeps track of the removed records at any point in time during `_check()` calls.
        this._unlinkedRecords = null;
        this._previousItHead = null;
        this._itHead = null;
        this._itTail = null;
        this._additionsHead = null;
        this._additionsTail = null;
        this._movesHead = null;
        this._movesTail = null;
        this._removalsHead = null;
        this._removalsTail = null;
    }
    get collection() { return this._collection; }
    get length() { return this._length; }
    forEachItem(fn) {
        var record;
        for (record = this._itHead; record !== null; record = record._next) {
            fn(record);
        }
    }
    forEachPreviousItem(fn) {
        var record;
        for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
            fn(record);
        }
    }
    forEachAddedItem(fn) {
        var record;
        for (record = this._additionsHead; record !== null; record = record._nextAdded) {
            fn(record);
        }
    }
    forEachMovedItem(fn) {
        var record;
        for (record = this._movesHead; record !== null; record = record._nextMoved) {
            fn(record);
        }
    }
    forEachRemovedItem(fn) {
        var record;
        for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
            fn(record);
        }
    }
    diff(collection) {
        if (isBlank(collection))
            collection = [];
        if (!isListLikeIterable(collection)) {
            throw new BaseException(`Error trying to diff '${collection}'`);
        }
        if (this.check(collection)) {
            return this;
        }
        else {
            return null;
        }
    }
    onDestroy() { }
    // todo(vicb): optim for UnmodifiableListView (frozen arrays)
    check(collection) {
        this._reset();
        var record = this._itHead;
        var mayBeDirty = false;
        var index;
        var item;
        if (isArray(collection)) {
            var list = collection;
            this._length = collection.length;
            for (index = 0; index < this._length; index++) {
                item = list[index];
                if (record === null || !looseIdentical(record.item, item)) {
                    record = this._mismatch(record, item, index);
                    mayBeDirty = true;
                }
                else if (mayBeDirty) {
                    // TODO(misko): can we limit this to duplicates only?
                    record = this._verifyReinsertion(record, item, index);
                }
                record = record._next;
            }
        }
        else {
            index = 0;
            iterateListLike(collection, (item) => {
                if (record === null || !looseIdentical(record.item, item)) {
                    record = this._mismatch(record, item, index);
                    mayBeDirty = true;
                }
                else if (mayBeDirty) {
                    // TODO(misko): can we limit this to duplicates only?
                    record = this._verifyReinsertion(record, item, index);
                }
                record = record._next;
                index++;
            });
            this._length = index;
        }
        this._truncate(record);
        this._collection = collection;
        return this.isDirty;
    }
    // CollectionChanges is considered dirty if it has any additions, moves or removals.
    get isDirty() {
        return this._additionsHead !== null || this._movesHead !== null || this._removalsHead !== null;
    }
    /**
     * Reset the state of the change objects to show no changes. This means set previousKey to
     * currentKey, and clear all of the queues (additions, moves, removals).
     * Set the previousIndexes of moved and added items to their currentIndexes
     * Reset the list of additions, moves and removals
     *
     * @internal
     */
    _reset() {
        if (this.isDirty) {
            var record;
            var nextRecord;
            for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
                record._nextPrevious = record._next;
            }
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                record.previousIndex = record.currentIndex;
            }
            this._additionsHead = this._additionsTail = null;
            for (record = this._movesHead; record !== null; record = nextRecord) {
                record.previousIndex = record.currentIndex;
                nextRecord = record._nextMoved;
            }
            this._movesHead = this._movesTail = null;
            this._removalsHead = this._removalsTail = null;
        }
    }
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
    _mismatch(record, item, index) {
        // The previous record after which we will append the current one.
        var previousRecord;
        if (record === null) {
            previousRecord = this._itTail;
        }
        else {
            previousRecord = record._prev;
            // Remove the record from the collection since we know it does not match the item.
            this._remove(record);
        }
        // Attempt to see if we have seen the item before.
        record = this._linkedRecords === null ? null : this._linkedRecords.get(item, index);
        if (record !== null) {
            // We have seen this before, we need to move it forward in the collection.
            this._moveAfter(record, previousRecord, index);
        }
        else {
            // Never seen it, check evicted list.
            record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(item);
            if (record !== null) {
                // It is an item which we have evicted earlier: reinsert it back into the list.
                this._reinsertAfter(record, previousRecord, index);
            }
            else {
                // It is a new item: add it.
                record = this._addAfter(new CollectionChangeRecord(item), previousRecord, index);
            }
        }
        return record;
    }
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
    _verifyReinsertion(record, item, index) {
        var reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(item);
        if (reinsertRecord !== null) {
            record = this._reinsertAfter(reinsertRecord, record._prev, index);
        }
        else if (record.currentIndex != index) {
            record.currentIndex = index;
            this._addToMoves(record, index);
        }
        return record;
    }
    /**
     * Get rid of any excess {@link CollectionChangeRecord}s from the previous collection
     *
     * - `record` The first excess {@link CollectionChangeRecord}.
     *
     * @internal
     */
    _truncate(record) {
        // Anything after that needs to be removed;
        while (record !== null) {
            var nextRecord = record._next;
            this._addToRemovals(this._unlink(record));
            record = nextRecord;
        }
        if (this._unlinkedRecords !== null) {
            this._unlinkedRecords.clear();
        }
        if (this._additionsTail !== null) {
            this._additionsTail._nextAdded = null;
        }
        if (this._movesTail !== null) {
            this._movesTail._nextMoved = null;
        }
        if (this._itTail !== null) {
            this._itTail._next = null;
        }
        if (this._removalsTail !== null) {
            this._removalsTail._nextRemoved = null;
        }
    }
    /** @internal */
    _reinsertAfter(record, prevRecord, index) {
        if (this._unlinkedRecords !== null) {
            this._unlinkedRecords.remove(record);
        }
        var prev = record._prevRemoved;
        var next = record._nextRemoved;
        if (prev === null) {
            this._removalsHead = next;
        }
        else {
            prev._nextRemoved = next;
        }
        if (next === null) {
            this._removalsTail = prev;
        }
        else {
            next._prevRemoved = prev;
        }
        this._insertAfter(record, prevRecord, index);
        this._addToMoves(record, index);
        return record;
    }
    /** @internal */
    _moveAfter(record, prevRecord, index) {
        this._unlink(record);
        this._insertAfter(record, prevRecord, index);
        this._addToMoves(record, index);
        return record;
    }
    /** @internal */
    _addAfter(record, prevRecord, index) {
        this._insertAfter(record, prevRecord, index);
        if (this._additionsTail === null) {
            // todo(vicb)
            // assert(this._additionsHead === null);
            this._additionsTail = this._additionsHead = record;
        }
        else {
            // todo(vicb)
            // assert(_additionsTail._nextAdded === null);
            // assert(record._nextAdded === null);
            this._additionsTail = this._additionsTail._nextAdded = record;
        }
        return record;
    }
    /** @internal */
    _insertAfter(record, prevRecord, index) {
        // todo(vicb)
        // assert(record != prevRecord);
        // assert(record._next === null);
        // assert(record._prev === null);
        var next = prevRecord === null ? this._itHead : prevRecord._next;
        // todo(vicb)
        // assert(next != record);
        // assert(prevRecord != record);
        record._next = next;
        record._prev = prevRecord;
        if (next === null) {
            this._itTail = record;
        }
        else {
            next._prev = record;
        }
        if (prevRecord === null) {
            this._itHead = record;
        }
        else {
            prevRecord._next = record;
        }
        if (this._linkedRecords === null) {
            this._linkedRecords = new _DuplicateMap();
        }
        this._linkedRecords.put(record);
        record.currentIndex = index;
        return record;
    }
    /** @internal */
    _remove(record) {
        return this._addToRemovals(this._unlink(record));
    }
    /** @internal */
    _unlink(record) {
        if (this._linkedRecords !== null) {
            this._linkedRecords.remove(record);
        }
        var prev = record._prev;
        var next = record._next;
        // todo(vicb)
        // assert((record._prev = null) === null);
        // assert((record._next = null) === null);
        if (prev === null) {
            this._itHead = next;
        }
        else {
            prev._next = next;
        }
        if (next === null) {
            this._itTail = prev;
        }
        else {
            next._prev = prev;
        }
        return record;
    }
    /** @internal */
    _addToMoves(record, toIndex) {
        // todo(vicb)
        // assert(record._nextMoved === null);
        if (record.previousIndex === toIndex) {
            return record;
        }
        if (this._movesTail === null) {
            // todo(vicb)
            // assert(_movesHead === null);
            this._movesTail = this._movesHead = record;
        }
        else {
            // todo(vicb)
            // assert(_movesTail._nextMoved === null);
            this._movesTail = this._movesTail._nextMoved = record;
        }
        return record;
    }
    /** @internal */
    _addToRemovals(record) {
        if (this._unlinkedRecords === null) {
            this._unlinkedRecords = new _DuplicateMap();
        }
        this._unlinkedRecords.put(record);
        record.currentIndex = null;
        record._nextRemoved = null;
        if (this._removalsTail === null) {
            // todo(vicb)
            // assert(_removalsHead === null);
            this._removalsTail = this._removalsHead = record;
            record._prevRemoved = null;
        }
        else {
            // todo(vicb)
            // assert(_removalsTail._nextRemoved === null);
            // assert(record._nextRemoved === null);
            record._prevRemoved = this._removalsTail;
            this._removalsTail = this._removalsTail._nextRemoved = record;
        }
        return record;
    }
    toString() {
        var record;
        var list = [];
        for (record = this._itHead; record !== null; record = record._next) {
            list.push(record);
        }
        var previous = [];
        for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
            previous.push(record);
        }
        var additions = [];
        for (record = this._additionsHead; record !== null; record = record._nextAdded) {
            additions.push(record);
        }
        var moves = [];
        for (record = this._movesHead; record !== null; record = record._nextMoved) {
            moves.push(record);
        }
        var removals = [];
        for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
            removals.push(record);
        }
        return "collection: " + list.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" +
            "additions: " + additions.join(', ') + "\n" + "moves: " + moves.join(', ') + "\n" +
            "removals: " + removals.join(', ') + "\n";
    }
}
export class CollectionChangeRecord {
    constructor(item) {
        this.item = item;
        this.currentIndex = null;
        this.previousIndex = null;
        /** @internal */
        this._nextPrevious = null;
        /** @internal */
        this._prev = null;
        /** @internal */
        this._next = null;
        /** @internal */
        this._prevDup = null;
        /** @internal */
        this._nextDup = null;
        /** @internal */
        this._prevRemoved = null;
        /** @internal */
        this._nextRemoved = null;
        /** @internal */
        this._nextAdded = null;
        /** @internal */
        this._nextMoved = null;
    }
    toString() {
        return this.previousIndex === this.currentIndex ?
            stringify(this.item) :
            stringify(this.item) + '[' + stringify(this.previousIndex) + '->' +
                stringify(this.currentIndex) + ']';
    }
}
// A linked list of CollectionChangeRecords with the same CollectionChangeRecord.item
class _DuplicateItemRecordList {
    constructor() {
        /** @internal */
        this._head = null;
        /** @internal */
        this._tail = null;
    }
    /**
     * Append the record to the list of duplicates.
     *
     * Note: by design all records in the list of duplicates hold the same value in record.item.
     */
    add(record) {
        if (this._head === null) {
            this._head = this._tail = record;
            record._nextDup = null;
            record._prevDup = null;
        }
        else {
            // todo(vicb)
            // assert(record.item ==  _head.item ||
            //       record.item is num && record.item.isNaN && _head.item is num && _head.item.isNaN);
            this._tail._nextDup = record;
            record._prevDup = this._tail;
            record._nextDup = null;
            this._tail = record;
        }
    }
    // Returns a CollectionChangeRecord having CollectionChangeRecord.item == item and
    // CollectionChangeRecord.currentIndex >= afterIndex
    get(item, afterIndex) {
        var record;
        for (record = this._head; record !== null; record = record._nextDup) {
            if ((afterIndex === null || afterIndex < record.currentIndex) &&
                looseIdentical(record.item, item)) {
                return record;
            }
        }
        return null;
    }
    /**
     * Remove one {@link CollectionChangeRecord} from the list of duplicates.
     *
     * Returns whether the list of duplicates is empty.
     */
    remove(record) {
        // todo(vicb)
        // assert(() {
        //  // verify that the record being removed is in the list.
        //  for (CollectionChangeRecord cursor = _head; cursor != null; cursor = cursor._nextDup) {
        //    if (identical(cursor, record)) return true;
        //  }
        //  return false;
        //});
        var prev = record._prevDup;
        var next = record._nextDup;
        if (prev === null) {
            this._head = next;
        }
        else {
            prev._nextDup = next;
        }
        if (next === null) {
            this._tail = prev;
        }
        else {
            next._prevDup = prev;
        }
        return this._head === null;
    }
}
class _DuplicateMap {
    constructor() {
        this.map = new Map();
    }
    put(record) {
        // todo(vicb) handle corner cases
        var key = getMapKey(record.item);
        var duplicates = this.map.get(key);
        if (!isPresent(duplicates)) {
            duplicates = new _DuplicateItemRecordList();
            this.map.set(key, duplicates);
        }
        duplicates.add(record);
    }
    /**
     * Retrieve the `value` using key. Because the CollectionChangeRecord value maybe one which we
     * have already iterated over, we use the afterIndex to pretend it is not there.
     *
     * Use case: `[a, b, c, a, a]` if we are at index `3` which is the second `a` then asking if we
     * have any more `a`s needs to return the last `a` not the first or second.
     */
    get(value, afterIndex = null) {
        var key = getMapKey(value);
        var recordList = this.map.get(key);
        return isBlank(recordList) ? null : recordList.get(value, afterIndex);
    }
    /**
     * Removes a {@link CollectionChangeRecord} from the list of duplicates.
     *
     * The list of duplicates also is removed from the map if it gets empty.
     */
    remove(record) {
        var key = getMapKey(record.item);
        // todo(vicb)
        // assert(this.map.containsKey(key));
        var recordList = this.map.get(key);
        // Remove the list of duplicates when it gets empty
        if (recordList.remove(record)) {
            this.map.delete(key);
        }
        return record;
    }
    get isEmpty() { return this.map.size === 0; }
    clear() { this.map.clear(); }
    toString() { return '_DuplicateMap(' + stringify(this.map) + ')'; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2RpZmZlcnMvZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXIudHMiXSwibmFtZXMiOlsiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlckZhY3Rvcnkuc3VwcG9ydHMiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXJGYWN0b3J5LmNyZWF0ZSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlciIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5jb25zdHJ1Y3RvciIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5jb2xsZWN0aW9uIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLmxlbmd0aCIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5mb3JFYWNoSXRlbSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5mb3JFYWNoUHJldmlvdXNJdGVtIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLmZvckVhY2hBZGRlZEl0ZW0iLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuZm9yRWFjaE1vdmVkSXRlbSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5mb3JFYWNoUmVtb3ZlZEl0ZW0iLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuZGlmZiIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5vbkRlc3Ryb3kiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuY2hlY2siLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuaXNEaXJ0eSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5fcmVzZXQiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuX21pc21hdGNoIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl92ZXJpZnlSZWluc2VydGlvbiIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5fdHJ1bmNhdGUiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuX3JlaW5zZXJ0QWZ0ZXIiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuX21vdmVBZnRlciIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5fYWRkQWZ0ZXIiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuX2luc2VydEFmdGVyIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl9yZW1vdmUiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuX3VubGluayIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5fYWRkVG9Nb3ZlcyIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5fYWRkVG9SZW1vdmFscyIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci50b1N0cmluZyIsIkNvbGxlY3Rpb25DaGFuZ2VSZWNvcmQiLCJDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLmNvbnN0cnVjdG9yIiwiQ29sbGVjdGlvbkNoYW5nZVJlY29yZC50b1N0cmluZyIsIl9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdCIsIl9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdC5jb25zdHJ1Y3RvciIsIl9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdC5hZGQiLCJfRHVwbGljYXRlSXRlbVJlY29yZExpc3QuZ2V0IiwiX0R1cGxpY2F0ZUl0ZW1SZWNvcmRMaXN0LnJlbW92ZSIsIl9EdXBsaWNhdGVNYXAiLCJfRHVwbGljYXRlTWFwLmNvbnN0cnVjdG9yIiwiX0R1cGxpY2F0ZU1hcC5wdXQiLCJfRHVwbGljYXRlTWFwLmdldCIsIl9EdXBsaWNhdGVNYXAucmVtb3ZlIiwiX0R1cGxpY2F0ZU1hcC5pc0VtcHR5IiwiX0R1cGxpY2F0ZU1hcC5jbGVhciIsIl9EdXBsaWNhdGVNYXAudG9TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sMEJBQTBCO09BQ3ZDLEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEVBQ0wsa0JBQWtCLEVBQ2xCLGVBQWUsRUFHaEIsTUFBTSxnQ0FBZ0M7T0FFaEMsRUFDTCxPQUFPLEVBQ1AsU0FBUyxFQUNULFNBQVMsRUFDVCxTQUFTLEVBQ1QsY0FBYyxFQUNkLE9BQU8sRUFDUixNQUFNLDBCQUEwQjtBQUtqQztJQUVFQSxRQUFRQSxDQUFDQSxHQUFXQSxJQUFhQyxNQUFNQSxDQUFDQSxrQkFBa0JBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ2xFRCxNQUFNQSxDQUFDQSxLQUF3QkEsSUFBU0UsTUFBTUEsQ0FBQ0EsSUFBSUEscUJBQXFCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUMvRUYsQ0FBQ0E7QUFKRDtJQUFDLEtBQUssRUFBRTs7aUNBSVA7QUFFRDtJQUFBRztRQUNVQyxnQkFBV0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLFlBQU9BLEdBQVdBLElBQUlBLENBQUNBO1FBQy9CQSwwRkFBMEZBO1FBQ2xGQSxtQkFBY0EsR0FBa0JBLElBQUlBLENBQUNBO1FBQzdDQSxtRkFBbUZBO1FBQzNFQSxxQkFBZ0JBLEdBQWtCQSxJQUFJQSxDQUFDQTtRQUN2Q0Esb0JBQWVBLEdBQTJCQSxJQUFJQSxDQUFDQTtRQUMvQ0EsWUFBT0EsR0FBMkJBLElBQUlBLENBQUNBO1FBQ3ZDQSxZQUFPQSxHQUEyQkEsSUFBSUEsQ0FBQ0E7UUFDdkNBLG1CQUFjQSxHQUEyQkEsSUFBSUEsQ0FBQ0E7UUFDOUNBLG1CQUFjQSxHQUEyQkEsSUFBSUEsQ0FBQ0E7UUFDOUNBLGVBQVVBLEdBQTJCQSxJQUFJQSxDQUFDQTtRQUMxQ0EsZUFBVUEsR0FBMkJBLElBQUlBLENBQUNBO1FBQzFDQSxrQkFBYUEsR0FBMkJBLElBQUlBLENBQUNBO1FBQzdDQSxrQkFBYUEsR0FBMkJBLElBQUlBLENBQUNBO0lBK2J2REEsQ0FBQ0E7SUE3YkNELElBQUlBLFVBQVVBLEtBQUtFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO0lBRTdDRixJQUFJQSxNQUFNQSxLQUFhRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU3Q0gsV0FBV0EsQ0FBQ0EsRUFBWUE7UUFDdEJJLElBQUlBLE1BQThCQSxDQUFDQTtRQUNuQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsTUFBTUEsS0FBS0EsSUFBSUEsRUFBRUEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7WUFDbkVBLEVBQUVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQ2JBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURKLG1CQUFtQkEsQ0FBQ0EsRUFBWUE7UUFDOUJLLElBQUlBLE1BQThCQSxDQUFDQTtRQUNuQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZUFBZUEsRUFBRUEsTUFBTUEsS0FBS0EsSUFBSUEsRUFBRUEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0E7WUFDbkZBLEVBQUVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQ2JBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURMLGdCQUFnQkEsQ0FBQ0EsRUFBWUE7UUFDM0JNLElBQUlBLE1BQThCQSxDQUFDQTtRQUNuQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsRUFBRUEsTUFBTUEsS0FBS0EsSUFBSUEsRUFBRUEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7WUFDL0VBLEVBQUVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQ2JBLENBQUNBO0lBQ0hBLENBQUNBO0lBRUROLGdCQUFnQkEsQ0FBQ0EsRUFBWUE7UUFDM0JPLElBQUlBLE1BQThCQSxDQUFDQTtRQUNuQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsTUFBTUEsS0FBS0EsSUFBSUEsRUFBRUEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7WUFDM0VBLEVBQUVBLENBQUNBLE1BQU1BLENBQUNB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SUEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDZEEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsTUFBTUEsS0FBS0EsSUFBSUEsRUFBRUEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7WUFDbkVBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUVEQSxJQUFJQSxRQUFRQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNsQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZUFBZUEsRUFBRUEsTUFBTUEsS0FBS0EsSUFBSUEsRUFBRUEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0E7WUFDbkZBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3hCQSxDQUFDQTtRQUVEQSxJQUFJQSxTQUFTQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNuQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsRUFBRUEsTUFBTUEsS0FBS0EsSUFBSUEsRUFBRUEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7WUFDL0VBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3pCQSxDQUFDQTtRQUNEQSxJQUFJQSxLQUFLQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNmQSxHQUFHQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxNQUFNQSxLQUFLQSxJQUFJQSxFQUFFQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtZQUMzRUEsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDckJBLENBQUNBO1FBRURBLElBQUlBLFFBQVFB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Q0EsQ0FBQ0E7WUFDOUJBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFFREosSUFBSUEsT0FBT0EsS0FBY0ssTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFdERMLEtBQUtBLEtBQUtNLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRTdCTixRQUFRQSxLQUFhTyxNQUFNQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO0FBQzdFUCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7XG4gIGlzTGlzdExpa2VJdGVyYWJsZSxcbiAgaXRlcmF0ZUxpc3RMaWtlLFxuICBMaXN0V3JhcHBlcixcbiAgTWFwV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge1xuICBpc0JsYW5rLFxuICBpc1ByZXNlbnQsXG4gIHN0cmluZ2lmeSxcbiAgZ2V0TWFwS2V5LFxuICBsb29zZUlkZW50aWNhbCxcbiAgaXNBcnJheVxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7SXRlcmFibGVEaWZmZXIsIEl0ZXJhYmxlRGlmZmVyRmFjdG9yeX0gZnJvbSAnLi4vZGlmZmVycy9pdGVyYWJsZV9kaWZmZXJzJztcblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBEZWZhdWx0SXRlcmFibGVEaWZmZXJGYWN0b3J5IGltcGxlbWVudHMgSXRlcmFibGVEaWZmZXJGYWN0b3J5IHtcbiAgc3VwcG9ydHMob2JqOiBPYmplY3QpOiBib29sZWFuIHsgcmV0dXJuIGlzTGlzdExpa2VJdGVyYWJsZShvYmopOyB9XG4gIGNyZWF0ZShjZFJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpOiBhbnkgeyByZXR1cm4gbmV3IERlZmF1bHRJdGVyYWJsZURpZmZlcigpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0SXRlcmFibGVEaWZmZXIgaW1wbGVtZW50cyBJdGVyYWJsZURpZmZlciB7XG4gIHByaXZhdGUgX2NvbGxlY3Rpb24gPSBudWxsO1xuICBwcml2YXRlIF9sZW5ndGg6IG51bWJlciA9IG51bGw7XG4gIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSB1c2VkIHJlY29yZHMgYXQgYW55IHBvaW50IGluIHRpbWUgKGR1cmluZyAmIGFjcm9zcyBgX2NoZWNrKClgIGNhbGxzKVxuICBwcml2YXRlIF9saW5rZWRSZWNvcmRzOiBfRHVwbGljYXRlTWFwID0gbnVsbDtcbiAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIHJlbW92ZWQgcmVjb3JkcyBhdCBhbnkgcG9pbnQgaW4gdGltZSBkdXJpbmcgYF9jaGVjaygpYCBjYWxscy5cbiAgcHJpdmF0ZSBfdW5saW5rZWRSZWNvcmRzOiBfRHVwbGljYXRlTWFwID0gbnVsbDtcbiAgcHJpdmF0ZSBfcHJldmlvdXNJdEhlYWQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICBwcml2YXRlIF9pdEhlYWQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICBwcml2YXRlIF9pdFRhaWw6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICBwcml2YXRlIF9hZGRpdGlvbnNIZWFkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgcHJpdmF0ZSBfYWRkaXRpb25zVGFpbDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIHByaXZhdGUgX21vdmVzSGVhZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIHByaXZhdGUgX21vdmVzVGFpbDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIHByaXZhdGUgX3JlbW92YWxzSGVhZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIHByaXZhdGUgX3JlbW92YWxzVGFpbDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG5cbiAgZ2V0IGNvbGxlY3Rpb24oKSB7IHJldHVybiB0aGlzLl9jb2xsZWN0aW9uOyB9XG5cbiAgZ2V0IGxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbGVuZ3RoOyB9XG5cbiAgZm9yRWFjaEl0ZW0oZm46IEZ1bmN0aW9uKSB7XG4gICAgdmFyIHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2l0SGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHQpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaFByZXZpb3VzSXRlbShmbjogRnVuY3Rpb24pIHtcbiAgICB2YXIgcmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5fcHJldmlvdXNJdEhlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0UHJldmlvdXMpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaEFkZGVkSXRlbShmbjogRnVuY3Rpb24pIHtcbiAgICB2YXIgcmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5fYWRkaXRpb25zSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRBZGRlZCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoTW92ZWRJdGVtKGZuOiBGdW5jdGlvbikge1xuICAgIHZhciByZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQ7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9tb3Zlc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0TW92ZWQpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaFJlbW92ZWRJdGVtKGZuOiBGdW5jdGlvbikge1xuICAgIHZhciByZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQ7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9yZW1vdmFsc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0UmVtb3ZlZCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBkaWZmKGNvbGxlY3Rpb246IGFueSk6IERlZmF1bHRJdGVyYWJsZURpZmZlciB7XG4gICAgaWYgKGlzQmxhbmsoY29sbGVjdGlvbikpIGNvbGxlY3Rpb24gPSBbXTtcbiAgICBpZiAoIWlzTGlzdExpa2VJdGVyYWJsZShjb2xsZWN0aW9uKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYEVycm9yIHRyeWluZyB0byBkaWZmICcke2NvbGxlY3Rpb259J2ApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoZWNrKGNvbGxlY3Rpb24pKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgb25EZXN0cm95KCkge31cblxuICAvLyB0b2RvKHZpY2IpOiBvcHRpbSBmb3IgVW5tb2RpZmlhYmxlTGlzdFZpZXcgKGZyb3plbiBhcnJheXMpXG4gIGNoZWNrKGNvbGxlY3Rpb246IGFueSk6IGJvb2xlYW4ge1xuICAgIHRoaXMuX3Jlc2V0KCk7XG5cbiAgICB2YXIgcmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gdGhpcy5faXRIZWFkO1xuICAgIHZhciBtYXlCZURpcnR5OiBib29sZWFuID0gZmFsc2U7XG4gICAgdmFyIGluZGV4OiBudW1iZXI7XG4gICAgdmFyIGl0ZW07XG5cbiAgICBpZiAoaXNBcnJheShjb2xsZWN0aW9uKSkge1xuICAgICAgdmFyIGxpc3QgPSBjb2xsZWN0aW9uO1xuICAgICAgdGhpcy5fbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGg7XG5cbiAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuX2xlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBpdGVtID0gbGlzdFtpbmRleF07XG4gICAgICAgIGlmIChyZWNvcmQgPT09IG51bGwgfHwgIWxvb3NlSWRlbnRpY2FsKHJlY29yZC5pdGVtLCBpdGVtKSkge1xuICAgICAgICAgIHJlY29yZCA9IHRoaXMuX21pc21hdGNoKHJlY29yZCwgaXRlbSwgaW5kZXgpO1xuICAgICAgICAgIG1heUJlRGlydHkgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKG1heUJlRGlydHkpIHtcbiAgICAgICAgICAvLyBUT0RPKG1pc2tvKTogY2FuIHdlIGxpbWl0IHRoaXMgdG8gZHVwbGljYXRlcyBvbmx5P1xuICAgICAgICAgIHJlY29yZCA9IHRoaXMuX3ZlcmlmeVJlaW5zZXJ0aW9uKHJlY29yZCwgaXRlbSwgaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHJlY29yZCA9IHJlY29yZC5fbmV4dDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaW5kZXggPSAwO1xuICAgICAgaXRlcmF0ZUxpc3RMaWtlKGNvbGxlY3Rpb24sIChpdGVtKSA9PiB7XG4gICAgICAgIGlmIChyZWNvcmQgPT09IG51bGwgfHwgIWxvb3NlSWRlbnRpY2FsKHJlY29yZC5pdGVtLCBpdGVtKSkge1xuICAgICAgICAgIHJlY29yZCA9IHRoaXMuX21pc21hdGNoKHJlY29yZCwgaXRlbSwgaW5kZXgpO1xuICAgICAgICAgIG1heUJlRGlydHkgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKG1heUJlRGlydHkpIHtcbiAgICAgICAgICAvLyBUT0RPKG1pc2tvKTogY2FuIHdlIGxpbWl0IHRoaXMgdG8gZHVwbGljYXRlcyBvbmx5P1xuICAgICAgICAgIHJlY29yZCA9IHRoaXMuX3ZlcmlmeVJlaW5zZXJ0aW9uKHJlY29yZCwgaXRlbSwgaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHJlY29yZCA9IHJlY29yZC5fbmV4dDtcbiAgICAgICAgaW5kZXgrKztcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fbGVuZ3RoID0gaW5kZXg7XG4gICAgfVxuXG4gICAgdGhpcy5fdHJ1bmNhdGUocmVjb3JkKTtcbiAgICB0aGlzLl9jb2xsZWN0aW9uID0gY29sbGVjdGlvbjtcbiAgICByZXR1cm4gdGhpcy5pc0RpcnR5O1xuICB9XG5cbiAgLy8gQ29sbGVjdGlvbkNoYW5nZXMgaXMgY29uc2lkZXJlZCBkaXJ0eSBpZiBpdCBoYXMgYW55IGFkZGl0aW9ucywgbW92ZXMgb3IgcmVtb3ZhbHMuXG4gIGdldCBpc0RpcnR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9hZGRpdGlvbnNIZWFkICE9PSBudWxsIHx8IHRoaXMuX21vdmVzSGVhZCAhPT0gbnVsbCB8fCB0aGlzLl9yZW1vdmFsc0hlYWQgIT09IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIHN0YXRlIG9mIHRoZSBjaGFuZ2Ugb2JqZWN0cyB0byBzaG93IG5vIGNoYW5nZXMuIFRoaXMgbWVhbnMgc2V0IHByZXZpb3VzS2V5IHRvXG4gICAqIGN1cnJlbnRLZXksIGFuZCBjbGVhciBhbGwgb2YgdGhlIHF1ZXVlcyAoYWRkaXRpb25zLCBtb3ZlcywgcmVtb3ZhbHMpLlxuICAgKiBTZXQgdGhlIHByZXZpb3VzSW5kZXhlcyBvZiBtb3ZlZCBhbmQgYWRkZWQgaXRlbXMgdG8gdGhlaXIgY3VycmVudEluZGV4ZXNcbiAgICogUmVzZXQgdGhlIGxpc3Qgb2YgYWRkaXRpb25zLCBtb3ZlcyBhbmQgcmVtb3ZhbHNcbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfcmVzZXQoKSB7XG4gICAgaWYgKHRoaXMuaXNEaXJ0eSkge1xuICAgICAgdmFyIHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZDtcbiAgICAgIHZhciBuZXh0UmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkO1xuXG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX3ByZXZpb3VzSXRIZWFkID0gdGhpcy5faXRIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dCkge1xuICAgICAgICByZWNvcmQuX25leHRQcmV2aW91cyA9IHJlY29yZC5fbmV4dDtcbiAgICAgIH1cblxuICAgICAgZm9yIChyZWNvcmQgPSB0aGlzLl9hZGRpdGlvbnNIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dEFkZGVkKSB7XG4gICAgICAgIHJlY29yZC5wcmV2aW91c0luZGV4ID0gcmVjb3JkLmN1cnJlbnRJbmRleDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FkZGl0aW9uc0hlYWQgPSB0aGlzLl9hZGRpdGlvbnNUYWlsID0gbnVsbDtcblxuICAgICAgZm9yIChyZWNvcmQgPSB0aGlzLl9tb3Zlc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gbmV4dFJlY29yZCkge1xuICAgICAgICByZWNvcmQucHJldmlvdXNJbmRleCA9IHJlY29yZC5jdXJyZW50SW5kZXg7XG4gICAgICAgIG5leHRSZWNvcmQgPSByZWNvcmQuX25leHRNb3ZlZDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX21vdmVzSGVhZCA9IHRoaXMuX21vdmVzVGFpbCA9IG51bGw7XG4gICAgICB0aGlzLl9yZW1vdmFsc0hlYWQgPSB0aGlzLl9yZW1vdmFsc1RhaWwgPSBudWxsO1xuXG4gICAgICAvLyB0b2RvKHZpY2IpIHdoZW4gYXNzZXJ0IGdldHMgc3VwcG9ydGVkXG4gICAgICAvLyBhc3NlcnQoIXRoaXMuaXNEaXJ0eSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgdGhlIGNvcmUgZnVuY3Rpb24gd2hpY2ggaGFuZGxlcyBkaWZmZXJlbmNlcyBiZXR3ZWVuIGNvbGxlY3Rpb25zLlxuICAgKlxuICAgKiAtIGByZWNvcmRgIGlzIHRoZSByZWNvcmQgd2hpY2ggd2Ugc2F3IGF0IHRoaXMgcG9zaXRpb24gbGFzdCB0aW1lLiBJZiBudWxsIHRoZW4gaXQgaXMgYSBuZXdcbiAgICogICBpdGVtLlxuICAgKiAtIGBpdGVtYCBpcyB0aGUgY3VycmVudCBpdGVtIGluIHRoZSBjb2xsZWN0aW9uXG4gICAqIC0gYGluZGV4YCBpcyB0aGUgcG9zaXRpb24gb2YgdGhlIGl0ZW0gaW4gdGhlIGNvbGxlY3Rpb25cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfbWlzbWF0Y2gocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLCBpdGVtLCBpbmRleDogbnVtYmVyKTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgLy8gVGhlIHByZXZpb3VzIHJlY29yZCBhZnRlciB3aGljaCB3ZSB3aWxsIGFwcGVuZCB0aGUgY3VycmVudCBvbmUuXG4gICAgdmFyIHByZXZpb3VzUmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkO1xuXG4gICAgaWYgKHJlY29yZCA9PT0gbnVsbCkge1xuICAgICAgcHJldmlvdXNSZWNvcmQgPSB0aGlzLl9pdFRhaWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXZpb3VzUmVjb3JkID0gcmVjb3JkLl9wcmV2O1xuICAgICAgLy8gUmVtb3ZlIHRoZSByZWNvcmQgZnJvbSB0aGUgY29sbGVjdGlvbiBzaW5jZSB3ZSBrbm93IGl0IGRvZXMgbm90IG1hdGNoIHRoZSBpdGVtLlxuICAgICAgdGhpcy5fcmVtb3ZlKHJlY29yZCk7XG4gICAgfVxuXG4gICAgLy8gQXR0ZW1wdCB0byBzZWUgaWYgd2UgaGF2ZSBzZWVuIHRoZSBpdGVtIGJlZm9yZS5cbiAgICByZWNvcmQgPSB0aGlzLl9saW5rZWRSZWNvcmRzID09PSBudWxsID8gbnVsbCA6IHRoaXMuX2xpbmtlZFJlY29yZHMuZ2V0KGl0ZW0sIGluZGV4KTtcbiAgICBpZiAocmVjb3JkICE9PSBudWxsKSB7XG4gICAgICAvLyBXZSBoYXZlIHNlZW4gdGhpcyBiZWZvcmUsIHdlIG5lZWQgdG8gbW92ZSBpdCBmb3J3YXJkIGluIHRoZSBjb2xsZWN0aW9uLlxuICAgICAgdGhpcy5fbW92ZUFmdGVyKHJlY29yZCwgcHJldmlvdXNSZWNvcmQsIGluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTmV2ZXIgc2VlbiBpdCwgY2hlY2sgZXZpY3RlZCBsaXN0LlxuICAgICAgcmVjb3JkID0gdGhpcy5fdW5saW5rZWRSZWNvcmRzID09PSBudWxsID8gbnVsbCA6IHRoaXMuX3VubGlua2VkUmVjb3Jkcy5nZXQoaXRlbSk7XG4gICAgICBpZiAocmVjb3JkICE9PSBudWxsKSB7XG4gICAgICAgIC8vIEl0IGlzIGFuIGl0ZW0gd2hpY2ggd2UgaGF2ZSBldmljdGVkIGVhcmxpZXI6IHJlaW5zZXJ0IGl0IGJhY2sgaW50byB0aGUgbGlzdC5cbiAgICAgICAgdGhpcy5fcmVpbnNlcnRBZnRlcihyZWNvcmQsIHByZXZpb3VzUmVjb3JkLCBpbmRleCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJdCBpcyBhIG5ldyBpdGVtOiBhZGQgaXQuXG4gICAgICAgIHJlY29yZCA9IHRoaXMuX2FkZEFmdGVyKG5ldyBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKGl0ZW0pLCBwcmV2aW91c1JlY29yZCwgaW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY2hlY2sgaXMgb25seSBuZWVkZWQgaWYgYW4gYXJyYXkgY29udGFpbnMgZHVwbGljYXRlcy4gKFNob3J0IGNpcmN1aXQgb2Ygbm90aGluZyBkaXJ0eSlcbiAgICpcbiAgICogVXNlIGNhc2U6IGBbYSwgYV1gID0+IGBbYiwgYSwgYV1gXG4gICAqXG4gICAqIElmIHdlIGRpZCBub3QgaGF2ZSB0aGlzIGNoZWNrIHRoZW4gdGhlIGluc2VydGlvbiBvZiBgYmAgd291bGQ6XG4gICAqICAgMSkgZXZpY3QgZmlyc3QgYGFgXG4gICAqICAgMikgaW5zZXJ0IGBiYCBhdCBgMGAgaW5kZXguXG4gICAqICAgMykgbGVhdmUgYGFgIGF0IGluZGV4IGAxYCBhcyBpcy4gPC0tIHRoaXMgaXMgd3JvbmchXG4gICAqICAgMykgcmVpbnNlcnQgYGFgIGF0IGluZGV4IDIuIDwtLSB0aGlzIGlzIHdyb25nIVxuICAgKlxuICAgKiBUaGUgY29ycmVjdCBiZWhhdmlvciBpczpcbiAgICogICAxKSBldmljdCBmaXJzdCBgYWBcbiAgICogICAyKSBpbnNlcnQgYGJgIGF0IGAwYCBpbmRleC5cbiAgICogICAzKSByZWluc2VydCBgYWAgYXQgaW5kZXggMS5cbiAgICogICAzKSBtb3ZlIGBhYCBhdCBmcm9tIGAxYCB0byBgMmAuXG4gICAqXG4gICAqXG4gICAqIERvdWJsZSBjaGVjayB0aGF0IHdlIGhhdmUgbm90IGV2aWN0ZWQgYSBkdXBsaWNhdGUgaXRlbS4gV2UgbmVlZCB0byBjaGVjayBpZiB0aGUgaXRlbSB0eXBlIG1heVxuICAgKiBoYXZlIGFscmVhZHkgYmVlbiByZW1vdmVkOlxuICAgKiBUaGUgaW5zZXJ0aW9uIG9mIGIgd2lsbCBldmljdCB0aGUgZmlyc3QgJ2EnLiBJZiB3ZSBkb24ndCByZWluc2VydCBpdCBub3cgaXQgd2lsbCBiZSByZWluc2VydGVkXG4gICAqIGF0IHRoZSBlbmQuIFdoaWNoIHdpbGwgc2hvdyB1cCBhcyB0aGUgdHdvICdhJ3Mgc3dpdGNoaW5nIHBvc2l0aW9uLiBUaGlzIGlzIGluY29ycmVjdCwgc2luY2UgYVxuICAgKiBiZXR0ZXIgd2F5IHRvIHRoaW5rIG9mIGl0IGlzIGFzIGluc2VydCBvZiAnYicgcmF0aGVyIHRoZW4gc3dpdGNoICdhJyB3aXRoICdiJyBhbmQgdGhlbiBhZGQgJ2EnXG4gICAqIGF0IHRoZSBlbmQuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX3ZlcmlmeVJlaW5zZXJ0aW9uKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCwgaXRlbSwgaW5kZXg6IG51bWJlcik6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIHZhciByZWluc2VydFJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9XG4gICAgICAgIHRoaXMuX3VubGlua2VkUmVjb3JkcyA9PT0gbnVsbCA/IG51bGwgOiB0aGlzLl91bmxpbmtlZFJlY29yZHMuZ2V0KGl0ZW0pO1xuICAgIGlmIChyZWluc2VydFJlY29yZCAhPT0gbnVsbCkge1xuICAgICAgcmVjb3JkID0gdGhpcy5fcmVpbnNlcnRBZnRlcihyZWluc2VydFJlY29yZCwgcmVjb3JkLl9wcmV2LCBpbmRleCk7XG4gICAgfSBlbHNlIGlmIChyZWNvcmQuY3VycmVudEluZGV4ICE9IGluZGV4KSB7XG4gICAgICByZWNvcmQuY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgICB0aGlzLl9hZGRUb01vdmVzKHJlY29yZCwgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCByaWQgb2YgYW55IGV4Y2VzcyB7QGxpbmsgQ29sbGVjdGlvbkNoYW5nZVJlY29yZH1zIGZyb20gdGhlIHByZXZpb3VzIGNvbGxlY3Rpb25cbiAgICpcbiAgICogLSBgcmVjb3JkYCBUaGUgZmlyc3QgZXhjZXNzIHtAbGluayBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkfS5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfdHJ1bmNhdGUocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKSB7XG4gICAgLy8gQW55dGhpbmcgYWZ0ZXIgdGhhdCBuZWVkcyB0byBiZSByZW1vdmVkO1xuICAgIHdoaWxlIChyZWNvcmQgIT09IG51bGwpIHtcbiAgICAgIHZhciBuZXh0UmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gcmVjb3JkLl9uZXh0O1xuICAgICAgdGhpcy5fYWRkVG9SZW1vdmFscyh0aGlzLl91bmxpbmsocmVjb3JkKSk7XG4gICAgICByZWNvcmQgPSBuZXh0UmVjb3JkO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdW5saW5rZWRSZWNvcmRzICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl91bmxpbmtlZFJlY29yZHMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fYWRkaXRpb25zVGFpbCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWRkaXRpb25zVGFpbC5fbmV4dEFkZGVkID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX21vdmVzVGFpbCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fbW92ZXNUYWlsLl9uZXh0TW92ZWQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5faXRUYWlsICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl9pdFRhaWwuX25leHQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fcmVtb3ZhbHNUYWlsICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl9yZW1vdmFsc1RhaWwuX25leHRSZW1vdmVkID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZWluc2VydEFmdGVyKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCwgcHJldlJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCxcbiAgICAgICAgICAgICAgICAgaW5kZXg6IG51bWJlcik6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIGlmICh0aGlzLl91bmxpbmtlZFJlY29yZHMgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3VubGlua2VkUmVjb3Jkcy5yZW1vdmUocmVjb3JkKTtcbiAgICB9XG4gICAgdmFyIHByZXYgPSByZWNvcmQuX3ByZXZSZW1vdmVkO1xuICAgIHZhciBuZXh0ID0gcmVjb3JkLl9uZXh0UmVtb3ZlZDtcblxuICAgIGlmIChwcmV2ID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9yZW1vdmFsc0hlYWQgPSBuZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2Ll9uZXh0UmVtb3ZlZCA9IG5leHQ7XG4gICAgfVxuICAgIGlmIChuZXh0ID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9yZW1vdmFsc1RhaWwgPSBwcmV2O1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0Ll9wcmV2UmVtb3ZlZCA9IHByZXY7XG4gICAgfVxuXG4gICAgdGhpcy5faW5zZXJ0QWZ0ZXIocmVjb3JkLCBwcmV2UmVjb3JkLCBpbmRleCk7XG4gICAgdGhpcy5fYWRkVG9Nb3ZlcyhyZWNvcmQsIGluZGV4KTtcbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbW92ZUFmdGVyKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCwgcHJldlJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCxcbiAgICAgICAgICAgICBpbmRleDogbnVtYmVyKTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgdGhpcy5fdW5saW5rKHJlY29yZCk7XG4gICAgdGhpcy5faW5zZXJ0QWZ0ZXIocmVjb3JkLCBwcmV2UmVjb3JkLCBpbmRleCk7XG4gICAgdGhpcy5fYWRkVG9Nb3ZlcyhyZWNvcmQsIGluZGV4KTtcbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkQWZ0ZXIocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLCBwcmV2UmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLFxuICAgICAgICAgICAgaW5kZXg6IG51bWJlcik6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIHRoaXMuX2luc2VydEFmdGVyKHJlY29yZCwgcHJldlJlY29yZCwgaW5kZXgpO1xuXG4gICAgaWYgKHRoaXMuX2FkZGl0aW9uc1RhaWwgPT09IG51bGwpIHtcbiAgICAgIC8vIHRvZG8odmljYilcbiAgICAgIC8vIGFzc2VydCh0aGlzLl9hZGRpdGlvbnNIZWFkID09PSBudWxsKTtcbiAgICAgIHRoaXMuX2FkZGl0aW9uc1RhaWwgPSB0aGlzLl9hZGRpdGlvbnNIZWFkID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0b2RvKHZpY2IpXG4gICAgICAvLyBhc3NlcnQoX2FkZGl0aW9uc1RhaWwuX25leHRBZGRlZCA9PT0gbnVsbCk7XG4gICAgICAvLyBhc3NlcnQocmVjb3JkLl9uZXh0QWRkZWQgPT09IG51bGwpO1xuICAgICAgdGhpcy5fYWRkaXRpb25zVGFpbCA9IHRoaXMuX2FkZGl0aW9uc1RhaWwuX25leHRBZGRlZCA9IHJlY29yZDtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2luc2VydEFmdGVyKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCwgcHJldlJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCxcbiAgICAgICAgICAgICAgIGluZGV4OiBudW1iZXIpOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIHtcbiAgICAvLyB0b2RvKHZpY2IpXG4gICAgLy8gYXNzZXJ0KHJlY29yZCAhPSBwcmV2UmVjb3JkKTtcbiAgICAvLyBhc3NlcnQocmVjb3JkLl9uZXh0ID09PSBudWxsKTtcbiAgICAvLyBhc3NlcnQocmVjb3JkLl9wcmV2ID09PSBudWxsKTtcblxuICAgIHZhciBuZXh0OiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gcHJldlJlY29yZCA9PT0gbnVsbCA/IHRoaXMuX2l0SGVhZCA6IHByZXZSZWNvcmQuX25leHQ7XG4gICAgLy8gdG9kbyh2aWNiKVxuICAgIC8vIGFzc2VydChuZXh0ICE9IHJlY29yZCk7XG4gICAgLy8gYXNzZXJ0KHByZXZSZWNvcmQgIT0gcmVjb3JkKTtcbiAgICByZWNvcmQuX25leHQgPSBuZXh0O1xuICAgIHJlY29yZC5fcHJldiA9IHByZXZSZWNvcmQ7XG4gICAgaWYgKG5leHQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2l0VGFpbCA9IHJlY29yZDtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dC5fcHJldiA9IHJlY29yZDtcbiAgICB9XG4gICAgaWYgKHByZXZSZWNvcmQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2l0SGVhZCA9IHJlY29yZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldlJlY29yZC5fbmV4dCA9IHJlY29yZDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGlua2VkUmVjb3JkcyA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fbGlua2VkUmVjb3JkcyA9IG5ldyBfRHVwbGljYXRlTWFwKCk7XG4gICAgfVxuICAgIHRoaXMuX2xpbmtlZFJlY29yZHMucHV0KHJlY29yZCk7XG5cbiAgICByZWNvcmQuY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlbW92ZShyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIHtcbiAgICByZXR1cm4gdGhpcy5fYWRkVG9SZW1vdmFscyh0aGlzLl91bmxpbmsocmVjb3JkKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91bmxpbmsocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgaWYgKHRoaXMuX2xpbmtlZFJlY29yZHMgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2xpbmtlZFJlY29yZHMucmVtb3ZlKHJlY29yZCk7XG4gICAgfVxuXG4gICAgdmFyIHByZXYgPSByZWNvcmQuX3ByZXY7XG4gICAgdmFyIG5leHQgPSByZWNvcmQuX25leHQ7XG5cbiAgICAvLyB0b2RvKHZpY2IpXG4gICAgLy8gYXNzZXJ0KChyZWNvcmQuX3ByZXYgPSBudWxsKSA9PT0gbnVsbCk7XG4gICAgLy8gYXNzZXJ0KChyZWNvcmQuX25leHQgPSBudWxsKSA9PT0gbnVsbCk7XG5cbiAgICBpZiAocHJldiA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faXRIZWFkID0gbmV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldi5fbmV4dCA9IG5leHQ7XG4gICAgfVxuICAgIGlmIChuZXh0ID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9pdFRhaWwgPSBwcmV2O1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0Ll9wcmV2ID0gcHJldjtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkVG9Nb3ZlcyhyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQsIHRvSW5kZXg6IG51bWJlcik6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIC8vIHRvZG8odmljYilcbiAgICAvLyBhc3NlcnQocmVjb3JkLl9uZXh0TW92ZWQgPT09IG51bGwpO1xuXG4gICAgaWYgKHJlY29yZC5wcmV2aW91c0luZGV4ID09PSB0b0luZGV4KSB7XG4gICAgICByZXR1cm4gcmVjb3JkO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9tb3Zlc1RhaWwgPT09IG51bGwpIHtcbiAgICAgIC8vIHRvZG8odmljYilcbiAgICAgIC8vIGFzc2VydChfbW92ZXNIZWFkID09PSBudWxsKTtcbiAgICAgIHRoaXMuX21vdmVzVGFpbCA9IHRoaXMuX21vdmVzSGVhZCA9IHJlY29yZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gdG9kbyh2aWNiKVxuICAgICAgLy8gYXNzZXJ0KF9tb3Zlc1RhaWwuX25leHRNb3ZlZCA9PT0gbnVsbCk7XG4gICAgICB0aGlzLl9tb3Zlc1RhaWwgPSB0aGlzLl9tb3Zlc1RhaWwuX25leHRNb3ZlZCA9IHJlY29yZDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkVG9SZW1vdmFscyhyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIHtcbiAgICBpZiAodGhpcy5fdW5saW5rZWRSZWNvcmRzID09PSBudWxsKSB7XG4gICAgICB0aGlzLl91bmxpbmtlZFJlY29yZHMgPSBuZXcgX0R1cGxpY2F0ZU1hcCgpO1xuICAgIH1cbiAgICB0aGlzLl91bmxpbmtlZFJlY29yZHMucHV0KHJlY29yZCk7XG4gICAgcmVjb3JkLmN1cnJlbnRJbmRleCA9IG51bGw7XG4gICAgcmVjb3JkLl9uZXh0UmVtb3ZlZCA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5fcmVtb3ZhbHNUYWlsID09PSBudWxsKSB7XG4gICAgICAvLyB0b2RvKHZpY2IpXG4gICAgICAvLyBhc3NlcnQoX3JlbW92YWxzSGVhZCA9PT0gbnVsbCk7XG4gICAgICB0aGlzLl9yZW1vdmFsc1RhaWwgPSB0aGlzLl9yZW1vdmFsc0hlYWQgPSByZWNvcmQ7XG4gICAgICByZWNvcmQuX3ByZXZSZW1vdmVkID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gdG9kbyh2aWNiKVxuICAgICAgLy8gYXNzZXJ0KF9yZW1vdmFsc1RhaWwuX25leHRSZW1vdmVkID09PSBudWxsKTtcbiAgICAgIC8vIGFzc2VydChyZWNvcmQuX25leHRSZW1vdmVkID09PSBudWxsKTtcbiAgICAgIHJlY29yZC5fcHJldlJlbW92ZWQgPSB0aGlzLl9yZW1vdmFsc1RhaWw7XG4gICAgICB0aGlzLl9yZW1vdmFsc1RhaWwgPSB0aGlzLl9yZW1vdmFsc1RhaWwuX25leHRSZW1vdmVkID0gcmVjb3JkO1xuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICB2YXIgcmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkO1xuXG4gICAgdmFyIGxpc3QgPSBbXTtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2l0SGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHQpIHtcbiAgICAgIGxpc3QucHVzaChyZWNvcmQpO1xuICAgIH1cblxuICAgIHZhciBwcmV2aW91cyA9IFtdO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5fcHJldmlvdXNJdEhlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0UHJldmlvdXMpIHtcbiAgICAgIHByZXZpb3VzLnB1c2gocmVjb3JkKTtcbiAgICB9XG5cbiAgICB2YXIgYWRkaXRpb25zID0gW107XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9hZGRpdGlvbnNIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dEFkZGVkKSB7XG4gICAgICBhZGRpdGlvbnMucHVzaChyZWNvcmQpO1xuICAgIH1cbiAgICB2YXIgbW92ZXMgPSBbXTtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX21vdmVzSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRNb3ZlZCkge1xuICAgICAgbW92ZXMucHVzaChyZWNvcmQpO1xuICAgIH1cblxuICAgIHZhciByZW1vdmFscyA9IFtdO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5fcmVtb3ZhbHNIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dFJlbW92ZWQpIHtcbiAgICAgIHJlbW92YWxzLnB1c2gocmVjb3JkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gXCJjb2xsZWN0aW9uOiBcIiArIGxpc3Quam9pbignLCAnKSArIFwiXFxuXCIgKyBcInByZXZpb3VzOiBcIiArIHByZXZpb3VzLmpvaW4oJywgJykgKyBcIlxcblwiICtcbiAgICAgICAgICAgXCJhZGRpdGlvbnM6IFwiICsgYWRkaXRpb25zLmpvaW4oJywgJykgKyBcIlxcblwiICsgXCJtb3ZlczogXCIgKyBtb3Zlcy5qb2luKCcsICcpICsgXCJcXG5cIiArXG4gICAgICAgICAgIFwicmVtb3ZhbHM6IFwiICsgcmVtb3ZhbHMuam9pbignLCAnKSArIFwiXFxuXCI7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICBjdXJyZW50SW5kZXg6IG51bWJlciA9IG51bGw7XG4gIHByZXZpb3VzSW5kZXg6IG51bWJlciA9IG51bGw7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmV4dFByZXZpb3VzOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcHJldjogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9wcmV2RHVwOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmV4dER1cDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ByZXZSZW1vdmVkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmV4dFJlbW92ZWQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0QWRkZWQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0TW92ZWQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpdGVtOiBhbnkpIHt9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcmV2aW91c0luZGV4ID09PSB0aGlzLmN1cnJlbnRJbmRleCA/XG4gICAgICAgICAgICAgICBzdHJpbmdpZnkodGhpcy5pdGVtKSA6XG4gICAgICAgICAgICAgICBzdHJpbmdpZnkodGhpcy5pdGVtKSArICdbJyArIHN0cmluZ2lmeSh0aGlzLnByZXZpb3VzSW5kZXgpICsgJy0+JyArXG4gICAgICAgICAgICAgICAgICAgc3RyaW5naWZ5KHRoaXMuY3VycmVudEluZGV4KSArICddJztcbiAgfVxufVxuXG4vLyBBIGxpbmtlZCBsaXN0IG9mIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmRzIHdpdGggdGhlIHNhbWUgQ29sbGVjdGlvbkNoYW5nZVJlY29yZC5pdGVtXG5jbGFzcyBfRHVwbGljYXRlSXRlbVJlY29yZExpc3Qge1xuICAvKiogQGludGVybmFsICovXG4gIF9oZWFkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdGFpbDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEFwcGVuZCB0aGUgcmVjb3JkIHRvIHRoZSBsaXN0IG9mIGR1cGxpY2F0ZXMuXG4gICAqXG4gICAqIE5vdGU6IGJ5IGRlc2lnbiBhbGwgcmVjb3JkcyBpbiB0aGUgbGlzdCBvZiBkdXBsaWNhdGVzIGhvbGQgdGhlIHNhbWUgdmFsdWUgaW4gcmVjb3JkLml0ZW0uXG4gICAqL1xuICBhZGQocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2hlYWQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2hlYWQgPSB0aGlzLl90YWlsID0gcmVjb3JkO1xuICAgICAgcmVjb3JkLl9uZXh0RHVwID0gbnVsbDtcbiAgICAgIHJlY29yZC5fcHJldkR1cCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHRvZG8odmljYilcbiAgICAgIC8vIGFzc2VydChyZWNvcmQuaXRlbSA9PSAgX2hlYWQuaXRlbSB8fFxuICAgICAgLy8gICAgICAgcmVjb3JkLml0ZW0gaXMgbnVtICYmIHJlY29yZC5pdGVtLmlzTmFOICYmIF9oZWFkLml0ZW0gaXMgbnVtICYmIF9oZWFkLml0ZW0uaXNOYU4pO1xuICAgICAgdGhpcy5fdGFpbC5fbmV4dER1cCA9IHJlY29yZDtcbiAgICAgIHJlY29yZC5fcHJldkR1cCA9IHRoaXMuX3RhaWw7XG4gICAgICByZWNvcmQuX25leHREdXAgPSBudWxsO1xuICAgICAgdGhpcy5fdGFpbCA9IHJlY29yZDtcbiAgICB9XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgQ29sbGVjdGlvbkNoYW5nZVJlY29yZCBoYXZpbmcgQ29sbGVjdGlvbkNoYW5nZVJlY29yZC5pdGVtID09IGl0ZW0gYW5kXG4gIC8vIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQuY3VycmVudEluZGV4ID49IGFmdGVySW5kZXhcbiAgZ2V0KGl0ZW06IGFueSwgYWZ0ZXJJbmRleDogbnVtYmVyKTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgdmFyIHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0RHVwKSB7XG4gICAgICBpZiAoKGFmdGVySW5kZXggPT09IG51bGwgfHwgYWZ0ZXJJbmRleCA8IHJlY29yZC5jdXJyZW50SW5kZXgpICYmXG4gICAgICAgICAgbG9vc2VJZGVudGljYWwocmVjb3JkLml0ZW0sIGl0ZW0pKSB7XG4gICAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBvbmUge0BsaW5rIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmR9IGZyb20gdGhlIGxpc3Qgb2YgZHVwbGljYXRlcy5cbiAgICpcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBsaXN0IG9mIGR1cGxpY2F0ZXMgaXMgZW1wdHkuXG4gICAqL1xuICByZW1vdmUocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKTogYm9vbGVhbiB7XG4gICAgLy8gdG9kbyh2aWNiKVxuICAgIC8vIGFzc2VydCgoKSB7XG4gICAgLy8gIC8vIHZlcmlmeSB0aGF0IHRoZSByZWNvcmQgYmVpbmcgcmVtb3ZlZCBpcyBpbiB0aGUgbGlzdC5cbiAgICAvLyAgZm9yIChDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIGN1cnNvciA9IF9oZWFkOyBjdXJzb3IgIT0gbnVsbDsgY3Vyc29yID0gY3Vyc29yLl9uZXh0RHVwKSB7XG4gICAgLy8gICAgaWYgKGlkZW50aWNhbChjdXJzb3IsIHJlY29yZCkpIHJldHVybiB0cnVlO1xuICAgIC8vICB9XG4gICAgLy8gIHJldHVybiBmYWxzZTtcbiAgICAvL30pO1xuXG4gICAgdmFyIHByZXY6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSByZWNvcmQuX3ByZXZEdXA7XG4gICAgdmFyIG5leHQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSByZWNvcmQuX25leHREdXA7XG4gICAgaWYgKHByZXYgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2hlYWQgPSBuZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2Ll9uZXh0RHVwID0gbmV4dDtcbiAgICB9XG4gICAgaWYgKG5leHQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3RhaWwgPSBwcmV2O1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0Ll9wcmV2RHVwID0gcHJldjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2hlYWQgPT09IG51bGw7XG4gIH1cbn1cblxuY2xhc3MgX0R1cGxpY2F0ZU1hcCB7XG4gIG1hcCA9IG5ldyBNYXA8YW55LCBfRHVwbGljYXRlSXRlbVJlY29yZExpc3Q+KCk7XG5cbiAgcHV0KHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCkge1xuICAgIC8vIHRvZG8odmljYikgaGFuZGxlIGNvcm5lciBjYXNlc1xuICAgIHZhciBrZXkgPSBnZXRNYXBLZXkocmVjb3JkLml0ZW0pO1xuXG4gICAgdmFyIGR1cGxpY2F0ZXMgPSB0aGlzLm1hcC5nZXQoa2V5KTtcbiAgICBpZiAoIWlzUHJlc2VudChkdXBsaWNhdGVzKSkge1xuICAgICAgZHVwbGljYXRlcyA9IG5ldyBfRHVwbGljYXRlSXRlbVJlY29yZExpc3QoKTtcbiAgICAgIHRoaXMubWFwLnNldChrZXksIGR1cGxpY2F0ZXMpO1xuICAgIH1cbiAgICBkdXBsaWNhdGVzLmFkZChyZWNvcmQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBgdmFsdWVgIHVzaW5nIGtleS4gQmVjYXVzZSB0aGUgQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB2YWx1ZSBtYXliZSBvbmUgd2hpY2ggd2VcbiAgICogaGF2ZSBhbHJlYWR5IGl0ZXJhdGVkIG92ZXIsIHdlIHVzZSB0aGUgYWZ0ZXJJbmRleCB0byBwcmV0ZW5kIGl0IGlzIG5vdCB0aGVyZS5cbiAgICpcbiAgICogVXNlIGNhc2U6IGBbYSwgYiwgYywgYSwgYV1gIGlmIHdlIGFyZSBhdCBpbmRleCBgM2Agd2hpY2ggaXMgdGhlIHNlY29uZCBgYWAgdGhlbiBhc2tpbmcgaWYgd2VcbiAgICogaGF2ZSBhbnkgbW9yZSBgYWBzIG5lZWRzIHRvIHJldHVybiB0aGUgbGFzdCBgYWAgbm90IHRoZSBmaXJzdCBvciBzZWNvbmQuXG4gICAqL1xuICBnZXQodmFsdWU6IGFueSwgYWZ0ZXJJbmRleDogbnVtYmVyID0gbnVsbCk6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIHZhciBrZXkgPSBnZXRNYXBLZXkodmFsdWUpO1xuXG4gICAgdmFyIHJlY29yZExpc3QgPSB0aGlzLm1hcC5nZXQoa2V5KTtcbiAgICByZXR1cm4gaXNCbGFuayhyZWNvcmRMaXN0KSA/IG51bGwgOiByZWNvcmRMaXN0LmdldCh2YWx1ZSwgYWZ0ZXJJbmRleCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIHtAbGluayBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkfSBmcm9tIHRoZSBsaXN0IG9mIGR1cGxpY2F0ZXMuXG4gICAqXG4gICAqIFRoZSBsaXN0IG9mIGR1cGxpY2F0ZXMgYWxzbyBpcyByZW1vdmVkIGZyb20gdGhlIG1hcCBpZiBpdCBnZXRzIGVtcHR5LlxuICAgKi9cbiAgcmVtb3ZlKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCk6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIHZhciBrZXkgPSBnZXRNYXBLZXkocmVjb3JkLml0ZW0pO1xuICAgIC8vIHRvZG8odmljYilcbiAgICAvLyBhc3NlcnQodGhpcy5tYXAuY29udGFpbnNLZXkoa2V5KSk7XG4gICAgdmFyIHJlY29yZExpc3Q6IF9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdCA9IHRoaXMubWFwLmdldChrZXkpO1xuICAgIC8vIFJlbW92ZSB0aGUgbGlzdCBvZiBkdXBsaWNhdGVzIHdoZW4gaXQgZ2V0cyBlbXB0eVxuICAgIGlmIChyZWNvcmRMaXN0LnJlbW92ZShyZWNvcmQpKSB7XG4gICAgICB0aGlzLm1hcC5kZWxldGUoa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxuXG4gIGdldCBpc0VtcHR5KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5tYXAuc2l6ZSA9PT0gMDsgfVxuXG4gIGNsZWFyKCkgeyB0aGlzLm1hcC5jbGVhcigpOyB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuICdfRHVwbGljYXRlTWFwKCcgKyBzdHJpbmdpZnkodGhpcy5tYXApICsgJyknOyB9XG59XG4iXX0=