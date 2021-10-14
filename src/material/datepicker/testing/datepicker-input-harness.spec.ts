import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDatepickerInputHarness} from './datepicker-input-harness';
import {runDatepickerInputHarnessTests} from './datepicker-input-harness-shared.spec';
import {MatCalendarHarness} from './calendar-harness';

describe('Non-MDC-based datepicker input harness', () => {
  runDatepickerInputHarnessTests(
    MatDatepickerModule,
    MatDatepickerInputHarness,
    MatCalendarHarness,
  );
});
