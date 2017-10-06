/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {HeaderRowPlaceholder, RowPlaceholder, CdkTable} from './table';
import {CdkCellOutlet, CdkHeaderRow, CdkHeaderRowDef, CdkRow, CdkRowDef} from './row';
import {CdkColumnDef, CdkHeaderCellDef, CdkHeaderCell, CdkCell, CdkCellDef} from './cell';

const EXPORTED_DECLARATIONS = [
  CdkTable,
  CdkRowDef,
  CdkCellDef,
  CdkCellOutlet,
  CdkHeaderCellDef,
  CdkColumnDef,
  CdkCell,
  CdkRow,
  CdkHeaderCell,
  CdkHeaderRow,
  CdkHeaderRowDef,
  RowPlaceholder,
  HeaderRowPlaceholder,
];

@NgModule({
  imports: [CommonModule],
  exports: [EXPORTED_DECLARATIONS],
  declarations: [EXPORTED_DECLARATIONS]

})
export class CdkTableModule { }
