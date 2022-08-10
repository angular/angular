import {MatLegacyMenuModule} from '@angular/material/legacy-menu';
import {runHarnessTests} from '@angular/material/menu/testing/shared.spec';
import {MatLegacyMenuHarness} from './menu-harness';

describe('Non-MDC-based MatMenuHarness', () => {
  runHarnessTests(MatLegacyMenuModule, MatLegacyMenuHarness as any);
});
