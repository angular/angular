import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacyPaginatorModule} from '@angular/material/legacy-paginator';
import {LegacyPaginatorConfigurableExample} from './legacy-paginator-configurable/legacy-paginator-configurable-example';
import {LegacyPaginatorOverviewExample} from './legacy-paginator-overview/legacy-paginator-overview-example';
import {LegacyPaginatorHarnessExample} from './legacy-paginator-harness/legacy-paginator-harness-example';
import {
  LegacyPaginatorIntlExample,
  LegacyPaginatorIntlExampleModule,
} from './legacy-paginator-intl/legacy-paginator-intl-example';

export {
  LegacyPaginatorConfigurableExample,
  LegacyPaginatorHarnessExample,
  LegacyPaginatorIntlExample,
  LegacyPaginatorOverviewExample,
};

const EXAMPLES = [
  LegacyPaginatorConfigurableExample,
  LegacyPaginatorHarnessExample,
  // LegacyPaginatorIntlExample is imported through it's own example module.
  LegacyPaginatorOverviewExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatLegacyInputModule,
    MatLegacyPaginatorModule,
    LegacyPaginatorIntlExampleModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class PaginatorExamplesModule {}
