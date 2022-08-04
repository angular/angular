import {MatLegacyAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {
  MatDatepickerInputHarness,
  MatDateRangeInputHarness,
} from '@angular/material/datepicker/testing';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacyInputHarness} from '@angular/material/legacy-input/testing';
import {MatLegacySelectModule} from '@angular/material/legacy-select';
import {MatLegacySelectHarness} from '@angular/material/legacy-select/testing';

import {MatLegacyFormFieldHarness} from './form-field-harness';
import {runHarnessTests} from '@angular/material/form-field/testing/shared.spec';

describe('Non-MDC-based MatFormFieldHarness', () => {
  runHarnessTests(
    [
      MatLegacyFormFieldModule,
      MatLegacyAutocompleteModule,
      MatLegacyInputModule,
      MatLegacySelectModule,
      MatNativeDateModule,
      MatDatepickerModule,
    ],
    {
      formFieldHarness: MatLegacyFormFieldHarness as any,
      inputHarness: MatLegacyInputHarness,
      selectHarness: MatLegacySelectHarness,
      datepickerInputHarness: MatDatepickerInputHarness,
      dateRangeInputHarness: MatDateRangeInputHarness,
      isMdcImplementation: false,
    },
  );
});
