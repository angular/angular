import {MatTableModule} from '@angular/material/table';
import {runHarnessTests} from '@angular/material/table/testing/shared.spec';
import {MatTableHarness} from './table-harness';

describe('Non-MDC-based MatTableHarness', () => {
  runHarnessTests(MatTableModule, MatTableHarness);
});
