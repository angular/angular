import {NgModule} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatLegacyListModule} from '@angular/material/legacy-list';
import {DividerOverviewExample} from './divider-overview/divider-overview-example';
import {DividerHarnessExample} from './divider-harness/divider-harness-example';

export {DividerHarnessExample, DividerOverviewExample};

const EXAMPLES = [DividerHarnessExample, DividerOverviewExample];

@NgModule({
  imports: [MatDividerModule, MatLegacyListModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class DividerExamplesModule {}
