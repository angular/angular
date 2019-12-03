import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {runHarnessTests} from '@angular/material/bottom-sheet/testing/shared.spec';
import {MatBottomSheetHarness} from './bottom-sheet-harness';

describe('Non-MDC-based MatBottomSheetHarness', () => {
  runHarnessTests(MatBottomSheetModule, MatBottomSheetHarness);
});
