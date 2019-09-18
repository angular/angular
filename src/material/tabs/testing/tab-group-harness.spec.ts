import {MatTabsModule} from '@angular/material/tabs';
import {runHarnessTests} from '@angular/material/tabs/testing/shared.spec';
import {MatTabGroupHarness} from './tab-group-harness';

describe('Non-MDC-based MatTabGroupHarness', () => {
  runHarnessTests(MatTabsModule, MatTabGroupHarness);
});
