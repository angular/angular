import {NgModule, ModuleWithProviders} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {MdSlideToggle} from './slide-toggle';
import {
  GestureConfig, CompatibilityModule, MdRippleModule, FOCUS_ORIGIN_MONITOR_PROVIDER
} from '../core';

@NgModule({
  imports: [FormsModule, MdRippleModule, CompatibilityModule],
  exports: [MdSlideToggle, CompatibilityModule],
  declarations: [MdSlideToggle],
  providers: [
    FOCUS_ORIGIN_MONITOR_PROVIDER,
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig }
  ],
})
export class MdSlideToggleModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSlideToggleModule,
      providers: []
    };
  }
}


export * from './slide-toggle';
