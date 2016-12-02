import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdSelect} from './select';
import {MdOption} from './option';
import {
  DefaultStyleCompatibilityModeModule,
  OVERLAY_PROVIDERS,
  MdRippleModule,
  OverlayModule,
} from '../core';
export * from './select';


@NgModule({
  imports: [CommonModule, OverlayModule, MdRippleModule, DefaultStyleCompatibilityModeModule],
  exports: [MdSelect, MdOption, DefaultStyleCompatibilityModeModule],
  declarations: [MdSelect, MdOption],
})
export class MdSelectModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSelectModule,
      providers: [OVERLAY_PROVIDERS]
    };
  }
}
