import {MatSnackBarModule} from '@angular/material/snack-bar';
import {runHarnessTests} from '@angular/material/snack-bar/testing/shared.spec';
import {MatSnackBarHarness} from './snack-bar-harness';

describe('Non-MDC-based MatSnackBarHarness', () => {
  runHarnessTests(MatSnackBarModule, MatSnackBarHarness);
});
