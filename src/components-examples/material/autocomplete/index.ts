import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacySlideToggleModule} from '@angular/material/legacy-slide-toggle';
import {AutocompleteAutoActiveFirstOptionExample} from './autocomplete-auto-active-first-option/autocomplete-auto-active-first-option-example';
import {AutocompleteDisplayExample} from './autocomplete-display/autocomplete-display-example';
import {AutocompleteFilterExample} from './autocomplete-filter/autocomplete-filter-example';
import {AutocompleteOptgroupExample} from './autocomplete-optgroup/autocomplete-optgroup-example';
import {AutocompleteOverviewExample} from './autocomplete-overview/autocomplete-overview-example';
import {AutocompletePlainInputExample} from './autocomplete-plain-input/autocomplete-plain-input-example';
import {AutocompleteSimpleExample} from './autocomplete-simple/autocomplete-simple-example';
import {AutocompleteHarnessExample} from './autocomplete-harness/autocomplete-harness-example';

export {
  AutocompleteAutoActiveFirstOptionExample,
  AutocompleteDisplayExample,
  AutocompleteFilterExample,
  AutocompleteHarnessExample,
  AutocompleteOptgroupExample,
  AutocompleteOverviewExample,
  AutocompletePlainInputExample,
  AutocompleteSimpleExample,
};

const EXAMPLES = [
  AutocompleteAutoActiveFirstOptionExample,
  AutocompleteDisplayExample,
  AutocompleteFilterExample,
  AutocompleteHarnessExample,
  AutocompleteOptgroupExample,
  AutocompleteOverviewExample,
  AutocompletePlainInputExample,
  AutocompleteSimpleExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatLegacyAutocompleteModule,
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacySlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class AutocompleteExamplesModule {}
