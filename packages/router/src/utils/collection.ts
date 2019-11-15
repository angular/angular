/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleFactory, ɵisObservable as isObservable, ɵisPromise as isPromise} from '@angular/core';
import {Observable, from, of } from 'rxjs';
import {concatAll, last as lastValue, map} from 'rxjs/operators';

import {PRIMARY_OUTLET} from '../shared';

export function shallowEqualArrays(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (!shallowEqual(a[i], b[i])) return false;
  }
  return true;
}

export function shallowEqual(a: {[x: string]: any}, b: {[x: string]: any}): boolean {
  // Casting Object.keys return values to include `undefined` as there are some cases
  // in IE 11 where this can happen. Cannot provide a test because the behavior only
  // exists in certain circumstances in IE 11, therefore doing this cast ensures the
  // logic is correct for when this edge case is hit.
  const k1 = Object.keys(a) as string[] | undefined;
  const k2 = Object.keys(b) as string[] | undefined;
  if (!k1 || !k2 || k1.length != k2.length) {
    return false;
  }
  let key: string;
  for (let i = 0; i < k1.length; i++) {
    key = k1[i];
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

/**
 * Flattens single-level nested arrays.
 */
export function flatten<T>(arr: T[][]): T[] {
  return Array.prototype.concat.apply([], arr);
}

/**
 * Return the last element of an array.
 */
export function last<T>(a: T[]): T|null {
  return a.length > 0 ? a[a.length - 1] : null;
}

/**
 * Verifys all booleans in an array are `true`.
 */
export function and(bools: boolean[]): boolean {
  return !bools.some(v => !v);
}

export function forEach<K, V>(map: {[key: string]: V}, callback: (v: V, k: string) => void): void {
  for (const prop in map) {
    if (map.hasOwnProperty(prop)) {
      callback(map[prop], prop);
    }
  }
}

export function waitForMap<A, B>(
    obj: {[k: string]: A}, fn: (k: string, a: A) => Observable<B>): Observable<{[k: string]: B}> {
  if (Object.keys(obj).length === 0) {
    return of ({});
  }

  const waitHead: Observable<B>[] = [];
  const waitTail: Observable<B>[] = [];
  const res: {[k: string]: B} = {};

  forEach(obj, (a: A, k: string) => {
    const mapped = fn(k, a).pipe(map((r: B) => res[k] = r));
    if (k === PRIMARY_OUTLET) {
      waitHead.push(mapped);
    } else {
      waitTail.push(mapped);
    }
  });

  // Closure compiler has problem with using spread operator here. So we use "Array.concat".
  // Note that we also need to cast the new promise because TypeScript cannot infer the type
  // when calling the "of" function through "Function.apply"
  return (of .apply(null, waitHead.concat(waitTail)) as Observable<Observable<B>>)
      .pipe(concatAll(), lastValue(), map(() => res));
}

export function wrapIntoObservable<T>(value: T | Promise<T>| Observable<T>): Observable<T> {
  if (isObservable(value)) {
    return value;
  }

  if (isPromise(value)) {
    // Use `Promise.resolve()` to wrap promise-like instances.
    // Required ie when a Resolver returns a AngularJS `$q` promise to correctly trigger the
    // change detection.
    return from(Promise.resolve(value));
  }

  return of (value);
}
