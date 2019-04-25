/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatMenuModule} from '@angular/material-experimental/mdc-menu';
import {RouterModule} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MdcMenuDemo} from './mdc-menu-demo';

@NgModule({
  imports: [
    CommonModule,
    MatMenuModule,
    RouterModule.forChild([{path: '', component: MdcMenuDemo}]),
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
  ],
  declarations: [MdcMenuDemo],
})
export class MdcMenuDemoModule {
}
