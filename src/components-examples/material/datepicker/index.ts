import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';

import {DatepickerApiExample} from './datepicker-api/datepicker-api-example';
import {DatepickerColorExample} from './datepicker-color/datepicker-color-example';
import {
  DatepickerCustomHeaderExample,
  ExampleHeader
} from './datepicker-custom-header/datepicker-custom-header-example';
import {DatepickerCustomIconExample} from './datepicker-custom-icon/datepicker-custom-icon-example';
import {DatepickerDateClassExample} from './datepicker-date-class/datepicker-date-class-example';
import {DatepickerDisabledExample} from './datepicker-disabled/datepicker-disabled-example';
import {DatepickerEventsExample} from './datepicker-events/datepicker-events-example';
import {DatepickerFilterExample} from './datepicker-filter/datepicker-filter-example';
import {DatepickerFormatsExample} from './datepicker-formats/datepicker-formats-example';
import {DatepickerLocaleExample} from './datepicker-locale/datepicker-locale-example';
import {DatepickerMinMaxExample} from './datepicker-min-max/datepicker-min-max-example';
import {DatepickerMomentExample} from './datepicker-moment/datepicker-moment-example';
import {DatepickerOverviewExample} from './datepicker-overview/datepicker-overview-example';
import {DatepickerStartViewExample} from './datepicker-start-view/datepicker-start-view-example';
import {DatepickerTouchExample} from './datepicker-touch/datepicker-touch-example';
import {DatepickerValueExample} from './datepicker-value/datepicker-value-example';
import {
  DatepickerViewsSelectionExample
} from './datepicker-views-selection/datepicker-views-selection-example';
import {
  DateRangePickerOverviewExample
} from './date-range-picker-overview/date-range-picker-overview-example';
import {
  DateRangePickerFormsExample
} from './date-range-picker-forms/date-range-picker-forms-example';
import {
  DateRangePickerComparisonExample
} from './date-range-picker-comparison/date-range-picker-comparison-example';
import {
  DateRangePickerSelectionStrategyExample
} from './date-range-picker-selection-strategy/date-range-picker-selection-strategy-example';
import {DatepickerHarnessExample} from './datepicker-harness/datepicker-harness-example';
import {DatepickerActionsExample} from './datepicker-actions/datepicker-actions-example';

export {
  DatepickerApiExample,
  DatepickerColorExample,
  DatepickerCustomHeaderExample,
  DatepickerCustomIconExample,
  DatepickerDateClassExample,
  DatepickerDisabledExample,
  DatepickerEventsExample,
  DatepickerFilterExample,
  DatepickerFormatsExample,
  DatepickerHarnessExample,
  DatepickerLocaleExample,
  DatepickerMinMaxExample,
  DatepickerMomentExample,
  DatepickerOverviewExample,
  DatepickerStartViewExample,
  DatepickerTouchExample,
  DatepickerValueExample,
  DatepickerViewsSelectionExample,
  DateRangePickerOverviewExample,
  DateRangePickerFormsExample,
  DateRangePickerComparisonExample,
  DateRangePickerSelectionStrategyExample,
  DatepickerActionsExample,
  ExampleHeader,
};

const EXAMPLES = [
  DatepickerApiExample,
  DatepickerColorExample,
  DatepickerCustomHeaderExample,
  DatepickerCustomIconExample,
  DatepickerDateClassExample,
  DatepickerDisabledExample,
  DatepickerEventsExample,
  DatepickerFilterExample,
  DatepickerFormatsExample,
  DatepickerHarnessExample,
  DatepickerLocaleExample,
  DatepickerMinMaxExample,
  DatepickerMomentExample,
  DatepickerOverviewExample,
  DatepickerStartViewExample,
  DatepickerTouchExample,
  DatepickerValueExample,
  DatepickerViewsSelectionExample,
  DateRangePickerOverviewExample,
  DateRangePickerFormsExample,
  DateRangePickerComparisonExample,
  DateRangePickerSelectionStrategyExample,
  DatepickerActionsExample,
  ExampleHeader,
];

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class DatepickerExamplesModule {
}
