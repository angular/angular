import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
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
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CheckboxExamplesModule {}
