import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {runHarnessTests} from '@angular/material/dialog/testing/shared.spec';
import {MatDialogHarness} from './dialog-harness';

describe('Non-MDC-based MatDialogHarness', () => {
  runHarnessTests(MatDialogModule, MatDialogHarness, MatDialog);
});
