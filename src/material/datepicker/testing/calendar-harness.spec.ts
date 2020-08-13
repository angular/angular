import {MatDatepickerModule} from '@angular/material/datepicker';
import {runCalendarHarnessTests} from './calendar-harness-shared.spec';
import {MatCalendarHarness} from './calendar-harness';

describe('Non-MDC-based calendar harness', () => {
  runCalendarHarnessTests(MatDatepickerModule, MatCalendarHarness);
});
