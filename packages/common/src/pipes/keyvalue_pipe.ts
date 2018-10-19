/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KeyValueChangeRecord, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Pipe, PipeTransform} from '@angular/core';

function makeKeyValuePair<K, V>(key: K, value: V): KeyValue<K, V> {
  return {key: key, value: value};
}

/**
 * A key value pair.
 * Usually used to represent the key value pairs from a Map or Object.
 *
 * @publicApi
 */
export interface KeyValue<K, V> {
  key: K;
  value: V;
}

/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms Object or Map into an array of key value pairs.
 *
 * The output array will be ordered by keys.
 * By default the comparator will be by Unicode point value.
 * You can optionally pass a compareFn if your keys are complex types.
 *
 * @usageNotes
 * ### Examples
 *
 * This examples show how an Object or a Map and be iterated by ngFor with the use of this keyvalue
 * pipe.
 *
 * {@example common/pipes/ts/keyvalue_pipe.ts region='KeyValuePipe'}
 *
 * @publicApi
 */
@Pipe({name: 'keyvalue', pure: false})
export class KeyValuePipe implements PipeTransform {
  constructor(private readonly differs: KeyValueDiffers) {}

  // TODO(issue/24571): remove '!'.
  private differ !: KeyValueDiffer<any, any>;
  // TODO(issue/24571): remove '!'.
  private keyValues !: Array<KeyValue<any, any>>;

  transform<K, V>(input: null, compareFn?: (a: KeyValue<K, V>, b: KeyValue<K, V>) => number): null;
  transform<V>(
      input: {[key: string]: V}|Map<string, V>,
      compareFn?: (a: KeyValue<string, V>, b: KeyValue<string, V>) => number):
      Array<KeyValue<string, V>>;
  transform<V>(
      input: {[key: number]: V}|Map<number, V>,
      compareFn?: (a: KeyValue<number, V>, b: KeyValue<number, V>) => number):
      Array<KeyValue<number, V>>;
  transform<K, V>(input: Map<K, V>, compareFn?: (a: KeyValue<K, V>, b: KeyValue<K, V>) => number):
      Array<KeyValue<K, V>>;
  transform<K, V>(
      input: null|{[key: string]: V, [key: number]: V}|Map<K, V>,
      compareFn: (a: KeyValue<K, V>, b: KeyValue<K, V>) => number = defaultComparator):
      Array<KeyValue<K, V>>|null {
    if (!input || (!(input instanceof Map) && typeof input !== 'object')) {
      return null;
    }

    if (!this.differ) {
      // make a differ for whatever type we've been passed in
      this.differ = this.differs.find(input).create();
    }

    const differChanges: KeyValueChanges<K, V>|null = this.differ.diff(input as any);

    if (differChanges) {
      this.keyValues = [];
      differChanges.forEachItem((r: KeyValueChangeRecord<K, V>) => {
        this.keyValues.push(makeKeyValuePair(r.key, r.currentValue !));
      });
      this.keyValues.sort(compareFn);
    }
    return this.keyValues;
  }
}

export function defaultComparator<K, V>(
    keyValueA: KeyValue<K, V>, keyValueB: KeyValue<K, V>): number {
  const a = keyValueA.key;
  const b = keyValueB.key;
  // if same exit with 0;
  if (a === b) return 0;
  // make sure that undefined are at the end of the sort.
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  // make sure that nulls are at the end of the sort.
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a == 'string' && typeof b == 'string') {
    return a < b ? -1 : 1;
  }
  if (typeof a == 'number' && typeof b == 'number') {
    return a - b;
  }
  if (typeof a == 'boolean' && typeof b == 'boolean') {
    return a < b ? -1 : 1;
  }
  // `a` and `b` are of different types. Compare their string values.
  const aString = String(a);
  const bString = String(b);
  return aString == bString ? 0 : aString < bString ? -1 : 1;
}
