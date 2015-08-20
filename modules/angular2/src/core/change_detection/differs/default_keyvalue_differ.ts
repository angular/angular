import {ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {
  stringify,
  looseIdentical,
  isJsObject,
  CONST,
  isBlank,
  BaseException
} from 'angular2/src/core/facade/lang';
import {ChangeDetectorRef} from '../change_detector_ref';
import {KeyValueDiffer, KeyValueDifferFactory} from '../differs/keyvalue_differs';

@CONST()
export class DefaultKeyValueDifferFactory implements KeyValueDifferFactory {
  supports(obj: any): boolean { return obj instanceof Map || isJsObject(obj); }

  create(cdRef: ChangeDetectorRef): KeyValueDiffer { return new DefaultKeyValueDiffer(); }
}

export class DefaultKeyValueDiffer implements KeyValueDiffer {
  private _records: Map<any, any> = new Map();
  private _mapHead: KVChangeRecord = null;
  private _previousMapHead: KVChangeRecord = null;
  private _changesHead: KVChangeRecord = null;
  private _changesTail: KVChangeRecord = null;
  private _additionsHead: KVChangeRecord = null;
  private _additionsTail: KVChangeRecord = null;
  private _removalsHead: KVChangeRecord = null;
  private _removalsTail: KVChangeRecord = null;

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

  diff(map: Map<any, any>): any {
    if (isBlank(map)) map = MapWrapper.createFromPairs([]);
    if (!(map instanceof Map || isJsObject(map))) {
      throw new BaseException(`Error trying to diff '${map}'`);
    }

    if (this.check(map)) {
      return this;
    } else {
      return null;
    }
  }

  onDestroy() {}

  check(map: Map<any, any>): boolean {
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
        if (records.has(key)) {
          newSeqRecord = records.get(key);
        } else {
          newSeqRecord = new KVChangeRecord(key);
          records.set(key, newSeqRecord);
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
      items.push(stringify(record));
    }
    for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
      previous.push(stringify(record));
    }
    for (record = this._changesHead; record !== null; record = record._nextChanged) {
      changes.push(stringify(record));
    }
    for (record = this._additionsHead; record !== null; record = record._nextAdded) {
      additions.push(stringify(record));
    }
    for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
      removals.push(stringify(record));
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


export class KVChangeRecord {
  previousValue: any = null;
  currentValue: any = null;

  _nextPrevious: KVChangeRecord = null;
  _next: KVChangeRecord = null;
  _nextAdded: KVChangeRecord = null;
  _nextRemoved: KVChangeRecord = null;
  _prevRemoved: KVChangeRecord = null;
  _nextChanged: KVChangeRecord = null;

  constructor(public key: any) {}

  toString(): string {
    return looseIdentical(this.previousValue, this.currentValue) ?
               stringify(this.key) :
               (stringify(this.key) + '[' + stringify(this.previousValue) + '->' +
                stringify(this.currentValue) + ']');
  }
}
