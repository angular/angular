import {MatTabsModule} from '@angular/material/tabs';
import {runTabNavBarHarnessTests} from '@angular/material/legacy-tabs/testing/tab-nav-bar-shared.spec';
import {MatTabNavBarHarness} from './tab-nav-bar-harness';

describe('MDC-based MatTabNavBarHarness', () => {
  runTabNavBarHarnessTests(MatTabsModule, MatTabNavBarHarness as any);
});
