import {MatLegacyTabsModule} from '@angular/material/legacy-tabs';
import {runTabGroupHarnessTests} from '@angular/material/legacy-tabs/testing/tab-group-shared.spec';
import {MatLegacyTabGroupHarness} from './tab-group-harness';

describe('Non-MDC-based MatTabGroupHarness', () => {
  runTabGroupHarnessTests(MatLegacyTabsModule, MatLegacyTabGroupHarness);
});
