import {MatDialog, MatDialogModule} from '@angular/material-experimental/mdc-dialog';
import {runHarnessTests} from '@angular/material/dialog/testing/shared.spec';
import {MatDialogHarness} from './dialog-harness';

describe('MDC-based MatDialog', () => {
  runHarnessTests(MatDialogModule, MatDialogHarness as any, MatDialog as any);
});
