import {MatLegacyOptionModule, MatLegacyOption} from '@angular/material/legacy-core';
import {runHarnessTests} from '@angular/material/core/testing/option-shared.spec';
import {MatLegacyOptionHarness} from './option-harness';

describe('Non-MDC-based MatOptionHarness', () => {
  runHarnessTests(MatLegacyOptionModule, MatLegacyOptionHarness as any, MatLegacyOption);
});
