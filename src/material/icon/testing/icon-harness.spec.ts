import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {runHarnessTests} from '@angular/material/icon/testing/shared.spec';
import {MatIconHarness} from './icon-harness';

describe('Non-MDC-based MatIconHarness', () => {
  runHarnessTests(MatIconModule, MatIconRegistry, MatIconHarness);
});
