/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdTable} from './table';
import {CdkTableModule} from '@angular/cdk/table';
import {MdCell, MdHeaderCell, MdCellDef, MdHeaderCellDef, MdColumnDef} from './cell';
import {MdHeaderRow, MdRow, MdHeaderRowDef, MdRowDef, MatHeaderRowDef, MatRowDef} from './row';
import {CommonModule} from '@angular/common';
import {MdCommonModule} from '../core';

export * from './cell';
export * from './table';
export * from './row';

@NgModule({
  imports: [CdkTableModule, CommonModule, MdCommonModule],
  exports: [MdTable, MdCellDef, MdHeaderCellDef, MdColumnDef,
    MdHeaderRowDef, MdRowDef,
    MdHeaderCell, MdCell, MdHeaderRow, MdRow,
    MatHeaderRowDef, MatRowDef],
  declarations: [MdTable, MdCellDef, MdHeaderCellDef, MdColumnDef,
    MdHeaderRowDef, MdRowDef,
    MdHeaderCell, MdCell, MdHeaderRow, MdRow,
    MatHeaderRowDef, MatRowDef],
})
export class MdTableModule {}
