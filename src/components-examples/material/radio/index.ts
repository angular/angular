import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {RadioNgModelExample} from './radio-ng-model/radio-ng-model-example';
import {RadioOverviewExample} from './radio-overview/radio-overview-example';

export {
  RadioNgModelExample,
  RadioOverviewExample,
};

const EXAMPLES = [
  RadioNgModelExample,
  RadioOverviewExample,
];

@NgModule({
  imports: [
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
