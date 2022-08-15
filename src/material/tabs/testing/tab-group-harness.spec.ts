import {MatTabsModule} from '@angular/material/tabs';
import {runTabGroupHarnessTests} from '@angular/material/legacy-tabs/testing/tab-group-shared.spec';
import {MatTabGroupHarness} from './tab-group-harness';

describe('MDC-based MatTabGroupHarness', () => {
  runTabGroupHarnessTests(MatTabsModule, MatTabGroupHarness as any);
});
