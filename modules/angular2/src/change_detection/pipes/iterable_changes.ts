import {CONST} from 'angular2/src/facade/lang';
import {
  isListLikeIterable,
  iterateListLike,
  ListWrapper,
  MapWrapper
} from 'angular2/src/facade/collection';

import {
  isBlank,
  isPresent,
  stringify,
  getMapKey,
  looseIdentical,
} from 'angular2/src/facade/lang';

import {WrappedValue, Pipe, PipeFactory} from './pipe';

@CONST()
export class IterableChangesFactory extends PipeFactory {
  constructor() { super(); }

  supports(obj): boolean { return IterableChanges.supportsObj(obj); }

  create(cdRef): Pipe { return new IterableChanges(); }
}

/**
 * @exportedAs angular2/pipes
 */
export class IterableChanges extends Pipe {
  private _collection;
  private _length: int;
  private _linkedRecords: _DuplicateMap;
  private _unlinkedRecords: _DuplicateMap;
  private _previousItHead: CollectionChangeRecord;
  private _itHead: CollectionChangeRecord;
  private _itTail: CollectionChangeRecord;
  private _additionsHead: CollectionChangeRecord;
  private _additionsTail: CollectionChangeRecord;
  private _movesHead: CollectionChangeRecord;
  private _movesTail: CollectionChangeRecord;
  private _removalsHead: CollectionChangeRecord;
  private _removalsTail: CollectionChangeRecord;

  constructor() {
    super();
    this._collection = null;
    this._length = null;
    /// Keeps track of the used records at any point in time (during & across `_check()` calls)
    this._linkedRecords = null;
    /// Keeps track of the removed records at any point in time during `_check()` calls.
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

  static supportsObj(obj): boolean { return isListLikeIterable(obj); }

  supports(obj): boolean { return IterableChanges.supportsObj(obj); }

  get collection() { return this._collection; }

  get length(): int { return this._length; }

  forEachItem(fn: Function) {
    var record: CollectionChangeRecord;
    for (record = this._itHead; record !== null; record = record._next) {
      fn(record);
    }
  }

  forEachPreviousItem(fn: Function) {
    var record: CollectionChangeRecord;
    for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
      fn(record);
    }
  }

  forEachAddedItem(fn: Function) {
    var record: CollectionChangeRecord;
    for (record = this._additionsHead; record !== null; record = record._nextAdded) {
      fn(record);
    }
  }

  forEachMovedItem(fn: Function) {
    var record: CollectionChangeRecord;
    for (record = this._movesHead; record !== null; record = record._nextMoved) {
      fn(record);
    }
  }

  forEachRemovedItem(fn: Function) {
    var record: CollectionChangeRecord;
    for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
      fn(record);
    }
  }

  transform(collection): any {
    if (this.check(collection)) {
      return WrappedValue.wrap(this);
    } else {
      return this;
    }
  }

  // todo(vicb): optim for UnmodifiableListView (frozen arrays)
  check(collection): boolean {
    this._reset();

    var record: CollectionChangeRecord = this._itHead;
    var mayBeDirty: boolean = false;
    var index: int;
    var item;

    if (ListWrapper.isList(collection)) {
      var list = collection;
      this._length = collection.length;

      for (index = 0; index < this._length; index++) {
        item = list[index];
        if (record === null || !looseIdentical(record.item, item)) {
          record = this._mismatch(record, item, index);
          mayBeDirty = true;
        } else if (mayBeDirty) {
          // TODO(misko): can we limit this to duplicates only?
          record = this._verifyReinsertion(record, item, index);
        }
        record = record._next;
      }
    } else {
      index = 0;
      iterateListLike(collection, (item) => {
        if (record === null || !looseIdentical(record.item, item)) {
          record = this._mismatch(record, item, index);
          mayBeDirty = true;
        } else if (mayBeDirty) {
          // TODO(misko): can we limit this to duplicates only?
          record = this._verifyReinsertion(record, item, index);
        }
        record = record._next;
        index++
      });
      this._length = index;
    }

    this._truncate(record);
    this._collection = collection;
    return this.isDirty;
  }

  // CollectionChanges is considered dirty if it has any additions, moves or removals.
  get isDirty(): boolean {
    return this._additionsHead !== null || this._movesHead !== null || this._removalsHead !== null;
  }

  /**
   * Reset the state of the change objects to show no changes. This means set previousKey to
   * currentKey, and clear all of the queues (additions, moves, removals).
   * Set the previousIndexes of moved and added items to their currentIndexes
   * Reset the list of additions, moves and removals
   */
  _reset() {
    if (this.isDirty) {
      var record: CollectionChangeRecord;
      var nextRecord: CollectionChangeRecord;

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

      // todo(vicb) when assert gets supported
      // assert(!this.isDirty);
    }
  }

  /**
   * This is the core function which handles differences between collections.
   *
   * - `record` is the record which we saw at this position last time. If null then it is a new
   *   item.
   * - `item` is the current item in the collection
   * - `index` is the position of the item in the collection
   */
  _mismatch(record: CollectionChangeRecord, item, index: int): CollectionChangeRecord {
    // The previous record after which we will append the current one.
    var previousRecord: CollectionChangeRecord;

    if (record === null) {
      previousRecord = this._itTail;
    } else {
      previousRecord = record._prev;
      // Remove the record from the collection since we know it does not match the item.
      this._remove(record);
    }

    // Attempt to see if we have seen the item before.
    record = this._linkedRecords === null ? null : this._linkedRecords.get(item, index);
    if (record !== null) {
      // We have seen this before, we need to move it forward in the collection.
      this._moveAfter(record, previousRecord, index);
    } else {
      // Never seen it, check evicted list.
      record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(item);
      if (record !== null) {
        // It is an item which we have evicted earlier: reinsert it back into the list.
        this._reinsertAfter(record, previousRecord, index);
      } else {
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
   */
  _verifyReinsertion(record: CollectionChangeRecord, item, index: int): CollectionChangeRecord {
    var reinsertRecord: CollectionChangeRecord =
        this._unlinkedRecords === null ? null : this._unlinkedRecords.get(item);
    if (reinsertRecord !== null) {
      record = this._reinsertAfter(reinsertRecord, record._prev, index);
    } else if (record.currentIndex != index) {
      record.currentIndex = index;
      this._addToMoves(record, index);
    }
    return record;
  }

  /**
   * Get rid of any excess {@link CollectionChangeRecord}s from the previous collection
   *
   * - `record` The first excess {@link CollectionChangeRecord}.
   */
  _truncate(record: CollectionChangeRecord) {
    // Anything after that needs to be removed;
    while (record !== null) {
      var nextRecord: CollectionChangeRecord = record._next;
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

  _reinsertAfter(record: CollectionChangeRecord, prevRecord: CollectionChangeRecord,
                 index: int): CollectionChangeRecord {
    if (this._unlinkedRecords !== null) {
      this._unlinkedRecords.remove(record);
    }
    var prev = record._prevRemoved;
    var next = record._nextRemoved;

    if (prev === null) {
      this._removalsHead = next;
    } else {
      prev._nextRemoved = next;
    }
    if (next === null) {
      this._removalsTail = prev;
    } else {
      next._prevRemoved = prev;
    }

    this._insertAfter(record, prevRecord, index);
    this._addToMoves(record, index);
    return record;
  }

  _moveAfter(record: CollectionChangeRecord, prevRecord: CollectionChangeRecord,
             index: int): CollectionChangeRecord {
    this._unlink(record);
    this._insertAfter(record, prevRecord, index);
    this._addToMoves(record, index);
    return record;
  }

  _addAfter(record: CollectionChangeRecord, prevRecord: CollectionChangeRecord,
            index: int): CollectionChangeRecord {
    this._insertAfter(record, prevRecord, index);

    if (this._additionsTail === null) {
      // todo(vicb)
      // assert(this._additionsHead === null);
      this._additionsTail = this._additionsHead = record;
    } else {
      // todo(vicb)
      // assert(_additionsTail._nextAdded === null);
      // assert(record._nextAdded === null);
      this._additionsTail = this._additionsTail._nextAdded = record;
    }
    return record;
  }

  _insertAfter(record: CollectionChangeRecord, prevRecord: CollectionChangeRecord,
               index: int): CollectionChangeRecord {
    // todo(vicb)
    // assert(record != prevRecord);
    // assert(record._next === null);
    // assert(record._prev === null);

    var next: CollectionChangeRecord = prevRecord === null ? this._itHead : prevRecord._next;
    // todo(vicb)
    // assert(next != record);
    // assert(prevRecord != record);
    record._next = next;
    record._prev = prevRecord;
    if (next === null) {
      this._itTail = record;
    } else {
      next._prev = record;
    }
    if (prevRecord === null) {
      this._itHead = record;
    } else {
      prevRecord._next = record;
    }

    if (this._linkedRecords === null) {
      this._linkedRecords = new _DuplicateMap();
    }
    this._linkedRecords.put(record);

    record.currentIndex = index;
    return record;
  }

  _remove(record: CollectionChangeRecord): CollectionChangeRecord {
    return this._addToRemovals(this._unlink(record));
  }

  _unlink(record: CollectionChangeRecord): CollectionChangeRecord {
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
    } else {
      prev._next = next;
    }
    if (next === null) {
      this._itTail = prev;
    } else {
      next._prev = prev;
    }

    return record;
  }

  _addToMoves(record: CollectionChangeRecord, toIndex: int): CollectionChangeRecord {
    // todo(vicb)
    // assert(record._nextMoved === null);

    if (record.previousIndex === toIndex) {
      return record;
    }

    if (this._movesTail === null) {
      // todo(vicb)
      // assert(_movesHead === null);
      this._movesTail = this._movesHead = record;
    } else {
      // todo(vicb)
      // assert(_movesTail._nextMoved === null);
      this._movesTail = this._movesTail._nextMoved = record;
    }

    return record;
  }

  _addToRemovals(record: CollectionChangeRecord): CollectionChangeRecord {
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
    } else {
      // todo(vicb)
      // assert(_removalsTail._nextRemoved === null);
      // assert(record._nextRemoved === null);
      record._prevRemoved = this._removalsTail;
      this._removalsTail = this._removalsTail._nextRemoved = record;
    }
    return record;
  }

  toString(): string {
    var record: CollectionChangeRecord;

    var list = [];
    for (record = this._itHead; record !== null; record = record._next) {
      ListWrapper.push(list, record);
    }

    var previous = [];
    for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
      ListWrapper.push(previous, record);
    }

    var additions = [];
    for (record = this._additionsHead; record !== null; record = record._nextAdded) {
      ListWrapper.push(additions, record);
    }
    var moves = [];
    for (record = this._movesHead; record !== null; record = record._nextMoved) {
      ListWrapper.push(moves, record);
    }

    var removals = [];
    for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
      ListWrapper.push(removals, record);
    }

    return "collection: " + list.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" +
           "additions: " + additions.join(', ') + "\n" + "moves: " + moves.join(', ') + "\n" +
           "removals: " + removals.join(', ') + "\n";
  }
}

/**
 * @exportedAs angular2/pipes
 */
export class CollectionChangeRecord {
  currentIndex: int;
  previousIndex: int;
  item;

  _nextPrevious: CollectionChangeRecord;
  _prev: CollectionChangeRecord;
  _next: CollectionChangeRecord;
  _prevDup: CollectionChangeRecord;
  _nextDup: CollectionChangeRecord;
  _prevRemoved: CollectionChangeRecord;
  _nextRemoved: CollectionChangeRecord;
  _nextAdded: CollectionChangeRecord;
  _nextMoved: CollectionChangeRecord;

  constructor(item) {
    this.currentIndex = null;
    this.previousIndex = null;
    this.item = item;

    this._nextPrevious = null;
    this._prev = null;
    this._next = null;
    this._prevDup = null;
    this._nextDup = null;
    this._prevRemoved = null;
    this._nextRemoved = null;
    this._nextAdded = null;
    this._nextMoved = null;
  }

  toString(): string {
    return this.previousIndex === this.currentIndex ?
               stringify(this.item) :
               stringify(this.item) + '[' + stringify(this.previousIndex) + '->' +
                   stringify(this.currentIndex) + ']';
  }
}

// A linked list of CollectionChangeRecords with the same CollectionChangeRecord.item
class _DuplicateItemRecordList {
  _head: CollectionChangeRecord;
  _tail: CollectionChangeRecord;

  constructor() {
    this._head = null;
    this._tail = null;
  }

  /**
   * Append the record to the list of duplicates.
   *
   * Note: by design all records in the list of duplicates hold the same value in record.item.
   */
  add(record: CollectionChangeRecord) {
    if (this._head === null) {
      this._head = this._tail = record;
      record._nextDup = null;
      record._prevDup = null;
    } else {
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
  get(item, afterIndex: int): CollectionChangeRecord {
    var record: CollectionChangeRecord;
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
  remove(record: CollectionChangeRecord): boolean {
    // todo(vicb)
    // assert(() {
    //  // verify that the record being removed is in the list.
    //  for (CollectionChangeRecord cursor = _head; cursor != null; cursor = cursor._nextDup) {
    //    if (identical(cursor, record)) return true;
    //  }
    //  return false;
    //});

    var prev: CollectionChangeRecord = record._prevDup;
    var next: CollectionChangeRecord = record._nextDup;
    if (prev === null) {
      this._head = next;
    } else {
      prev._nextDup = next;
    }
    if (next === null) {
      this._tail = prev;
    } else {
      next._prevDup = prev;
    }
    return this._head === null;
  }
}

class _DuplicateMap {
  map: Map<any, _DuplicateItemRecordList>;
  constructor() { this.map = MapWrapper.create(); }

  put(record: CollectionChangeRecord) {
    // todo(vicb) handle corner cases
    var key = getMapKey(record.item);

    var duplicates = MapWrapper.get(this.map, key);
    if (!isPresent(duplicates)) {
      duplicates = new _DuplicateItemRecordList();
      MapWrapper.set(this.map, key, duplicates);
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
  get(value, afterIndex = null): CollectionChangeRecord {
    var key = getMapKey(value);

    var recordList = MapWrapper.get(this.map, key);
    return isBlank(recordList) ? null : recordList.get(value, afterIndex);
  }

  /**
   * Removes a {@link CollectionChangeRecord} from the list of duplicates.
   *
   * The list of duplicates also is removed from the map if it gets empty.
   */
  remove(record: CollectionChangeRecord): CollectionChangeRecord {
    var key = getMapKey(record.item);
    // todo(vicb)
    // assert(this.map.containsKey(key));
    var recordList: _DuplicateItemRecordList = MapWrapper.get(this.map, key);
    // Remove the list of duplicates when it gets empty
    if (recordList.remove(record)) {
      MapWrapper.delete(this.map, key);
    }
    return record;
  }

  get isEmpty(): boolean { return MapWrapper.size(this.map) === 0; }

  clear() { MapWrapper.clear(this.map); }

  toString(): string { return '_DuplicateMap(' + stringify(this.map) + ')'; }
}
