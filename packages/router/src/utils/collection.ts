/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵisPromise as isPromise} from '@angular/core';
import {from, isObservable, Observable, of} from 'rxjs';
import {firstValueFrom} from './first_value_from';

export function shallowEqualArrays(a: readonly any[], b: readonly any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (!shallowEqual(a[i], b[i])) return false;
  }
  return true;
}

export function shallowEqual(
  a: {[key: string | symbol]: any},
  b: {[key: string | symbol]: any},
): boolean {
  // While `undefined` should never be possible, it would sometimes be the case in IE 11
  // and pre-chromium Edge. The check below accounts for this edge case.
  const k1 = a ? getDataKeys(a) : undefined;
  const k2 = b ? getDataKeys(b) : undefined;
  if (!k1 || !k2 || k1.length != k2.length) {
    return false;
  }
  let key: string | symbol;
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
export function getDataKeys(obj: Object): Array<string | symbol> {
  return [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
}

/**
 * Test equality for arrays of strings or a string.
 */
export function equalArraysOrString(
  a: string | readonly string[],
  b: string | readonly string[],
): boolean {
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
export function last<T>(a: readonly T[]): T | null {
  return a.length > 0 ? a[a.length - 1] : null;
}

export function wrapIntoObservable<T>(value: T | Promise<T> | Observable<T>): Observable<T> {
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

export function wrapIntoPromise<T>(value: T | Promise<T> | Observable<T>): Promise<T> {
  if (isObservable(value)) {
    return firstValueFrom(value);
  }
  return Promise.resolve(value);
}

// Above V8's slow-elements threshold.
const SLOW_ELEMENTS_SENTINEL = 0x40000000;

/**
 * Prevents URL-derived numeric keys from producing large V8 fast-elements
 * backing stores by first forcing indexed properties into dictionary storage.
 *
 * Copies need the same protection because their elements storage is independent.
 * Named-only records keep their normal representation.
 *
 * This is a V8-specific memory mitigation and is not an ECMAScript guarantee.
 *
 * Background:
 * https://v8.dev/blog/fast-properties#elements-or-array-indexed-properties
 */
function preventDenseElements(target: {[key: string]: unknown}, key: string): void {
  // Array indices are canonical uint32 strings, excluding 2 ** 32 - 1.
  const index = Number(key) >>> 0;
  // Preserve a URL-supplied sentinel; its presence already requires dictionary elements.
  if (
    String(index) === key &&
    index !== 0xffffffff &&
    !Object.hasOwn(target, SLOW_ELEMENTS_SENTINEL)
  ) {
    Object.defineProperty(target, SLOW_ELEMENTS_SENTINEL, {value: 0, configurable: true});
    delete target[SLOW_ELEMENTS_SENTINEL];
  }
}

/** Defines a URL-derived own property without sparse-index allocation in V8. */
export function setUrlDerivedKey<T>(target: {[key: string]: T}, key: string, value: T): void {
  defineUrlDerivedKey(target, key, value);
}

/** Defines a URL-derived own property without invoking inherited setters. */
export function defineUrlDerivedKey(
  target: {[key: string | symbol]: unknown},
  key: string | symbol,
  value: unknown,
): void {
  if (typeof key === 'string') preventDenseElements(target, key);
  Object.defineProperty(target, key, {value, writable: true, enumerable: true, configurable: true});
}

/** Copies URL-derived records with object-spread semantics, retaining the V8 protection. */
export function mergeUrlDerivedKeys<T>(
  ...sources: ({[key: string | symbol]: T} | null | undefined)[]
): {[key: string | symbol]: T} {
  const target: {[key: string | symbol]: T} = {};
  for (const source of sources) {
    const from = Object(source);
    for (const key of Reflect.ownKeys(from)) {
      if (!Object.prototype.propertyIsEnumerable.call(from, key)) continue;
      defineUrlDerivedKey(target, key, from[key]);
    }
  }
  return target;
}
