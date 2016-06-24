/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function shallowEqualArrays(a:any[], b:any[]):boolean {
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
  return bools.reduce((a, b) => a && b, true);
}

export function merge<V>(m1: {[key: string]: V}, m2: {[key: string]: V}): {[key: string]: V} {
  var m: {[key: string]: V} = {};

  for (var attr in m1) {
    if (m1.hasOwnProperty(attr)) {
      m[attr] = m1[attr];
    }
  }

  for (var attr in m2) {
    if (m2.hasOwnProperty(attr)) {
      m[attr] = m2[attr];
    }
  }

  return m;
}

export function forEach<K, V>(
    map: {[key: string]: V}, callback: /*(V, K) => void*/ Function): void {
  for (var prop in map) {
    if (map.hasOwnProperty(prop)) {
      callback(map[prop], prop);
    }
  }
}