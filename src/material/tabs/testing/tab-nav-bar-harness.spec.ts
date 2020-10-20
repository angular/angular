import {MatTabsModule} from '@angular/material/tabs';
import {runTabNavBarHarnessTests} from '@angular/material/tabs/testing/tab-nav-bar-shared.spec';
import {MatTabNavBarHarness} from './tab-nav-bar-harness';

describe('Non-MDC-based MatTabNavBarHarness', () => {
  runTabNavBarHarnessTests(MatTabsModule, MatTabNavBarHarness);
});
