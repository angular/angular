import {runHarnessTests} from '@angular/material/slider/testing/shared.spec';
import {MatSliderModule} from '../index';
import {MatSliderHarness} from './slider-harness';

// TODO: disabled until we implement the new MDC slider.
describe('MDC-based MatSliderHarness dummy' , () => it('', () => {}));

// tslint:disable-next-line:ban
xdescribe('MDC-based MatSliderHarness', () => {
  runHarnessTests(MatSliderModule, MatSliderHarness as any, {
    supportsVertical: false,
    supportsInvert: false,
  });
});
