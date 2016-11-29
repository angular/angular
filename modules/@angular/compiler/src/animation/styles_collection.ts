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
  entries = new Map<string, {[key: string]: StylesCollectionEntry[]}>();

  insertAtTime(queryId: string, property: string, time: number, value: string|number) {
    let styles = this.entries.get(queryId);
    if (!styles) {
      this.entries.set(queryId, styles = {});
    }

    let entries = styles[property];
    if (!isPresent(entries)) {
      entries = styles[property] = [];
    }

    const tuple = new StylesCollectionEntry(time, value);
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

  getByIndex(queryId: string, property: string, index: number): StylesCollectionEntry {
    const styles = this.entries.get(queryId);
    if (styles) {
      const items = styles[property];
      if (isPresent(items)) {
        return index >= items.length ? null : items[index];
      }
    }
    return null;
  }

  indexOfAtOrBeforeTime(queryId: string, property: string, time: number): number {
    const styles = this.entries.get(queryId);
    if (styles) {
      const entries = styles[property];
      if (isPresent(entries)) {
        for (var i = entries.length - 1; i >= 0; i--) {
          if (entries[i].time <= time) return i;
        }
      }
    }
    return null;
  }
}
