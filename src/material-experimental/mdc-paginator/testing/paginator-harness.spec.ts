import {MatPaginatorModule} from '@angular/material-experimental/mdc-paginator';
import {runHarnessTests} from '@angular/material/paginator/testing/shared.spec';
import {MatPaginatorHarness} from './paginator-harness';

describe('MDC-based MatPaginatorHarness', () => {
  runHarnessTests(MatPaginatorModule, MatPaginatorHarness as any);
});
