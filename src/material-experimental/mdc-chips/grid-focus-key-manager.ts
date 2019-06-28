/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GridKeyManager} from './grid-key-manager';

/**
 * A version of GridKeyManager where the cells are HTMLElements, and focus()
 * is called on a cell when it becomes active.
 */
export class GridFocusKeyManager extends GridKeyManager<HTMLElement> {
  /**
   * Sets the active cell to the cell at the specified
   * indices and focuses the newly active cell.
   * @param cell Row and column indices of the cell to be set as active.
   */
  setActiveCell(cell: {row: number, column: number}): void;

  /**
   * Sets the active cell to the cell that is specified and focuses it.
   * @param cell Cell to be set as active.
   */
  setActiveCell(cell: HTMLElement): void;

  setActiveCell(cell: any): void {
    super.setActiveCell(cell);

    if (this.activeCell) {
      this.activeCell.focus();
    }
  }
}
