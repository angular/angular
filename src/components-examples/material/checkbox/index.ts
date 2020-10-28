import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {CheckboxConfigurableExample} from './checkbox-configurable/checkbox-configurable-example';
import {CheckboxOverviewExample} from './checkbox-overview/checkbox-overview-example';
import {CheckboxHarnessExample} from './checkbox-harness/checkbox-harness-example';

export {
  CheckboxConfigurableExample,
  CheckboxOverviewExample,
  CheckboxHarnessExample,
};

const EXAMPLES = [
  CheckboxConfigurableExample,
  CheckboxOverviewExample,
  CheckboxHarnessExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CheckboxExamplesModule {
}
