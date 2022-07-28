import {MatOptionModule, MatOption} from '@angular/material/core';
import {runHarnessTests} from './option-shared.spec';
import {MatOptionHarness} from './option-harness';

describe('MDC-based MatOptionHarness', () => {
  runHarnessTests(MatOptionModule, MatOptionHarness, MatOption);
});
