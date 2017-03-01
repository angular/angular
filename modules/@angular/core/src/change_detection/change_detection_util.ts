/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isJsObject, isPrimitive, looseIdentical} from '../facade/lang';
import {getSymbolIterator} from '../util';

export {looseIdentical} from '../facade/lang';

export function devModeEqual(a: any, b: any): boolean {
  if (isListLikeIterable(a) && isListLikeIterable(b)) {
    return areIterablesEqual(a, b, devModeEqual);

  } else if (
      !isListLikeIterable(a) && !isPrimitive(a) && !isListLikeIterable(b) && !isPrimitive(b)) {
    return true;

  } else {
    return looseIdentical(a, b);
  }
}

/**
 * Indicates that the result of a {@link Pipe} transformation has changed even though the
 * reference
 * has not changed.
 *
 * The wrapped value will be unwrapped by change detection, and the unwrapped value will be stored.
 *
 * Example:
 *
 * ```
 * if (this._latestValue === this._latestReturnedValue) {
 *    return this._latestReturnedValue;
 *  } else {
 *    this._latestReturnedValue = this._latestValue;
 *    return WrappedValue.wrap(this._latestValue); // this will force update
 *  }
 * ```
 * @stable
 */
export class WrappedValue {
  constructor(public wrapped: any) {}

  static wrap(value: any): WrappedValue { return new WrappedValue(value); }
}

/**
 * Helper class for unwrapping WrappedValue s
 */
export class ValueUnwrapper {
  public hasWrappedValue = false;

  unwrap(value: any): any {
    if (value instanceof WrappedValue) {
      this.hasWrappedValue = true;
      return value.wrapped;
    }
    return value;
  }

  reset() { this.hasWrappedValue = false; }
}

/**
 * Represents a basic change from a previous to a new value.
 * @stable
 */
export class SimpleChange {
  constructor(public previousValue: any, public currentValue: any, public firstChange: boolean) {}

  /**
   * Check whether the new value is the first value assigned.
   */
  isFirstChange(): boolean { return this.firstChange; }
}

export function isListLikeIterable(obj: any): boolean {
  if (!isJsObject(obj)) return false;
  return Array.isArray(obj) ||
      (!(obj instanceof Map) &&      // JS Map are iterables but return entries as [k, v]
       getSymbolIterator() in obj);  // JS Iterable have a Symbol.iterator prop
}

export function areIterablesEqual(
    a: any, b: any, comparator: (a: any, b: any) => boolean): boolean {
  const iterator1 = a[getSymbolIterator()]();
  const iterator2 = b[getSymbolIterator()]();

  while (true) {
    const item1 = iterator1.next();
    const item2 = iterator2.next();
    if (item1.done && item2.done) return true;
    if (item1.done || item2.done) return false;
    if (!comparator(item1.value, item2.value)) return false;
  }
}

export function iterateListLike(obj: any, fn: (p: any) => any) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      fn(obj[i]);
    }
  } else {
    const iterator = obj[getSymbolIterator()]();
    let item: any;
    while (!((item = iterator.next()).done)) {
      fn(item.value);
    }
  }
}
