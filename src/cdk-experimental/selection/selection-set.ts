/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TrackByFunction} from '@angular/core';
import {Subject} from 'rxjs';

/**
 * Maintains a set of selected values. One or more values can be added to or removed from the
 * selection.
 */
interface TrackBySelection<T> {
  isSelected(value: SelectableWithIndex<T>): boolean;
  select(...values: SelectableWithIndex<T>[]): void;
  deselect(...values: SelectableWithIndex<T>[]): void;
  changed: Subject<SelectionChange<T>>;
}

/**
 * A selectable value with an optional index. The index is required when the selection is used with
 * `trackBy`.
 */
export interface SelectableWithIndex<T> {
  value: T;
  index?: number;
}

/**
 * Represents the change in the selection set.
 */
export interface SelectionChange<T> {
  before: SelectableWithIndex<T>[];
  after: SelectableWithIndex<T>[];
}

/**
 * Maintains a set of selected items. Support selecting and deselecting items, and checking if a
 * value is selected.
 * When constructed with a `trackByFn`, all the items will be identified by applying the `trackByFn`
 * on them. Because `trackByFn` requires the index of the item to be passed in, the `index` field is
 * expected to be set when calling `isSelected`, `select` and `deselect`.
 */
export class SelectionSet<T> implements TrackBySelection<T> {
  private _selectionMap = new Map<T | ReturnType<TrackByFunction<T>>, SelectableWithIndex<T>>();
  changed = new Subject<SelectionChange<T>>();

  constructor(private _multiple = false, private _trackByFn?: TrackByFunction<T>) {}

  isSelected(value: SelectableWithIndex<T>): boolean {
    return this._selectionMap.has(this._getTrackedByValue(value));
  }

  select(...selects: SelectableWithIndex<T>[]) {
    if (!this._multiple && selects.length > 1 && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('SelectionSet: not multiple selection');
    }

    const before = this._getCurrentSelection();

    if (!this._multiple) {
      this._selectionMap.clear();
    }

    const toSelect: SelectableWithIndex<T>[] = [];
    for (const select of selects) {
      if (this.isSelected(select)) {
        continue;
      }

      toSelect.push(select);
      this._markSelected(this._getTrackedByValue(select), select);
    }

    const after = this._getCurrentSelection();

    this.changed.next({before, after});
  }

  deselect(...selects: SelectableWithIndex<T>[]) {
    if (!this._multiple && selects.length > 1 && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('SelectionSet: not multiple selection');
    }

    const before = this._getCurrentSelection();
    const toDeselect: SelectableWithIndex<T>[] = [];

    for (const select of selects) {
      if (!this.isSelected(select)) {
        continue;
      }

      toDeselect.push(select);
      this._markDeselected(this._getTrackedByValue(select));
    }

    const after = this._getCurrentSelection();
    this.changed.next({before, after});
  }

  private _markSelected(key: T | ReturnType<TrackByFunction<T>>, toSelect: SelectableWithIndex<T>) {
    this._selectionMap.set(key, toSelect);
  }

  private _markDeselected(key: T | ReturnType<TrackByFunction<T>>) {
    this._selectionMap.delete(key);
  }

  private _getTrackedByValue(select: SelectableWithIndex<T>) {
    if (!this._trackByFn) {
      return select.value;
    }

    if (select.index == null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('SelectionSet: index required when trackByFn is used.');
    }

    return this._trackByFn(select.index!, select.value);
  }

  private _getCurrentSelection(): SelectableWithIndex<T>[] {
    return Array.from(this._selectionMap.values());
  }
}
