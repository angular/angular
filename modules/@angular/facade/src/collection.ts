/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSymbolIterator, isJsObject, isPresent} from './lang';

/**
 * Wraps Javascript Objects
 */
export class StringMapWrapper {
  static merge<V>(m1: {[key: string]: V}, m2: {[key: string]: V}): {[key: string]: V} {
    const m: {[key: string]: V} = {};

    for (let k of Object.keys(m1)) {
      m[k] = m1[k];
    }

    for (let k of Object.keys(m2)) {
      m[k] = m2[k];
    }

    return m;
  }

  static equals<V>(m1: {[key: string]: V}, m2: {[key: string]: V}): boolean {
    const k1 = Object.keys(m1);
    const k2 = Object.keys(m2);

    if (k1.length != k2.length) {
      return false;
    }

    for (let i = 0; i < k1.length; i++) {
      const key = k1[i];
      if (m1[key] !== m2[key]) {
        return false;
      }
    }

    return true;
  }
}

/**
 * A boolean-valued function over a value, possibly including context information
 * regarding that value's position in an array.
 */
export interface Predicate<T> { (value: T, index?: number, array?: T[]): boolean; }

export class ListWrapper {
  static removeAll<T>(list: T[], items: T[]) {
    for (let i = 0; i < items.length; ++i) {
      const index = list.indexOf(items[i]);
      if (index > -1) {
        list.splice(index, 1);
      }
    }
  }

  static remove<T>(list: T[], el: T): boolean {
    const index = list.indexOf(el);
    if (index > -1) {
      list.splice(index, 1);
      return true;
    }
    return false;
  }

  static equals(a: any[], b: any[]): boolean {
    if (a.length != b.length) return false;
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  static flatten<T>(list: Array<T|T[]>): T[] {
    return list.reduce((flat: any[], item: T | T[]): T[] => {
      const flatItem = Array.isArray(item) ? ListWrapper.flatten(item) : item;
      return (<T[]>flat).concat(flatItem);
    }, []);
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
    let item1 = iterator1.next();
    let item2 = iterator2.next();
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
