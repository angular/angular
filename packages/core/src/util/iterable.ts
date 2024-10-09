/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function isIterable(obj: any): obj is Iterable<any> {
  return obj !== null && typeof obj === 'object' && obj[Symbol.iterator] !== undefined;
}

export function isListLikeIterable(obj: any): boolean {
  if (!isJsObject(obj)) return false;
  return (
    Array.isArray(obj) ||
    (!(obj instanceof Map) && // JS Map are iterables but return entries as [k, v]
      Symbol.iterator in obj)
  ); // JS Iterable have a Symbol.iterator prop
}

export function areIterablesEqual<T>(
  a: Iterable<T>,
  b: Iterable<T>,
  comparator: (a: T, b: T) => boolean,
): boolean {
  const iterator1 = a[Symbol.iterator]();
  const iterator2 = b[Symbol.iterator]();

  while (true) {
    const item1 = iterator1.next();
    const item2 = iterator2.next();
    if (item1.done && item2.done) return true;
    if (item1.done || item2.done) return false;
    if (!comparator(item1.value, item2.value)) return false;
  }
}

export function iterateListLike<T>(obj: Iterable<T>, fn: (p: T) => void) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      fn(obj[i]);
    }
  } else {
    const iterator = obj[Symbol.iterator]();
    let item: IteratorResult<T, any>;
    while (!(item = iterator.next()).done) {
      fn(item.value);
    }
  }
}

export function isJsObject(o: any): boolean {
  return o !== null && (typeof o === 'function' || typeof o === 'object');
}
