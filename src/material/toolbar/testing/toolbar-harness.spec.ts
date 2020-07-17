import {runHarnessTests} from '@angular/material/toolbar/testing/shared.spec';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatToolbarHarness} from '@angular/material/toolbar/testing';

describe('Non-MDC-based MatToolbarHarness', () => {
  runHarnessTests(MatToolbarModule, MatToolbarHarness);
});
