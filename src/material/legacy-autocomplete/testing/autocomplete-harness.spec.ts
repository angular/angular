import {MatLegacyAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {runHarnessTests} from '@angular/material/autocomplete/testing/shared.spec';
import {MatLegacyAutocompleteHarness} from './autocomplete-harness';

describe('Non-MDC-based MatAutocompleteHarness', () => {
  runHarnessTests(MatLegacyAutocompleteModule, MatLegacyAutocompleteHarness as any);
});
