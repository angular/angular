import {MatTooltipModule} from '@angular/material-experimental/mdc-tooltip';
import {runHarnessTests} from '@angular/material/tooltip/testing/shared.spec';
import {MatTooltipHarness} from './index';

describe('MDC-based MatTooltipHarness', () => {
  runHarnessTests(MatTooltipModule, MatTooltipHarness as any);
});
