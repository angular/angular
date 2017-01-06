/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isPresent} from '../facade/lang';

export class StylesCollectionEntry {
  constructor(public time: number, public value: string|number) {}

  matches(time: number, value: string|number): boolean {
    return time == this.time && value == this.value;
  }
}

export class StylesCollection {
  styles: {[key: string]: StylesCollectionEntry[]} = {};

  insertAtTime(property: string, time: number, value: string|number) {
    const tuple = new StylesCollectionEntry(time, value);
    let entries = this.styles[property];
    if (!isPresent(entries)) {
      entries = this.styles[property] = [];
    }

    // insert this at the right stop in the array
    // this way we can keep it sorted
    let insertionIndex = 0;
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].time <= time) {
        insertionIndex = i + 1;
        break;
      }
    }

    entries.splice(insertionIndex, 0, tuple);
  }

  getByIndex(property: string, index: number): StylesCollectionEntry {
    const items = this.styles[property];
    if (isPresent(items)) {
      return index >= items.length ? null : items[index];
    }
    return null;
  }

  indexOfAtOrBeforeTime(property: string, time: number): number {
    const entries = this.styles[property];
    if (isPresent(entries)) {
      for (let i = entries.length - 1; i >= 0; i--) {
        if (entries[i].time <= time) return i;
      }
    }
    return null;
  }
}
