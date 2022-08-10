import {runHarnessTests} from '@angular/material/menu/testing/shared.spec';
import {MatMenuModule} from '../index';
import {MatMenuHarness} from './menu-harness';

describe('MDC-based MatMenuHarness', () => {
  runHarnessTests(MatMenuModule, MatMenuHarness);
});
