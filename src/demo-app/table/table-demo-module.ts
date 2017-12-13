/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {TableDemo} from './table-demo';
import {TableHeaderDemo} from './table-header-demo';
import {PeopleDatabase} from './people-database';
import {TableDemoPage} from './table-demo-page';
import {CustomTableDemo} from './custom-table/custom-table';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatIconModule,
  MatInputModule, MatMenuModule,
  MatPaginatorModule,
  MatRadioModule,
  MatSortModule,
  MatTableModule, MatTabsModule
} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {CdkTableModule} from '@angular/cdk/table';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {WrapperTable} from './custom-table/wrapper-table';
import {SimpleColumn} from './custom-table/simple-column';

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
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    RouterModule,
  ],
  declarations: [
    CustomTableDemo,
    TableDemo,
    TableDemoPage,
    TableHeaderDemo,
    WrapperTable,
    SimpleColumn,
  ],
  providers: [
    PeopleDatabase
  ],
})
export class TableDemoModule { }
