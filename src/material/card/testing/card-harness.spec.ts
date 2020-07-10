import {MatCardModule} from '@angular/material/card';
import {runHarnessTests} from '@angular/material/card/testing/shared.spec';
import {MatCardHarness} from './card-harness';

describe('Non-MDC-based MatCardHarness', () => {
  runHarnessTests(MatCardModule, MatCardHarness);
});
