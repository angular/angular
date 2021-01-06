import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {GridListDynamicExample} from './grid-list-dynamic/grid-list-dynamic-example';
import {GridListOverviewExample} from './grid-list-overview/grid-list-overview-example';
import {GridListHarnessExample} from './grid-list-harness/grid-list-harness-example';

export {
  GridListDynamicExample,
  GridListHarnessExample,
  GridListOverviewExample,
};

const EXAMPLES = [
  GridListDynamicExample,
  GridListHarnessExample,
  GridListOverviewExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatGridListModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class GridListExamplesModule {
}
