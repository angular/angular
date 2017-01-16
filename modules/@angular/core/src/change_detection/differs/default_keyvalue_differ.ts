/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StringMapWrapper} from '../../facade/collection';
import {isJsObject, looseIdentical, stringify} from '../../facade/lang';
import {ChangeDetectorRef} from '../change_detector_ref';

import {KeyValueChangeRecord, KeyValueChanges, KeyValueDiffer, KeyValueDifferFactory} from './keyvalue_differs';


export class DefaultKeyValueDifferFactory<K, V> implements KeyValueDifferFactory {
  constructor() {}
  supports(obj: any): boolean { return obj instanceof Map || isJsObject(obj); }

  create<K, V>(cdRef: ChangeDetectorRef): KeyValueDiffer<K, V> {
    return new DefaultKeyValueDiffer<K, V>();
  }
}

export class DefaultKeyValueDiffer<K, V> implements KeyValueDiffer<K, V>, KeyValueChanges<K, V> {
  private _records: Map<K, V> = new Map<K, V>();
  private _mapHead: KeyValueChangeRecord_<K, V> = null;
  private _previousMapHead: KeyValueChangeRecord_<K, V> = null;
  private _changesHead: KeyValueChangeRecord_<K, V> = null;
  private _changesTail: KeyValueChangeRecord_<K, V> = null;
  private _additionsHead: KeyValueChangeRecord_<K, V> = null;
  private _additionsTail: KeyValueChangeRecord_<K, V> = null;
  private _removalsHead: KeyValueChangeRecord_<K, V> = null;
  private _removalsTail: KeyValueChangeRecord_<K, V> = null;

  get isDirty(): boolean {
    return this._additionsHead !== null || this._changesHead !== null ||
        this._removalsHead !== null;
  }

  forEachItem(fn: (r: KeyValueChangeRecord<K, V>) => void) {
    let record: KeyValueChangeRecord_<K, V>;
    for (record = this._mapHead; record !== null; record = record._next) {
      fn(record);
    }
  }

  forEachPreviousItem(fn: (r: KeyValueChangeRecord<K, V>) => void) {
    let record: KeyValueChangeRecord_<K, V>;
    for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
      fn(record);
    }
  }

  forEachChangedItem(fn: (r: KeyValueChangeRecord<K, V>) => void) {
    let record: KeyValueChangeRecord_<K, V>;
    for (record = this._changesHead; record !== null; record = record._nextChanged) {
      fn(record);
    }
  }

  forEachAddedItem(fn: (r: KeyValueChangeRecord<K, V>) => void) {
    let record: KeyValueChangeRecord_<K, V>;
    for (record = this._additionsHead; record !== null; record = record._nextAdded) {
      fn(record);
    }
  }

  forEachRemovedItem(fn: (r: KeyValueChangeRecord<K, V>) => void) {
    let record: KeyValueChangeRecord_<K, V>;
    for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
      fn(record);
    }
  }

  diff(map: Map<any, any>|{[k: string]: any}): any {
    if (!map) {
      map = new Map();
    } else if (!(map instanceof Map || isJsObject(map))) {
      throw new Error(`Error trying to diff '${map}'`);
    }

    return this.check(map) ? this : null;
  }

  onDestroy() {}

  check(map: Map<any, any>|{[k: string]: any}): boolean {
    this._reset();
    const records = this._records;
    let oldSeqRecord: KeyValueChangeRecord_<K, V> = this._mapHead;
    let lastOldSeqRecord: KeyValueChangeRecord_<K, V> = null;
    let lastNewSeqRecord: KeyValueChangeRecord_<K, V> = null;
    let seqChanged: boolean = false;

    this._forEach(map, (value: any, key: any) => {
      let newSeqRecord: any;
      if (oldSeqRecord && key === oldSeqRecord.key) {
        newSeqRecord = oldSeqRecord;
        this._maybeAddToChanges(newSeqRecord, value);
      } else {
        seqChanged = true;
        if (oldSeqRecord !== null) {
          this._removeFromSeq(lastOldSeqRecord, oldSeqRecord);
          this._addToRemovals(oldSeqRecord);
        }
        if (records.has(key)) {
          newSeqRecord = records.get(key);
          this._maybeAddToChanges(newSeqRecord, value);
        } else {
          newSeqRecord = new KeyValueChangeRecord_<K, V>(key);
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
      oldSeqRecord = oldSeqRecord && oldSeqRecord._next;
    });
    this._truncate(lastOldSeqRecord, oldSeqRecord);
    return this.isDirty;
  }

  /** @internal */
  _reset() {
    if (this.isDirty) {
      let record: KeyValueChangeRecord_<K, V>;
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

      this._changesHead = this._changesTail = null;
      this._additionsHead = this._additionsTail = null;
      this._removalsHead = this._removalsTail = null;
    }
  }

  private _truncate(lastRecord: KeyValueChangeRecord_<K, V>, record: KeyValueChangeRecord_<K, V>) {
    while (record !== null) {
      if (lastRecord === null) {
        this._mapHead = null;
      } else {
        lastRecord._next = null;
      }
      const nextRecord = record._next;
      this._addToRemovals(record);
      lastRecord = record;
      record = nextRecord;
    }

    for (let rec: KeyValueChangeRecord_<K, V> = this._removalsHead; rec !== null;
         rec = rec._nextRemoved) {
      rec.previousValue = rec.currentValue;
      rec.currentValue = null;
      this._records.delete(rec.key);
    }
  }

  private _maybeAddToChanges(record: KeyValueChangeRecord_<K, V>, newValue: any): void {
    if (!looseIdentical(newValue, record.currentValue)) {
      record.previousValue = record.currentValue;
      record.currentValue = newValue;
      this._addToChanges(record);
    }
  }

  private _isInRemovals(record: KeyValueChangeRecord_<K, V>) {
    return record === this._removalsHead || record._nextRemoved !== null ||
        record._prevRemoved !== null;
  }

  private _addToRemovals(record: KeyValueChangeRecord_<K, V>) {
    if (this._removalsHead === null) {
      this._removalsHead = this._removalsTail = record;
    } else {
      this._removalsTail._nextRemoved = record;
      record._prevRemoved = this._removalsTail;
      this._removalsTail = record;
    }
  }

  private _removeFromSeq(prev: KeyValueChangeRecord_<K, V>, record: KeyValueChangeRecord_<K, V>) {
    const next = record._next;
    if (prev === null) {
      this._mapHead = next;
    } else {
      prev._next = next;
    }
    record._next = null;
  }

  private _removeFromRemovals(record: KeyValueChangeRecord_<K, V>) {
    const prev = record._prevRemoved;
    const next = record._nextRemoved;
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

  private _addToAdditions(record: KeyValueChangeRecord_<K, V>) {
    if (this._additionsHead === null) {
      this._additionsHead = this._additionsTail = record;
    } else {
      this._additionsTail._nextAdded = record;
      this._additionsTail = record;
    }
  }

  private _addToChanges(record: KeyValueChangeRecord_<K, V>) {
    if (this._changesHead === null) {
      this._changesHead = this._changesTail = record;
    } else {
      this._changesTail._nextChanged = record;
      this._changesTail = record;
    }
  }

  toString(): string {
    const items: any[] = [];
    const previous: any[] = [];
    const changes: any[] = [];
    const additions: any[] = [];
    const removals: any[] = [];
    let record: KeyValueChangeRecord_<K, V>;

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

    return 'map: ' + items.join(', ') + '\n' +
        'previous: ' + previous.join(', ') + '\n' +
        'additions: ' + additions.join(', ') + '\n' +
        'changes: ' + changes.join(', ') + '\n' +
        'removals: ' + removals.join(', ') + '\n';
  }

  /** @internal */
  private _forEach<K, V>(obj: Map<K, V>|{[k: string]: V}, fn: (v: V, k: any) => void) {
    if (obj instanceof Map) {
      obj.forEach(fn);
    } else {
      Object.keys(obj).forEach(k => fn(obj[k], k));
    }
  }
}


/**
 * @stable
 */
class KeyValueChangeRecord_<K, V> implements KeyValueChangeRecord<K, V> {
  previousValue: V = null;
  currentValue: V = null;

  /** @internal */
  _nextPrevious: KeyValueChangeRecord_<K, V> = null;
  /** @internal */
  _next: KeyValueChangeRecord_<K, V> = null;
  /** @internal */
  _nextAdded: KeyValueChangeRecord_<K, V> = null;
  /** @internal */
  _nextRemoved: KeyValueChangeRecord_<K, V> = null;
  /** @internal */
  _prevRemoved: KeyValueChangeRecord_<K, V> = null;
  /** @internal */
  _nextChanged: KeyValueChangeRecord_<K, V> = null;

  constructor(public key: K) {}

  toString(): string {
    return looseIdentical(this.previousValue, this.currentValue) ?
        stringify(this.key) :
        (stringify(this.key) + '[' + stringify(this.previousValue) + '->' +
         stringify(this.currentValue) + ']');
  }
}
