import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {runHarnessTests} from '@angular/material/autocomplete/testing/shared.spec';
import {MatAutocompleteHarness} from './autocomplete-harness';

describe('Non-MDC-based MatAutocompleteHarness', () => {
  runHarnessTests(MatAutocompleteModule, MatAutocompleteHarness);
});
