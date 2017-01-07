import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdSelect} from './select';
import {MdOptionModule} from '../core/option/option';
import {
  DefaultStyleCompatibilityModeModule,
  OVERLAY_PROVIDERS,
  OverlayModule,
} from '../core';
export * from './select';
export {fadeInContent, transformPanel, transformPlaceholder} from './select-animations';


@NgModule({
  imports: [CommonModule, OverlayModule, MdOptionModule, DefaultStyleCompatibilityModeModule],
  exports: [MdSelect, MdOptionModule, DefaultStyleCompatibilityModeModule],
  declarations: [MdSelect],
})
export class MdSelectModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSelectModule,
      providers: [OVERLAY_PROVIDERS]
    };
  }
}
