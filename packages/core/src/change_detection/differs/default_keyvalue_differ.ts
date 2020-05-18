/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {stringify} from '../../util/stringify';
import {isJsObject} from '../change_detection_util';
import {KeyValueChangeRecord, KeyValueChanges, KeyValueDiffer, KeyValueDifferFactory} from './keyvalue_differs';


export class DefaultKeyValueDifferFactory<K, V> implements KeyValueDifferFactory {
  constructor() {}
  supports(obj: any): boolean {
    return obj instanceof Map || isJsObject(obj);
  }

  create<K, V>(): KeyValueDiffer<K, V> {
    return new DefaultKeyValueDiffer<K, V>();
  }
}

export class DefaultKeyValueDiffer<K, V> implements KeyValueDiffer<K, V>, KeyValueChanges<K, V> {
  private _records = new Map<K, KeyValueChangeRecord_<K, V>>();
  private _mapHead: KeyValueChangeRecord_<K, V>|null = null;
  // _appendAfter is used in the check loop
  private _appendAfter: KeyValueChangeRecord_<K, V>|null = null;
  private _previousMapHead: KeyValueChangeRecord_<K, V>|null = null;
  private _changesHead: KeyValueChangeRecord_<K, V>|null = null;
  private _changesTail: KeyValueChangeRecord_<K, V>|null = null;
  private _additionsHead: KeyValueChangeRecord_<K, V>|null = null;
  private _additionsTail: KeyValueChangeRecord_<K, V>|null = null;
  private _removalsHead: KeyValueChangeRecord_<K, V>|null = null;
  private _removalsTail: KeyValueChangeRecord_<K, V>|null = null;

  get isDirty(): boolean {
    return this._additionsHead !== null || this._changesHead !== null ||
        this._removalsHead !== null;
  }

  forEachItem(fn: (r: KeyValueChangeRecord<K, V>) => void) {
    let record: KeyValueChangeRecord_<K, V>|null;
    for (record = this._mapHead; record !== null; record = record._next) {
      fn(record);
    }
  }

  forEachPreviousItem(fn: (r: KeyValueChangeRecord<K, V>) => void) {
    let record: KeyValueChangeRecord_<K, V>|null;
    for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
      fn(record);
    }
  }

  forEachChangedItem(fn: (r: KeyValueChangeRecord<K, V>) => void) {
    let record: KeyValueChangeRecord_<K, V>|null;
    for (record = this._changesHead; record !== null; record = record._nextChanged) {
      fn(record);
    }
  }

  forEachAddedItem(fn: (r: KeyValueChangeRecord<K, V>) => void) {
    let record: KeyValueChangeRecord_<K, V>|null;
    for (record = this._additionsHead; record !== null; record = record._nextAdded) {
      fn(record);
    }
  }

  forEachRemovedItem(fn: (r: KeyValueChangeRecord<K, V>) => void) {
    let record: KeyValueChangeRecord_<K, V>|null;
    for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
      fn(record);
    }
  }

  diff(map?: Map<any, any>|{[k: string]: any}|null): any {
    if (!map) {
      map = new Map();
    } else if (!(map instanceof Map || isJsObject(map))) {
      throw new Error(
          `Error trying to diff '${stringify(map)}'. Only maps and objects are allowed`);
    }

    return this.check(map) ? this : null;
  }

  onDestroy() {}

  /**
   * Check the current state of the map vs the previous.
   * The algorithm is optimised for when the keys do no change.
   */
  check(map: Map<any, any>|{[k: string]: any}): boolean {
    this._reset();

    let insertBefore = this._mapHead;
    this._appendAfter = null;

    this._forEach(map, (value: any, key: any) => {
      if (insertBefore && insertBefore.key === key) {
        this._maybeAddToChanges(insertBefore, value);
        this._appendAfter = insertBefore;
        insertBefore = insertBefore._next;
      } else {
        const record = this._getOrCreateRecordForKey(key, value);
        insertBefore = this._insertBeforeOrAppend(insertBefore, record);
      }
    });

    // Items remaining at the end of the list have been deleted
    if (insertBefore) {
      if (insertBefore._prev) {
        insertBefore._prev._next = null;
      }

      this._removalsHead = insertBefore;

      for (let record: KeyValueChangeRecord_<K, V>|null = insertBefore; record !== null;
           record = record._nextRemoved) {
        if (record === this._mapHead) {
          this._mapHead = null;
        }
        this._records.delete(record.key);
        record._nextRemoved = record._next;
        record.previousValue = record.currentValue;
        record.currentValue = null;
        record._prev = null;
        record._next = null;
      }
    }

    // Make sure tails have no next records from previous runs
    if (this._changesTail) this._changesTail._nextChanged = null;
    if (this._additionsTail) this._additionsTail._nextAdded = null;

    return this.isDirty;
  }

  /**
   * Inserts a record before `before` or append at the end of the list when `before` is null.
   *
   * Notes:
   * - This method appends at `this._appendAfter`,
   * - This method updates `this._appendAfter`,
   * - The return value is the new value for the insertion pointer.
   */
  private _insertBeforeOrAppend(
      before: KeyValueChangeRecord_<K, V>|null,
      record: KeyValueChangeRecord_<K, V>): KeyValueChangeRecord_<K, V>|null {
    if (before) {
      const prev = before._prev;
      record._next = before;
      record._prev = prev;
      before._prev = record;
      if (prev) {
        prev._next = record;
      }
      if (before === this._mapHead) {
        this._mapHead = record;
      }

      this._appendAfter = before;
      return before;
    }

    if (this._appendAfter) {
      this._appendAfter._next = record;
      record._prev = this._appendAfter;
    } else {
      this._mapHead = record;
    }

    this._appendAfter = record;
    return null;
  }

  private _getOrCreateRecordForKey(key: K, value: V): KeyValueChangeRecord_<K, V> {
    if (this._records.has(key)) {
      const record = this._records.get(key)!;
      this._maybeAddToChanges(record, value);
      const prev = record._prev;
      const next = record._next;
      if (prev) {
        prev._next = next;
      }
      if (next) {
        next._prev = prev;
      }
      record._next = null;
      record._prev = null;

      return record;
    }

    const record = new KeyValueChangeRecord_<K, V>(key);
    this._records.set(key, record);
    record.currentValue = value;
    this._addToAdditions(record);
    return record;
  }

  /** @internal */
  _reset() {
    if (this.isDirty) {
      let record: KeyValueChangeRecord_<K, V>|null;
      // let `_previousMapHead` contain the state of the map before the changes
      this._previousMapHead = this._mapHead;
      for (record = this._previousMapHead; record !== null; record = record._next) {
        record._nextPrevious = record._next;
      }

      // Update `record.previousValue` with the value of the item before the changes
      // We need to update all changed items (that's those which have been added and changed)
      for (record = this._changesHead; record !== null; record = record._nextChanged) {
        record.previousValue = record.currentValue;
      }
      for (record = this._additionsHead; record != null; record = record._nextAdded) {
        record.previousValue = record.currentValue;
      }

      this._changesHead = this._changesTail = null;
      this._additionsHead = this._additionsTail = null;
      this._removalsHead = null;
    }
  }

  // Add the record or a given key to the list of changes only when the value has actually changed
  private _maybeAddToChanges(record: KeyValueChangeRecord_<K, V>, newValue: any): void {
    if (!Object.is(newValue, record.currentValue)) {
      record.previousValue = record.currentValue;
      record.currentValue = newValue;
      this._addToChanges(record);
    }
  }

  private _addToAdditions(record: KeyValueChangeRecord_<K, V>) {
    if (this._additionsHead === null) {
      this._additionsHead = this._additionsTail = record;
    } else {
      this._additionsTail!._nextAdded = record;
      this._additionsTail = record;
    }
  }

  private _addToChanges(record: KeyValueChangeRecord_<K, V>) {
    if (this._changesHead === null) {
      this._changesHead = this._changesTail = record;
    } else {
      this._changesTail!._nextChanged = record;
      this._changesTail = record;
    }
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

class KeyValueChangeRecord_<K, V> implements KeyValueChangeRecord<K, V> {
  previousValue: V|null = null;
  currentValue: V|null = null;

  /** @internal */
  _nextPrevious: KeyValueChangeRecord_<K, V>|null = null;
  /** @internal */
  _next: KeyValueChangeRecord_<K, V>|null = null;
  /** @internal */
  _prev: KeyValueChangeRecord_<K, V>|null = null;
  /** @internal */
  _nextAdded: KeyValueChangeRecord_<K, V>|null = null;
  /** @internal */
  _nextRemoved: KeyValueChangeRecord_<K, V>|null = null;
  /** @internal */
  _nextChanged: KeyValueChangeRecord_<K, V>|null = null;

  constructor(public key: K) {}
}
