/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleFactory} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {fromPromise} from 'rxjs/observable/fromPromise';
import {of } from 'rxjs/observable/of';
import {concatAll} from 'rxjs/operator/concatAll';
import {every} from 'rxjs/operator/every';
import * as l from 'rxjs/operator/last';
import {map} from 'rxjs/operator/map';
import {mergeAll} from 'rxjs/operator/mergeAll';

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

export function flatten<T>(a: T[][]): T[] {
  const target: T[] = [];
  for (let i = 0; i < a.length; ++i) {
    for (let j = 0; j < a[i].length; ++j) {
      target.push(a[i][j]);
    }
  }
  return target;
}

export function first<T>(a: T[]): T {
  return a.length > 0 ? a[0] : null;
}

export function last<T>(a: T[]): T {
  return a.length > 0 ? a[a.length - 1] : null;
}

export function and(bools: boolean[]): boolean {
  return !bools.some(v => !v);
}

export function merge<V>(m1: {[key: string]: V}, m2: {[key: string]: V}): {[key: string]: V} {
  const m: {[key: string]: V} = {};

  for (const attr in m1) {
    if (m1.hasOwnProperty(attr)) {
      m[attr] = m1[attr];
    }
  }

  for (const attr in m2) {
    if (m2.hasOwnProperty(attr)) {
      m[attr] = m2[attr];
    }
  }

  return m;
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
  const waitFor: Observable<B>[] = [];
  const res: {[k: string]: B} = {};

  forEach(obj, (a: A, k: string) => {
    if (k === PRIMARY_OUTLET) {
      waitFor.push(map.call(fn(k, a), (_: B) => {
        res[k] = _;
        return _;
      }));
    }
  });

  forEach(obj, (a: A, k: string) => {
    if (k !== PRIMARY_OUTLET) {
      waitFor.push(map.call(fn(k, a), (_: B) => {
        res[k] = _;
        return _;
      }));
    }
  });

  if (waitFor.length > 0) {
    const concatted$ = concatAll.call(of (...waitFor));
    const last$ = l.last.call(concatted$);
    return map.call(last$, () => res);
  }

  return of (res);
}

export function andObservables(observables: Observable<Observable<any>>): Observable<boolean> {
  const merged$ = mergeAll.call(observables);
  return every.call(merged$, (result: any) => result === true);
}

export function wrapIntoObservable<T>(value: T | NgModuleFactory<T>| Promise<T>| Observable<T>):
    Observable<T> {
  if (value instanceof Observable) {
    return value;
  }

  if (value instanceof Promise) {
    return fromPromise(value);
  }

  return of (value);
}
