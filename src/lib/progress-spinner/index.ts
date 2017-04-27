import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdCommonModule} from '../core';
import {
  MdProgressSpinner,
  MdSpinner,
  MdProgressSpinnerCssMatStyler,
} from './progress-spinner';


@NgModule({
  imports: [MdCommonModule],
  exports: [
    MdProgressSpinner,
    MdSpinner,
    MdCommonModule,
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
