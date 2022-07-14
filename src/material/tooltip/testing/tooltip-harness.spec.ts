import {MatTooltipModule} from '@angular/material/tooltip';
import {runHarnessTests} from '@angular/material/legacy-tooltip/testing/shared.spec';
import {MatTooltipHarness} from './index';

describe('MDC-based MatTooltipHarness', () => {
  runHarnessTests(MatTooltipModule, MatTooltipHarness as any);
});
