import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyListModule} from '@angular/material/legacy-list';
import {ListOverviewExample} from './list-overview/list-overview-example';
import {ListSectionsExample} from './list-sections/list-sections-example';
import {ListSelectionExample} from './list-selection/list-selection-example';
import {ListSingleSelectionExample} from './list-single-selection/list-single-selection-example';
import {ListHarnessExample} from './list-harness/list-harness-example';

export {
  ListHarnessExample,
  ListOverviewExample,
  ListSectionsExample,
  ListSelectionExample,
  ListSingleSelectionExample,
};

const EXAMPLES = [
  ListHarnessExample,
  ListOverviewExample,
  ListSectionsExample,
  ListSelectionExample,
  ListSingleSelectionExample,
];

@NgModule({
  imports: [CommonModule, MatIconModule, MatLegacyListModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class ListExamplesModule {}
