import {MatDatepickerModule} from '@angular/material/datepicker';
import {
  MatDateRangeInputHarness,
  MatStartDateHarness,
  MatEndDateHarness,
} from './date-range-input-harness';
import {runDateRangeInputHarnessTests} from './date-range-input-harness-shared.spec';
import {MatCalendarHarness} from './calendar-harness';

describe('Non-MDC-based date range input harness', () => {
  runDateRangeInputHarnessTests(
    MatDatepickerModule,
    MatDateRangeInputHarness,
    MatStartDateHarness,
    MatEndDateHarness,
    MatCalendarHarness,
  );
});
