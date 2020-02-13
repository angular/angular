import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {GridListDynamicExample} from './grid-list-dynamic/grid-list-dynamic-example';
import {GridListOverviewExample} from './grid-list-overview/grid-list-overview-example';

export {
  GridListDynamicExample,
  GridListOverviewExample,
};

const EXAMPLES = [
  GridListDynamicExample,
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
