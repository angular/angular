import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {ListOverviewExample} from './list-overview/list-overview-example';
import {ListSectionsExample} from './list-sections/list-sections-example';
import {ListSelectionExample} from './list-selection/list-selection-example';

export {
  ListOverviewExample,
  ListSectionsExample,
  ListSelectionExample,
};

const EXAMPLES = [
  ListOverviewExample,
  ListSectionsExample,
  ListSelectionExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class ListExamplesModule {
}
