import {NgModule, ModuleWithProviders} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {GestureConfig, CompatibilityModule} from '../core';
import {MdSlideToggle} from './slide-toggle';
import {MdRippleModule} from '../core/ripple/index';


@NgModule({
  imports: [FormsModule, MdRippleModule, CompatibilityModule],
  exports: [MdSlideToggle, CompatibilityModule],
  declarations: [MdSlideToggle],
  providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}],
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
