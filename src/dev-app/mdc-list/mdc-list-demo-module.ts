/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatListModule} from '@angular/material-experimental/mdc-list';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {MdcListDemo} from './mdc-list-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    RouterModule.forChild([{path: '', component: MdcListDemo}]),
  ],
  declarations: [MdcListDemo],
})
export class MdcListDemoModule {}
