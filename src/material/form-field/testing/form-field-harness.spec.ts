import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatInputHarness} from '@angular/material/input/testing';
import {MatSelectModule} from '@angular/material/select';
import {MatSelectHarness} from '@angular/material/select/testing';

import {MatFormFieldHarness} from './form-field-harness';
import {runHarnessTests} from './shared.spec';

describe('Non-MDC-based MatFormFieldHarness', () => {
  runHarnessTests([MatFormFieldModule, MatAutocompleteModule, MatInputModule, MatSelectModule], {
    formFieldHarness: MatFormFieldHarness,
    inputHarness: MatInputHarness,
    selectHarness: MatSelectHarness,
    isMdcImplementation: false,
  });
});
