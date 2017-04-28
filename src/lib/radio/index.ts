import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VIEWPORT_RULER_PROVIDER} from '../core/overlay/position/viewport-ruler';
import {
  MdRippleModule,
  MdCommonModule,
  UNIQUE_SELECTION_DISPATCHER_PROVIDER,
  FocusOriginMonitor,
} from '../core';
import {MdRadioGroup, MdRadioButton} from './radio';


@NgModule({
  imports: [CommonModule, MdRippleModule, MdCommonModule],
  exports: [MdRadioGroup, MdRadioButton, MdCommonModule],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER, VIEWPORT_RULER_PROVIDER, FocusOriginMonitor],
  declarations: [MdRadioGroup, MdRadioButton],
})
export class MdRadioModule {}


export * from './radio';
