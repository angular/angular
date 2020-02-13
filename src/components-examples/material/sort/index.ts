import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatSortModule} from '@angular/material/sort';
import {SortOverviewExample} from './sort-overview/sort-overview-example';

export {SortOverviewExample};

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
  entryComponents: EXAMPLES,
})
export class SortExamplesModule {
}
