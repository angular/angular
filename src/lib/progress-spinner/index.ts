import {NgModule, ModuleWithProviders} from '@angular/core';
import {CompatibilityModule} from '../core';
import {
  MdProgressSpinner,
  MdSpinner,
  MdProgressSpinnerCssMatStyler,
} from './progress-spinner';


@NgModule({
  imports: [CompatibilityModule],
  exports: [
    MdProgressSpinner,
    MdSpinner,
    CompatibilityModule,
    MdProgressSpinnerCssMatStyler
  ],
  declarations: [
    MdProgressSpinner,
    MdSpinner,
    MdProgressSpinnerCssMatStyler
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
