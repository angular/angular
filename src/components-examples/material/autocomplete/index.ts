import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {
  AutocompleteAutoActiveFirstOptionExample
} from './autocomplete-auto-active-first-option/autocomplete-auto-active-first-option-example';
import {AutocompleteDisplayExample} from './autocomplete-display/autocomplete-display-example';
import {AutocompleteFilterExample} from './autocomplete-filter/autocomplete-filter-example';
import {AutocompleteOptgroupExample} from './autocomplete-optgroup/autocomplete-optgroup-example';
import {AutocompleteOverviewExample} from './autocomplete-overview/autocomplete-overview-example';
import {
  AutocompletePlainInputExample
} from './autocomplete-plain-input/autocomplete-plain-input-example';
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
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class AutocompleteExamplesModule {
}
