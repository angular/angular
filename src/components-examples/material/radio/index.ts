import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {RadioNgModelExample} from './radio-ng-model/radio-ng-model-example';
import {RadioOverviewExample} from './radio-overview/radio-overview-example';
import {RadioHarnessExample} from './radio-harness/radio-harness-example';

export {
  RadioHarnessExample,
  RadioNgModelExample,
  RadioOverviewExample,
};

const EXAMPLES = [
  RadioHarnessExample,
  RadioNgModelExample,
  RadioOverviewExample,
];

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatRadioModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class RadioExamplesModule {
}
