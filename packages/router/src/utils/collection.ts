/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, NgModuleFactory, ɵisObservable as isObservable, ɵisPromise as isPromise} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {empty} from 'rxjs/observable/empty';
import {from} from 'rxjs/observable/from';
import {fromPromise} from 'rxjs/observable/fromPromise';
import {of } from 'rxjs/observable/of';
import {concatAll} from 'rxjs/operator/concatAll';
import {every} from 'rxjs/operator/every';
import {first} from 'rxjs/operator/first';
import * as l from 'rxjs/operator/last';
import {map} from 'rxjs/operator/map';
import {mergeMap} from 'rxjs/operator/mergeMap';

import {PRIMARY_OUTLET} from '../shared';

export function shallowEqualArrays(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (!shallowEqual(a[i], b[i])) return false;
  }
  return true;
}

export function shallowEqual(a: {[x: string]: any}, b: {[x: string]: any}): boolean {
  const k1 = Object.keys(a);
  const k2 = Object.keys(b);
  if (k1.length != k2.length) {
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
    const mapped = map.call(fn(k, a), (r: B) => res[k] = r);
    if (k === PRIMARY_OUTLET) {
      waitHead.push(mapped);
    } else {
      waitTail.push(mapped);
    }
  });

  const concat$ = concatAll.call(of (...waitHead, ...waitTail));
  const last$ = l.last.call(concat$);
  return map.call(last$, () => res);
}

/**
 * ANDs Observable values by verifying that all values return `true`.
 */
export function andObservable(observable: Observable<any>): Observable<boolean> {
  return every.call(observable, (result: any) => result === true);
}

/**
 * Convert the input into a single emit observable.
 */
export function wrapIntoObservable<T>(value: T | NgModuleFactory<T>| Promise<T>| Observable<T>):
    Observable<T> {
  if (isObservable(value)) {
    return first.call(value);
  }

  if (isPromise(value)) {
    // Use `Promise.resolve()` to wrap promise-like instances.
    // Required ie when a Resolver returns a AngularJS `$q` promise to correctly trigger the
    // change detection.
    return fromPromise(Promise.resolve(value));
  }

  return of (value as T);
}

/**
 * Convert each guard into an observable and return an observable that will emit the first item
 * emited by each guard's observable.
 */
export function runGuards<T>(
    name: string, guardTokens: any[] | null | undefined, injector: Injector, guardArguments: any[],
    defaultValue?: T): Observable<T> {
  if (!guardTokens || guardTokens.length === 0)
    return defaultValue === undefined ? empty() : of (defaultValue);

  return mergeMap.call(from(guardTokens), (token: any) => {
    const guard = injector.get(token);
    const guardResult =
        guard[name] ? guard[name].apply(guard, guardArguments) : guard.apply(null, guardArguments);

    return wrapIntoObservable(guardResult);
  });
}
