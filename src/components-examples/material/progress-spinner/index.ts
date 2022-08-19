import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {MatLegacyProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {MatLegacySliderModule} from '@angular/material/legacy-slider';
import {ProgressSpinnerConfigurableExample} from './progress-spinner-configurable/progress-spinner-configurable-example';
import {ProgressSpinnerOverviewExample} from './progress-spinner-overview/progress-spinner-overview-example';
import {ProgressSpinnerHarnessExample} from './progress-spinner-harness/progress-spinner-harness-example';

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
    MatLegacyCardModule,
    MatLegacyProgressSpinnerModule,
    MatLegacyRadioModule,
    MatLegacySliderModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class ProgressSpinnerExamplesModule {}
