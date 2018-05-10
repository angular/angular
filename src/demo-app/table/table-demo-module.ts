/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {TableDemo} from './table-demo';
import {CustomTableDemo} from './custom-table/custom-table';
import {
  MatButtonModule,
  MatCardModule,
  MatPaginatorModule,
  MatRadioModule,
  MatSlideToggleModule,
  MatSortModule,
  MatTableModule
} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {CdkTableModule} from '@angular/cdk/table';
import {CommonModule} from '@angular/common';
import {WrapperTable} from './custom-table/wrapper-table';
import {SimpleColumn} from './custom-table/simple-column';
import {DataInputTableDemo} from './data-input-table/data-input-table';
import {WhenRowsDemo} from './when-rows/when-rows';
import {MaterialExampleModule} from '../example/example-module';


@NgModule({
  imports: [
    MaterialExampleModule,
    CdkTableModule,
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatRadioModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  declarations: [
    CustomTableDemo,
    DataInputTableDemo,
    TableDemo,
    WrapperTable,
    SimpleColumn,
    WhenRowsDemo,
  ],
})
export class TableDemoModule { }
