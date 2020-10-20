import {MatTabsModule} from '@angular/material-experimental/mdc-tabs';
import {runTabGroupHarnessTests} from '@angular/material/tabs/testing/tab-group-shared.spec';
import {MatTabGroupHarness} from './tab-group-harness';

describe('MDC-based MatTabGroupHarness', () => {
  runTabGroupHarnessTests(MatTabsModule, MatTabGroupHarness as any);
});
