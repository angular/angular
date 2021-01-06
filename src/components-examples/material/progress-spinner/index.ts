import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSliderModule} from '@angular/material/slider';
import {
  ProgressSpinnerConfigurableExample
} from './progress-spinner-configurable/progress-spinner-configurable-example';
import {
  ProgressSpinnerOverviewExample
} from './progress-spinner-overview/progress-spinner-overview-example';
import {
  ProgressSpinnerHarnessExample
} from './progress-spinner-harness/progress-spinner-harness-example';

export {
  ProgressSpinnerConfigurableExample,
  ProgressSpinnerHarnessExample,
  ProgressSpinnerOverviewExample,
};

const EXAMPLES = [
  ProgressSpinnerConfigurableExample,
  ProgressSpinnerHarnessExample,
  ProgressSpinnerOverviewExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSliderModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class ProgressSpinnerExamplesModule {
}
