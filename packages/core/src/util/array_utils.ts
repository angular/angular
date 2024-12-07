/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertEqual, assertLessThanOrEqual} from './assert';

/**
 * Determines if the contents of two arrays is identical
 *
 * @param a first array
 * @param b second array
 * @param identityAccessor Optional function for extracting stable object identity from a value in
 *     the array.
 */
export function arrayEquals<T>(a: T[], b: T[], identityAccessor?: (value: T) => unknown): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    let valueA = a[i];
    let valueB = b[i];
    if (identityAccessor) {
      valueA = identityAccessor(valueA) as any;
      valueB = identityAccessor(valueB) as any;
    }
    if (valueB !== valueA) {
      return false;
    }
  }
  return true;
}

/**
 * Flattens an array.
 */
export function flatten(list: any[]): any[] {
  return list.flat(Number.POSITIVE_INFINITY);
}

export function deepForEach<T>(input: (T | any[])[], fn: (value: T) => void): void {
  input.forEach((value) => (Array.isArray(value) ? deepForEach(value, fn) : fn(value)));
}

export function addToArray(arr: any[], index: number, value: any): void {
  // perf: array.push is faster than array.splice!
  if (index >= arr.length) {
    arr.push(value);
  } else {
    arr.splice(index, 0, value);
  }
}

export function removeFromArray(arr: any[], index: number): any {
  // perf: array.pop is faster than array.splice!
  if (index >= arr.length - 1) {
    return arr.pop();
  } else {
    return arr.splice(index, 1)[0];
  }
}

export function newArray<T = any>(size: number): T[];
export function newArray<T>(size: number, value: T): T[];
export function newArray<T>(size: number, value?: T): T[] {
  const list: T[] = [];
  for (let i = 0; i < size; i++) {
    list.push(value!);
  }
  return list;
}

/**
 * Remove item from array (Same as `Array.splice()` but faster.)
 *
 * `Array.splice()` is not as fast because it has to allocate an array for the elements which were
 * removed. This causes memory pressure and slows down code when most of the time we don't
 * care about the deleted items array.
 *
 * https://jsperf.com/fast-array-splice (About 20x faster)
 *
 * @param array Array to splice
 * @param index Index of element in array to remove.
 * @param count Number of items to remove.
 */
export function arraySplice(array: any[], index: number, count: number): void {
  const length = array.length - count;
  while (index < length) {
    array[index] = array[index + count];
    index++;
  }
  while (count--) {
    array.pop(); // shrink the array
  }
}

/**
 * Same as `Array.splice(index, 0, value)` but faster.
 *
 * `Array.splice()` is not fast because it has to allocate an array for the elements which were
 * removed. This causes memory pressure and slows down code when most of the time we don't
 * care about the deleted items array.
 *
 * @param array Array to splice.
 * @param index Index in array where the `value` should be added.
 * @param value Value to add to array.
 */
export function arrayInsert(array: any[], index: number, value: any): void {
  ngDevMode && assertLessThanOrEqual(index, array.length, "Can't insert past array end.");
  let end = array.length;
  while (end > index) {
    const previousEnd = end - 1;
    array[end] = array[previousEnd];
    end = previousEnd;
  }
  array[index] = value;
}

/**
 * Same as `Array.splice2(index, 0, value1, value2)` but faster.
 *
 * `Array.splice()` is not fast because it has to allocate an array for the elements which were
 * removed. This causes memory pressure and slows down code when most of the time we don't
 * care about the deleted items array.
 *
 * @param array Array to splice.
 * @param index Index in array where the `value` should be added.
 * @param value1 Value to add to array.
 * @param value2 Value to add to array.
 */
export function arrayInsert2(array: any[], index: number, value1: any, value2: any): void {
  ngDevMode && assertLessThanOrEqual(index, array.length, "Can't insert past array end.");
  let end = array.length;
  if (end == index) {
    // inserting at the end.
    array.push(value1, value2);
  } else if (end === 1) {
    // corner case when we have less items in array than we have items to insert.
    array.push(value2, array[0]);
    array[0] = value1;
  } else {
    end--;
    array.push(array[end - 1], array[end]);
    while (end > index) {
      const previousEnd = end - 2;
      array[end] = array[previousEnd];
      end--;
    }
    array[index] = value1;
    array[index + 1] = value2;
  }
}

/**
 * Get an index of an `value` in a sorted `array`.
 *
 * NOTE:
 * - This uses binary search algorithm for fast removals.
 *
 * @param array A sorted array to binary search.
 * @param value The value to look for.
 * @returns index of the value.
 *   - positive index if value found.
 *   - negative index if value not found. (`~index` to get the value where it should have been
 *     located)
 */
export function arrayIndexOfSorted(array: string[], value: string): number {
  return _arrayIndexOfSorted(array, value, 0);
}

/**
 * `KeyValueArray` is an array where even positions contain keys and odd positions contain values.
 *
 * `KeyValueArray` provides a very efficient way of iterating over its contents. For small
 * sets (~10) the cost of binary searching an `KeyValueArray` has about the same performance
 * characteristics that of a `Map` with significantly better memory footprint.
 *
 * If used as a `Map` the keys are stored in alphabetical order so that they can be binary searched
 * for retrieval.
 *
 * See: `keyValueArraySet`, `keyValueArrayGet`, `keyValueArrayIndexOf`, `keyValueArrayDelete`.
 */
export interface KeyValueArray<VALUE> extends Array<VALUE | string> {
  __brand__: 'array-map';
}

/**
 * Set a `value` for a `key`.
 *
 * @param keyValueArray to modify.
 * @param key The key to locate or create.
 * @param value The value to set for a `key`.
 * @returns index (always even) of where the value vas set.
 */
export function keyValueArraySet<V>(
  keyValueArray: KeyValueArray<V>,
  key: string,
  value: V,
): number {
  let index = keyValueArrayIndexOf(keyValueArray, key);
  if (index >= 0) {
    // if we found it set it.
    keyValueArray[index | 1] = value;
  } else {
    index = ~index;
    arrayInsert2(keyValueArray, index, key, value);
  }
  return index;
}

/**
 * Retrieve a `value` for a `key` (on `undefined` if not found.)
 *
 * @param keyValueArray to search.
 * @param key The key to locate.
 * @return The `value` stored at the `key` location or `undefined if not found.
 */
export function keyValueArrayGet<V>(keyValueArray: KeyValueArray<V>, key: string): V | undefined {
  const index = keyValueArrayIndexOf(keyValueArray, key);
  if (index >= 0) {
    // if we found it retrieve it.
    return keyValueArray[index | 1] as V;
  }
  return undefined;
}

/**
 * Retrieve a `key` index value in the array or `-1` if not found.
 *
 * @param keyValueArray to search.
 * @param key The key to locate.
 * @returns index of where the key is (or should have been.)
 *   - positive (even) index if key found.
 *   - negative index if key not found. (`~index` (even) to get the index where it should have
 *     been inserted.)
 */
export function keyValueArrayIndexOf<V>(keyValueArray: KeyValueArray<V>, key: string): number {
  return _arrayIndexOfSorted(keyValueArray as string[], key, 1);
}

/**
 * Delete a `key` (and `value`) from the `KeyValueArray`.
 *
 * @param keyValueArray to modify.
 * @param key The key to locate or delete (if exist).
 * @returns index of where the key was (or should have been.)
 *   - positive (even) index if key found and deleted.
 *   - negative index if key not found. (`~index` (even) to get the index where it should have
 *     been.)
 */
export function keyValueArrayDelete<V>(keyValueArray: KeyValueArray<V>, key: string): number {
  const index = keyValueArrayIndexOf(keyValueArray, key);
  if (index >= 0) {
    // if we found it remove it.
    arraySplice(keyValueArray, index, 2);
  }
  return index;
}

/**
 * INTERNAL: Get an index of an `value` in a sorted `array` by grouping search by `shift`.
 *
 * NOTE:
 * - This uses binary search algorithm for fast removals.
 *
 * @param array A sorted array to binary search.
 * @param value The value to look for.
 * @param shift grouping shift.
 *   - `0` means look at every location
 *   - `1` means only look at every other (even) location (the odd locations are to be ignored as
 *         they are values.)
 * @returns index of the value.
 *   - positive index if value found.
 *   - negative index if value not found. (`~index` to get the value where it should have been
 * inserted)
 */
function _arrayIndexOfSorted(array: string[], value: string, shift: number): number {
  ngDevMode && assertEqual(Array.isArray(array), true, 'Expecting an array');
  let start = 0;
  let end = array.length >> shift;
  while (end !== start) {
    const middle = start + ((end - start) >> 1); // find the middle.
    const current = array[middle << shift];
    if (value === current) {
      return middle << shift;
    } else if (current > value) {
      end = middle;
    } else {
      start = middle + 1; // We already searched middle so make it non-inclusive by adding 1
    }
  }
  return ~(end << shift);
}
