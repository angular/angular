import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdRippleModule, CompatibilityModule, FocusOriginMonitor} from '../core';
import {MdCheckbox} from './checkbox';


@NgModule({
  imports: [CommonModule, MdRippleModule, CompatibilityModule],
  exports: [MdCheckbox, CompatibilityModule],
  declarations: [MdCheckbox],
  providers: [FocusOriginMonitor]
})
export class MdCheckboxModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdCheckboxModule,
      providers: []
    };
  }
}


export * from './checkbox';
