import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {CheckboxConfigurableExample} from './checkbox-configurable/checkbox-configurable-example';
import {CheckboxHarnessExample} from './checkbox-harness/checkbox-harness-example';
import {CheckboxOverviewExample} from './checkbox-overview/checkbox-overview-example';
import {CheckboxReactiveFormsExample} from './checkbox-reactive-forms/checkbox-reactive-forms-example';

export {
  CheckboxConfigurableExample,
  CheckboxOverviewExample,
  CheckboxHarnessExample,
  CheckboxReactiveFormsExample,
};

const EXAMPLES = [
  CheckboxConfigurableExample,
  CheckboxOverviewExample,
  CheckboxHarnessExample,
  CheckboxReactiveFormsExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatLegacyCardModule,
    MatLegacyCheckboxModule,
    MatLegacyRadioModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CheckboxExamplesModule {}
