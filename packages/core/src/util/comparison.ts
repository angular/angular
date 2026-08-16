/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {areIterablesEqual, isListLikeIterable} from './iterable';

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

export function eq(a: any, b: any): boolean {
  if (a === b) return true;

  if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) {
    return true;
  }

  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  /**
   * Temporal API
   * Unlike the Date object, Temporal objects do not have a getTime() method.
   * Instead, `.equals()` is available to compare two Temporal objects for equality.
   * @see {https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/Instant/equals}
   */
  if (typeof a.equals === 'function' && typeof b.equals === 'function') {
    try {
      return a.equals(b);
    } catch {
      // Fall through to object inspection if `.equals()` fails
    }
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, idx) => eq(item, b[idx]));
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || !eq(a[key], b[key])) {
      return false;
    }
  }

  return true;
}
