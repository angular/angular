import {MatProgressBarModule} from '@angular/material/progress-bar';
import {runHarnessTests} from '@angular/material/progress-bar/testing/shared.spec';
import {MatProgressBarHarness} from './progress-bar-harness';

describe('MatProgressBarHarness', () => {
  runHarnessTests(MatProgressBarModule, MatProgressBarHarness);
});
