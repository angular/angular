import {MatMenuModule} from '@angular/material/menu';
import {runHarnessTests} from '@angular/material/menu/testing/shared.spec';
import {MatMenuHarness} from './menu-harness';

describe('Non-MDC-based MatMenuHarness', () => {
  runHarnessTests(MatMenuModule, MatMenuHarness);
});
