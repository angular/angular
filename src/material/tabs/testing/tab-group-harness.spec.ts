import {MatTabsModule} from '@angular/material/tabs';
import {runTabGroupHarnessTests} from '@angular/material/tabs/testing/tab-group-shared.spec';
import {MatTabGroupHarness} from './tab-group-harness';

describe('Non-MDC-based MatTabGroupHarness', () => {
  runTabGroupHarnessTests(MatTabsModule, MatTabGroupHarness);
});
