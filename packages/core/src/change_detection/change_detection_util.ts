/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSymbolIterator} from '../util/symbol';

export function devModeEqual(a: any, b: any): boolean {
  const isListLikeIterableA = isListLikeIterable(a);
  const isListLikeIterableB = isListLikeIterable(b);
  if (isListLikeIterableA && isListLikeIterableB) {
    return areIterablesEqual(a, b, devModeEqual);
  } else {
    const isAObject = a && (typeof a === 'object' || typeof a === 'function');
    const isBObject = b && (typeof b === 'object' || typeof b === 'function');
    if (!isListLikeIterableA && isAObject && !isListLikeIterableB && isBObject) {
      return true;
    } else {
      return Object.is(a, b);
    }
  }
}

/**
 * Indicates that the result of a {@link Pipe} transformation has changed even though the
 * reference has not changed.
 *
 * Wrapped values are unwrapped automatically during the change detection, and the unwrapped value
 * is stored.
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
 *
 * @publicApi
 * @deprecated from v10 stop using. (No replacement, deemed unnecessary.)
 */
export class WrappedValue {
  /** @deprecated from 5.3, use `unwrap()` instead - will switch to protected */
  wrapped: any;

  constructor(value: any) {
    this.wrapped = value;
  }

  /** Creates a wrapped value. */
  static wrap(value: any): WrappedValue {
    return new WrappedValue(value);
  }

  /**
   * Returns the underlying value of a wrapped value.
   * Returns the given `value` when it is not wrapped.
   **/
  static unwrap(value: any): any {
    return WrappedValue.isWrapped(value) ? value.wrapped : value;
  }

  /** Returns true if `value` is a wrapped value. */
  static isWrapped(value: any): value is WrappedValue {
    return value instanceof WrappedValue;
  }
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

export function isJsObject(o: any): boolean {
  return o !== null && (typeof o === 'function' || typeof o === 'object');
}
