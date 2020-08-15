import {MatOptionModule, MatOption} from '@angular/material-experimental/mdc-core';
import {runHarnessTests} from '@angular/material/core/testing/option-shared.spec';
import {MatOptionHarness} from './option-harness';

describe('MDC-based MatOptionHarness', () => {
  runHarnessTests(MatOptionModule, MatOptionHarness as any, MatOption);
});
