import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatSortModule} from '@angular/material/sort';
import {SortOverviewExample} from './sort-overview/sort-overview-example';

const EXAMPLES = [
  SortOverviewExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatSortModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class SortExamplesModule {
}
