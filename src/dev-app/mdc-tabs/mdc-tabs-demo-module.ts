/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatTabsModule} from '@angular/material-experimental/mdc-tabs';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MdcTabsDemo} from './mdc-tabs-demo';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@NgModule({
  imports: [
    MatTabsModule,
    RouterModule.forChild([{path: '', component: MdcTabsDemo}]),
    CommonModule,
    MatButtonToggleModule,
  ],
  declarations: [MdcTabsDemo],
})
export class MdcTabsDemoModule {
}
