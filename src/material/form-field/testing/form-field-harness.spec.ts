import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material-experimental/mdc-autocomplete';
import {MatInputHarness} from '@angular/material/input/testing';
import {MatSelectModule} from '@angular/material/select';
import {MatSelectHarness} from '@angular/material/select/testing';
import {runHarnessTests} from './shared.spec';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {
  MatDatepickerInputHarness,
  MatDateRangeInputHarness,
} from '@angular/material/datepicker/testing';
import {MatFormFieldHarness} from './form-field-harness';

describe('MDC-based MatFormFieldHarness', () => {
  runHarnessTests(
    [
      MatFormFieldModule,
      MatAutocompleteModule,
      MatInputModule,
      MatSelectModule,
      MatNativeDateModule,
      MatDatepickerModule,
    ],
    {
      formFieldHarness: MatFormFieldHarness,
      inputHarness: MatInputHarness,
      selectHarness: MatSelectHarness,
      datepickerInputHarness: MatDatepickerInputHarness,
      dateRangeInputHarness: MatDateRangeInputHarness,
      isMdcImplementation: true,
    },
  );
});
