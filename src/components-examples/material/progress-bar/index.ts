import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {MatLegacyProgressBarModule} from '@angular/material/legacy-progress-bar';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {MatLegacySliderModule} from '@angular/material/legacy-slider';
import {ProgressBarBufferExample} from './progress-bar-buffer/progress-bar-buffer-example';
import {ProgressBarConfigurableExample} from './progress-bar-configurable/progress-bar-configurable-example';
import {ProgressBarDeterminateExample} from './progress-bar-determinate/progress-bar-determinate-example';
import {ProgressBarIndeterminateExample} from './progress-bar-indeterminate/progress-bar-indeterminate-example';
import {ProgressBarQueryExample} from './progress-bar-query/progress-bar-query-example';
import {ProgressBarHarnessExample} from './progress-bar-harness/progress-bar-harness-example';

export {
  ProgressBarBufferExample,
  ProgressBarConfigurableExample,
  ProgressBarDeterminateExample,
  ProgressBarHarnessExample,
  ProgressBarIndeterminateExample,
  ProgressBarQueryExample,
};

const EXAMPLES = [
  ProgressBarBufferExample,
  ProgressBarConfigurableExample,
  ProgressBarDeterminateExample,
  ProgressBarHarnessExample,
  ProgressBarIndeterminateExample,
  ProgressBarQueryExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatLegacyCardModule,
    MatLegacyProgressBarModule,
    MatLegacyRadioModule,
    MatLegacySliderModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class ProgressBarExamplesModule {}
