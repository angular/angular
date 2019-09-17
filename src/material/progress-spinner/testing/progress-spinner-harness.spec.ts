import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {runHarnessTests} from '@angular/material/progress-spinner/testing/shared.spec';
import {MatProgressSpinnerHarness} from './progress-spinner-harness';

describe('Non-MDC-based MatProgressSpinnerHarness', () => {
  runHarnessTests(MatProgressSpinnerModule, MatProgressSpinnerHarness);
});
