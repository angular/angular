import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatCheckboxHarness} from './checkbox-harness';
import {runHarnessTests} from '@angular/material/checkbox/testing/shared.spec';

describe('Non-MDC-based MatCheckboxHarness', () => {
  runHarnessTests(MatCheckboxModule, MatCheckboxHarness);
});
