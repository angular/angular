/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatTable} from './table';
import {CdkTableModule} from '@angular/cdk/table';
import {MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef} from './cell';
import {MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef} from './row';
import {CommonModule} from '@angular/common';
import {MatCommonModule} from '@angular/material/core';

const EXPORTED_DECLARATIONS = [
  // Table
  MatTable,

  // Template defs
  MatCellDef,
  MatHeaderCellDef,
  MatColumnDef,
  MatHeaderRowDef,
  MatRowDef,

  // Cell directives
  MatHeaderCell,
  MatCell,

  // Row directions
  MatHeaderRow,
  MatRow,
];

@NgModule({
  imports: [CdkTableModule, CommonModule, MatCommonModule],
  exports: EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS,
})
export class MatTableModule {}
