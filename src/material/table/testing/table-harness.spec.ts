import {MatTableModule} from '@angular/material/table';
import {runHarnessTests} from './shared.spec';
import {MatTableHarness} from './table-harness';

describe('MDC-based MatTableHarness', () => {
  runHarnessTests(MatTableModule, MatTableHarness);
});
