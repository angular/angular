import {MatLegacyDialog, MatLegacyDialogModule} from '@angular/material/legacy-dialog';
import {runHarnessTests} from '@angular/material/dialog/testing/shared.spec';
import {MatLegacyDialogHarness} from './dialog-harness';

describe('Non-MDC-based MatDialogHarness', () => {
  runHarnessTests(MatLegacyDialogModule, MatLegacyDialogHarness as any, MatLegacyDialog as any);
});
