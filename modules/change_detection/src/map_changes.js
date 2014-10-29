import {ListWrapper, MapWrapper} from 'facade/collection';

import {stringify, looseIdentical} from 'facade/lang';

export class MapChanges {
  // todo(vicb) add as fields when supported
  /*
  final _records = new HashMap<dynamic, MapKeyValue>();
  Map _map;

  Map get map => _map;

  MapKeyValue<K, V> _mapHead;
  MapKeyValue<K, V> _previousMapHead;
  MapKeyValue<K, V> _changesHead, _changesTail;
  MapKeyValue<K, V> _additionsHead, _additionsTail;
  MapKeyValue<K, V> _removalsHead, _removalsTail;
  */

  constructor() {
    this._records = MapWrapper.create();
    this._map = null;
    this._mapHead = null;
    this._previousMapHead = null;
    this._changesHead = null;
    this._changesTail = null;
    this._additionsHead = null;
    this._additionsTail = null;
    this._removalsHead = null;
    this._removalsTail = null;
  }

  get isDirty():boolean {
    return this._additionsHead !== null ||
           this._changesHead !== null ||
           this._removalsHead !== null;
  }

    forEachItem(fn:Function) {
      var record:MapChangeRecord;
      for (record = this._mapHead; record !== null; record = record._next) {
        fn(record);
      }
    }

    forEachPreviousItem(fn:Function) {
      var record:MapChangeRecord;
      for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
        fn(record);
      }
    }

    forEachChangedItem(fn:Function) {
      var record:MapChangeRecord;
      for (record = this._changesHead; record !== null; record = record._nextChanged) {
        fn(record);
      }
    }

    forEachAddedItem(fn:Function){
      var record:MapChangeRecord;
      for (record = this._additionsHead; record !== null; record = record._nextAdded) {
        fn(record);
      }
    }

    forEachRemovedItem(fn:Function){
      var record:MapChangeRecord;
      for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
        fn(record);
      }
    }

  check(map):boolean {
    this._reset();
    this._map = map;
    var records = this._records;
    var oldSeqRecord:MapChangeRecord = this._mapHead;
    var lastOldSeqRecord:MapChangeRecord = null;
    var lastNewSeqRecord:MapChangeRecord = null;
    var seqChanged:boolean = false;

    MapWrapper.forEach(map, (value, key) => {
      var newSeqRecord;
      if (oldSeqRecord !== null && key === oldSeqRecord.key) {
        newSeqRecord = oldSeqRecord;
        if (!looseIdentical(value, oldSeqRecord._currentValue)) {
          oldSeqRecord._previousValue = oldSeqRecord._currentValue;
          oldSeqRecord._currentValue = value;
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
          newSeqRecord = new MapChangeRecord(key);
          MapWrapper.set(records, key, newSeqRecord);
          newSeqRecord._currentValue = value;
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
      var record:MapChangeRecord;
      // Record the state of the mapping
      for (record = this._previousMapHead = this._mapHead;
           record !== null;
           record = record._next) {
        record._nextPrevious = record._next;
      }

      for (record = this._changesHead; record !== null; record = record._nextChanged) {
        record._previousValue = record._currentValue;
      }

      for (record = this._additionsHead; record != null; record = record._nextAdded) {
        record._previousValue = record._currentValue;
      }

      // todo(vicb) once assert is supported
      //assert(() {
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

  _truncate(lastRecord:MapChangeRecord, record:MapChangeRecord) {
    while (record !== null) {
      if (lastRecord === null) {
        this._mapHead = null;
      } else {
        lastRecord._next = null;
      }
      var nextRecord = record._next;
      // todo(vicb) assert
      //assert((() {
      //  record._next = null;
      //  return true;
      //}));
      this._addToRemovals(record);
      lastRecord = record;
      record = nextRecord;
    }

    for (var rec:MapChangeRecord = this._removalsHead; rec !== null; rec = rec._nextRemoved) {
      rec._previousValue = rec._currentValue;
      rec._currentValue = null;
      MapWrapper.delete(this._records, rec.key);
    }
  }

  _isInRemovals(record:MapChangeRecord) {
    return record === this._removalsHead ||
           record._nextRemoved !== null ||
           record._prevRemoved !== null;
  }

  _addToRemovals(record:MapChangeRecord) {
    // todo(vicb) assert
    //assert(record._next == null);
    //assert(record._nextAdded == null);
    //assert(record._nextChanged == null);
    //assert(record._nextRemoved == null);
    //assert(record._prevRemoved == null);
    if (this._removalsHead === null) {
      this._removalsHead = this._removalsTail = record;
    } else {
      this._removalsTail._nextRemoved = record;
      record._prevRemoved = this._removalsTail;
      this._removalsTail = record;
    }
  }

  _removeFromSeq(prev:MapChangeRecord, record:MapChangeRecord) {
    var next = record._next;
    if (prev === null) {
      this._mapHead = next;
    } else {
      prev._next = next;
    }
    // todo(vicb) assert
    //assert((() {
    //  record._next = null;
    //  return true;
    //})());
  }

  _removeFromRemovals(record:MapChangeRecord) {
    // todo(vicb) assert
    //assert(record._next == null);
    //assert(record._nextAdded == null);
    //assert(record._nextChanged == null);

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

  _addToAdditions(record:MapChangeRecord) {
    // todo(vicb): assert
    //assert(record._next == null);
    //assert(record._nextAdded == null);
    //assert(record._nextChanged == null);
    //assert(record._nextRemoved == null);
    //assert(record._prevRemoved == null);
    if (this._additionsHead === null) {
      this._additionsHead = this._additionsTail = record;
    } else {
      this._additionsTail._nextAdded = record;
      this._additionsTail = record;
    }
  }

  _addToChanges(record:MapChangeRecord) {
    // todo(vicb) assert
    //assert(record._nextAdded == null);
    //assert(record._nextChanged == null);
    //assert(record._nextRemoved == null);
    //assert(record._prevRemoved == null);
    if (this._changesHead === null) {
      this._changesHead = this._changesTail = record;
    } else {
      this._changesTail._nextChanged = record;
      this._changesTail = record;
    }
  }

  toString():string {
    var items = [];
    var previous = [];
    var changes = [];
    var additions = [];
    var removals = [];
    var record:MapChangeRecord;

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

    return "map: " + items.join(', ') + "\n" +
           "previous: " + previous.join(', ') + "\n" +
           "additions: " + additions.join(', ') + "\n" +
           "changes: " + changes.join(', ') + "\n" +
           "removals: " + removals.join(', ') + "\n";
  }
}

export class MapChangeRecord {
  // todo(vicb) add as fields
  //final K key;
  //V _previousValue, _currentValue;
  //
  //V get previousValue => _previousValue;
  //V get currentValue => _currentValue;
  //
  //MapKeyValue<K, V> _nextPrevious;
  //MapKeyValue<K, V> _next;
  //MapKeyValue<K, V> _nextAdded;
  //MapKeyValue<K, V> _nextRemoved, _prevRemoved;
  //MapKeyValue<K, V> _nextChanged;

  constructor(key) {
    this.key = key;
    this._previousValue = null;
    this._currentValue = null;

    this._nextPrevious = null;
    this._next = null;
    this._nextAdded = null;
    this._nextRemoved = null;
    this._prevRemoved = null;
    this._nextChanged = null;
  }

  toString():string {
    return looseIdentical(this._previousValue, this._currentValue) ?
      stringify(this.key) :
      (stringify(this.key) + '[' + stringify(this._previousValue) + '->' +
        stringify(this._currentValue) + ']');
  }

}
