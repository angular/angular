/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatRippleModule} from '@angular/material/core';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacyPaginatorModule} from '@angular/material/legacy-paginator';
import {MatLegacyProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {MatSortModule} from '@angular/material/sort';
import {MatLegacyTableModule} from '@angular/material/legacy-table';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CdkTableModule} from '@angular/cdk/table';

import {LegacyTableFlexBasicExample} from './legacy-table-flex-basic/legacy-table-flex-basic-example';
import {LegacyTableBasicExample} from './legacy-table-basic/legacy-table-basic-example';
import {LegacyTableDynamicColumnsExample} from './legacy-table-dynamic-columns/legacy-table-dynamic-columns-example';
import {LegacyTableExpandableRowsExample} from './legacy-table-expandable-rows/legacy-table-expandable-rows-example';
import {LegacyTableFilteringExample} from './legacy-table-filtering/legacy-table-filtering-example';
import {LegacyTableFooterRowExample} from './legacy-table-footer-row/legacy-table-footer-row-example';
import {LegacyTableHttpExample} from './legacy-table-http/legacy-table-http-example';
import {LegacyTableMultipleHeaderFooterExample} from './legacy-table-multiple-header-footer/legacy-table-multiple-header-footer-example';
import {LegacyTableOverviewExample} from './legacy-table-overview/legacy-table-overview-example';
import {LegacyTablePaginationExample} from './legacy-table-pagination/legacy-table-pagination-example';
import {LegacyTableRowContextExample} from './legacy-table-row-context/legacy-table-row-context-example';
import {LegacyTableSelectionExample} from './legacy-table-selection/legacy-table-selection-example';
import {LegacyTableSortingExample} from './legacy-table-sorting/legacy-table-sorting-example';
import {LegacyTableStickyColumnsExample} from './legacy-table-sticky-columns/legacy-table-sticky-columns-example';
import {LegacyTableStickyComplexFlexExample} from './legacy-table-sticky-complex-flex/legacy-table-sticky-complex-flex-example';
import {LegacyTableStickyComplexExample} from './legacy-table-sticky-complex/legacy-table-sticky-complex-example';
import {LegacyTableStickyFooterExample} from './legacy-table-sticky-footer/legacy-table-sticky-footer-example';
import {LegacyTableStickyHeaderExample} from './legacy-table-sticky-header/legacy-table-sticky-header-example';
import {LegacyTableTextColumnAdvancedExample} from './legacy-table-text-column-advanced/legacy-table-text-column-advanced-example';
import {LegacyTableTextColumnExample} from './legacy-table-text-column/legacy-table-text-column-example';
import {
  LegacyTableWrappedExample,
  WrapperTable,
} from './legacy-table-wrapped/legacy-table-wrapped-example';
import {LegacyTableReorderableExample} from './legacy-table-reorderable/legacy-table-reorderable-example';
import {LegacyTableRecycleRowsExample} from './legacy-table-recycle-rows/legacy-table-recycle-rows-example';
import {LegacyTableWithRipplesExample} from './legacy-table-with-ripples/legacy-table-with-ripples-example';
import {LegacyTableColumnStylingExample} from './legacy-table-column-styling/legacy-table-column-styling-example';
import {LegacyTableRowBindingExample} from './legacy-table-row-binding/legacy-table-row-binding-example';
import {LegacyTableDynamicArrayDataExample} from './legacy-table-dynamic-array-data/legacy-table-dynamic-array-data-example';
import {LegacyTableDynamicObservableDataExample} from './legacy-table-dynamic-observable-data/legacy-table-dynamic-observable-data-example';
import {LegacyTableGeneratedColumnsExample} from './legacy-table-generated-columns/legacy-table-generated-columns-example';

export {
  LegacyTableBasicExample,
  LegacyTableColumnStylingExample,
  LegacyTableDynamicArrayDataExample,
  LegacyTableDynamicColumnsExample,
  LegacyTableDynamicObservableDataExample,
  LegacyTableExpandableRowsExample,
  LegacyTableFilteringExample,
  LegacyTableFlexBasicExample,
  LegacyTableFooterRowExample,
  LegacyTableGeneratedColumnsExample,
  LegacyTableHttpExample,
  LegacyTableMultipleHeaderFooterExample,
  LegacyTableOverviewExample,
  LegacyTablePaginationExample,
  LegacyTableRecycleRowsExample,
  LegacyTableReorderableExample,
  LegacyTableRowBindingExample,
  LegacyTableRowContextExample,
  LegacyTableSelectionExample,
  LegacyTableSortingExample,
  LegacyTableStickyColumnsExample,
  LegacyTableStickyComplexExample,
  LegacyTableStickyComplexFlexExample,
  LegacyTableStickyFooterExample,
  LegacyTableStickyHeaderExample,
  LegacyTableTextColumnAdvancedExample,
  LegacyTableTextColumnExample,
  LegacyTableWithRipplesExample,
  LegacyTableWrappedExample,
  WrapperTable,
};

const EXAMPLES = [
  LegacyTableBasicExample,
  LegacyTableColumnStylingExample,
  LegacyTableDynamicArrayDataExample,
  LegacyTableDynamicColumnsExample,
  LegacyTableDynamicObservableDataExample,
  LegacyTableExpandableRowsExample,
  LegacyTableFilteringExample,
  LegacyTableFlexBasicExample,
  LegacyTableFooterRowExample,
  LegacyTableGeneratedColumnsExample,
  LegacyTableHttpExample,
  LegacyTableMultipleHeaderFooterExample,
  LegacyTableOverviewExample,
  LegacyTablePaginationExample,
  LegacyTableRecycleRowsExample,
  LegacyTableReorderableExample,
  LegacyTableRowBindingExample,
  LegacyTableRowContextExample,
  LegacyTableSelectionExample,
  LegacyTableSortingExample,
  LegacyTableStickyColumnsExample,
  LegacyTableStickyComplexExample,
  LegacyTableStickyComplexFlexExample,
  LegacyTableStickyFooterExample,
  LegacyTableStickyHeaderExample,
  LegacyTableTextColumnAdvancedExample,
  LegacyTableTextColumnExample,
  LegacyTableWithRipplesExample,
  LegacyTableWrappedExample,
  WrapperTable,
];

@NgModule({
  imports: [
    CommonModule,
    MatLegacyButtonModule,
    MatButtonToggleModule,
    MatLegacyCheckboxModule,
    MatIconModule,
    MatLegacyInputModule,
    MatLegacyPaginatorModule,
    MatLegacyProgressSpinnerModule,
    MatRippleModule,
    MatSortModule,
    MatLegacyTableModule,
    CdkTableModule,
    DragDropModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class LegacyTableExamplesModule {}
