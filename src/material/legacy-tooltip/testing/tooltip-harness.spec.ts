import {MatLegacyTooltipModule} from '@angular/material/legacy-tooltip';
import {runHarnessTests} from '@angular/material/legacy-tooltip/testing/shared.spec';
import {MatLegacyTooltipHarness} from './tooltip-harness';

describe('Non-MDC-based MatTooltipHarness', () => {
  runHarnessTests(MatLegacyTooltipModule, MatLegacyTooltipHarness);
});
