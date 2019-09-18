import {MatSidenavModule} from '@angular/material/sidenav';
import {runHarnessTests} from '@angular/material/sidenav/testing/shared.spec';
import {MatDrawerHarness} from './drawer-harness';
import {MatSidenavHarness} from './sidenav-harness';

describe('Non-MDC-based', () => {
  runHarnessTests(MatSidenavModule, MatDrawerHarness, MatSidenavHarness);
});
