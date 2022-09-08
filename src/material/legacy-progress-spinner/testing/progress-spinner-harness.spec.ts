import {MatLegacyProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {runHarnessTests} from '@angular/material/progress-spinner/testing/shared.spec';
import {MatLegacyProgressSpinnerHarness} from './progress-spinner-harness';

describe('Non-MDC-based MatProgressSpinnerHarness', () => {
  runHarnessTests(MatLegacyProgressSpinnerModule, MatLegacyProgressSpinnerHarness as any);
});
