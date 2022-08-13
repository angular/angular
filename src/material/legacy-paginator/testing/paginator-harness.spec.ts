import {MatLegacyPaginatorModule} from '@angular/material/legacy-paginator';
import {runHarnessTests} from '@angular/material/paginator/testing/shared.spec';
import {MatLegacyPaginatorHarness} from './paginator-harness';

describe('Non-MDC-based MatPaginatorHarness', () => {
  runHarnessTests(MatLegacyPaginatorModule, MatLegacyPaginatorHarness as any);
});
