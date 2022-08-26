/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MatDatepickerBase, MatDatepickerContent, MatDatepickerControl} from './datepicker-base';
import {MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER, DateRange} from './date-selection-model';
import {MAT_CALENDAR_RANGE_STRATEGY_PROVIDER} from './date-range-selection-strategy';

/**
 * Input that can be associated with a date range picker.
 * @docs-private
 */
export interface MatDateRangePickerInput<D> extends MatDatepickerControl<D> {
  _getEndDateAccessibleName(): string | null;
  _getStartDateAccessibleName(): string | null;
  comparisonStart: D | null;
  comparisonEnd: D | null;
}

// TODO(mmalerba): We use a component instead of a directive here so the user can use implicit
// template reference variables (e.g. #d vs #d="matDateRangePicker"). We can change this to a
// directive if angular adds support for `exportAs: '$implicit'` on directives.
/** Component responsible for managing the date range picker popup/dialog. */
@Component({
  selector: 'mat-date-range-picker',
  template: '',
  exportAs: 'matDateRangePicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER,
    MAT_CALENDAR_RANGE_STRATEGY_PROVIDER,
    {provide: MatDatepickerBase, useExisting: MatDateRangePicker},
  ],
})
export class MatDateRangePicker<D> extends MatDatepickerBase<
  MatDateRangePickerInput<D>,
  DateRange<D>,
  D
> {
  protected override _forwardContentValues(instance: MatDatepickerContent<DateRange<D>, D>) {
    super._forwardContentValues(instance);

    const input = this.datepickerInput;

    if (input) {
      instance.comparisonStart = input.comparisonStart;
      instance.comparisonEnd = input.comparisonEnd;
      instance.startDateAccessibleName = input._getStartDateAccessibleName();
      instance.endDateAccessibleName = input._getEndDateAccessibleName();
    }
  }
}
