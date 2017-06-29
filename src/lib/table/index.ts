/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdTable} from './table';
import {CdkDataTableModule} from '../core/data-table/index';
import {MdCell, MdHeaderCell} from './cell';
import {MdHeaderRow, MdRow} from './row';
import {CommonModule} from '@angular/common';
import {MdCommonModule} from '../core';

export * from './cell';
export * from './table';
export * from './row';

@NgModule({
  imports: [CdkDataTableModule, CommonModule, MdCommonModule],
  exports: [MdTable, MdHeaderCell, MdCell, MdHeaderRow, MdRow],
  declarations: [MdTable, MdHeaderCell, MdCell, MdHeaderRow, MdRow],
})
export class MdTableModule {}
