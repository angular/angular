/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {QueryList} from '@angular/core';
import {Subject} from 'rxjs';
import {
  UP_ARROW,
  DOWN_ARROW,
  LEFT_ARROW,
  RIGHT_ARROW,
} from '@angular/cdk/keycodes';


/** The keys handled by the GridKeyManager keydown method. */
export const NAVIGATION_KEYS = [DOWN_ARROW, UP_ARROW, RIGHT_ARROW, LEFT_ARROW];

/** This interface is for rows that can be passed to a GridKeyManager. */
export interface GridKeyManagerRow<T> {
  cells: T[];
}

/**
 * This class manages keyboard events for grids. If you pass it a query list
 * of GridKeyManagerRow, it will set the active cell correctly when arrow events occur.
 *
 * GridKeyManager expects that rows may change dynamically, but the cells for a given row are
 * static. It also expects that all rows have the same number of cells.
 */
export class GridKeyManager<T> {
  private _activeRowIndex = -1;
  private _activeColumnIndex = -1;
  private _activeRow: GridKeyManagerRow<T> | null = null;
  private _activeCell: T | null = null;
  private _dir: 'ltr' | 'rtl' = 'ltr';

  constructor(private _rows: QueryList<GridKeyManagerRow<T>> | GridKeyManagerRow<T>[]) {
    // We allow for the rows to be an array because, in some cases, the consumer may
    // not have access to a QueryList of the rows they want to manage (e.g. when the
    // rows aren't being collected via `ViewChildren` or `ContentChildren`).
    if (_rows instanceof QueryList) {
      _rows.changes.subscribe((newRows: QueryList<GridKeyManagerRow<T>>) => {
        if (this._activeRow) {
          const newIndex = newRows.toArray().indexOf(this._activeRow);

          if (newIndex > -1 && newIndex !== this._activeRowIndex) {
            this._activeRowIndex = newIndex;
          }
        }
      });
    }
  }

  /** Stream that emits whenever the active cell of the grid manager changes. */
  change = new Subject<{row: number, column: number}>();

  /**
   * Configures the directionality of the key manager's horizontal movement.
   * @param direction Direction which is considered forward movement across a row.
   *
   * If withDirectionality is not set, the default is 'ltr'.
   */
  withDirectionality(direction: 'ltr' | 'rtl'): this {
    this._dir = direction;
    return this;
  }

  /**
   * Sets the active cell to the cell at the indices specified.
   * @param cell The row and column containing the cell to be set as active.
   */
  setActiveCell(cell: {row: number, column: number}): void;

  /**
   * Sets the active cell to the cell.
   * @param cell The cell to be set as active.
   */
  setActiveCell(cell: T): void;

  setActiveCell(cell: any): void {
    const previousRowIndex = this._activeRowIndex;
    const previousColumnIndex = this._activeColumnIndex;

    this.updateActiveCell(cell);

    if (this._activeRowIndex !== previousRowIndex ||
      this._activeColumnIndex !== previousColumnIndex) {
      this.change.next({row: this._activeRowIndex, column: this._activeColumnIndex});
    }
  }

  /**
   * Sets the active cell depending on the key event passed in.
   * @param event Keyboard event to be used for determining which element should be active.
   */
  onKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;

    switch (keyCode) {
      case DOWN_ARROW:
        this.setNextRowActive();
        break;

      case UP_ARROW:
        this.setPreviousRowActive();
        break;

      case RIGHT_ARROW:
        this._dir === 'rtl' ? this.setPreviousColumnActive() : this.setNextColumnActive();
        break;

      case LEFT_ARROW:
        this._dir === 'rtl' ? this.setNextColumnActive() : this.setPreviousColumnActive();
        break;

      default:
        // Note that we return here, in order to avoid preventing
        // the default action of non-navigational keys.
        return;
    }

    event.preventDefault();
  }

  /** Index of the currently active row. */
  get activeRowIndex(): number {
    return this._activeRowIndex;
  }

  /** Index of the currently active column. */
  get activeColumnIndex(): number {
    return this._activeColumnIndex;
  }

  /** The active cell. */
  get activeCell(): T | null {
    return this._activeCell;
  }

  /** Sets the active cell to the first cell in the grid. */
  setFirstCellActive(): void {
    this._setActiveCellByIndex(0, 0);
  }

  /** Sets the active cell to the last cell in the grid. */
  setLastCellActive(): void {
    const lastRowIndex = this._rows.length - 1;
    const lastRow = this._getRowsArray()[lastRowIndex];
    this._setActiveCellByIndex(lastRowIndex, lastRow.cells.length - 1);
  }

  /** Sets the active row to the next row in the grid. Active column is unchanged. */
  setNextRowActive(): void {
    this._activeRowIndex < 0 ? this.setFirstCellActive() : this._setActiveCellByDelta(1, 0);
  }

  /** Sets the active row to the previous row in the grid. Active column is unchanged. */
  setPreviousRowActive(): void {
    this._setActiveCellByDelta(-1, 0);
  }

  /**
   * Sets the active column to the next column in the grid.
   * Active row is unchanged, unless we reach the end of a row.
   */
  setNextColumnActive(): void {
    this._activeRowIndex < 0 ? this.setFirstCellActive() : this._setActiveCellByDelta(0, 1);
  }

  /**
   * Sets the active column to the previous column in the grid.
   * Active row is unchanged, unless we reach the end of a row.
   */
  setPreviousColumnActive(): void {
    this._setActiveCellByDelta(0, -1);
  }

  /**
   * Allows setting the active cell without any other effects.
   * @param cell Row and column of the cell to be set as active.
   */
  updateActiveCell(cell: {row: number, column: number}): void;

  /**
   * Allows setting the active cell without any other effects.
   * @param cell Cell to be set as active.
   */
  updateActiveCell(cell: T): void;

  updateActiveCell(cell: any): void {
    const rowArray = this._getRowsArray();

    if (typeof cell === 'object' && typeof cell.row === 'number' &&
      typeof cell.column === 'number') {
      this._activeRowIndex = cell.row;
      this._activeColumnIndex = cell.column;
      this._activeRow = rowArray[cell.row] || null;
      this._activeCell = this._activeRow ? this._activeRow.cells[cell.column] || null : null;
    } else {
      rowArray.forEach((row, rowIndex) => {
        const columnIndex = row.cells.indexOf(cell);
        if (columnIndex !== -1) {
          this._activeRowIndex = rowIndex;
          this._activeColumnIndex = columnIndex;
          this._activeRow = row;
          this._activeCell = row.cells[columnIndex];
        }
      });
    }
  }

  /**
   * This method sets the active cell, given the row and columns deltas
   * between the currently active cell and the new active cell.
   */
  private _setActiveCellByDelta(rowDelta: -1 | 0 | 1, columnDelta: -1 | 0 | 1): void {
    // If delta puts us past the last cell in a row, move to the first cell of the next row.
    if (this._activeRow && this._activeColumnIndex + columnDelta >= this._activeRow.cells.length) {
      this._setActiveCellByIndex(this._activeRowIndex + 1, 0);

    // If delta puts us prior to the first cell in a row, move to the last cell of the previous row.
    } else if (this._activeColumnIndex + columnDelta < 0) {
      const previousRowIndex = this._activeRowIndex - 1;
      const previousRow = this._getRowsArray()[previousRowIndex];
      if (previousRow) {
        this._setActiveCellByIndex(previousRowIndex, previousRow.cells.length - 1);
      }
    } else {
      this._setActiveCellByIndex(this._activeRowIndex + rowDelta,
        this._activeColumnIndex + columnDelta);
    }
  }

  /**
   * Sets the active cell to the cell at the indices specified, if they are valid.
   */
  private _setActiveCellByIndex(rowIndex: number, columnIndex: number): void {
    const rows = this._getRowsArray();

    const targetRow = rows[rowIndex];

    if (!targetRow || !targetRow.cells[columnIndex]) {
      return;
    }

    this.setActiveCell({row: rowIndex, column: columnIndex});
  }

  /** Returns the rows as an array. */
  private _getRowsArray(): GridKeyManagerRow<T>[] {
    return this._rows instanceof QueryList ? this._rows.toArray() : this._rows;
  }
}
