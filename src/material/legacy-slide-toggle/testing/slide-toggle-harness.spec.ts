import {MatLegacySlideToggleModule} from '@angular/material/legacy-slide-toggle';
import {runHarnessTests} from '@angular/material/slide-toggle/testing/shared.spec';
import {MatLegacySlideToggleHarness} from './slide-toggle-harness';

describe('Non-MDC-based MatSlideToggleHarness', () => {
  runHarnessTests(MatLegacySlideToggleModule, MatLegacySlideToggleHarness as any);
});
