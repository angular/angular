/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MatDatepickerBase, MatDatepickerContent} from './datepicker-base';
import {MatDateRangeInput} from './date-range-input';
import {MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER, DateRange} from './date-selection-model';

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
  providers: [MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER]
})
export class MatDateRangePicker<D>
  extends MatDatepickerBase<MatDateRangeInput<D>, DateRange<D>, D> {

  protected _forwardContentValues(instance: MatDatepickerContent<DateRange<D>, D>) {
    super._forwardContentValues(instance);

    const input = this._datepickerInput;

    if (input) {
      instance.comparisonStart = input.comparisonStart;
      instance.comparisonEnd = input.comparisonEnd;
    }
  }
}
