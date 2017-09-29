/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs/Subject';

/**
 * Class to be used to power selecting one or more options from a list.
 */
export class SelectionModel<T> {
  /** Currently-selected values. */
  private _selection: Set<T> = new Set();

  /** Keeps track of the deselected options that haven't been emitted by the change event. */
  private _deselectedToEmit: T[] = [];

  /** Keeps track of the selected option that haven't been emitted by the change event. */
  private _selectedToEmit: T[] = [];

  /** Cache for the array value of the selected items. */
  private _selected: T[] | null;

  /** Selected value(s). */
  get selected(): T[] {
    if (!this._selected) {
      this._selected = Array.from(this._selection.values());
    }

    return this._selected;
  }

  /** Event emitted when the value has changed. */
  onChange: Subject<SelectionChange<T>> | null = this._emitChanges ? new Subject() : null;

  constructor(
    private _isMulti = false,
    initiallySelectedValues?: T[],
    private _emitChanges = true) {

    if (initiallySelectedValues) {
      if (_isMulti) {
        initiallySelectedValues.forEach(value => this._markSelected(value));
      } else {
        this._markSelected(initiallySelectedValues[0]);
      }

      // Clear the array in order to avoid firing the change event for preselected values.
      this._selectedToEmit.length = 0;
    }
  }

  /**
   * Selects a value or an array of values.
   */
  select(...values: T[]): void {
    this._verifyValueAssignment(values);
    values.forEach(value => this._markSelected(value));
    this._emitChangeEvent();
  }

  /**
   * Deselects a value or an array of values.
   */
  deselect(...values: T[]): void {
    this._verifyValueAssignment(values);
    values.forEach(value => this._unmarkSelected(value));
    this._emitChangeEvent();
  }

  /**
   * Toggles a value between selected and deselected.
   */
  toggle(value: T): void {
    this.isSelected(value) ? this.deselect(value) : this.select(value);
  }

  /**
   * Clears all of the selected values.
   */
  clear(): void {
    this._unmarkAll();
    this._emitChangeEvent();
  }

  /**
   * Determines whether a value is selected.
   */
  isSelected(value: T): boolean {
    return this._selection.has(value);
  }

  /**
   * Determines whether the model does not have a value.
   */
  isEmpty(): boolean {
    return this._selection.size === 0;
  }

  /**
   * Determines whether the model has a value.
   */
  hasValue(): boolean {
    return !this.isEmpty();
  }

  /**
   * Sorts the selected values based on a predicate function.
   */
  sort(predicate?: (a: T, b: T) => number): void {
    if (this._isMulti && this._selected) {
      this._selected.sort(predicate);
    }
  }

  /** Emits a change event and clears the records of selected and deselected values. */
  private _emitChangeEvent() {
    if (this._selectedToEmit.length || this._deselectedToEmit.length) {
      let eventData = new SelectionChange(this._selectedToEmit, this._deselectedToEmit);

      if (this.onChange) {
        this.onChange.next(eventData);
      }

      this._deselectedToEmit = [];
      this._selectedToEmit = [];
    }

    this._selected = null;
  }

  /** Selects a value. */
  private _markSelected(value: T) {
    if (!this.isSelected(value)) {
      if (!this._isMulti) {
        this._unmarkAll();
      }

      this._selection.add(value);

      if (this._emitChanges) {
        this._selectedToEmit.push(value);
      }
    }
  }

  /** Deselects a value. */
  private _unmarkSelected(value: T) {
    if (this.isSelected(value)) {
      this._selection.delete(value);

      if (this._emitChanges) {
        this._deselectedToEmit.push(value);
      }
    }
  }

  /** Clears out the selected values. */
  private _unmarkAll() {
    if (!this.isEmpty()) {
      this._selection.forEach(value => this._unmarkSelected(value));
    }
  }

  /**
   * Verifies the value assignment and throws an error if the specified value array is
   * including multiple values while the selection model is not supporting multiple values.
   */
  private _verifyValueAssignment(values: T[]) {
    if (values.length > 1 && !this._isMulti) {
      throw getMultipleValuesInSingleSelectionError();
    }
  }
}

/**
 * Describes an event emitted when the value of a MatSelectionModel has changed.
 * @docs-private
 */
export class SelectionChange<T> {
  constructor(public added?: T[], public removed?: T[]) { }
}

/**
 * Returns an error that reports that multiple values are passed into a selection model
 * with a single value.
 */
export function getMultipleValuesInSingleSelectionError() {
  return Error('Cannot pass multiple values into SelectionModel with single-value mode.');
}
