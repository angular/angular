import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VIEWPORT_RULER_PROVIDER} from '../core/overlay/position/viewport-ruler';
import {
  MdRippleModule,
  CompatibilityModule,
  UNIQUE_SELECTION_DISPATCHER_PROVIDER,
  FocusOriginMonitor,
} from '../core';
import {MdRadioGroup, MdRadioButton} from './radio';


@NgModule({
  imports: [CommonModule, MdRippleModule, CompatibilityModule],
  exports: [MdRadioGroup, MdRadioButton, CompatibilityModule],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER, VIEWPORT_RULER_PROVIDER, FocusOriginMonitor],
  declarations: [MdRadioGroup, MdRadioButton],
})
export class MdRadioModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdRadioModule,
      providers: [],
    };
  }
}


export * from './radio';
