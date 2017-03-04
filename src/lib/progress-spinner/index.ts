import {NgModule, ModuleWithProviders} from '@angular/core';
import {CompatibilityModule} from '../core';
import {
  MdProgressSpinner,
  MdSpinner,
  MdProgressSpinnerCssMatStyler,
  MdProgressCircleCssMatStyler
} from './progress-spinner';


@NgModule({
  imports: [CompatibilityModule],
  exports: [
    MdProgressSpinner,
    MdSpinner,
    CompatibilityModule,
    MdProgressSpinnerCssMatStyler,
    MdProgressCircleCssMatStyler
  ],
  declarations: [
    MdProgressSpinner,
    MdSpinner,
    MdProgressSpinnerCssMatStyler,
    MdProgressCircleCssMatStyler
  ],
})
class MdProgressSpinnerModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdProgressSpinnerModule,
      providers: []
    };
  }
}

export {MdProgressSpinnerModule};
export * from './progress-spinner';

/** @deprecated */
export {MdProgressSpinnerModule as MdProgressCircleModule};
export {MdProgressSpinner as MdProgressCircle};
