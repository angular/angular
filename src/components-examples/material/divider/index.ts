import {NgModule} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {DividerOverviewExample} from './divider-overview/divider-overview-example';
import {DividerHarnessExample} from './divider-harness/divider-harness-example';

export {DividerHarnessExample, DividerOverviewExample};

const EXAMPLES = [
  DividerHarnessExample,
  DividerOverviewExample,
];

@NgModule({
  imports: [
    MatDividerModule,
    MatListModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class DividerExamplesModule {
}
