import {MatInputModule} from '@angular/material/input';
import {MatInputHarness} from './input-harness';
import {runHarnessTests} from './shared.spec';

describe('Non-MDC-based MatInputHarness', () => {
  runHarnessTests(MatInputModule, MatInputHarness);
});
