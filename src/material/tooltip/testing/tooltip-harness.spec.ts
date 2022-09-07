import {MatTooltipModule} from '@angular/material/tooltip';
import {runHarnessTests} from './shared.spec';
import {MatTooltipHarness} from './index';

describe('MDC-based MatTooltipHarness', () => {
  runHarnessTests(MatTooltipModule, MatTooltipHarness);
});
