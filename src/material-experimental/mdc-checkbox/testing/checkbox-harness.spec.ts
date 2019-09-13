import {MatCheckboxModule} from '../index';
import {MatCheckboxHarness} from './checkbox-harness';
import {runTests} from '@angular/material/checkbox/testing/shared.spec';

describe('MDC-based MatCheckboxHarness', () => {
  runTests(MatCheckboxModule, MatCheckboxHarness as any);
});
