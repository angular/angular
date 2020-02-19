import { DefaultIterableDiffer } from '@angular/core';

export interface MovedRecord {
  currentIndex: number;
  previousIndex: number;
}

export const diff = <T>(differ: DefaultIterableDiffer<T>, a: T[], b: T[]) => {
  differ.diff(a);
  differ.diff(b);

  // We first have to set the moved items to their correct positions.
  // Keep in mind that the track by function may not guarantee
  // that we haven't changed any of the items' props.
  const movedItems: MovedRecord[] = [];
  differ.forEachMovedItem(record => {
    a[record.currentIndex] = a[record.previousIndex];
    movedItems.push(record);
  });

  // Now we can set the new items and remove the deleted ones.
  const newItems: T[] = [];
  const alreadySet = [];
  differ.forEachOperation(record => {
    if (record.currentIndex !== null && record.previousIndex === null) {
      a[record.currentIndex] = record.item;
      alreadySet[record.currentIndex] = true;
    }
    if (record.currentIndex === null && !alreadySet[record.currentIndex]) {
      a[record.previousIndex] = null;
    }
    if (record.previousIndex === null && record.currentIndex) {
      newItems.push(record.item);
    }
  });

  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i] === null) {
      a.splice(i, 1);
    }
  }

  return { newItems, movedItems };
};
