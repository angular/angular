/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
 * This examples show how an Object or a Map can be iterated by ngFor with the use of this
 * keyvalue pipe.
 *
 * {@example common/pipes/ts/keyvalue_pipe.ts region='KeyValuePipe'}
 *
 * @publicApi
 */
@Pipe({name: 'keyvalue', pure: false})
export class KeyValuePipe implements PipeTransform {
  constructor(private readonly differs: KeyValueDiffers) {}

  private differ!: KeyValueDiffer<any, any>;
  private keyValues: Array<KeyValue<any, any>> = [];

  /*
   * NOTE: when the `input` value is a simple Record<K, V> object, the keys are extracted with
   * Object.keys(). This means that even if the `input` type is Record<number, V> the keys are
   * compared/returned as `string`s.
   */
  transform<K, V>(
      input: ReadonlyMap<K, V>,
      compareFn?: (a: KeyValue<K, V>, b: KeyValue<K, V>) => number): Array<KeyValue<K, V>>;
  transform<K extends number, V>(
      input: Record<K, V>, compareFn?: (a: KeyValue<string, V>, b: KeyValue<string, V>) => number):
      Array<KeyValue<string, V>>;
  transform<K extends string, V>(
      input: Record<K, V>|ReadonlyMap<K, V>,
      compareFn?: (a: KeyValue<K, V>, b: KeyValue<K, V>) => number): Array<KeyValue<K, V>>;
  transform(
      input: null|undefined,
      compareFn?: (a: KeyValue<unknown, unknown>, b: KeyValue<unknown, unknown>) => number): null;
  transform<K, V>(
      input: ReadonlyMap<K, V>|null|undefined,
      compareFn?: (a: KeyValue<K, V>, b: KeyValue<K, V>) => number): Array<KeyValue<K, V>>|null;
  transform<K extends number, V>(
      input: Record<K, V>|null|undefined,
      compareFn?: (a: KeyValue<string, V>, b: KeyValue<string, V>) => number):
      Array<KeyValue<string, V>>|null;
  transform<K extends string, V>(
      input: Record<K, V>|ReadonlyMap<K, V>|null|undefined,
      compareFn?: (a: KeyValue<K, V>, b: KeyValue<K, V>) => number): Array<KeyValue<K, V>>|null;
  transform<K, V>(
      input: undefined|null|{[key: string]: V, [key: number]: V}|ReadonlyMap<K, V>,
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
        this.keyValues.push(makeKeyValuePair(r.key, r.currentValue!));
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
