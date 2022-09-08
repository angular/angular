import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {runHarnessTests} from '@angular/material/button/testing/shared.spec';
import {MatLegacyButtonHarness} from './button-harness';

describe('Non-MDC-based MatLegacyButtonHarness', () => {
  runHarnessTests(MatLegacyButtonModule, MatLegacyButtonHarness as any);
});
