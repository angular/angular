import {MatSnackBarModule, MatSnackBar} from '@angular/material-experimental/mdc-snack-bar';
import {runHarnessTests} from '@angular/material/snack-bar/testing/shared.spec';
import {MatSnackBarHarness} from './snack-bar-harness';

describe('MDC-based MatSnackBarHarness', () => {
  runHarnessTests(MatSnackBarModule, MatSnackBar, MatSnackBarHarness as any);
});
