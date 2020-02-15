import { DefaultIterableDiffer } from '@angular/core';

export const diff = <T>(differ: DefaultIterableDiffer<T>, a: T[], b: T[]) => {
  differ.diff(a);
  differ.diff(b);

  differ.forEachRemovedItem(record => {
    a[record.previousIndex] = null;
  });

  const newItems: T[] = [];
  differ.forEachOperation((record, adjustedPreviousIndex, currentIndex) => {
    if (currentIndex !== null) {
      a[currentIndex] = record.item;
    }
    if (record.previousIndex === null && currentIndex) {
      newItems.push(record.item);
    }
  });

  let currentIdx = 0;
  for (const item of a) {
    if (item !== null) {
      a[currentIdx] = item;
      currentIdx++;
    }
  }

  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i] !== null) {
      break;
    }
    a.splice(i, 1);
  }

  return newItems;
};
