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

@NgModule({
  imports: [CdkTableModule, CommonModule, MatCommonModule],
  exports: [MatTable, MatCellDef, MatHeaderCellDef, MatColumnDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow,
    MatHeaderRowDef, MatRowDef],
  declarations: [MatTable, MatCellDef, MatHeaderCellDef, MatColumnDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow,
    MatHeaderRowDef, MatRowDef],
})
export class MatTableModule {}
