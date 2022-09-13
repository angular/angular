import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatSliderModule} from '@angular/material/slider';
import {SliderConfigurableExample} from './slider-configurable/slider-configurable-example';
import {SliderFormattingExample} from './slider-formatting/slider-formatting-example';
import {SliderOverviewExample} from './slider-overview/slider-overview-example';
import {SliderHarnessExample} from './slider-harness/slider-harness-example';
import {SliderRangeExample} from './slider-range/slider-range-example';

export {
  SliderConfigurableExample,
  SliderFormattingExample,
  SliderHarnessExample,
  SliderOverviewExample,
  SliderRangeExample,
};

const EXAMPLES = [
  SliderConfigurableExample,
  SliderFormattingExample,
  SliderHarnessExample,
  SliderOverviewExample,
  SliderRangeExample,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatInputModule,
    MatSliderModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class SliderExamplesModule {}
