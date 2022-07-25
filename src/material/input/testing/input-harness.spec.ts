import {MatInputModule} from '@angular/material/input';
import {runInputHarnessTests} from './shared-input.spec';
import {MatInputHarness} from './input-harness';

describe('MDC-based MatInputHarness', () => {
  runInputHarnessTests(MatInputModule, MatInputHarness);
});
