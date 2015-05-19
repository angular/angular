import {ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {stringify, looseIdentical, isJsObject, CONST} from 'angular2/src/facade/lang';

import {WrappedValue, Pipe, PipeFactory} from './pipe';

/**
 * @exportedAs angular2/pipes
 */
@CONST()
export class KeyValueChangesFactory extends PipeFactory {
  constructor() { super(); }

  supports(obj): boolean { return KeyValueChanges.supportsObj(obj); }

  create(cdRef): Pipe { return new KeyValueChanges(); }
}

/**
 * @exportedAs angular2/pipes
 */
export class KeyValueChanges extends Pipe {
  private _records: Map<any, any>;
  private _mapHead: KVChangeRecord;
  private _previousMapHead: KVChangeRecord;
  private _changesHead: KVChangeRecord;
  private _changesTail: KVChangeRecord;
  private _additionsHead: KVChangeRecord;
  private _additionsTail: KVChangeRecord;
  private _removalsHead: KVChangeRecord;
  private _removalsTail: KVChangeRecord;

  constructor() {
    super();
    this._records = MapWrapper.create();
    this._mapHead = null;
    this._previousMapHead = null;
    this._changesHead = null;
    this._changesTail = null;
    this._additionsHead = null;
    this._additionsTail = null;
    this._removalsHead = null;
    this._removalsTail = null;
  }

  static supportsObj(obj): boolean { return obj instanceof Map || isJsObject(obj); }

  supports(obj): boolean { return KeyValueChanges.supportsObj(obj); }

  transform(map): any {
    if (this.check(map)) {
      return WrappedValue.wrap(this);
    } else {
      return this;
    }
  }

  get isDirty(): boolean {
    return this._additionsHead !== null || this._changesHead !== null ||
           this._removalsHead !== null;
  }

  forEachItem(fn: Function) {
    var record: KVChangeRecord;
    for (record = this._mapHead; record !== null; record = record._next) {
      fn(record);
    }
  }

  forEachPreviousItem(fn: Function) {
    var record: KVChangeRecord;
    for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
      fn(record);
    }
  }

  forEachChangedItem(fn: Function) {
    var record: KVChangeRecord;
    for (record = this._changesHead; record !== null; record = record._nextChanged) {
      fn(record);
    }
  }

  forEachAddedItem(fn: Function) {
    var record: KVChangeRecord;
    for (record = this._additionsHead; record !== null; record = record._nextAdded) {
      fn(record);
    }
  }

  forEachRemovedItem(fn: Function) {
    var record: KVChangeRecord;
    for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
      fn(record);
    }
  }

  check(map): boolean {
    this._reset();
    var records = this._records;
    var oldSeqRecord: KVChangeRecord = this._mapHead;
    var lastOldSeqRecord: KVChangeRecord = null;
    var lastNewSeqRecord: KVChangeRecord = null;
    var seqChanged: boolean = false;

    this._forEach(map, (value, key) => {
      var newSeqRecord;
      if (oldSeqRecord !== null && key === oldSeqRecord.key) {
        newSeqRecord = oldSeqRecord;
        if (!looseIdentical(value, oldSeqRecord.currentValue)) {
          oldSeqRecord.previousValue = oldSeqRecord.currentValue;
          oldSeqRecord.currentValue = value;
          this._addToChanges(oldSeqRecord);
        }
      } else {
        seqChanged = true;
        if (oldSeqRecord !== null) {
          oldSeqRecord._next = null;
          this._removeFromSeq(lastOldSeqRecord, oldSeqRecord);
          this._addToRemovals(oldSeqRecord);
        }
        if (MapWrapper.contains(records, key)) {
          newSeqRecord = MapWrapper.get(records, key);
        } else {
          newSeqRecord = new KVChangeRecord(key);
          MapWrapper.set(records, key, newSeqRecord);
          newSeqRecord.currentValue = value;
          this._addToAdditions(newSeqRecord);
        }
      }

      if (seqChanged) {
        if (this._isInRemovals(newSeqRecord)) {
          this._removeFromRemovals(newSeqRecord);
        }
        if (lastNewSeqRecord == null) {
          this._mapHead = newSeqRecord;
        } else {
          lastNewSeqRecord._next = newSeqRecord;
        }
      }
      lastOldSeqRecord = oldSeqRecord;
      lastNewSeqRecord = newSeqRecord;
      oldSeqRecord = oldSeqRecord === null ? null : oldSeqRecord._next;
    });
    this._truncate(lastOldSeqRecord, oldSeqRecord);
    return this.isDirty;
  }

  _reset() {
    if (this.isDirty) {
      var record: KVChangeRecord;
      // Record the state of the mapping
      for (record = this._previousMapHead = this._mapHead; record !== null; record = record._next) {
        record._nextPrevious = record._next;
      }

      for (record = this._changesHead; record !== null; record = record._nextChanged) {
        record.previousValue = record.currentValue;
      }

      for (record = this._additionsHead; record != null; record = record._nextAdded) {
        record.previousValue = record.currentValue;
      }

      // todo(vicb) once assert is supported
      // assert(() {
      //  var r = _changesHead;
      //  while (r != null) {
      //    var nextRecord = r._nextChanged;
      //    r._nextChanged = null;
      //    r = nextRecord;
      //  }
      //
      //  r = _additionsHead;
      //  while (r != null) {
      //    var nextRecord = r._nextAdded;
      //    r._nextAdded = null;
      //    r = nextRecord;
      //  }
      //
      //  r = _removalsHead;
      //  while (r != null) {
      //    var nextRecord = r._nextRemoved;
      //    r._nextRemoved = null;
      //    r = nextRecord;
      //  }
      //
      //  return true;
      //});
      this._changesHead = this._changesTail = null;
      this._additionsHead = this._additionsTail = null;
      this._removalsHead = this._removalsTail = null;
    }
  }

  _truncate(lastRecord: KVChangeRecord, record: KVChangeRecord) {
    while (record !== null) {
      if (lastRecord === null) {
        this._mapHead = null;
      } else {
        lastRecord._next = null;
      }
      var nextRecord = record._next;
      // todo(vicb) assert
      // assert((() {
      //  record._next = null;
      //  return true;
      //}));
      this._addToRemovals(record);
      lastRecord = record;
      record = nextRecord;
    }

    for (var rec: KVChangeRecord = this._removalsHead; rec !== null; rec = rec._nextRemoved) {
      rec.previousValue = rec.currentValue;
      rec.currentValue = null;
      MapWrapper.delete(this._records, rec.key);
    }
  }

  _isInRemovals(record: KVChangeRecord) {
    return record === this._removalsHead || record._nextRemoved !== null ||
           record._prevRemoved !== null;
  }

  _addToRemovals(record: KVChangeRecord) {
    // todo(vicb) assert
    // assert(record._next == null);
    // assert(record._nextAdded == null);
    // assert(record._nextChanged == null);
    // assert(record._nextRemoved == null);
    // assert(record._prevRemoved == null);
    if (this._removalsHead === null) {
      this._removalsHead = this._removalsTail = record;
    } else {
      this._removalsTail._nextRemoved = record;
      record._prevRemoved = this._removalsTail;
      this._removalsTail = record;
    }
  }

  _removeFromSeq(prev: KVChangeRecord, record: KVChangeRecord) {
    var next = record._next;
    if (prev === null) {
      this._mapHead = next;
    } else {
      prev._next = next;
    }
    // todo(vicb) assert
    // assert((() {
    //  record._next = null;
    //  return true;
    //})());
  }

  _removeFromRemovals(record: KVChangeRecord) {
    // todo(vicb) assert
    // assert(record._next == null);
    // assert(record._nextAdded == null);
    // assert(record._nextChanged == null);

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
    record._prevRemoved = record._nextRemoved = null;
  }

  _addToAdditions(record: KVChangeRecord) {
    // todo(vicb): assert
    // assert(record._next == null);
    // assert(record._nextAdded == null);
    // assert(record._nextChanged == null);
    // assert(record._nextRemoved == null);
    // assert(record._prevRemoved == null);
    if (this._additionsHead === null) {
      this._additionsHead = this._additionsTail = record;
    } else {
      this._additionsTail._nextAdded = record;
      this._additionsTail = record;
    }
  }

  _addToChanges(record: KVChangeRecord) {
    // todo(vicb) assert
    // assert(record._nextAdded == null);
    // assert(record._nextChanged == null);
    // assert(record._nextRemoved == null);
    // assert(record._prevRemoved == null);
    if (this._changesHead === null) {
      this._changesHead = this._changesTail = record;
    } else {
      this._changesTail._nextChanged = record;
      this._changesTail = record;
    }
  }

  toString(): string {
    var items = [];
    var previous = [];
    var changes = [];
    var additions = [];
    var removals = [];
    var record: KVChangeRecord;

    for (record = this._mapHead; record !== null; record = record._next) {
      ListWrapper.push(items, stringify(record));
    }
    for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
      ListWrapper.push(previous, stringify(record));
    }
    for (record = this._changesHead; record !== null; record = record._nextChanged) {
      ListWrapper.push(changes, stringify(record));
    }
    for (record = this._additionsHead; record !== null; record = record._nextAdded) {
      ListWrapper.push(additions, stringify(record));
    }
    for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
      ListWrapper.push(removals, stringify(record));
    }

    return "map: " + items.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" +
           "additions: " + additions.join(', ') + "\n" + "changes: " + changes.join(', ') + "\n" +
           "removals: " + removals.join(', ') + "\n";
  }

  _forEach(obj, fn: Function) {
    if (obj instanceof Map) {
      MapWrapper.forEach(obj, fn);
    } else {
      StringMapWrapper.forEach(obj, fn);
    }
  }
}



/**
 * @exportedAs angular2/pipes
 */
export class KVChangeRecord {
  key;
  previousValue;
  currentValue;

  _nextPrevious: KVChangeRecord;
  _next: KVChangeRecord;
  _nextAdded: KVChangeRecord;
  _nextRemoved: KVChangeRecord;
  _prevRemoved: KVChangeRecord;
  _nextChanged: KVChangeRecord;

  constructor(key) {
    this.key = key;
    this.previousValue = null;
    this.currentValue = null;

    this._nextPrevious = null;
    this._next = null;
    this._nextAdded = null;
    this._nextRemoved = null;
    this._prevRemoved = null;
    this._nextChanged = null;
  }

  toString(): string {
    return looseIdentical(this.previousValue, this.currentValue) ?
               stringify(this.key) :
               (stringify(this.key) + '[' + stringify(this.previousValue) + '->' +
                stringify(this.currentValue) + ']');
  }
}
