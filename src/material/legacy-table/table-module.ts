/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatLegacyRecycleRows, MatLegacyTable} from './table';
import {CdkTableModule} from '@angular/cdk/table';
import {
  MatLegacyCell,
  MatLegacyCellDef,
  MatLegacyColumnDef,
  MatLegacyFooterCell,
  MatLegacyFooterCellDef,
  MatLegacyHeaderCell,
  MatLegacyHeaderCellDef,
} from './cell';
import {
  MatLegacyFooterRow,
  MatLegacyFooterRowDef,
  MatLegacyHeaderRow,
  MatLegacyHeaderRowDef,
  MatLegacyRow,
  MatLegacyRowDef,
  MatLegacyNoDataRow,
} from './row';
import {MatLegacyTextColumn} from './text-column';
import {MatCommonModule} from '@angular/material/core';

const EXPORTED_DECLARATIONS = [
  // Table
  MatLegacyTable,
  MatLegacyRecycleRows,

  // Template defs
  MatLegacyHeaderCellDef,
  MatLegacyHeaderRowDef,
  MatLegacyColumnDef,
  MatLegacyCellDef,
  MatLegacyRowDef,
  MatLegacyFooterCellDef,
  MatLegacyFooterRowDef,

  // Cell directives
  MatLegacyHeaderCell,
  MatLegacyCell,
  MatLegacyFooterCell,

  // Row directives
  MatLegacyHeaderRow,
  MatLegacyRow,
  MatLegacyFooterRow,
  MatLegacyNoDataRow,

  MatLegacyTextColumn,
];

/**
 * @deprecated Use `MatTableModule` from `@angular/material/table` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@NgModule({
  imports: [CdkTableModule, MatCommonModule],
  exports: [MatCommonModule, EXPORTED_DECLARATIONS],
  declarations: EXPORTED_DECLARATIONS,
})
export class MatLegacyTableModule {}
