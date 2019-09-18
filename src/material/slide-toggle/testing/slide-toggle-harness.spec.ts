import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {runHarnessTests} from '@angular/material/slide-toggle/testing/shared.spec';
import {MatSlideToggleHarness} from './slide-toggle-harness';

describe('Non-MDC-based MatSlideToggleHarness', () => {
  runHarnessTests(MatSlideToggleModule, MatSlideToggleHarness);
});
