import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {runInputHarnessTests} from '@angular/material/input/testing/shared-input.spec';
import {MatInputHarness} from './index';

describe('MDC-based MatInputHarness', () => {
  runInputHarnessTests(MatInputModule, MatInputHarness);
});
