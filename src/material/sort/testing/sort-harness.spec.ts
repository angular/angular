import {MatSortModule} from '@angular/material/sort';
import {runHarnessTests} from '@angular/material/sort/testing/shared.spec';
import {MatSortHarness} from './sort-harness';

describe('Non-MDC-based MatSortHarness', () => {
  runHarnessTests(MatSortModule, MatSortHarness);
});
