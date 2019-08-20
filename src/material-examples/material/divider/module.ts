import {NgModule} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {DividerOverviewExample} from './divider-overview/divider-overview-example';

const EXAMPLES = [
  DividerOverviewExample,
];

@NgModule({
  imports: [
    MatDividerModule,
    MatListModule,
  ],
  declarations: EXAMPLES,
})
export class DividerExamplesModule {
}
