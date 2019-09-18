import {MatSliderModule} from '@angular/material/slider';
import {runHarnessTests} from '@angular/material/slider/testing/shared.spec';
import {MatSliderHarness} from './slider-harness';

describe('Non-MDC-based MatSliderHarness', () => {
  runHarnessTests(MatSliderModule, MatSliderHarness);
});
