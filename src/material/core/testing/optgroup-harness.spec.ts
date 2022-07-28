import {MatOptionModule} from '@angular/material/core';
import {runHarnessTests} from './optgroup-shared.spec';
import {MatOptgroupHarness} from './optgroup-harness';

describe('MDC-based MatOptgroupHarness', () => {
  runHarnessTests(MatOptionModule, MatOptgroupHarness);
});
