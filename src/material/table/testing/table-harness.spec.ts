import {MatTableModule} from '@angular/material/table';
import {runHarnessTests} from '@angular/material/legacy-table/testing/shared.spec';
import {MatTableHarness} from './table-harness';

describe('MDC-based MatTableHarness', () => {
  runHarnessTests(MatTableModule, MatTableHarness as any);
});
