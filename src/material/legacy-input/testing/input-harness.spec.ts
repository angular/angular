import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacyInputHarness} from '@angular/material/legacy-input/testing';
import {runInputHarnessTests} from '@angular/material/input/testing/shared-input.spec';

describe('Non-MDC-based MatInputHarness', () => {
  runInputHarnessTests(MatLegacyInputModule, MatLegacyInputHarness);
});
