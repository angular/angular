/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {$$observable as symbolObservable} from 'rxjs/symbol/observable';

/**
 * Determine if the argument is shaped like a Promise
 */
export function isPromise(obj: any): obj is Promise<any> {
  // allow any Promise/A+ compliant thenable.
  // It's up to the caller to ensure that obj.then conforms to the spec
  return !!obj && typeof obj.then === 'function';
}

/**
 * Determine if the argument is an Observable
 */
export function isObservable(obj: any | Observable<any>): obj is Observable<any> {
  return !!(obj && obj[symbolObservable]);
}

// TODO(misko): replace with Object.assign once we require ES6.
export function merge<V>(m1: {[key: string]: V}, m2: {[key: string]: V}): {[key: string]: V} {
  const m: {[key: string]: V} = {};

  for (const k of Object.keys(m1)) {
    m[k] = m1[k];
  }

  for (const k of Object.keys(m2)) {
    m[k] = m2[k];
  }

  return m;
}
