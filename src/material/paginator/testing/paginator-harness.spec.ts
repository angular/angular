import {MatPaginatorModule} from '@angular/material/paginator';
import {runHarnessTests} from './shared.spec';
import {MatPaginatorHarness} from './paginator-harness';

describe('MDC-based MatPaginatorHarness', () => {
  runHarnessTests(MatPaginatorModule, MatPaginatorHarness as any);
});
