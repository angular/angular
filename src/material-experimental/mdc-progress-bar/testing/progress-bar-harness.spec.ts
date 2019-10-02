import {MatProgressBarModule} from '../index';
import {MatProgressBarHarness} from './progress-bar-harness';
import {runHarnessTests} from '@angular/material/progress-bar/testing/shared.spec';

describe('MDC-based MatProgressBarHarness', () => {
  runHarnessTests(MatProgressBarModule, MatProgressBarHarness as any);
});
