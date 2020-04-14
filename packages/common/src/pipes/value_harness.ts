/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * An interface that updates the `value` member whenever `update()` is called.
 *
 * This interface allows for an abstraction to create a new value
 * each time the `update()` method is called. It is up to the
 * abstraction to decide whether or not to update its value when
 * this occurs.
 *
 * Value harnesses are useful for collection-based values. A collection-based
 * harness can be used to make a local copy of a collection and then only
 * change the underlying collection instance whenever the contents change.
 *
 * ```typescript
 * const h = new MyCollectionValueHarness([1,2,3]);
 * const v1 = h.value; // [1,2,3]
 *
 * h.update([1,2,3])
 * const v2 = h.value; // same identity as v1 => [1,2,3]
 *
 * h.update([1,2])
 * const v3 = h.value; // new collection => [1,2]
 * ```
 */
export interface ValueHarness<T> {
  update(value: T): void;
  readonly value: T;
}

/**
 * A value harness specific to arrays.
 *
 * This harness is used to track whenever contents of an array
 * change compared to the previous array that is current stored.
 *
 * Each time the `update()` method is called, then the local array
 * copy will be updated with the new contents of the new array that
 * was provided. If and when the new array contents do not match with
 * the old array then the local array value will be updated.
 */
export class ArrayHarness implements ValueHarness<unknown[]> {
  private _array!: unknown[];

  constructor(value: unknown[]) {
    this._updateValue(value);
  }

  private _updateValue(value: unknown[]) {
    this._array = [...value];
  }

  update(value: unknown[]): void {
    if (!arraysAreEqual(value, this._array)) {
      this._updateValue(value);
    }
  }

  get value() {
    return this._array;
  }
}

/**
 * An array representation of a key/value map.
 *
 * A `KeyValueArray` is used as a substitute data structure
 * to avoid having to constantly fetch all key strings from
 * a map (this avoids megamorphic property reads).
 *
 * All even-indexed keys are used to store the key values
 * within a key/value map and all odd-based store the
 * values within a key/value map.
 */
interface KeyValueArray extends Array<string|unknown> {}

/**
 * A collection of constants used for accessing entries within a `KeyValueArray` data-structure
 */
const enum KeyValueArrayIndex {
  TupleLength = 2,
  KeyOffset = 0,
  ValueOffset = 1,
}

/**
 * A value harness specific to key/value maps.
 *
 * This harness is used to track whenever contents of a key/value map
 * change compared to the previous key/value map that is current stored.
 *
 * Each time the `update()` method is called, then the local key/value map
 * copy will be updated with the new contents of the new key/value map that
 * was provided. If and when the new key/value map contents do not match with
 * the key/value map then the local key/value map value will be updated.
 */
export class MapHarness implements ValueHarness<{[key: string]: unknown}> {
  private _keyValueArray!: KeyValueArray;
  private _value!: {[key: string]: any};

  constructor(value: {[key: string]: unknown}) {
    this._updateValue(value);
    this._value = value;
  }

  private _updateValue(value: {[key: string]: unknown}) {
    this._keyValueArray = toKeyValueArray(value);
  }

  update(value: {[key: string]: unknown}): void {
    if (hasMapChanged(value, this._keyValueArray)) {
      this._updateValue(value);
      this._value = {...value};
    }
  }

  get value() {
    return this._value;
  }
}

/**
 * A value harness specific to non-collection values.
 *
 * This harness is used to track whenever or not the a new value
 * value has changed compared to the previous value that is stored
 * within the class. Each time there is a change the new value is
 * stored within the class.
 */
export class DefaultValueHarness implements ValueHarness<unknown> {
  constructor(private _value: unknown) {}

  update(value: unknown): void {
    if (this._value !== value) {
      this._value = value;
    }
  }

  get value() {
    return this._value;
  }
}

/**
 * Converts a key/value map to an instance of `KeyValueArray`
 *
 * Examples include:
 *
 * `{}` => []
 * `{one:1}` => ['one', 1]
 * `{one:1, two:2}` => ['one', 1, 'two', 2]
 */
function toKeyValueArray(map: {[key: string]: unknown}): KeyValueArray {
  const keys = Object.keys(map);
  const keyValueArray: KeyValueArray = new Array(keys.length * KeyValueArrayIndex.TupleLength);
  for (let i = 0, j = 0; i < keys.length; i++, j += KeyValueArrayIndex.TupleLength) {
    const key = keys[i];
    setKey(keyValueArray, j, key);
    setValue(keyValueArray, j, map[key]);
  }
  return keyValueArray;
}

/**
 * Whether or not the provided `map` value is different in terms of entries.
 */
function hasMapChanged(
    map: {[key: string]: unknown}, previousValue: KeyValueArray|{[key: string]: unknown}): boolean {
  let hasChanged = false;

  const keyValueArray =
      Array.isArray(previousValue) ? previousValue : toKeyValueArray(previousValue);
  const keys = Object.keys(map);

  if (keyValueArray.length !== (keys.length * KeyValueArrayIndex.TupleLength)) {
    // check #1: check to see if the sizing of the map has changed
    hasChanged = true;
  } else {
    // check #2: check to see if all the values match up
    //           Because we know that the key sizes are the same,
    //           we do not need to run another for loop.
    for (let i = 0; i < keyValueArray.length; i += KeyValueArrayIndex.TupleLength) {
      const key = getKey(keyValueArray, i);
      if (!map.hasOwnProperty(key) || getValue(keyValueArray, i) !== map[key]) {
        hasChanged = true;
        break;
      }
    }
  }

  return hasChanged;
}

/**
 * Returns the `key` string value at the provided `index` location within a `KeyValueArray`
 */
function getKey(kvArray: KeyValueArray, index: number): string {
  return kvArray[index + KeyValueArrayIndex.KeyOffset] as string;
}

/**
 * Sets the `key` string value at the provided `index` location within a `KeyValueArray`
 */
function setKey(kvArray: KeyValueArray, index: number, key: string): void {
  kvArray[index + KeyValueArrayIndex.KeyOffset] = key;
}

/**
 * Gets the value at the provided `index` location within a `KeyValueArray`
 */
function getValue(kvArray: KeyValueArray, index: number): unknown {
  return kvArray[index + KeyValueArrayIndex.ValueOffset];
}

/**
 * Sets the value at the provided `index` location within a `KeyValueArray`
 */
function setValue(kvArray: KeyValueArray, index: number, value: unknown): void {
  kvArray[index + KeyValueArrayIndex.ValueOffset] = value;
}

/**
 * Whether or not the arrays have the same entries.
 */
function arraysAreEqual(arrayA: unknown[], arrayB: unknown[]): boolean {
  if (arrayA.length !== arrayB.length) {
    return false;
  }

  for (let i = 0; i < arrayA.length; i++) {
    if (arrayA[i] !== arrayB[i]) {
      return false;
    }
  }

  return true;
}
