import {MatSelectModule} from '@angular/material-experimental/mdc-select';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {runHarnessTests} from '@angular/material/select/testing/shared.spec';
import {MatSelectHarness} from './index';

describe('MDC-based MatSelectHarness', () => {
  runHarnessTests(MatFormFieldModule, MatSelectModule, MatSelectHarness as any);
});
