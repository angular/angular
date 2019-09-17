import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {
  PaginatorConfigurableExample
} from './paginator-configurable/paginator-configurable-example';
import {PaginatorOverviewExample} from './paginator-overview/paginator-overview-example';

export {
  PaginatorConfigurableExample,
  PaginatorOverviewExample,
};

const EXAMPLES = [
  PaginatorConfigurableExample,
  PaginatorOverviewExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatPaginatorModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class PaginatorExamplesModule {
}
