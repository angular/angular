import {NgModule} from '@angular/core';
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
class MdProgressSpinnerModule {}

export {MdProgressSpinnerModule};
export * from './progress-spinner';
