import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatSortModule} from '@angular/material/sort';
import {SortOverviewExample} from './sort-overview/sort-overview-example';
import {SortHarnessExample} from './sort-harness/sort-harness-example';

export {SortHarnessExample, SortOverviewExample};

const EXAMPLES = [
  SortHarnessExample,
  SortOverviewExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatSortModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class SortExamplesModule {
}
