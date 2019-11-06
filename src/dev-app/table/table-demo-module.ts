/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CdkTableExamplesModule} from '@angular/material-examples/cdk/table/module';
import {TableExamplesModule} from '@angular/material-examples/material/table/module';
import {TableDemo} from './table-demo';

@NgModule({
  imports: [
    CdkTableExamplesModule,
    TableExamplesModule,
    RouterModule.forChild([{path: '', component: TableDemo}]),
  ],
  declarations: [TableDemo],
})
export class TableDemoModule {
}
