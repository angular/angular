import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {runHarnessTests} from './shared.spec';
import {MatDialogHarness} from './dialog-harness';

describe('MDC-based MatDialog', () => {
  runHarnessTests(MatDialogModule, MatDialogHarness, MatDialog);
});
