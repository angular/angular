import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {runHarnessTests} from './button-toggle-shared.spec';
import {MatButtonToggleHarness} from './button-toggle-harness';

describe('Non-MDC-based MatButtonToggleHarness', () => {
  runHarnessTests(MatButtonToggleModule, MatButtonToggleHarness);
});
