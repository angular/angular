import {runHarnessTests} from '@angular/material/slide-toggle/testing/shared.spec';
import {MatSlideToggleModule} from '../index';
import {MatSlideToggleHarness} from './slide-toggle-harness';

describe('MDC-based MatSlideToggleHarness', () => {
  runHarnessTests(MatSlideToggleModule, MatSlideToggleHarness as any);
});
