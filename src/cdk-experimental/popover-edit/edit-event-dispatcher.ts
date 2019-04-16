/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Observable, Subject, timer} from 'rxjs';
import {audit, distinctUntilChanged, filter, map, share} from 'rxjs/operators';

import {CELL_SELECTOR, ROW_SELECTOR} from './constants';
import {closest} from './polyfill';
import {EditRef} from './edit-ref';

/** The delay between mouse out events and hiding hover content. */
const DEFAULT_MOUSE_OUT_DELAY_MS = 30;

/**
 * Service for sharing delegated events and state for triggering table edits.
 */
@Injectable()
export class EditEventDispatcher {
  /** A subject that indicates which table cell is currently editing. */
  readonly editing = new Subject<Element|null>();

  /** A subject that indicates which table row is currently hovered. */
  readonly hovering = new Subject<Element|null>();

  /** A subject that emits mouse move events for table rows. */
  readonly mouseMove = new Subject<Element|null>();

  /** The EditRef for the currently active edit lens (if any). */
  get editRef(): EditRef<any>|null {
    return this._editRef;
  }
  private _editRef: EditRef<any>|null = null;

  /** The table cell that has an active edit lens (or null). */
  private _currentlyEditing: Element|null = null;

  private readonly _hoveringDistinct = this.hovering.pipe(distinctUntilChanged(), share());
  private readonly _editingDistinct = this.editing.pipe(distinctUntilChanged(), share());

  constructor() {
    this._editingDistinct.subscribe(cell => {
      this._currentlyEditing = cell;
    });
  }

  /**
   * Gets an Observable that emits true when the specified element's cell
   * is editing and false when not.
   */
  editingCell(element: Element|EventTarget): Observable<boolean> {
    let cell: Element|null = null;

    return this._editingDistinct.pipe(
        map(editCell => editCell === (cell || (cell = closest(element, CELL_SELECTOR)))),
        distinctUntilChanged(),
    );
  }

  /**
   * Stops editing for the specified cell. If the specified cell is not the current
   * edit cell, does nothing.
   */
  doneEditingCell(element: Element|EventTarget): void {
    const cell = closest(element, CELL_SELECTOR);

    if (this._currentlyEditing === cell) {
      this.editing.next(null);
    }
  }

  /** Sets the currently active EditRef. */
  setActiveEditRef(ref: EditRef<any>) {
    this._editRef = ref;
  }

  /** Unsets the currently active EditRef, if the specified editRef is active. */
  unsetActiveEditRef(ref: EditRef<any>) {
    if (this._editRef !== ref) {
      return;
    }

    this._editRef = null;
  }

  /**
   * Gets an Observable that emits true when the specified element's row
   * is being hovered over and false when not. Hovering is defined as when
   * the mouse has momentarily stopped moving over the cell.
   */
  hoveringOnRow(element: Element|EventTarget): Observable<boolean> {
    let row: Element|null = null;

    return this._hoveringDistinct.pipe(
        map(hoveredRow => hoveredRow === (row || (row = closest(element, ROW_SELECTOR)))),
        audit(
            (hovering) => hovering ? this.mouseMove.pipe(filter(hoveredRow => hoveredRow === row)) :
                                     timer(DEFAULT_MOUSE_OUT_DELAY_MS)),
        distinctUntilChanged(),
    );
  }
}
