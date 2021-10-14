import {MatDatepickerModule} from '@angular/material/datepicker';
import {runDatepickerToggleHarnessTests} from './datepicker-toggle-harness-shared.spec';
import {MatDatepickerToggleHarness} from './datepicker-toggle-harness';
import {MatCalendarHarness} from './calendar-harness';

describe('Non-MDC-based datepicker toggle harness', () => {
  runDatepickerToggleHarnessTests(
    MatDatepickerModule,
    MatDatepickerToggleHarness,
    MatCalendarHarness,
  );
});
