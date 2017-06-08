import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {MdSlideToggle} from './slide-toggle';
import {
  FOCUS_ORIGIN_MONITOR_PROVIDER,
  GestureConfig,
  MdCommonModule,
  MdRippleModule,
  PlatformModule,
} from '../core';

@NgModule({
  imports: [FormsModule, MdRippleModule, MdCommonModule, PlatformModule],
  exports: [MdSlideToggle, MdCommonModule],
  declarations: [MdSlideToggle],
  providers: [
    FOCUS_ORIGIN_MONITOR_PROVIDER,
    {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}
  ],
})
export class MdSlideToggleModule {}


export * from './slide-toggle';
