import {MatLegacyDialog, MatLegacyDialogModule} from '@angular/material/legacy-dialog';
import {runHarnessTests} from '@angular/material/legacy-dialog/testing/shared.spec';
import {MatLegacyDialogHarness} from './dialog-harness';

describe('Non-MDC-based MatDialogHarness', () => {
  runHarnessTests(MatLegacyDialogModule, MatLegacyDialogHarness, MatLegacyDialog);
});
