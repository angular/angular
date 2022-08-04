import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyCheckboxHarness} from './checkbox-harness';
import {runHarnessTests} from '@angular/material/checkbox/testing/shared.spec';

describe('Non-MDC-based MatLegacyCheckboxHarness', () => {
  runHarnessTests(MatLegacyCheckboxModule, MatLegacyCheckboxHarness as any);
});
