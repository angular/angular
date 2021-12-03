import {LayoutModule} from '@angular/cdk/layout';
import {NgModule} from '@angular/core';
import {BreakpointObserverOverviewExample} from './breakpoint-observer-overview/breakpoint-observer-overview-example';

export {BreakpointObserverOverviewExample};

const EXAMPLES = [BreakpointObserverOverviewExample];

@NgModule({
  imports: [LayoutModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkLayoutExamplesModule {}
