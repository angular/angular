import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {MdSlideToggle} from './slide-toggle';
import {
  GestureConfig, MdCommonModule, MdRippleModule, FOCUS_ORIGIN_MONITOR_PROVIDER
} from '../core';

@NgModule({
  imports: [FormsModule, MdRippleModule, MdCommonModule],
  exports: [MdSlideToggle, MdCommonModule],
  declarations: [MdSlideToggle],
  providers: [
    FOCUS_ORIGIN_MONITOR_PROVIDER,
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig }
  ],
})
export class MdSlideToggleModule {}


export * from './slide-toggle';
