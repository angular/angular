import {MatSelectModule} from '@angular/material/select';
import {MatSelectHarness} from './select-harness';
import {runHarnessTests} from './shared.spec';

describe('Non-MDC-based MatSelectHarness', () => {
  runHarnessTests(MatSelectModule, MatSelectHarness);
});
