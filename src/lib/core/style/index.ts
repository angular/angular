import {NgModule} from '@angular/core';
import {CdkMonitorFocus, FOCUS_ORIGIN_MONITOR_PROVIDER} from './focus-origin-monitor';


@NgModule({
  declarations: [CdkMonitorFocus],
  exports: [CdkMonitorFocus],
  providers: [FOCUS_ORIGIN_MONITOR_PROVIDER],
})
export class StyleModule {}


export * from './focus-origin-monitor';
export * from './apply-transform';
