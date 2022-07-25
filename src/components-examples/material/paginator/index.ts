import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {PaginatorConfigurableExample} from './paginator-configurable/paginator-configurable-example';
import {PaginatorOverviewExample} from './paginator-overview/paginator-overview-example';
import {PaginatorHarnessExample} from './paginator-harness/paginator-harness-example';
import {
  PaginatorIntlExample,
  PaginatorIntlExampleModule,
} from './paginator-intl/paginator-intl-example';

export {
  PaginatorConfigurableExample,
  PaginatorHarnessExample,
  PaginatorIntlExample,
  PaginatorOverviewExample,
};

const EXAMPLES = [
  PaginatorConfigurableExample,
  PaginatorHarnessExample,
  // PaginatorIntlExample is imported through it's own example module.
  PaginatorOverviewExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatLegacyInputModule,
    MatPaginatorModule,
    PaginatorIntlExampleModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class PaginatorExamplesModule {}
