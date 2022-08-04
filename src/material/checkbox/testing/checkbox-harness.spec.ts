import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatCheckboxHarness} from './checkbox-harness';
import {runHarnessTests} from './shared.spec';

describe('MDC-based MatCheckboxHarness', () => {
  runHarnessTests(MatCheckboxModule, MatCheckboxHarness as any);
});
