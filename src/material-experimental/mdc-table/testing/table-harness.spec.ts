import {MatTableModule} from '@angular/material-experimental/mdc-table';
import {runHarnessTests} from '@angular/material/table/testing/shared.spec';
import {MatTableHarness} from './table-harness';

describe('MDC-based MatTableHarness', () => {
  runHarnessTests(MatTableModule, MatTableHarness as any);
});
