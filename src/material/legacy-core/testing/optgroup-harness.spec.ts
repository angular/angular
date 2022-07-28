import {MatLegacyOptionModule} from '@angular/material/legacy-core';
import {runHarnessTests} from '@angular/material/core/testing/optgroup-shared.spec';
import {MatLegacyOptgroupHarness} from './optgroup-harness';

describe('Non-MDC-based MatOptgroupHarness', () => {
  runHarnessTests(MatLegacyOptionModule, MatLegacyOptgroupHarness as any);
});
