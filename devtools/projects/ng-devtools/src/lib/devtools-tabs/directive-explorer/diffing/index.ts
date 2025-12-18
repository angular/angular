/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DefaultIterableDiffer} from '@angular/core';

export interface MovedRecord {
  currentIndex: number;
  previousIndex: number;
}

/**
 * Performs a diff between a host and a new array.
 * The host array is modified in-place with the diff.
 *
 * @param differ
 * @param a Host array
 * @param b New array
 * @returns A report with all updates in the form of an object
 */
export const diff = <T extends Record<string, any>>(
  differ: DefaultIterableDiffer<T>,
  a: T[],
  b: T[],
): {newItems: T[]; removedItems: T[]; movedItems: T[]; updatedItems: T[]} => {
  differ.diff(a);
  differ.diff(b);

  const alreadySet: boolean[] = [];
  const movedItems: T[] = [];
  const alteredItems = new Set<number>();

  // We first have to set the moved items to their correct positions.
  // Keep in mind that the track by function may not guarantee
  // that we haven't changed any of the items' props.
  differ.forEachMovedItem((record) => {
    if (record.currentIndex === null) {
      return;
    }
    if (record.previousIndex === null) {
      return;
    }
    // We want to preserve the reference so that a default
    // track by function used by the CDK, for instance, can
    // recognize that this item's identity hasn't changed.
    // At the same time, since we don't have the guarantee
    // that we haven't already set the previousIndex while
    // iterating, we need to check that. If we have, we assign
    // this array item to a new object. We don't want to risk
    // changing the properties of an object we'll use in the future.
    if (!alreadySet[record.previousIndex]) {
      a[record.currentIndex] = a[record.previousIndex];
    } else {
      a[record.currentIndex] = {} as unknown as T;
    }
    Object.keys(b[record.currentIndex]).forEach((prop) => {
      // TypeScript's type inference didn't follow the check from above.
      if (record.currentIndex === null) {
        return;
      }
      (a[record.currentIndex] as any)[prop] = b[record.currentIndex][prop];
    });
    if (!alreadySet[record.previousIndex]) {
      a[record.previousIndex] = null!;
    }
    alreadySet[record.currentIndex] = true;
    movedItems.push(a[record.currentIndex]);
    alteredItems.add(record.currentIndex);
  });

  // Now we can set the new items and remove the deleted ones.
  const newItems: T[] = [];
  const removedItems: T[] = [];
  differ.forEachAddedItem((record) => {
    if (record.currentIndex !== null && record.previousIndex === null) {
      a[record.currentIndex] = record.item;
      alreadySet[record.currentIndex] = true;
      newItems.push(record.item);
      alteredItems.add(record.currentIndex);
    }
  });

  differ.forEachRemovedItem((record) => {
    if (record.previousIndex === null) {
      return;
    }
    if (record.currentIndex === null && !alreadySet[record.previousIndex]) {
      a[record.previousIndex] = null!;
      alteredItems.add(record.previousIndex);
    }
    removedItems.push(record.item);
  });

  const updatedItems: T[] = [];
  differ.forEachIdentityChange((record) => {
    const currIdx = record.currentIndex;

    // For all remaining cases, where we detect an identity/ref change,
    // but the index hasn't changed, that is, an update of the object's
    // internals*, we update the internal properties with the new internals
    // similarly to 'forEachMovedItem'.
    // * Simply said, this handles object updates where the position/index
    // remains the same.
    if (currIdx !== null && currIdx === record.previousIndex && !alteredItems.has(currIdx)) {
      for (const prop of Object.keys(b[currIdx])) {
        (a[currIdx] as any)[prop] = b[currIdx][prop];
      }
      updatedItems.push(a[currIdx]);
    }

    // Handle items with same identity but changed content (e.g., @for itemCount changes)
    // These items are not moved, added, or removed - they stayed in place but their
    // properties may have updated.
    if (currIdx !== null) {
      Object.keys(b[currIdx] as unknown as {}).forEach((prop) => {
        if (currIdx === null) {
          return;
        }
        (a[currIdx] as any)[prop] = (b[currIdx] as any)[prop];
      });
    }
  });

  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i] === null) {
      a.splice(i, 1);
    }
  }

  return {newItems, removedItems, movedItems, updatedItems};
};
