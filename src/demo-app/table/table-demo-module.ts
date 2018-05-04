/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {TableDemo} from './table-demo';
import {PeopleDatabase} from './people-database';
import {TableDemoPage} from './table-demo-page';
import {CustomTableDemo} from './custom-table/custom-table';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatPaginatorModule,
  MatRadioModule,
  MatSlideToggleModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule
} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {CdkTableModule} from '@angular/cdk/table';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {WrapperTable} from './custom-table/wrapper-table';
import {SimpleColumn} from './custom-table/simple-column';
import {DataInputTableDemo} from './data-input-table/data-input-table';
import {MatTableDataSourceDemo} from './mat-table-data-source/mat-table-data-source';
import {DynamicColumnsDemo} from './dynamic-columns/dynamic-columns';
import {RowContextDemo} from './row-context/row-context';
import {WhenRowsDemo} from './when-rows/when-rows';
import {ExpandableRowsDemo} from 'table/expandable-rows/expandable-rows';


@NgModule({
  imports: [
    CdkTableModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    RouterModule,
  ],
  declarations: [
    CustomTableDemo,
    DataInputTableDemo,
    TableDemo,
    TableDemoPage,
    WrapperTable,
    SimpleColumn,
    MatTableDataSourceDemo,
    DynamicColumnsDemo,
    RowContextDemo,
    WhenRowsDemo,
    ExpandableRowsDemo
  ],
  providers: [
    PeopleDatabase
  ],
})
export class TableDemoModule { }
