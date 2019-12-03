import {MatBadgeModule} from '@angular/material/badge';
import {runHarnessTests} from '@angular/material/badge/testing/shared.spec';
import {MatBadgeHarness} from './badge-harness';

describe('Non-MDC-based MatBadgeHarness', () => {
  runHarnessTests(MatBadgeModule, MatBadgeHarness);
});
