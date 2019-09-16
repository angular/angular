import {MatCheckboxModule} from '../index';
import {MatCheckboxHarness} from './checkbox-harness';
import {runHarnessTests} from '@angular/material/checkbox/testing/shared.spec';

describe('MDC-based MatCheckboxHarness', () => {
  runHarnessTests(MatCheckboxModule, MatCheckboxHarness as any);
});
