/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
* Equivalent to ES6 spread, add each item to an array.
*
* @param items The items to add
* @param arr The array to which you want to add the items
*/
export function addAllToArray(items: any[], arr: any[]) {
  for (let i = 0; i < items.length; i++) {
    arr.push(items[i]);
  }
}

const flattenQueue: (any[] | number)[] = [];

/**
 * Flattens an array in non-recursive way. Input arrays are not modified.
 *
 * This implementation is memory efficient and only allocates objects when needed.
 */
export function flatten(list: any[]): any[] {
  // This is an optimization so that we don't allocate memory until we have to.
  let flat: any[] = list;
  let queueIndex = 0;
  let index = 0;
  let length = list.length;
  while (true) {
    while (index < length) {
      let item = list[index++];
      if (Array.isArray(item)) {
        // we need to inline it.
        if (flat === list) {
          // we need to clone flat since we need to write to it.
          flat = list.slice(0, index - 1);
        }
        flattenQueue[queueIndex++] = index;
        flattenQueue[queueIndex++] = list;
        list = item;
        index = 0;
        length = list.length;
      } else if (flat !== list) {
        flat.push(item);
      }
    }
    if (queueIndex > 0) {
      // There are items in the flattenQueue which need to be processed.
      list = flattenQueue[--queueIndex] as any[];
      length = list.length;
      index = flattenQueue[--queueIndex] as number;
    } else {
      break;
    }
  }

  return flat;
}
