import {MatTabsModule} from '@angular/material-experimental/mdc-tabs';
import {runHarnessTests} from '@angular/material/tabs/testing/shared.spec';
import {MatTabGroupHarness} from './tab-group-harness';

describe('MDC-based MatTabGroupHarness', () => {
  runHarnessTests(MatTabsModule, MatTabGroupHarness as any);
});
