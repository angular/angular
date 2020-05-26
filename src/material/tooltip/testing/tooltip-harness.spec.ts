import {MatTooltipModule} from '@angular/material/tooltip';
import {runHarnessTests} from '@angular/material/tooltip/testing/shared.spec';
import {MatTooltipHarness} from './tooltip-harness';

describe('Non-MDC-based MatTooltipHarness', () => {
  runHarnessTests(MatTooltipModule, MatTooltipHarness);
});
