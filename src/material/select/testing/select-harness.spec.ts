import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {runHarnessTests} from '@angular/material/select/testing/shared.spec';
import {MatSelectHarness} from './select-harness';

describe('MDC-based MatSelectHarness', () => {
  runHarnessTests(MatFormFieldModule, MatSelectModule, MatSelectHarness);
});
