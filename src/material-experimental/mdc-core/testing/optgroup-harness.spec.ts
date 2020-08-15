import {MatOptionModule} from '@angular/material-experimental/mdc-core';
import {runHarnessTests} from '@angular/material/core/testing/optgroup-shared.spec';
import {MatOptgroupHarness} from './optgroup-harness';

describe('MDC-based MatOptgroupHarness', () => {
  runHarnessTests(MatOptionModule, MatOptgroupHarness as any);
});
