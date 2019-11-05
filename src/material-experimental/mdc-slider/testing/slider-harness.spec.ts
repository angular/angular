import {runHarnessTests} from '@angular/material/slider/testing/shared.spec';
import {MatSliderModule} from '../index';
import {MatSliderHarness} from './slider-harness';

describe('MDC-based MatSliderHarness', () => {
  runHarnessTests(MatSliderModule, MatSliderHarness as any, {
    supportsVertical: false,
    supportsInvert: false,
  });
});
