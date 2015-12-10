'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var lang_2 = require('angular2/src/facade/lang');
var DefaultIterableDifferFactory = (function () {
    function DefaultIterableDifferFactory() {
    }
    DefaultIterableDifferFactory.prototype.supports = function (obj) { return collection_1.isListLikeIterable(obj); };
    DefaultIterableDifferFactory.prototype.create = function (cdRef) { return new DefaultIterableDiffer(); };
    DefaultIterableDifferFactory = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], DefaultIterableDifferFactory);
    return DefaultIterableDifferFactory;
})();
exports.DefaultIterableDifferFactory = DefaultIterableDifferFactory;
var DefaultIterableDiffer = (function () {
    function DefaultIterableDiffer() {
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
    Object.defineProperty(DefaultIterableDiffer.prototype, "collection", {
        get: function () { return this._collection; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefaultIterableDiffer.prototype, "length", {
        get: function () { return this._length; },
        enumerable: true,
        configurable: true
    });
    DefaultIterableDiffer.prototype.forEachItem = function (fn) {
        var record;
        for (record = this._itHead; record !== null; record = record._next) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachPreviousItem = function (fn) {
        var record;
        for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachAddedItem = function (fn) {
        var record;
        for (record = this._additionsHead; record !== null; record = record._nextAdded) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachMovedItem = function (fn) {
        var record;
        for (record = this._movesHead; record !== null; record = record._nextMoved) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachRemovedItem = function (fn) {
        var record;
        for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.diff = function (collection) {
        if (lang_2.isBlank(collection))
            collection = [];
        if (!collection_1.isListLikeIterable(collection)) {
            throw new exceptions_1.BaseException("Error trying to diff '" + collection + "'");
        }
        if (this.check(collection)) {
            return this;
        }
        else {
            return null;
        }
    };
    DefaultIterableDiffer.prototype.onDestroy = function () { };
    // todo(vicb): optim for UnmodifiableListView (frozen arrays)
    DefaultIterableDiffer.prototype.check = function (collection) {
        var _this = this;
        this._reset();
        var record = this._itHead;
        var mayBeDirty = false;
        var index;
        var item;
        if (lang_2.isArray(collection)) {
            var list = collection;
            this._length = collection.length;
            for (index = 0; index < this._length; index++) {
                item = list[index];
                if (record === null || !lang_2.looseIdentical(record.item, item)) {
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
            collection_1.iterateListLike(collection, function (item) {
                if (record === null || !lang_2.looseIdentical(record.item, item)) {
                    record = _this._mismatch(record, item, index);
                    mayBeDirty = true;
                }
                else if (mayBeDirty) {
                    // TODO(misko): can we limit this to duplicates only?
                    record = _this._verifyReinsertion(record, item, index);
                }
                record = record._next;
                index++;
            });
            this._length = index;
        }
        this._truncate(record);
        this._collection = collection;
        return this.isDirty;
    };
    Object.defineProperty(DefaultIterableDiffer.prototype, "isDirty", {
        // CollectionChanges is considered dirty if it has any additions, moves or removals.
        get: function () {
            return this._additionsHead !== null || this._movesHead !== null || this._removalsHead !== null;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Reset the state of the change objects to show no changes. This means set previousKey to
     * currentKey, and clear all of the queues (additions, moves, removals).
     * Set the previousIndexes of moved and added items to their currentIndexes
     * Reset the list of additions, moves and removals
     *
     * @internal
     */
    DefaultIterableDiffer.prototype._reset = function () {
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
    };
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
    DefaultIterableDiffer.prototype._mismatch = function (record, item, index) {
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
    };
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
    DefaultIterableDiffer.prototype._verifyReinsertion = function (record, item, index) {
        var reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(item);
        if (reinsertRecord !== null) {
            record = this._reinsertAfter(reinsertRecord, record._prev, index);
        }
        else if (record.currentIndex != index) {
            record.currentIndex = index;
            this._addToMoves(record, index);
        }
        return record;
    };
    /**
     * Get rid of any excess {@link CollectionChangeRecord}s from the previous collection
     *
     * - `record` The first excess {@link CollectionChangeRecord}.
     *
     * @internal
     */
    DefaultIterableDiffer.prototype._truncate = function (record) {
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
    };
    /** @internal */
    DefaultIterableDiffer.prototype._reinsertAfter = function (record, prevRecord, index) {
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
    };
    /** @internal */
    DefaultIterableDiffer.prototype._moveAfter = function (record, prevRecord, index) {
        this._unlink(record);
        this._insertAfter(record, prevRecord, index);
        this._addToMoves(record, index);
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._addAfter = function (record, prevRecord, index) {
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
    };
    /** @internal */
    DefaultIterableDiffer.prototype._insertAfter = function (record, prevRecord, index) {
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
    };
    /** @internal */
    DefaultIterableDiffer.prototype._remove = function (record) {
        return this._addToRemovals(this._unlink(record));
    };
    /** @internal */
    DefaultIterableDiffer.prototype._unlink = function (record) {
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
    };
    /** @internal */
    DefaultIterableDiffer.prototype._addToMoves = function (record, toIndex) {
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
    };
    /** @internal */
    DefaultIterableDiffer.prototype._addToRemovals = function (record) {
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
    };
    DefaultIterableDiffer.prototype.toString = function () {
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
    };
    return DefaultIterableDiffer;
})();
exports.DefaultIterableDiffer = DefaultIterableDiffer;
var CollectionChangeRecord = (function () {
    function CollectionChangeRecord(item) {
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
    CollectionChangeRecord.prototype.toString = function () {
        return this.previousIndex === this.currentIndex ?
            lang_2.stringify(this.item) :
            lang_2.stringify(this.item) + '[' + lang_2.stringify(this.previousIndex) + '->' +
                lang_2.stringify(this.currentIndex) + ']';
    };
    return CollectionChangeRecord;
})();
exports.CollectionChangeRecord = CollectionChangeRecord;
// A linked list of CollectionChangeRecords with the same CollectionChangeRecord.item
var _DuplicateItemRecordList = (function () {
    function _DuplicateItemRecordList() {
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
    _DuplicateItemRecordList.prototype.add = function (record) {
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
    };
    // Returns a CollectionChangeRecord having CollectionChangeRecord.item == item and
    // CollectionChangeRecord.currentIndex >= afterIndex
    _DuplicateItemRecordList.prototype.get = function (item, afterIndex) {
        var record;
        for (record = this._head; record !== null; record = record._nextDup) {
            if ((afterIndex === null || afterIndex < record.currentIndex) &&
                lang_2.looseIdentical(record.item, item)) {
                return record;
            }
        }
        return null;
    };
    /**
     * Remove one {@link CollectionChangeRecord} from the list of duplicates.
     *
     * Returns whether the list of duplicates is empty.
     */
    _DuplicateItemRecordList.prototype.remove = function (record) {
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
    };
    return _DuplicateItemRecordList;
})();
var _DuplicateMap = (function () {
    function _DuplicateMap() {
        this.map = new Map();
    }
    _DuplicateMap.prototype.put = function (record) {
        // todo(vicb) handle corner cases
        var key = lang_2.getMapKey(record.item);
        var duplicates = this.map.get(key);
        if (!lang_2.isPresent(duplicates)) {
            duplicates = new _DuplicateItemRecordList();
            this.map.set(key, duplicates);
        }
        duplicates.add(record);
    };
    /**
     * Retrieve the `value` using key. Because the CollectionChangeRecord value maybe one which we
     * have already iterated over, we use the afterIndex to pretend it is not there.
     *
     * Use case: `[a, b, c, a, a]` if we are at index `3` which is the second `a` then asking if we
     * have any more `a`s needs to return the last `a` not the first or second.
     */
    _DuplicateMap.prototype.get = function (value, afterIndex) {
        if (afterIndex === void 0) { afterIndex = null; }
        var key = lang_2.getMapKey(value);
        var recordList = this.map.get(key);
        return lang_2.isBlank(recordList) ? null : recordList.get(value, afterIndex);
    };
    /**
     * Removes a {@link CollectionChangeRecord} from the list of duplicates.
     *
     * The list of duplicates also is removed from the map if it gets empty.
     */
    _DuplicateMap.prototype.remove = function (record) {
        var key = lang_2.getMapKey(record.item);
        // todo(vicb)
        // assert(this.map.containsKey(key));
        var recordList = this.map.get(key);
        // Remove the list of duplicates when it gets empty
        if (recordList.remove(record)) {
            this.map.delete(key);
        }
        return record;
    };
    Object.defineProperty(_DuplicateMap.prototype, "isEmpty", {
        get: function () { return this.map.size === 0; },
        enumerable: true,
        configurable: true
    });
    _DuplicateMap.prototype.clear = function () { this.map.clear(); };
    _DuplicateMap.prototype.toString = function () { return '_DuplicateMap(' + lang_2.stringify(this.map) + ')'; };
    return _DuplicateMap;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2RpZmZlcnMvZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXIudHMiXSwibmFtZXMiOlsiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlckZhY3RvcnkuY29uc3RydWN0b3IiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXJGYWN0b3J5LnN1cHBvcnRzIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyRmFjdG9yeS5jcmVhdGUiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuY29uc3RydWN0b3IiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuY29sbGVjdGlvbiIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5sZW5ndGgiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuZm9yRWFjaEl0ZW0iLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuZm9yRWFjaFByZXZpb3VzSXRlbSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5mb3JFYWNoQWRkZWRJdGVtIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLmZvckVhY2hNb3ZlZEl0ZW0iLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuZm9yRWFjaFJlbW92ZWRJdGVtIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLmRpZmYiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIub25EZXN0cm95IiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLmNoZWNrIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLmlzRGlydHkiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuX3Jlc2V0IiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl9taXNtYXRjaCIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5fdmVyaWZ5UmVpbnNlcnRpb24iLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuX3RydW5jYXRlIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl9yZWluc2VydEFmdGVyIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl9tb3ZlQWZ0ZXIiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuX2FkZEFmdGVyIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl9pbnNlcnRBZnRlciIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5fcmVtb3ZlIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl91bmxpbmsiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuX2FkZFRvTW92ZXMiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuX2FkZFRvUmVtb3ZhbHMiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIudG9TdHJpbmciLCJDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIiwiQ29sbGVjdGlvbkNoYW5nZVJlY29yZC5jb25zdHJ1Y3RvciIsIkNvbGxlY3Rpb25DaGFuZ2VSZWNvcmQudG9TdHJpbmciLCJfRHVwbGljYXRlSXRlbVJlY29yZExpc3QiLCJfRHVwbGljYXRlSXRlbVJlY29yZExpc3QuY29uc3RydWN0b3IiLCJfRHVwbGljYXRlSXRlbVJlY29yZExpc3QuYWRkIiwiX0R1cGxpY2F0ZUl0ZW1SZWNvcmRMaXN0LmdldCIsIl9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdC5yZW1vdmUiLCJfRHVwbGljYXRlTWFwIiwiX0R1cGxpY2F0ZU1hcC5jb25zdHJ1Y3RvciIsIl9EdXBsaWNhdGVNYXAucHV0IiwiX0R1cGxpY2F0ZU1hcC5nZXQiLCJfRHVwbGljYXRlTWFwLnJlbW92ZSIsIl9EdXBsaWNhdGVNYXAuaXNFbXB0eSIsIl9EdXBsaWNhdGVNYXAuY2xlYXIiLCJfRHVwbGljYXRlTWFwLnRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFCQUFvQiwwQkFBMEIsQ0FBQyxDQUFBO0FBQy9DLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELDJCQUtPLGdDQUFnQyxDQUFDLENBQUE7QUFFeEMscUJBT08sMEJBQTBCLENBQUMsQ0FBQTtBQUtsQztJQUFBQTtJQUlBQyxDQUFDQTtJQUZDRCwrQ0FBUUEsR0FBUkEsVUFBU0EsR0FBV0EsSUFBYUUsTUFBTUEsQ0FBQ0EsK0JBQWtCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNsRUYsNkNBQU1BLEdBQU5BLFVBQU9BLEtBQXdCQSxJQUFTRyxNQUFNQSxDQUFDQSxJQUFJQSxxQkFBcUJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBSC9FSDtRQUFDQSxZQUFLQSxFQUFFQTs7cUNBSVBBO0lBQURBLG1DQUFDQTtBQUFEQSxDQUFDQSxBQUpELElBSUM7QUFIWSxvQ0FBNEIsK0JBR3hDLENBQUE7QUFFRDtJQUFBSTtRQUNVQyxnQkFBV0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLFlBQU9BLEdBQVdBLElBQUlBLENBQUNBO1FBQy9CQSwwRkFBMEZBO1FBQ2xGQSxtQkFBY0EsR0FBa0JBLElBQUlBLENBQUNBO1FBQzdDQSxtRkFBbUZBO1FBQzNFQSxxQkFBZ0JBLEdBQWtCQSxJQUFJQSxDQUFDQTtRQUN2Q0Esb0JBQWVBLEdBQTJCQSxJQUFJQSxDQUFDQTtRQUMvQ0EsWUFBT0EsR0FBMkJBLElBQUlBLENBQUNBO1FBQ3ZDQSxZQUFPQSxHQUEyQkEsSUFBSUEsQ0FBQ0E7UUFDdkNBLG1CQUFjQSxHQUEyQkEsSUFBSUEsQ0FBQ0E7UUFDOUNBLG1CQUFjQSxHQUEyQkEsSUFBSUEsQ0FBQ0E7UUFDOUNBLGVBQVVBLEdBQTJCQSxJQUFJQSxDQUFDQTtRQUMxQ0EsZUFBVUEsR0FBMkJBLElBQUlBLENBQUNBO1FBQzFDQSxrQkFBYUEsR0FBMkJBLElBQUlBLENBQUNBO1FBQzdDQSxrQkFBYUEsR0FBMkJBLElBQUlBLENBQUNBO0lBK2J2REEsQ0FBQ0E7SUE3YkNELHNCQUFJQSw2Q0FBVUE7YUFBZEEsY0FBbUJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7SUFFN0NBLHNCQUFJQSx5Q0FBTUE7YUFBVkEsY0FBdUJHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUg7SUFFN0NBLDJDQUFXQSxHQUFYQSxVQUFZQSxFQUFZQTtRQUN0QkksSUFBSUEsTUFBOEJBLENBQUNBO1FBQ25DQSxHQUFHQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxNQUFNQSxLQUFLQSxJQUFJQSxFQUFFQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtZQUNuRUEsRUFBRUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDYkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREosbURBQW1CQSxHQUFuQkEsVUFBb0JBLEVBQVlBO1FBQzlCSyxJQUFJQSxNQUE4QkEsQ0FBQ0E7UUFDbkNBLEdBQUdBLENBQUNBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLGVBQWVBLEVBQUVBLE1BQU1BLEtBQUtBLElBQUlBLEVBQUVBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLGFBQWFBLEVBQUVBLENBQUNBO1lBQ25GQSxFQUFFQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNiQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVETCxnREFBZ0JBLEdBQWhCQSxVQUFpQkEsRUFBWUE7UUFDM0JNLElBQUlBLE1BQThCQSxDQUFDQTtRQUNuQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsRUFBRUEsTUFBTUEsS0FBS0EsSUFBSUEsRUFBRUEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7WUFDL0VBLEVBQUVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQ2JBLENBQUNBO0lBQ0hBLENBQUNBO0lBRUROLGdEQUFnQkEsR0FBaEJBLFVBQWlCQSxFQUFZQTtRQUMzQk8sSUFBSUEsTUFBOEJBLENBQUNBO1FBQ25DQSxHQUFHQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxNQUFNQSxLQUFLQSxJQUFJQSxFQUFFQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtZQUMzRUEsRUFBRUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDYkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRFAsa0RBQWtCQSxHQUFsQkEsVUFBbUJBLEVBQVlBO1FBQzdCUSxJQUFJQSxNQUE4QkEsQ0FBQ0E7UUFDbkNBLEdBQUdBLENBQUNBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLEVBQUVBLE1BQU1BLEtBQUtBLElBQUlBLEVBQUVBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBO1lBQ2hGQSxFQUFFQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNiQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEUixvQ0FBSUEsR0FBSkEsVUFBS0EsVUFBZUE7UUFDbEJTLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1lBQUNBLFVBQVVBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ3pDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSwrQkFBa0JBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BDQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0EsMkJBQXlCQSxVQUFVQSxNQUFHQSxDQUFDQSxDQUFDQTtRQUNsRUEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURULHlDQUFTQSxHQUFUQSxjQUFhVSxDQUFDQTtJQUVkViw2REFBNkRBO0lBQzdEQSxxQ0FBS0EsR0FBTEEsVUFBTUEsVUFBZUE7UUFBckJXLGlCQTBDQ0E7UUF6Q0NBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBRWRBLElBQUlBLE1BQU1BLEdBQTJCQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUNsREEsSUFBSUEsVUFBVUEsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFDaENBLElBQUlBLEtBQWFBLENBQUNBO1FBQ2xCQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUVUQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsSUFBSUEsSUFBSUEsR0FBR0EsVUFBVUEsQ0FBQ0E7WUFDdEJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBO1lBRWpDQSxHQUFHQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxFQUFFQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxLQUFLQSxFQUFFQSxFQUFFQSxDQUFDQTtnQkFDOUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNuQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBS0EsSUFBSUEsSUFBSUEsQ0FBQ0EscUJBQWNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUMxREEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7b0JBQzdDQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQTtnQkFDcEJBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDdEJBLHFEQUFxREE7b0JBQ3JEQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO2dCQUN4REEsQ0FBQ0E7Z0JBQ0RBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1lBQ3hCQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNWQSw0QkFBZUEsQ0FBQ0EsVUFBVUEsRUFBRUEsVUFBQ0EsSUFBSUE7Z0JBQy9CQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQSxxQkFBY0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzFEQSxNQUFNQSxHQUFHQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtvQkFDN0NBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBO2dCQUNwQkEsQ0FBQ0E7Z0JBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO29CQUN0QkEscURBQXFEQTtvQkFDckRBLE1BQU1BLEdBQUdBLEtBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hEQSxDQUFDQTtnQkFDREEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7Z0JBQ3RCQSxLQUFLQSxFQUFFQSxDQUFDQTtZQUNWQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNIQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFFREEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDdkJBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLFVBQVVBLENBQUNBO1FBQzlCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQTtJQUN0QkEsQ0FBQ0E7SUFHRFgsc0JBQUlBLDBDQUFPQTtRQURYQSxvRkFBb0ZBO2FBQ3BGQTtZQUNFWSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxLQUFLQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQSxVQUFVQSxLQUFLQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQSxhQUFhQSxLQUFLQSxJQUFJQSxDQUFDQTtRQUNqR0EsQ0FBQ0E7OztPQUFBWjtJQUVEQTs7Ozs7OztPQU9HQTtJQUNIQSxzQ0FBTUEsR0FBTkE7UUFDRWEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakJBLElBQUlBLE1BQThCQSxDQUFDQTtZQUNuQ0EsSUFBSUEsVUFBa0NBLENBQUNBO1lBRXZDQSxHQUFHQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxlQUFlQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxNQUFNQSxLQUFLQSxJQUFJQSxFQUFFQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtnQkFDMUZBLE1BQU1BLENBQUNBLGFBQWFBLEdBQUdBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1lBQ3RDQSxDQUFDQTtZQUVEQSxHQUFHQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxFQUFFQSxNQUFNQSxLQUFLQSxJQUFJQSxFQUFFQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtnQkFDL0VBLE1BQU1BLENBQUNBLGFBQWFBLEdBQUdBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBO1lBQzdDQSxDQUFDQTtZQUNEQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUVqREEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsTUFBTUEsS0FBS0EsSUFBSUEsRUFBRUEsTUFBTUEsR0FBR0EsVUFBVUEsRUFBRUEsQ0FBQ0E7Z0JBQ3BFQSxNQUFNQSxDQUFDQSxhQUFhQSxHQUFHQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQTtnQkFDM0NBLFVBQVVBLEdBQUdBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1lBQ2pDQSxDQUFDQTtZQUNEQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUN6Q0EsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFJakRBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURiOzs7Ozs7Ozs7T0FTR0E7SUFDSEEseUNBQVNBLEdBQVRBLFVBQVVBLE1BQThCQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFhQTtRQUMzRGMsa0VBQWtFQTtRQUNsRUEsSUFBSUEsY0FBc0NBLENBQUNBO1FBRTNDQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFDaENBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLGNBQWNBLEdBQUdBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1lBQzlCQSxrRkFBa0ZBO1lBQ2xGQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFFREEsa0RBQWtEQTtRQUNsREEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsS0FBS0EsSUFBSUEsR0FBR0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDcEZBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSwwRUFBMEVBO1lBQzFFQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxNQUFNQSxFQUFFQSxjQUFjQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNqREEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEscUNBQXFDQTtZQUNyQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxLQUFLQSxJQUFJQSxHQUFHQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ2pGQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDcEJBLCtFQUErRUE7Z0JBQy9FQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxFQUFFQSxjQUFjQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNyREEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ05BLDRCQUE0QkE7Z0JBQzVCQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxzQkFBc0JBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLGNBQWNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBQ25GQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFFRGQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BMEJHQTtJQUNIQSxrREFBa0JBLEdBQWxCQSxVQUFtQkEsTUFBOEJBLEVBQUVBLElBQUlBLEVBQUVBLEtBQWFBO1FBQ3BFZSxJQUFJQSxjQUFjQSxHQUNkQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEtBQUtBLElBQUlBLEdBQUdBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDNUVBLEVBQUVBLENBQUNBLENBQUNBLGNBQWNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxjQUFjQSxFQUFFQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNwRUEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsWUFBWUEsSUFBSUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeENBLE1BQU1BLENBQUNBLFlBQVlBLEdBQUdBLEtBQUtBLENBQUNBO1lBQzVCQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxNQUFNQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNsQ0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0lBRURmOzs7Ozs7T0FNR0E7SUFDSEEseUNBQVNBLEdBQVRBLFVBQVVBLE1BQThCQTtRQUN0Q2dCLDJDQUEyQ0E7UUFDM0NBLE9BQU9BLE1BQU1BLEtBQUtBLElBQUlBLEVBQUVBLENBQUNBO1lBQ3ZCQSxJQUFJQSxVQUFVQSxHQUEyQkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDdERBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQzFDQSxNQUFNQSxHQUFHQSxVQUFVQSxDQUFDQTtRQUN0QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtRQUNoQ0EsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3hDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3QkEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDcENBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUM1QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3pDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEaEIsZ0JBQWdCQTtJQUNoQkEsOENBQWNBLEdBQWRBLFVBQWVBLE1BQThCQSxFQUFFQSxVQUFrQ0EsRUFDbEVBLEtBQWFBO1FBQzFCaUIsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsSUFBSUEsSUFBSUEsR0FBR0EsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7UUFDL0JBLElBQUlBLElBQUlBLEdBQUdBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBO1FBRS9CQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDNUJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBO1FBQzNCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDNUJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBO1FBQzNCQSxDQUFDQTtRQUVEQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxVQUFVQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUM3Q0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsTUFBTUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDaENBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUVEakIsZ0JBQWdCQTtJQUNoQkEsMENBQVVBLEdBQVZBLFVBQVdBLE1BQThCQSxFQUFFQSxVQUFrQ0EsRUFDbEVBLEtBQWFBO1FBQ3RCa0IsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDckJBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLFVBQVVBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQzdDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxNQUFNQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNoQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0lBRURsQixnQkFBZ0JBO0lBQ2hCQSx5Q0FBU0EsR0FBVEEsVUFBVUEsTUFBOEJBLEVBQUVBLFVBQWtDQSxFQUNsRUEsS0FBYUE7UUFDckJtQixJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxVQUFVQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUU3Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLGFBQWFBO1lBQ2JBLHdDQUF3Q0E7WUFDeENBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3JEQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxhQUFhQTtZQUNiQSw4Q0FBOENBO1lBQzlDQSxzQ0FBc0NBO1lBQ3RDQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxVQUFVQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUNoRUEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0lBRURuQixnQkFBZ0JBO0lBQ2hCQSw0Q0FBWUEsR0FBWkEsVUFBYUEsTUFBOEJBLEVBQUVBLFVBQWtDQSxFQUNsRUEsS0FBYUE7UUFDeEJvQixhQUFhQTtRQUNiQSxnQ0FBZ0NBO1FBQ2hDQSxpQ0FBaUNBO1FBQ2pDQSxpQ0FBaUNBO1FBRWpDQSxJQUFJQSxJQUFJQSxHQUEyQkEsVUFBVUEsS0FBS0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDekZBLGFBQWFBO1FBQ2JBLDBCQUEwQkE7UUFDMUJBLGdDQUFnQ0E7UUFDaENBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3BCQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxVQUFVQSxDQUFDQTtRQUMxQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3hCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUN0QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3hCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxVQUFVQSxDQUFDQSxLQUFLQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUM1QkEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLGFBQWFBLEVBQUVBLENBQUNBO1FBQzVDQSxDQUFDQTtRQUNEQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUVoQ0EsTUFBTUEsQ0FBQ0EsWUFBWUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDNUJBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUVEcEIsZ0JBQWdCQTtJQUNoQkEsdUNBQU9BLEdBQVBBLFVBQVFBLE1BQThCQTtRQUNwQ3FCLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO0lBQ25EQSxDQUFDQTtJQUVEckIsZ0JBQWdCQTtJQUNoQkEsdUNBQU9BLEdBQVBBLFVBQVFBLE1BQThCQTtRQUNwQ3NCLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNyQ0EsQ0FBQ0E7UUFFREEsSUFBSUEsSUFBSUEsR0FBR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDeEJBLElBQUlBLElBQUlBLEdBQUdBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBRXhCQSxhQUFhQTtRQUNiQSwwQ0FBMENBO1FBQzFDQSwwQ0FBMENBO1FBRTFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFFRHRCLGdCQUFnQkE7SUFDaEJBLDJDQUFXQSxHQUFYQSxVQUFZQSxNQUE4QkEsRUFBRUEsT0FBZUE7UUFDekR1QixhQUFhQTtRQUNiQSxzQ0FBc0NBO1FBRXRDQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxLQUFLQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDaEJBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQzdCQSxhQUFhQTtZQUNiQSwrQkFBK0JBO1lBQy9CQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUM3Q0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsYUFBYUE7WUFDYkEsMENBQTBDQTtZQUMxQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsVUFBVUEsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDeERBLENBQUNBO1FBRURBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUVEdkIsZ0JBQWdCQTtJQUNoQkEsOENBQWNBLEdBQWRBLFVBQWVBLE1BQThCQTtRQUMzQ3dCLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkNBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsSUFBSUEsYUFBYUEsRUFBRUEsQ0FBQ0E7UUFDOUNBLENBQUNBO1FBQ0RBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDbENBLE1BQU1BLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBO1FBQzNCQSxNQUFNQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUUzQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaENBLGFBQWFBO1lBQ2JBLGtDQUFrQ0E7WUFDbENBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLE1BQU1BLENBQUNBO1lBQ2pEQSxNQUFNQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUM3QkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsYUFBYUE7WUFDYkEsK0NBQStDQTtZQUMvQ0Esd0NBQXdDQTtZQUN4Q0EsTUFBTUEsQ0FBQ0EsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7WUFDekNBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLFlBQVlBLEdBQUdBLE1BQU1BLENBQUNBO1FBQ2hFQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFFRHhCLHdDQUFRQSxHQUFSQTtRQUNFeUIsSUFBSUEsTUFBOEJBLENBQUNBO1FBRW5DQSxJQUFJQSxJQUFJQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNkQSxHQUFHQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxNQUFNQSxLQUFLQSxJQUFJQSxFQUFFQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtZQUNuRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBRURBLElBQUlBLFFBQVFBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2xCQSxHQUFHQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxlQUFlQSxFQUFFQSxNQUFNQSxLQUFLQSxJQUFJQSxFQUFFQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQTtZQUNuRkEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDeEJBLENBQUNBO1FBRURBLElBQUlBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ25CQSxHQUFHQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxFQUFFQSxNQUFNQSxLQUFLQSxJQUFJQSxFQUFFQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtZQUMvRUEsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDekJBLENBQUNBO1FBQ0RBLElBQUlBLEtBQUtBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2ZBLEdBQUdBLENBQUNBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLE1BQU1BLEtBQUtBLElBQUlBLEVBQUVBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO1lBQzNFQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7UUFFREEsSUFBSUEsUUFBUUEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDbEJBLEdBQUdBLENBQUNBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLEVBQUVBLE1BQU1BLEtBQUtBLElBQUlBLEVBQUVBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBO1lBQ2hGQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsR0FBR0EsWUFBWUEsR0FBR0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUE7WUFDbkZBLGFBQWFBLEdBQUdBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLEdBQUdBLFNBQVNBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBO1lBQ2pGQSxZQUFZQSxHQUFHQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUNuREEsQ0FBQ0E7SUFDSHpCLDRCQUFDQTtBQUFEQSxDQUFDQSxBQTljRCxJQThjQztBQTljWSw2QkFBcUIsd0JBOGNqQyxDQUFBO0FBRUQ7SUF1QkUwQixnQ0FBbUJBLElBQVNBO1FBQVRDLFNBQUlBLEdBQUpBLElBQUlBLENBQUtBO1FBdEI1QkEsaUJBQVlBLEdBQVdBLElBQUlBLENBQUNBO1FBQzVCQSxrQkFBYUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFFN0JBLGdCQUFnQkE7UUFDaEJBLGtCQUFhQSxHQUEyQkEsSUFBSUEsQ0FBQ0E7UUFDN0NBLGdCQUFnQkE7UUFDaEJBLFVBQUtBLEdBQTJCQSxJQUFJQSxDQUFDQTtRQUNyQ0EsZ0JBQWdCQTtRQUNoQkEsVUFBS0EsR0FBMkJBLElBQUlBLENBQUNBO1FBQ3JDQSxnQkFBZ0JBO1FBQ2hCQSxhQUFRQSxHQUEyQkEsSUFBSUEsQ0FBQ0E7UUFDeENBLGdCQUFnQkE7UUFDaEJBLGFBQVFBLEdBQTJCQSxJQUFJQSxDQUFDQTtRQUN4Q0EsZ0JBQWdCQTtRQUNoQkEsaUJBQVlBLEdBQTJCQSxJQUFJQSxDQUFDQTtRQUM1Q0EsZ0JBQWdCQTtRQUNoQkEsaUJBQVlBLEdBQTJCQSxJQUFJQSxDQUFDQTtRQUM1Q0EsZ0JBQWdCQTtRQUNoQkEsZUFBVUEsR0FBMkJBLElBQUlBLENBQUNBO1FBQzFDQSxnQkFBZ0JBO1FBQ2hCQSxlQUFVQSxHQUEyQkEsSUFBSUEsQ0FBQ0E7SUFFWEEsQ0FBQ0E7SUFFaENELHlDQUFRQSxHQUFSQTtRQUNFRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxLQUFLQSxJQUFJQSxDQUFDQSxZQUFZQTtZQUNwQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1lBQ3BCQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLEdBQUdBLElBQUlBO2dCQUM3REEsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO0lBQ3BEQSxDQUFDQTtJQUNIRiw2QkFBQ0E7QUFBREEsQ0FBQ0EsQUEvQkQsSUErQkM7QUEvQlksOEJBQXNCLHlCQStCbEMsQ0FBQTtBQUVELHFGQUFxRjtBQUNyRjtJQUFBRztRQUNFQyxnQkFBZ0JBO1FBQ2hCQSxVQUFLQSxHQUEyQkEsSUFBSUEsQ0FBQ0E7UUFDckNBLGdCQUFnQkE7UUFDaEJBLFVBQUtBLEdBQTJCQSxJQUFJQSxDQUFDQTtJQWlFdkNBLENBQUNBO0lBL0RDRDs7OztPQUlHQTtJQUNIQSxzQ0FBR0EsR0FBSEEsVUFBSUEsTUFBOEJBO1FBQ2hDRSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsTUFBTUEsQ0FBQ0E7WUFDakNBLE1BQU1BLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBO1lBQ3ZCQSxNQUFNQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN6QkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsYUFBYUE7WUFDYkEsdUNBQXVDQTtZQUN2Q0EsMkZBQTJGQTtZQUMzRkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsR0FBR0EsTUFBTUEsQ0FBQ0E7WUFDN0JBLE1BQU1BLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1lBQzdCQSxNQUFNQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUN2QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDdEJBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURGLGtGQUFrRkE7SUFDbEZBLG9EQUFvREE7SUFDcERBLHNDQUFHQSxHQUFIQSxVQUFJQSxJQUFTQSxFQUFFQSxVQUFrQkE7UUFDL0JHLElBQUlBLE1BQThCQSxDQUFDQTtRQUNuQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsS0FBS0EsSUFBSUEsRUFBRUEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDcEVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLEtBQUtBLElBQUlBLElBQUlBLFVBQVVBLEdBQUdBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBO2dCQUN6REEscUJBQWNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0Q0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7WUFDaEJBLENBQUNBO1FBQ0hBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBRURIOzs7O09BSUdBO0lBQ0hBLHlDQUFNQSxHQUFOQSxVQUFPQSxNQUE4QkE7UUFDbkNJLGFBQWFBO1FBQ2JBLGNBQWNBO1FBQ2RBLDJEQUEyREE7UUFDM0RBLDJGQUEyRkE7UUFDM0ZBLGlEQUFpREE7UUFDakRBLEtBQUtBO1FBQ0xBLGlCQUFpQkE7UUFDakJBLEtBQUtBO1FBRUxBLElBQUlBLElBQUlBLEdBQTJCQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUNuREEsSUFBSUEsSUFBSUEsR0FBMkJBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBO1FBQ25EQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxLQUFLQSxJQUFJQSxDQUFDQTtJQUM3QkEsQ0FBQ0E7SUFDSEosK0JBQUNBO0FBQURBLENBQUNBLEFBckVELElBcUVDO0FBRUQ7SUFBQUs7UUFDRUMsUUFBR0EsR0FBR0EsSUFBSUEsR0FBR0EsRUFBaUNBLENBQUNBO0lBa0RqREEsQ0FBQ0E7SUFoRENELDJCQUFHQSxHQUFIQSxVQUFJQSxNQUE4QkE7UUFDaENFLGlDQUFpQ0E7UUFDakNBLElBQUlBLEdBQUdBLEdBQUdBLGdCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUVqQ0EsSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzQkEsVUFBVUEsR0FBR0EsSUFBSUEsd0JBQXdCQSxFQUFFQSxDQUFDQTtZQUM1Q0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDaENBLENBQUNBO1FBQ0RBLFVBQVVBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQ3pCQSxDQUFDQTtJQUVERjs7Ozs7O09BTUdBO0lBQ0hBLDJCQUFHQSxHQUFIQSxVQUFJQSxLQUFVQSxFQUFFQSxVQUF5QkE7UUFBekJHLDBCQUF5QkEsR0FBekJBLGlCQUF5QkE7UUFDdkNBLElBQUlBLEdBQUdBLEdBQUdBLGdCQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUUzQkEsSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLE1BQU1BLENBQUNBLGNBQU9BLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLEdBQUdBLFVBQVVBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO0lBQ3hFQSxDQUFDQTtJQUVESDs7OztPQUlHQTtJQUNIQSw4QkFBTUEsR0FBTkEsVUFBT0EsTUFBOEJBO1FBQ25DSSxJQUFJQSxHQUFHQSxHQUFHQSxnQkFBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDakNBLGFBQWFBO1FBQ2JBLHFDQUFxQ0E7UUFDckNBLElBQUlBLFVBQVVBLEdBQTZCQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUM3REEsbURBQW1EQTtRQUNuREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOUJBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFFREosc0JBQUlBLGtDQUFPQTthQUFYQSxjQUF5QkssTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBTDtJQUV0REEsNkJBQUtBLEdBQUxBLGNBQVVNLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRTdCTixnQ0FBUUEsR0FBUkEsY0FBcUJPLE1BQU1BLENBQUNBLGdCQUFnQkEsR0FBR0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO0lBQzdFUCxvQkFBQ0E7QUFBREEsQ0FBQ0EsQUFuREQsSUFtREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtcbiAgaXNMaXN0TGlrZUl0ZXJhYmxlLFxuICBpdGVyYXRlTGlzdExpa2UsXG4gIExpc3RXcmFwcGVyLFxuICBNYXBXcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7XG4gIGlzQmxhbmssXG4gIGlzUHJlc2VudCxcbiAgc3RyaW5naWZ5LFxuICBnZXRNYXBLZXksXG4gIGxvb3NlSWRlbnRpY2FsLFxuICBpc0FycmF5XG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuaW1wb3J0IHtJdGVyYWJsZURpZmZlciwgSXRlcmFibGVEaWZmZXJGYWN0b3J5fSBmcm9tICcuLi9kaWZmZXJzL2l0ZXJhYmxlX2RpZmZlcnMnO1xuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIERlZmF1bHRJdGVyYWJsZURpZmZlckZhY3RvcnkgaW1wbGVtZW50cyBJdGVyYWJsZURpZmZlckZhY3Rvcnkge1xuICBzdXBwb3J0cyhvYmo6IE9iamVjdCk6IGJvb2xlYW4geyByZXR1cm4gaXNMaXN0TGlrZUl0ZXJhYmxlKG9iaik7IH1cbiAgY3JlYXRlKGNkUmVmOiBDaGFuZ2VEZXRlY3RvclJlZik6IGFueSB7IHJldHVybiBuZXcgRGVmYXVsdEl0ZXJhYmxlRGlmZmVyKCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIERlZmF1bHRJdGVyYWJsZURpZmZlciBpbXBsZW1lbnRzIEl0ZXJhYmxlRGlmZmVyIHtcbiAgcHJpdmF0ZSBfY29sbGVjdGlvbiA9IG51bGw7XG4gIHByaXZhdGUgX2xlbmd0aDogbnVtYmVyID0gbnVsbDtcbiAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIHVzZWQgcmVjb3JkcyBhdCBhbnkgcG9pbnQgaW4gdGltZSAoZHVyaW5nICYgYWNyb3NzIGBfY2hlY2soKWAgY2FsbHMpXG4gIHByaXZhdGUgX2xpbmtlZFJlY29yZHM6IF9EdXBsaWNhdGVNYXAgPSBudWxsO1xuICAvLyBLZWVwcyB0cmFjayBvZiB0aGUgcmVtb3ZlZCByZWNvcmRzIGF0IGFueSBwb2ludCBpbiB0aW1lIGR1cmluZyBgX2NoZWNrKClgIGNhbGxzLlxuICBwcml2YXRlIF91bmxpbmtlZFJlY29yZHM6IF9EdXBsaWNhdGVNYXAgPSBudWxsO1xuICBwcml2YXRlIF9wcmV2aW91c0l0SGVhZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIHByaXZhdGUgX2l0SGVhZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIHByaXZhdGUgX2l0VGFpbDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIHByaXZhdGUgX2FkZGl0aW9uc0hlYWQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICBwcml2YXRlIF9hZGRpdGlvbnNUYWlsOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgcHJpdmF0ZSBfbW92ZXNIZWFkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgcHJpdmF0ZSBfbW92ZXNUYWlsOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgcHJpdmF0ZSBfcmVtb3ZhbHNIZWFkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgcHJpdmF0ZSBfcmVtb3ZhbHNUYWlsOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcblxuICBnZXQgY29sbGVjdGlvbigpIHsgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb247IH1cblxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9sZW5ndGg7IH1cblxuICBmb3JFYWNoSXRlbShmbjogRnVuY3Rpb24pIHtcbiAgICB2YXIgcmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5faXRIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoUHJldmlvdXNJdGVtKGZuOiBGdW5jdGlvbikge1xuICAgIHZhciByZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQ7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9wcmV2aW91c0l0SGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRQcmV2aW91cykge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoQWRkZWRJdGVtKGZuOiBGdW5jdGlvbikge1xuICAgIHZhciByZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQ7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9hZGRpdGlvbnNIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dEFkZGVkKSB7XG4gICAgICBmbihyZWNvcmQpO1xuICAgIH1cbiAgfVxuXG4gIGZvckVhY2hNb3ZlZEl0ZW0oZm46IEZ1bmN0aW9uKSB7XG4gICAgdmFyIHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX21vdmVzSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRNb3ZlZCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoUmVtb3ZlZEl0ZW0oZm46IEZ1bmN0aW9uKSB7XG4gICAgdmFyIHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX3JlbW92YWxzSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRSZW1vdmVkKSB7XG4gICAgICBmbihyZWNvcmQpO1xuICAgIH1cbiAgfVxuXG4gIGRpZmYoY29sbGVjdGlvbjogYW55KTogRGVmYXVsdEl0ZXJhYmxlRGlmZmVyIHtcbiAgICBpZiAoaXNCbGFuayhjb2xsZWN0aW9uKSkgY29sbGVjdGlvbiA9IFtdO1xuICAgIGlmICghaXNMaXN0TGlrZUl0ZXJhYmxlKGNvbGxlY3Rpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgRXJyb3IgdHJ5aW5nIHRvIGRpZmYgJyR7Y29sbGVjdGlvbn0nYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hlY2soY29sbGVjdGlvbikpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBvbkRlc3Ryb3koKSB7fVxuXG4gIC8vIHRvZG8odmljYik6IG9wdGltIGZvciBVbm1vZGlmaWFibGVMaXN0VmlldyAoZnJvemVuIGFycmF5cylcbiAgY2hlY2soY29sbGVjdGlvbjogYW55KTogYm9vbGVhbiB7XG4gICAgdGhpcy5fcmVzZXQoKTtcblxuICAgIHZhciByZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSB0aGlzLl9pdEhlYWQ7XG4gICAgdmFyIG1heUJlRGlydHk6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICB2YXIgaW5kZXg6IG51bWJlcjtcbiAgICB2YXIgaXRlbTtcblxuICAgIGlmIChpc0FycmF5KGNvbGxlY3Rpb24pKSB7XG4gICAgICB2YXIgbGlzdCA9IGNvbGxlY3Rpb247XG4gICAgICB0aGlzLl9sZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aDtcblxuICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5fbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGl0ZW0gPSBsaXN0W2luZGV4XTtcbiAgICAgICAgaWYgKHJlY29yZCA9PT0gbnVsbCB8fCAhbG9vc2VJZGVudGljYWwocmVjb3JkLml0ZW0sIGl0ZW0pKSB7XG4gICAgICAgICAgcmVjb3JkID0gdGhpcy5fbWlzbWF0Y2gocmVjb3JkLCBpdGVtLCBpbmRleCk7XG4gICAgICAgICAgbWF5QmVEaXJ0eSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAobWF5QmVEaXJ0eSkge1xuICAgICAgICAgIC8vIFRPRE8obWlza28pOiBjYW4gd2UgbGltaXQgdGhpcyB0byBkdXBsaWNhdGVzIG9ubHk/XG4gICAgICAgICAgcmVjb3JkID0gdGhpcy5fdmVyaWZ5UmVpbnNlcnRpb24ocmVjb3JkLCBpdGVtLCBpbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVjb3JkID0gcmVjb3JkLl9uZXh0O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpbmRleCA9IDA7XG4gICAgICBpdGVyYXRlTGlzdExpa2UoY29sbGVjdGlvbiwgKGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKHJlY29yZCA9PT0gbnVsbCB8fCAhbG9vc2VJZGVudGljYWwocmVjb3JkLml0ZW0sIGl0ZW0pKSB7XG4gICAgICAgICAgcmVjb3JkID0gdGhpcy5fbWlzbWF0Y2gocmVjb3JkLCBpdGVtLCBpbmRleCk7XG4gICAgICAgICAgbWF5QmVEaXJ0eSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAobWF5QmVEaXJ0eSkge1xuICAgICAgICAgIC8vIFRPRE8obWlza28pOiBjYW4gd2UgbGltaXQgdGhpcyB0byBkdXBsaWNhdGVzIG9ubHk/XG4gICAgICAgICAgcmVjb3JkID0gdGhpcy5fdmVyaWZ5UmVpbnNlcnRpb24ocmVjb3JkLCBpdGVtLCBpbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVjb3JkID0gcmVjb3JkLl9uZXh0O1xuICAgICAgICBpbmRleCsrO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9sZW5ndGggPSBpbmRleDtcbiAgICB9XG5cbiAgICB0aGlzLl90cnVuY2F0ZShyZWNvcmQpO1xuICAgIHRoaXMuX2NvbGxlY3Rpb24gPSBjb2xsZWN0aW9uO1xuICAgIHJldHVybiB0aGlzLmlzRGlydHk7XG4gIH1cblxuICAvLyBDb2xsZWN0aW9uQ2hhbmdlcyBpcyBjb25zaWRlcmVkIGRpcnR5IGlmIGl0IGhhcyBhbnkgYWRkaXRpb25zLCBtb3ZlcyBvciByZW1vdmFscy5cbiAgZ2V0IGlzRGlydHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2FkZGl0aW9uc0hlYWQgIT09IG51bGwgfHwgdGhpcy5fbW92ZXNIZWFkICE9PSBudWxsIHx8IHRoaXMuX3JlbW92YWxzSGVhZCAhPT0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0aGUgc3RhdGUgb2YgdGhlIGNoYW5nZSBvYmplY3RzIHRvIHNob3cgbm8gY2hhbmdlcy4gVGhpcyBtZWFucyBzZXQgcHJldmlvdXNLZXkgdG9cbiAgICogY3VycmVudEtleSwgYW5kIGNsZWFyIGFsbCBvZiB0aGUgcXVldWVzIChhZGRpdGlvbnMsIG1vdmVzLCByZW1vdmFscykuXG4gICAqIFNldCB0aGUgcHJldmlvdXNJbmRleGVzIG9mIG1vdmVkIGFuZCBhZGRlZCBpdGVtcyB0byB0aGVpciBjdXJyZW50SW5kZXhlc1xuICAgKiBSZXNldCB0aGUgbGlzdCBvZiBhZGRpdGlvbnMsIG1vdmVzIGFuZCByZW1vdmFsc1xuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9yZXNldCgpIHtcbiAgICBpZiAodGhpcy5pc0RpcnR5KSB7XG4gICAgICB2YXIgcmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkO1xuICAgICAgdmFyIG5leHRSZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQ7XG5cbiAgICAgIGZvciAocmVjb3JkID0gdGhpcy5fcHJldmlvdXNJdEhlYWQgPSB0aGlzLl9pdEhlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0KSB7XG4gICAgICAgIHJlY29yZC5fbmV4dFByZXZpb3VzID0gcmVjb3JkLl9uZXh0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2FkZGl0aW9uc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0QWRkZWQpIHtcbiAgICAgICAgcmVjb3JkLnByZXZpb3VzSW5kZXggPSByZWNvcmQuY3VycmVudEluZGV4O1xuICAgICAgfVxuICAgICAgdGhpcy5fYWRkaXRpb25zSGVhZCA9IHRoaXMuX2FkZGl0aW9uc1RhaWwgPSBudWxsO1xuXG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX21vdmVzSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSBuZXh0UmVjb3JkKSB7XG4gICAgICAgIHJlY29yZC5wcmV2aW91c0luZGV4ID0gcmVjb3JkLmN1cnJlbnRJbmRleDtcbiAgICAgICAgbmV4dFJlY29yZCA9IHJlY29yZC5fbmV4dE1vdmVkO1xuICAgICAgfVxuICAgICAgdGhpcy5fbW92ZXNIZWFkID0gdGhpcy5fbW92ZXNUYWlsID0gbnVsbDtcbiAgICAgIHRoaXMuX3JlbW92YWxzSGVhZCA9IHRoaXMuX3JlbW92YWxzVGFpbCA9IG51bGw7XG5cbiAgICAgIC8vIHRvZG8odmljYikgd2hlbiBhc3NlcnQgZ2V0cyBzdXBwb3J0ZWRcbiAgICAgIC8vIGFzc2VydCghdGhpcy5pc0RpcnR5KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyB0aGUgY29yZSBmdW5jdGlvbiB3aGljaCBoYW5kbGVzIGRpZmZlcmVuY2VzIGJldHdlZW4gY29sbGVjdGlvbnMuXG4gICAqXG4gICAqIC0gYHJlY29yZGAgaXMgdGhlIHJlY29yZCB3aGljaCB3ZSBzYXcgYXQgdGhpcyBwb3NpdGlvbiBsYXN0IHRpbWUuIElmIG51bGwgdGhlbiBpdCBpcyBhIG5ld1xuICAgKiAgIGl0ZW0uXG4gICAqIC0gYGl0ZW1gIGlzIHRoZSBjdXJyZW50IGl0ZW0gaW4gdGhlIGNvbGxlY3Rpb25cbiAgICogLSBgaW5kZXhgIGlzIHRoZSBwb3NpdGlvbiBvZiB0aGUgaXRlbSBpbiB0aGUgY29sbGVjdGlvblxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9taXNtYXRjaChyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQsIGl0ZW0sIGluZGV4OiBudW1iZXIpOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIHtcbiAgICAvLyBUaGUgcHJldmlvdXMgcmVjb3JkIGFmdGVyIHdoaWNoIHdlIHdpbGwgYXBwZW5kIHRoZSBjdXJyZW50IG9uZS5cbiAgICB2YXIgcHJldmlvdXNSZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQ7XG5cbiAgICBpZiAocmVjb3JkID09PSBudWxsKSB7XG4gICAgICBwcmV2aW91c1JlY29yZCA9IHRoaXMuX2l0VGFpbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldmlvdXNSZWNvcmQgPSByZWNvcmQuX3ByZXY7XG4gICAgICAvLyBSZW1vdmUgdGhlIHJlY29yZCBmcm9tIHRoZSBjb2xsZWN0aW9uIHNpbmNlIHdlIGtub3cgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIGl0ZW0uXG4gICAgICB0aGlzLl9yZW1vdmUocmVjb3JkKTtcbiAgICB9XG5cbiAgICAvLyBBdHRlbXB0IHRvIHNlZSBpZiB3ZSBoYXZlIHNlZW4gdGhlIGl0ZW0gYmVmb3JlLlxuICAgIHJlY29yZCA9IHRoaXMuX2xpbmtlZFJlY29yZHMgPT09IG51bGwgPyBudWxsIDogdGhpcy5fbGlua2VkUmVjb3Jkcy5nZXQoaXRlbSwgaW5kZXgpO1xuICAgIGlmIChyZWNvcmQgIT09IG51bGwpIHtcbiAgICAgIC8vIFdlIGhhdmUgc2VlbiB0aGlzIGJlZm9yZSwgd2UgbmVlZCB0byBtb3ZlIGl0IGZvcndhcmQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gICAgICB0aGlzLl9tb3ZlQWZ0ZXIocmVjb3JkLCBwcmV2aW91c1JlY29yZCwgaW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOZXZlciBzZWVuIGl0LCBjaGVjayBldmljdGVkIGxpc3QuXG4gICAgICByZWNvcmQgPSB0aGlzLl91bmxpbmtlZFJlY29yZHMgPT09IG51bGwgPyBudWxsIDogdGhpcy5fdW5saW5rZWRSZWNvcmRzLmdldChpdGVtKTtcbiAgICAgIGlmIChyZWNvcmQgIT09IG51bGwpIHtcbiAgICAgICAgLy8gSXQgaXMgYW4gaXRlbSB3aGljaCB3ZSBoYXZlIGV2aWN0ZWQgZWFybGllcjogcmVpbnNlcnQgaXQgYmFjayBpbnRvIHRoZSBsaXN0LlxuICAgICAgICB0aGlzLl9yZWluc2VydEFmdGVyKHJlY29yZCwgcHJldmlvdXNSZWNvcmQsIGluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEl0IGlzIGEgbmV3IGl0ZW06IGFkZCBpdC5cbiAgICAgICAgcmVjb3JkID0gdGhpcy5fYWRkQWZ0ZXIobmV3IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQoaXRlbSksIHByZXZpb3VzUmVjb3JkLCBpbmRleCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBjaGVjayBpcyBvbmx5IG5lZWRlZCBpZiBhbiBhcnJheSBjb250YWlucyBkdXBsaWNhdGVzLiAoU2hvcnQgY2lyY3VpdCBvZiBub3RoaW5nIGRpcnR5KVxuICAgKlxuICAgKiBVc2UgY2FzZTogYFthLCBhXWAgPT4gYFtiLCBhLCBhXWBcbiAgICpcbiAgICogSWYgd2UgZGlkIG5vdCBoYXZlIHRoaXMgY2hlY2sgdGhlbiB0aGUgaW5zZXJ0aW9uIG9mIGBiYCB3b3VsZDpcbiAgICogICAxKSBldmljdCBmaXJzdCBgYWBcbiAgICogICAyKSBpbnNlcnQgYGJgIGF0IGAwYCBpbmRleC5cbiAgICogICAzKSBsZWF2ZSBgYWAgYXQgaW5kZXggYDFgIGFzIGlzLiA8LS0gdGhpcyBpcyB3cm9uZyFcbiAgICogICAzKSByZWluc2VydCBgYWAgYXQgaW5kZXggMi4gPC0tIHRoaXMgaXMgd3JvbmchXG4gICAqXG4gICAqIFRoZSBjb3JyZWN0IGJlaGF2aW9yIGlzOlxuICAgKiAgIDEpIGV2aWN0IGZpcnN0IGBhYFxuICAgKiAgIDIpIGluc2VydCBgYmAgYXQgYDBgIGluZGV4LlxuICAgKiAgIDMpIHJlaW5zZXJ0IGBhYCBhdCBpbmRleCAxLlxuICAgKiAgIDMpIG1vdmUgYGFgIGF0IGZyb20gYDFgIHRvIGAyYC5cbiAgICpcbiAgICpcbiAgICogRG91YmxlIGNoZWNrIHRoYXQgd2UgaGF2ZSBub3QgZXZpY3RlZCBhIGR1cGxpY2F0ZSBpdGVtLiBXZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBpdGVtIHR5cGUgbWF5XG4gICAqIGhhdmUgYWxyZWFkeSBiZWVuIHJlbW92ZWQ6XG4gICAqIFRoZSBpbnNlcnRpb24gb2YgYiB3aWxsIGV2aWN0IHRoZSBmaXJzdCAnYScuIElmIHdlIGRvbid0IHJlaW5zZXJ0IGl0IG5vdyBpdCB3aWxsIGJlIHJlaW5zZXJ0ZWRcbiAgICogYXQgdGhlIGVuZC4gV2hpY2ggd2lsbCBzaG93IHVwIGFzIHRoZSB0d28gJ2EncyBzd2l0Y2hpbmcgcG9zaXRpb24uIFRoaXMgaXMgaW5jb3JyZWN0LCBzaW5jZSBhXG4gICAqIGJldHRlciB3YXkgdG8gdGhpbmsgb2YgaXQgaXMgYXMgaW5zZXJ0IG9mICdiJyByYXRoZXIgdGhlbiBzd2l0Y2ggJ2EnIHdpdGggJ2InIGFuZCB0aGVuIGFkZCAnYSdcbiAgICogYXQgdGhlIGVuZC5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfdmVyaWZ5UmVpbnNlcnRpb24ocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLCBpdGVtLCBpbmRleDogbnVtYmVyKTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgdmFyIHJlaW5zZXJ0UmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID1cbiAgICAgICAgdGhpcy5fdW5saW5rZWRSZWNvcmRzID09PSBudWxsID8gbnVsbCA6IHRoaXMuX3VubGlua2VkUmVjb3Jkcy5nZXQoaXRlbSk7XG4gICAgaWYgKHJlaW5zZXJ0UmVjb3JkICE9PSBudWxsKSB7XG4gICAgICByZWNvcmQgPSB0aGlzLl9yZWluc2VydEFmdGVyKHJlaW5zZXJ0UmVjb3JkLCByZWNvcmQuX3ByZXYsIGluZGV4KTtcbiAgICB9IGVsc2UgaWYgKHJlY29yZC5jdXJyZW50SW5kZXggIT0gaW5kZXgpIHtcbiAgICAgIHJlY29yZC5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICAgIHRoaXMuX2FkZFRvTW92ZXMocmVjb3JkLCBpbmRleCk7XG4gICAgfVxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHJpZCBvZiBhbnkgZXhjZXNzIHtAbGluayBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkfXMgZnJvbSB0aGUgcHJldmlvdXMgY29sbGVjdGlvblxuICAgKlxuICAgKiAtIGByZWNvcmRgIFRoZSBmaXJzdCBleGNlc3Mge0BsaW5rIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmR9LlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF90cnVuY2F0ZShyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpIHtcbiAgICAvLyBBbnl0aGluZyBhZnRlciB0aGF0IG5lZWRzIHRvIGJlIHJlbW92ZWQ7XG4gICAgd2hpbGUgKHJlY29yZCAhPT0gbnVsbCkge1xuICAgICAgdmFyIG5leHRSZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSByZWNvcmQuX25leHQ7XG4gICAgICB0aGlzLl9hZGRUb1JlbW92YWxzKHRoaXMuX3VubGluayhyZWNvcmQpKTtcbiAgICAgIHJlY29yZCA9IG5leHRSZWNvcmQ7XG4gICAgfVxuICAgIGlmICh0aGlzLl91bmxpbmtlZFJlY29yZHMgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3VubGlua2VkUmVjb3Jkcy5jbGVhcigpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9hZGRpdGlvbnNUYWlsICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl9hZGRpdGlvbnNUYWlsLl9uZXh0QWRkZWQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbW92ZXNUYWlsICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl9tb3Zlc1RhaWwuX25leHRNb3ZlZCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9pdFRhaWwgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2l0VGFpbC5fbmV4dCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9yZW1vdmFsc1RhaWwgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlbW92YWxzVGFpbC5fbmV4dFJlbW92ZWQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlaW5zZXJ0QWZ0ZXIocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLCBwcmV2UmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLFxuICAgICAgICAgICAgICAgICBpbmRleDogbnVtYmVyKTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgaWYgKHRoaXMuX3VubGlua2VkUmVjb3JkcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fdW5saW5rZWRSZWNvcmRzLnJlbW92ZShyZWNvcmQpO1xuICAgIH1cbiAgICB2YXIgcHJldiA9IHJlY29yZC5fcHJldlJlbW92ZWQ7XG4gICAgdmFyIG5leHQgPSByZWNvcmQuX25leHRSZW1vdmVkO1xuXG4gICAgaWYgKHByZXYgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlbW92YWxzSGVhZCA9IG5leHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXYuX25leHRSZW1vdmVkID0gbmV4dDtcbiAgICB9XG4gICAgaWYgKG5leHQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlbW92YWxzVGFpbCA9IHByZXY7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQuX3ByZXZSZW1vdmVkID0gcHJldjtcbiAgICB9XG5cbiAgICB0aGlzLl9pbnNlcnRBZnRlcihyZWNvcmQsIHByZXZSZWNvcmQsIGluZGV4KTtcbiAgICB0aGlzLl9hZGRUb01vdmVzKHJlY29yZCwgaW5kZXgpO1xuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tb3ZlQWZ0ZXIocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLCBwcmV2UmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLFxuICAgICAgICAgICAgIGluZGV4OiBudW1iZXIpOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIHtcbiAgICB0aGlzLl91bmxpbmsocmVjb3JkKTtcbiAgICB0aGlzLl9pbnNlcnRBZnRlcihyZWNvcmQsIHByZXZSZWNvcmQsIGluZGV4KTtcbiAgICB0aGlzLl9hZGRUb01vdmVzKHJlY29yZCwgaW5kZXgpO1xuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRBZnRlcihyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQsIHByZXZSZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQsXG4gICAgICAgICAgICBpbmRleDogbnVtYmVyKTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgdGhpcy5faW5zZXJ0QWZ0ZXIocmVjb3JkLCBwcmV2UmVjb3JkLCBpbmRleCk7XG5cbiAgICBpZiAodGhpcy5fYWRkaXRpb25zVGFpbCA9PT0gbnVsbCkge1xuICAgICAgLy8gdG9kbyh2aWNiKVxuICAgICAgLy8gYXNzZXJ0KHRoaXMuX2FkZGl0aW9uc0hlYWQgPT09IG51bGwpO1xuICAgICAgdGhpcy5fYWRkaXRpb25zVGFpbCA9IHRoaXMuX2FkZGl0aW9uc0hlYWQgPSByZWNvcmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHRvZG8odmljYilcbiAgICAgIC8vIGFzc2VydChfYWRkaXRpb25zVGFpbC5fbmV4dEFkZGVkID09PSBudWxsKTtcbiAgICAgIC8vIGFzc2VydChyZWNvcmQuX25leHRBZGRlZCA9PT0gbnVsbCk7XG4gICAgICB0aGlzLl9hZGRpdGlvbnNUYWlsID0gdGhpcy5fYWRkaXRpb25zVGFpbC5fbmV4dEFkZGVkID0gcmVjb3JkO1xuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaW5zZXJ0QWZ0ZXIocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLCBwcmV2UmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLFxuICAgICAgICAgICAgICAgaW5kZXg6IG51bWJlcik6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIC8vIHRvZG8odmljYilcbiAgICAvLyBhc3NlcnQocmVjb3JkICE9IHByZXZSZWNvcmQpO1xuICAgIC8vIGFzc2VydChyZWNvcmQuX25leHQgPT09IG51bGwpO1xuICAgIC8vIGFzc2VydChyZWNvcmQuX3ByZXYgPT09IG51bGwpO1xuXG4gICAgdmFyIG5leHQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBwcmV2UmVjb3JkID09PSBudWxsID8gdGhpcy5faXRIZWFkIDogcHJldlJlY29yZC5fbmV4dDtcbiAgICAvLyB0b2RvKHZpY2IpXG4gICAgLy8gYXNzZXJ0KG5leHQgIT0gcmVjb3JkKTtcbiAgICAvLyBhc3NlcnQocHJldlJlY29yZCAhPSByZWNvcmQpO1xuICAgIHJlY29yZC5fbmV4dCA9IG5leHQ7XG4gICAgcmVjb3JkLl9wcmV2ID0gcHJldlJlY29yZDtcbiAgICBpZiAobmV4dCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faXRUYWlsID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0Ll9wcmV2ID0gcmVjb3JkO1xuICAgIH1cbiAgICBpZiAocHJldlJlY29yZCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faXRIZWFkID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2UmVjb3JkLl9uZXh0ID0gcmVjb3JkO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9saW5rZWRSZWNvcmRzID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9saW5rZWRSZWNvcmRzID0gbmV3IF9EdXBsaWNhdGVNYXAoKTtcbiAgICB9XG4gICAgdGhpcy5fbGlua2VkUmVjb3Jkcy5wdXQocmVjb3JkKTtcblxuICAgIHJlY29yZC5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVtb3ZlKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCk6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIHJldHVybiB0aGlzLl9hZGRUb1JlbW92YWxzKHRoaXMuX3VubGluayhyZWNvcmQpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VubGluayhyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIHtcbiAgICBpZiAodGhpcy5fbGlua2VkUmVjb3JkcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fbGlua2VkUmVjb3Jkcy5yZW1vdmUocmVjb3JkKTtcbiAgICB9XG5cbiAgICB2YXIgcHJldiA9IHJlY29yZC5fcHJldjtcbiAgICB2YXIgbmV4dCA9IHJlY29yZC5fbmV4dDtcblxuICAgIC8vIHRvZG8odmljYilcbiAgICAvLyBhc3NlcnQoKHJlY29yZC5fcHJldiA9IG51bGwpID09PSBudWxsKTtcbiAgICAvLyBhc3NlcnQoKHJlY29yZC5fbmV4dCA9IG51bGwpID09PSBudWxsKTtcblxuICAgIGlmIChwcmV2ID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9pdEhlYWQgPSBuZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2Ll9uZXh0ID0gbmV4dDtcbiAgICB9XG4gICAgaWYgKG5leHQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2l0VGFpbCA9IHByZXY7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQuX3ByZXYgPSBwcmV2O1xuICAgIH1cblxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRUb01vdmVzKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCwgdG9JbmRleDogbnVtYmVyKTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgLy8gdG9kbyh2aWNiKVxuICAgIC8vIGFzc2VydChyZWNvcmQuX25leHRNb3ZlZCA9PT0gbnVsbCk7XG5cbiAgICBpZiAocmVjb3JkLnByZXZpb3VzSW5kZXggPT09IHRvSW5kZXgpIHtcbiAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX21vdmVzVGFpbCA9PT0gbnVsbCkge1xuICAgICAgLy8gdG9kbyh2aWNiKVxuICAgICAgLy8gYXNzZXJ0KF9tb3Zlc0hlYWQgPT09IG51bGwpO1xuICAgICAgdGhpcy5fbW92ZXNUYWlsID0gdGhpcy5fbW92ZXNIZWFkID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0b2RvKHZpY2IpXG4gICAgICAvLyBhc3NlcnQoX21vdmVzVGFpbC5fbmV4dE1vdmVkID09PSBudWxsKTtcbiAgICAgIHRoaXMuX21vdmVzVGFpbCA9IHRoaXMuX21vdmVzVGFpbC5fbmV4dE1vdmVkID0gcmVjb3JkO1xuICAgIH1cblxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRUb1JlbW92YWxzKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCk6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIGlmICh0aGlzLl91bmxpbmtlZFJlY29yZHMgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3VubGlua2VkUmVjb3JkcyA9IG5ldyBfRHVwbGljYXRlTWFwKCk7XG4gICAgfVxuICAgIHRoaXMuX3VubGlua2VkUmVjb3Jkcy5wdXQocmVjb3JkKTtcbiAgICByZWNvcmQuY3VycmVudEluZGV4ID0gbnVsbDtcbiAgICByZWNvcmQuX25leHRSZW1vdmVkID0gbnVsbDtcblxuICAgIGlmICh0aGlzLl9yZW1vdmFsc1RhaWwgPT09IG51bGwpIHtcbiAgICAgIC8vIHRvZG8odmljYilcbiAgICAgIC8vIGFzc2VydChfcmVtb3ZhbHNIZWFkID09PSBudWxsKTtcbiAgICAgIHRoaXMuX3JlbW92YWxzVGFpbCA9IHRoaXMuX3JlbW92YWxzSGVhZCA9IHJlY29yZDtcbiAgICAgIHJlY29yZC5fcHJldlJlbW92ZWQgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0b2RvKHZpY2IpXG4gICAgICAvLyBhc3NlcnQoX3JlbW92YWxzVGFpbC5fbmV4dFJlbW92ZWQgPT09IG51bGwpO1xuICAgICAgLy8gYXNzZXJ0KHJlY29yZC5fbmV4dFJlbW92ZWQgPT09IG51bGwpO1xuICAgICAgcmVjb3JkLl9wcmV2UmVtb3ZlZCA9IHRoaXMuX3JlbW92YWxzVGFpbDtcbiAgICAgIHRoaXMuX3JlbW92YWxzVGFpbCA9IHRoaXMuX3JlbW92YWxzVGFpbC5fbmV4dFJlbW92ZWQgPSByZWNvcmQ7XG4gICAgfVxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHZhciByZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQ7XG5cbiAgICB2YXIgbGlzdCA9IFtdO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5faXRIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dCkge1xuICAgICAgbGlzdC5wdXNoKHJlY29yZCk7XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzID0gW107XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9wcmV2aW91c0l0SGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRQcmV2aW91cykge1xuICAgICAgcHJldmlvdXMucHVzaChyZWNvcmQpO1xuICAgIH1cblxuICAgIHZhciBhZGRpdGlvbnMgPSBbXTtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2FkZGl0aW9uc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0QWRkZWQpIHtcbiAgICAgIGFkZGl0aW9ucy5wdXNoKHJlY29yZCk7XG4gICAgfVxuICAgIHZhciBtb3ZlcyA9IFtdO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5fbW92ZXNIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dE1vdmVkKSB7XG4gICAgICBtb3Zlcy5wdXNoKHJlY29yZCk7XG4gICAgfVxuXG4gICAgdmFyIHJlbW92YWxzID0gW107XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9yZW1vdmFsc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0UmVtb3ZlZCkge1xuICAgICAgcmVtb3ZhbHMucHVzaChyZWNvcmQpO1xuICAgIH1cblxuICAgIHJldHVybiBcImNvbGxlY3Rpb246IFwiICsgbGlzdC5qb2luKCcsICcpICsgXCJcXG5cIiArIFwicHJldmlvdXM6IFwiICsgcHJldmlvdXMuam9pbignLCAnKSArIFwiXFxuXCIgK1xuICAgICAgICAgICBcImFkZGl0aW9uczogXCIgKyBhZGRpdGlvbnMuam9pbignLCAnKSArIFwiXFxuXCIgKyBcIm1vdmVzOiBcIiArIG1vdmVzLmpvaW4oJywgJykgKyBcIlxcblwiICtcbiAgICAgICAgICAgXCJyZW1vdmFsczogXCIgKyByZW1vdmFscy5qb2luKCcsICcpICsgXCJcXG5cIjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gIGN1cnJlbnRJbmRleDogbnVtYmVyID0gbnVsbDtcbiAgcHJldmlvdXNJbmRleDogbnVtYmVyID0gbnVsbDtcblxuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0UHJldmlvdXM6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9wcmV2OiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmV4dDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ByZXZEdXA6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0RHVwOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcHJldlJlbW92ZWQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0UmVtb3ZlZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRBZGRlZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRNb3ZlZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGl0ZW06IGFueSkge31cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByZXZpb3VzSW5kZXggPT09IHRoaXMuY3VycmVudEluZGV4ID9cbiAgICAgICAgICAgICAgIHN0cmluZ2lmeSh0aGlzLml0ZW0pIDpcbiAgICAgICAgICAgICAgIHN0cmluZ2lmeSh0aGlzLml0ZW0pICsgJ1snICsgc3RyaW5naWZ5KHRoaXMucHJldmlvdXNJbmRleCkgKyAnLT4nICtcbiAgICAgICAgICAgICAgICAgICBzdHJpbmdpZnkodGhpcy5jdXJyZW50SW5kZXgpICsgJ10nO1xuICB9XG59XG5cbi8vIEEgbGlua2VkIGxpc3Qgb2YgQ29sbGVjdGlvbkNoYW5nZVJlY29yZHMgd2l0aCB0aGUgc2FtZSBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLml0ZW1cbmNsYXNzIF9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdCB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2hlYWQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF90YWlsOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcblxuICAvKipcbiAgICogQXBwZW5kIHRoZSByZWNvcmQgdG8gdGhlIGxpc3Qgb2YgZHVwbGljYXRlcy5cbiAgICpcbiAgICogTm90ZTogYnkgZGVzaWduIGFsbCByZWNvcmRzIGluIHRoZSBsaXN0IG9mIGR1cGxpY2F0ZXMgaG9sZCB0aGUgc2FtZSB2YWx1ZSBpbiByZWNvcmQuaXRlbS5cbiAgICovXG4gIGFkZChyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faGVhZCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faGVhZCA9IHRoaXMuX3RhaWwgPSByZWNvcmQ7XG4gICAgICByZWNvcmQuX25leHREdXAgPSBudWxsO1xuICAgICAgcmVjb3JkLl9wcmV2RHVwID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gdG9kbyh2aWNiKVxuICAgICAgLy8gYXNzZXJ0KHJlY29yZC5pdGVtID09ICBfaGVhZC5pdGVtIHx8XG4gICAgICAvLyAgICAgICByZWNvcmQuaXRlbSBpcyBudW0gJiYgcmVjb3JkLml0ZW0uaXNOYU4gJiYgX2hlYWQuaXRlbSBpcyBudW0gJiYgX2hlYWQuaXRlbS5pc05hTik7XG4gICAgICB0aGlzLl90YWlsLl9uZXh0RHVwID0gcmVjb3JkO1xuICAgICAgcmVjb3JkLl9wcmV2RHVwID0gdGhpcy5fdGFpbDtcbiAgICAgIHJlY29yZC5fbmV4dER1cCA9IG51bGw7XG4gICAgICB0aGlzLl90YWlsID0gcmVjb3JkO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybnMgYSBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIGhhdmluZyBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLml0ZW0gPT0gaXRlbSBhbmRcbiAgLy8gQ29sbGVjdGlvbkNoYW5nZVJlY29yZC5jdXJyZW50SW5kZXggPj0gYWZ0ZXJJbmRleFxuICBnZXQoaXRlbTogYW55LCBhZnRlckluZGV4OiBudW1iZXIpOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIHtcbiAgICB2YXIgcmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5faGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHREdXApIHtcbiAgICAgIGlmICgoYWZ0ZXJJbmRleCA9PT0gbnVsbCB8fCBhZnRlckluZGV4IDwgcmVjb3JkLmN1cnJlbnRJbmRleCkgJiZcbiAgICAgICAgICBsb29zZUlkZW50aWNhbChyZWNvcmQuaXRlbSwgaXRlbSkpIHtcbiAgICAgICAgcmV0dXJuIHJlY29yZDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIG9uZSB7QGxpbmsgQ29sbGVjdGlvbkNoYW5nZVJlY29yZH0gZnJvbSB0aGUgbGlzdCBvZiBkdXBsaWNhdGVzLlxuICAgKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGxpc3Qgb2YgZHVwbGljYXRlcyBpcyBlbXB0eS5cbiAgICovXG4gIHJlbW92ZShyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpOiBib29sZWFuIHtcbiAgICAvLyB0b2RvKHZpY2IpXG4gICAgLy8gYXNzZXJ0KCgpIHtcbiAgICAvLyAgLy8gdmVyaWZ5IHRoYXQgdGhlIHJlY29yZCBiZWluZyByZW1vdmVkIGlzIGluIHRoZSBsaXN0LlxuICAgIC8vICBmb3IgKENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgY3Vyc29yID0gX2hlYWQ7IGN1cnNvciAhPSBudWxsOyBjdXJzb3IgPSBjdXJzb3IuX25leHREdXApIHtcbiAgICAvLyAgICBpZiAoaWRlbnRpY2FsKGN1cnNvciwgcmVjb3JkKSkgcmV0dXJuIHRydWU7XG4gICAgLy8gIH1cbiAgICAvLyAgcmV0dXJuIGZhbHNlO1xuICAgIC8vfSk7XG5cbiAgICB2YXIgcHJldjogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IHJlY29yZC5fcHJldkR1cDtcbiAgICB2YXIgbmV4dDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IHJlY29yZC5fbmV4dER1cDtcbiAgICBpZiAocHJldiA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faGVhZCA9IG5leHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXYuX25leHREdXAgPSBuZXh0O1xuICAgIH1cbiAgICBpZiAobmV4dCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fdGFpbCA9IHByZXY7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQuX3ByZXZEdXAgPSBwcmV2O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faGVhZCA9PT0gbnVsbDtcbiAgfVxufVxuXG5jbGFzcyBfRHVwbGljYXRlTWFwIHtcbiAgbWFwID0gbmV3IE1hcDxhbnksIF9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdD4oKTtcblxuICBwdXQocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKSB7XG4gICAgLy8gdG9kbyh2aWNiKSBoYW5kbGUgY29ybmVyIGNhc2VzXG4gICAgdmFyIGtleSA9IGdldE1hcEtleShyZWNvcmQuaXRlbSk7XG5cbiAgICB2YXIgZHVwbGljYXRlcyA9IHRoaXMubWFwLmdldChrZXkpO1xuICAgIGlmICghaXNQcmVzZW50KGR1cGxpY2F0ZXMpKSB7XG4gICAgICBkdXBsaWNhdGVzID0gbmV3IF9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdCgpO1xuICAgICAgdGhpcy5tYXAuc2V0KGtleSwgZHVwbGljYXRlcyk7XG4gICAgfVxuICAgIGR1cGxpY2F0ZXMuYWRkKHJlY29yZCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGB2YWx1ZWAgdXNpbmcga2V5LiBCZWNhdXNlIHRoZSBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIHZhbHVlIG1heWJlIG9uZSB3aGljaCB3ZVxuICAgKiBoYXZlIGFscmVhZHkgaXRlcmF0ZWQgb3Zlciwgd2UgdXNlIHRoZSBhZnRlckluZGV4IHRvIHByZXRlbmQgaXQgaXMgbm90IHRoZXJlLlxuICAgKlxuICAgKiBVc2UgY2FzZTogYFthLCBiLCBjLCBhLCBhXWAgaWYgd2UgYXJlIGF0IGluZGV4IGAzYCB3aGljaCBpcyB0aGUgc2Vjb25kIGBhYCB0aGVuIGFza2luZyBpZiB3ZVxuICAgKiBoYXZlIGFueSBtb3JlIGBhYHMgbmVlZHMgdG8gcmV0dXJuIHRoZSBsYXN0IGBhYCBub3QgdGhlIGZpcnN0IG9yIHNlY29uZC5cbiAgICovXG4gIGdldCh2YWx1ZTogYW55LCBhZnRlckluZGV4OiBudW1iZXIgPSBudWxsKTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgdmFyIGtleSA9IGdldE1hcEtleSh2YWx1ZSk7XG5cbiAgICB2YXIgcmVjb3JkTGlzdCA9IHRoaXMubWFwLmdldChrZXkpO1xuICAgIHJldHVybiBpc0JsYW5rKHJlY29yZExpc3QpID8gbnVsbCA6IHJlY29yZExpc3QuZ2V0KHZhbHVlLCBhZnRlckluZGV4KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEge0BsaW5rIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmR9IGZyb20gdGhlIGxpc3Qgb2YgZHVwbGljYXRlcy5cbiAgICpcbiAgICogVGhlIGxpc3Qgb2YgZHVwbGljYXRlcyBhbHNvIGlzIHJlbW92ZWQgZnJvbSB0aGUgbWFwIGlmIGl0IGdldHMgZW1wdHkuXG4gICAqL1xuICByZW1vdmUocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgdmFyIGtleSA9IGdldE1hcEtleShyZWNvcmQuaXRlbSk7XG4gICAgLy8gdG9kbyh2aWNiKVxuICAgIC8vIGFzc2VydCh0aGlzLm1hcC5jb250YWluc0tleShrZXkpKTtcbiAgICB2YXIgcmVjb3JkTGlzdDogX0R1cGxpY2F0ZUl0ZW1SZWNvcmRMaXN0ID0gdGhpcy5tYXAuZ2V0KGtleSk7XG4gICAgLy8gUmVtb3ZlIHRoZSBsaXN0IG9mIGR1cGxpY2F0ZXMgd2hlbiBpdCBnZXRzIGVtcHR5XG4gICAgaWYgKHJlY29yZExpc3QucmVtb3ZlKHJlY29yZCkpIHtcbiAgICAgIHRoaXMubWFwLmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgZ2V0IGlzRW1wdHkoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLm1hcC5zaXplID09PSAwOyB9XG5cbiAgY2xlYXIoKSB7IHRoaXMubWFwLmNsZWFyKCk7IH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gJ19EdXBsaWNhdGVNYXAoJyArIHN0cmluZ2lmeSh0aGlzLm1hcCkgKyAnKSc7IH1cbn1cbiJdfQ==