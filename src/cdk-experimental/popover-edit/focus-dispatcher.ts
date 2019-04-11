/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {LEFT_ARROW, UP_ARROW, RIGHT_ARROW, DOWN_ARROW} from '@angular/cdk/keycodes';
import {Injectable} from '@angular/core';
import {PartialObserver} from 'rxjs';

import {EDITABLE_CELL_SELECTOR, ROW_SELECTOR, TABLE_SELECTOR} from './constants';
import {closest} from './polyfill';

/**
 * Service responsible for moving cell focus around in response to keyboard events.
 * May be overridden to customize the keyboard behavior of popover edit.
 */
@Injectable({providedIn: 'root'})
export class FocusDispatcher {
  /** Observes keydown events triggered from the table. */
  readonly keyObserver: PartialObserver<KeyboardEvent>;

  constructor(protected readonly directionality: Directionality) {
    this.keyObserver = {next: (event) => this.handleKeyboardEvent(event)};
  }

  /**
   * Moves focus to earlier or later cells (in dom order) by offset cells relative to
   * currentCell.
   */
  moveFocusHorizontally(currentCell: HTMLElement, offset: number): void {
    const cells = Array.from(closest(currentCell, TABLE_SELECTOR)!.querySelectorAll(
                      EDITABLE_CELL_SELECTOR)) as HTMLElement[];
    const currentIndex = cells.indexOf(currentCell);
    const newIndex = currentIndex + offset;

    if (cells[newIndex]) {
      cells[newIndex].focus();
    }
  }

  /** Moves focus to up or down by row by offset cells relative to currentCell. */
  moveFocusVertically(currentCell: HTMLElement, offset: number): void {
    const currentRow = closest(currentCell, ROW_SELECTOR)!;
    const rows = Array.from(closest(currentRow, TABLE_SELECTOR)!.querySelectorAll(ROW_SELECTOR));
    const currentRowIndex = rows.indexOf(currentRow);
    const currentIndexWithinRow =
        Array.from(currentRow.querySelectorAll(EDITABLE_CELL_SELECTOR)).indexOf(currentCell);
    const newRowIndex = currentRowIndex + offset;

    if (rows[newRowIndex]) {
      const rowToFocus =
          Array.from(rows[newRowIndex].querySelectorAll(EDITABLE_CELL_SELECTOR)) as HTMLElement[];

      if (rowToFocus[currentIndexWithinRow]) {
        rowToFocus[currentIndexWithinRow].focus();
      }
    }
  }

  /** Translates arrow keydown events into focus move operations. */
  protected handleKeyboardEvent(event: KeyboardEvent): void {
    const cell = closest(event.target, EDITABLE_CELL_SELECTOR) as HTMLElement | null;

    if (!cell) {
      return;
    }

    switch (event.keyCode) {
      case UP_ARROW:
        this.moveFocusVertically(cell, -1);
        break;
      case DOWN_ARROW:
        this.moveFocusVertically(cell, 1);
        break;
      case LEFT_ARROW:
        this.moveFocusHorizontally(cell, this.directionality.value === 'ltr' ? -1 : 1);
        break;
      case RIGHT_ARROW:
        this.moveFocusHorizontally(cell, this.directionality.value === 'ltr' ? 1 : -1);
        break;
      default:
        // If the keyboard event is not handled, return now so that we don't `preventDefault`.
        return;
    }

    event.preventDefault();
  }
}
