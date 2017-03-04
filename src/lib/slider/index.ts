import {NgModule, ModuleWithProviders} from '@angular/core';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GestureConfig, CompatibilityModule} from '../core';
import {MdSlider} from './slider';


@NgModule({
  imports: [CommonModule, FormsModule, CompatibilityModule],
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
