import {MatTabsModule} from '@angular/material-experimental/mdc-tabs';
import {runTabNavBarHarnessTests} from '@angular/material/tabs/testing/tab-nav-bar-shared.spec';
import {MatTabNavBarHarness} from './tab-nav-bar-harness';

describe('MDC-based MatTabNavBarHarness', () => {
  runTabNavBarHarnessTests(MatTabsModule, MatTabNavBarHarness as any);
});
