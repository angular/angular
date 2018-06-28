/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Moves an item one index in an array to another.
 * @param array Array in which to move the item.
 * @param fromIndex Starting index of the item.
 * @param toIndex Index to which the item should be moved.
 */
export function moveItemInArray<T = any>(array: T[], fromIndex: number, toIndex: number): void {
  if (fromIndex === toIndex) {
    return;
  }

  const target = array[fromIndex];
  const delta = toIndex < fromIndex ? -1 : 1;

  for (let i = fromIndex; i !== toIndex; i += delta) {
    array[i] = array[i + delta];
  }

  array[toIndex] = target;
}


/**
 * Moves an item from one array to another.
 * @param currentArray Array from which to transfer the item.
 * @param targetArray Array into which to put the item.
 * @param currentIndex Index of the item in its current array.
 * @param targetIndex Index at which to insert the item.
 */
export function transferArrayItem<T = any>(currentArray: T[],
                                           targetArray: T[],
                                           currentIndex: number,
                                           targetIndex: number): void {
  targetArray.splice(targetIndex, 0, currentArray.splice(currentIndex, 1)[0]);
}
