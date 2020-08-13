/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of datepicker input instances. */
export interface DatepickerInputHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the value of the input. */
  value?: string | RegExp;
  /** Filters based on the placeholder text of the input. */
  placeholder?: string | RegExp;
}

/** A set of criteria that can be used to filter a list of datepicker toggle instances. */
export interface DatepickerToggleHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of calendar instances. */
export interface CalendarHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of calendar cell instances. */
export interface CalendarCellHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the text of the cell. */
  text?: string | RegExp;
  /** Filters based on whether the cell is selected. */
  selected?: boolean;
  /** Filters based on whether the cell is activated using keyboard navigation */
  active?: boolean;
  /** Filters based on whether the cell is disabled. */
  disabled?: boolean;
  /** Filters based on whether the cell represents today's date. */
  today?: boolean;
  /** Filters based on whether the cell is inside of the main range. */
  inRange?: boolean;
  /** Filters based on whether the cell is inside of the comparison range. */
  inComparisonRange?: boolean;
  /** Filters based on whether the cell is inside of the preview range. */
  inPreviewRange?: boolean;
}

/** A set of criteria that can be used to filter a list of date range input instances. */
export interface DateRangeInputHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the value of the input. */
  value?: string | RegExp;
}
