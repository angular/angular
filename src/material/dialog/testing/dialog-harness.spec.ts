import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {runHarnessTests} from '@angular/material/legacy-dialog/testing/shared.spec';
import {MatDialogHarness} from './dialog-harness';

describe('MDC-based MatDialog', () => {
  runHarnessTests(MatDialogModule, MatDialogHarness as any, MatDialog as any);
});
