import {MatAutocompleteModule} from '@angular/material-experimental/mdc-autocomplete';
import {runHarnessTests} from '@angular/material/autocomplete/testing/shared.spec';
import {MatAutocompleteHarness} from './autocomplete-harness';

describe('MDC-based MatAutocompleteHarness', () => {
  runHarnessTests(MatAutocompleteModule, MatAutocompleteHarness as any);
});
