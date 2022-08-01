import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacySelectModule} from '@angular/material/legacy-select';
import {runHarnessTests} from '@angular/material/select/testing/shared.spec';
import {MatLegacySelectHarness} from './select-harness';

describe('Non-MDC-based MatSelectHarness', () => {
  runHarnessTests(MatLegacyFormFieldModule, MatLegacySelectModule, MatLegacySelectHarness as any);
});
