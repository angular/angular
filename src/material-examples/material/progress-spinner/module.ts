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

export {
  ProgressSpinnerConfigurableExample,
  ProgressSpinnerOverviewExample,
};

const EXAMPLES = [
  ProgressSpinnerConfigurableExample,
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
})
export class ProgressSpinnerExamplesModule {
}
