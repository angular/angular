import {MatPaginatorModule} from '@angular/material/paginator';
import {runHarnessTests} from './shared.spec';
import {MatPaginatorHarness} from './paginator-harness';

describe('Non-MDC-based MatPaginatorHarness', () => {
  runHarnessTests(MatPaginatorModule, MatPaginatorHarness);
});
