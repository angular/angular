import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {runHarnessTests} from '@angular/material/radio/testing/shared.spec';
import {MatLegacyRadioButtonHarness, MatLegacyRadioGroupHarness} from './radio-harness';

describe('Non-MDC-based', () => {
  runHarnessTests(
    MatLegacyRadioModule,
    MatLegacyRadioGroupHarness as any,
    MatLegacyRadioButtonHarness as any,
  );
});
