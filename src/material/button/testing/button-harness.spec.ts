import {MatButtonModule} from '@angular/material/button';
import {runHarnessTests} from '@angular/material/button/testing/shared.spec';
import {MatButtonHarness} from './button-harness';

describe('Non-MDC-based MatButtonHarness', () => {
  runHarnessTests(MatButtonModule, MatButtonHarness);
});
