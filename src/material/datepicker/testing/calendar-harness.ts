/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate, ComponentHarness} from '@angular/cdk/testing';
import {CalendarHarnessFilters, CalendarCellHarnessFilters} from './datepicker-harness-filters';
import {MatCalendarCellHarness} from './calendar-cell-harness';

/** Possible views of a `MatCalendarHarness`. */
export const enum CalendarView {
  MONTH,
  YEAR,
  MULTI_YEAR,
}

/** Harness for interacting with a standard Material calendar in tests. */
export class MatCalendarHarness extends ComponentHarness {
  static hostSelector = '.mat-calendar';

  /** Queries for the calendar's period toggle button. */
  private _periodButton = this.locatorFor('.mat-calendar-period-button');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatCalendarHarness`
   * that meets certain criteria.
   * @param options Options for filtering which calendar instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: CalendarHarnessFilters = {}): HarnessPredicate<MatCalendarHarness> {
    return new HarnessPredicate(MatCalendarHarness, options);
  }

  /**
   * Gets a list of cells inside the calendar.
   * @param filter Optionally filters which cells are included.
   */
  async getCells(filter: CalendarCellHarnessFilters = {}): Promise<MatCalendarCellHarness[]> {
    return this.locatorForAll(MatCalendarCellHarness.with(filter))();
  }

  /** Gets the current view that is being shown inside the calendar. */
  async getCurrentView(): Promise<CalendarView> {
    if (await this.locatorForOptional('mat-multi-year-view')()) {
      return CalendarView.MULTI_YEAR;
    }

    if (await this.locatorForOptional('mat-year-view')()) {
      return CalendarView.YEAR;
    }

    return CalendarView.MONTH;
  }

  /** Gets the label of the current calendar view. */
  async getCurrentViewLabel(): Promise<string> {
    return (await this._periodButton()).text();
  }

  /** Changes the calendar view by clicking on the view toggle button. */
  async changeView(): Promise<void> {
    return (await this._periodButton()).click();
  }

  /** Goes to the next page of the current view (e.g. next month when inside the month view). */
  async next(): Promise<void> {
    return (await this.locatorFor('.mat-calendar-next-button')()).click();
  }

  /**
   * Goes to the previous page of the current view
   * (e.g. previous month when inside the month view).
   */
  async previous(): Promise<void> {
    return (await this.locatorFor('.mat-calendar-previous-button')()).click();
  }

  /**
   * Selects a cell in the current calendar view.
   * @param filter An optional filter to apply to the cells. The first cell matching the filter
   *     will be selected.
   */
  async selectCell(filter: CalendarCellHarnessFilters = {}): Promise<void> {
    const cells = await this.getCells(filter);
    if (!cells.length) {
      throw Error(`Cannot find calendar cell matching filter ${JSON.stringify(filter)}`);
    }
    await cells[0].select();
  }
}
