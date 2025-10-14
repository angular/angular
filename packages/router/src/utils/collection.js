/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵisPromise as isPromise} from '@angular/core';
import {from, isObservable, of} from 'rxjs';
export function shallowEqualArrays(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (!shallowEqual(a[i], b[i])) return false;
  }
  return true;
}
export function shallowEqual(a, b) {
  // While `undefined` should never be possible, it would sometimes be the case in IE 11
  // and pre-chromium Edge. The check below accounts for this edge case.
  const k1 = a ? getDataKeys(a) : undefined;
  const k2 = b ? getDataKeys(b) : undefined;
  if (!k1 || !k2 || k1.length != k2.length) {
    return false;
  }
  let key;
  for (let i = 0; i < k1.length; i++) {
    key = k1[i];
    if (!equalArraysOrString(a[key], b[key])) {
      return false;
    }
  }
  return true;
}
/**
 * Gets the keys of an object, including `symbol` keys.
 */
export function getDataKeys(obj) {
  return [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
}
/**
 * Test equality for arrays of strings or a string.
 */
export function equalArraysOrString(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const aSorted = [...a].sort();
    const bSorted = [...b].sort();
    return aSorted.every((val, index) => bSorted[index] === val);
  } else {
    return a === b;
  }
}
/**
 * Return the last element of an array.
 */
export function last(a) {
  return a.length > 0 ? a[a.length - 1] : null;
}
export function wrapIntoObservable(value) {
  if (isObservable(value)) {
    return value;
  }
  if (isPromise(value)) {
    // Use `Promise.resolve()` to wrap promise-like instances.
    // Required ie when a Resolver returns a AngularJS `$q` promise to correctly trigger the
    // change detection.
    return from(Promise.resolve(value));
  }
  return of(value);
}
//# sourceMappingURL=collection.js.map
