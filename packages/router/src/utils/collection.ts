/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleFactory, ɵisObservable as isObservable, ɵisPromise as isPromise} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {fromPromise} from 'rxjs/observable/fromPromise';
import {of } from 'rxjs/observable/of';
import {concatAll} from 'rxjs/operator/concatAll';
import {every} from 'rxjs/operator/every';
import * as l from 'rxjs/operator/last';
import {map} from 'rxjs/operator/map';
import {mergeAll} from 'rxjs/operator/mergeAll';
import {PRIMARY_OUTLET} from '../shared';

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
 * ANDs Observables by merging all input observables, reducing to an Observable verifying all
 * input Observables return `true`.
 */
export function andObservables(observables: Observable<Observable<any>>): Observable<boolean> {
  const merged$ = mergeAll.call(observables);
  return every.call(merged$, (result: any) => result === true);
}

export function wrapIntoObservable<T>(value: T | NgModuleFactory<T>| Promise<T>| Observable<T>):
    Observable<T> {
  if (isObservable(value)) {
    return value;
  }

  if (isPromise(value)) {
    // Use `Promise.resolve()` to wrap promise-like instances.
    // Required ie when a Resolver returns a AngularJS `$q` promise to correctly trigger the
    // change detection.
    return fromPromise(Promise.resolve(value));
  }

  return of (value as T);
}
