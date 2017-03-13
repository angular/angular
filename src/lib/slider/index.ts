import {ModuleWithProviders, NgModule} from '@angular/core';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CompatibilityModule, GestureConfig, StyleModule} from '../core';
import {MdSlider} from './slider';
import {RtlModule} from '../core/rtl/dir';


@NgModule({
  imports: [CommonModule, FormsModule, CompatibilityModule, StyleModule, RtlModule],
  exports: [MdSlider, CompatibilityModule],
  declarations: [MdSlider],
  providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}]
})
export class MdSliderModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSliderModule,
      providers: []
    };
  }
}


export * from './slider';
