import {MatInputHarness} from '@angular/material-experimental/input/testing';
import {MatSelectHarness} from '@angular/material-experimental/select/testing';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

import {MatFormFieldHarness} from './form-field-harness';
import {runHarnessTests} from './shared.spec';

describe('Non-MDC-based MatFormFieldHarness', () => {
  runHarnessTests(
      [MatFormFieldModule, MatAutocompleteModule, MatInputModule, MatSelectModule],
      MatFormFieldHarness, MatInputHarness, MatSelectHarness);
});
