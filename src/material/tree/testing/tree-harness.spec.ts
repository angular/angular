import {MatTreeHarness} from '@angular/material/tree/testing';
import {MatTreeModule} from '@angular/material/tree';
import {runHarnessTests} from '@angular/material/tree/testing/shared.spec';

describe('Non-MDC-based MatTreeHarness', () => {
  runHarnessTests(MatTreeModule, MatTreeHarness);
});
