import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacyNativeSelectHarness} from '@angular/material/legacy-input/testing';
import {runNativeSelectHarnessTests} from '@angular/material/input/testing/shared-native-select.spec';

describe('Non-MDC-based MatNativeSelectHarness', () => {
  runNativeSelectHarnessTests(MatLegacyInputModule, MatLegacyNativeSelectHarness);
});
