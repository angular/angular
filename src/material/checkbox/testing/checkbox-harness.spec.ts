import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatCheckboxHarness} from './checkbox-harness';
import {runTests} from '@angular/material/checkbox/testing/shared.spec';

describe('Non-MDC-based MatCheckboxHarness', () => {
  runTests(MatCheckboxModule, MatCheckboxHarness);
});
