import {MatSidenavModule} from '@angular/material/sidenav';
import {runHarnessTests} from '@angular/material/sidenav/testing/shared.spec';
import {MatDrawerContainerHarness} from './drawer-container-harness';
import {MatDrawerContentHarness} from './drawer-content-harness';
import {MatDrawerHarness} from './drawer-harness';
import {MatSidenavContainerHarness} from './sidenav-container-harness';
import {MatSidenavContentHarness} from './sidenav-content-harness';
import {MatSidenavHarness} from './sidenav-harness';

describe('Non-MDC-based', () => {
  runHarnessTests(
    MatSidenavModule,
    MatDrawerHarness,
    MatDrawerContainerHarness,
    MatDrawerContentHarness,
    MatSidenavHarness,
    MatSidenavContainerHarness,
    MatSidenavContentHarness,
  );
});
