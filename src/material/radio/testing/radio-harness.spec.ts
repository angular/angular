import {MatRadioModule} from '@angular/material/radio';
import {runHarnessTests} from '@angular/material/radio/testing/shared.spec';
import {MatRadioButtonHarness, MatRadioGroupHarness} from './radio-harness';

describe('Non-MDC-based', () => {
  runHarnessTests(MatRadioModule, MatRadioGroupHarness, MatRadioButtonHarness);
});
