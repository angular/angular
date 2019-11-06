import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {CheckboxConfigurableExample} from './checkbox-configurable/checkbox-configurable-example';
import {CheckboxOverviewExample} from './checkbox-overview/checkbox-overview-example';

export {
  CheckboxConfigurableExample,
  CheckboxOverviewExample,
};

const EXAMPLES = [
  CheckboxConfigurableExample,
  CheckboxOverviewExample,
];

@NgModule({
  imports: [
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CheckboxExamplesModule {
}
