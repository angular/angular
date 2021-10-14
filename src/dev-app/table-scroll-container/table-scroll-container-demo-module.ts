/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CdkTableScrollContainerModule} from '@angular/cdk-experimental/table-scroll-container';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
/*import {MatTableModule} from '@angular/material-experimental/mdc-table';*/
import {MatTableModule} from '@angular/material/table';
import {RouterModule} from '@angular/router';
import {TableScrollContainerDemo} from './table-scroll-container-demo';

@NgModule({
  imports: [
    CdkTableScrollContainerModule,
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTableModule,
    RouterModule.forChild([{path: '', component: TableScrollContainerDemo}]),
  ],
  declarations: [TableScrollContainerDemo],
})
export class TableScrollContainerDemoModule {}
