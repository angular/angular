/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatRadioModule} from '@angular/material-experimental/mdc-radio';
import {RouterModule} from '@angular/router';
import {MdcRadioDemo} from './mdc-radio-demo';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MatRadioModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    RouterModule.forChild([{path: '', component: MdcRadioDemo}]),
  ],
  declarations: [MdcRadioDemo],
})
export class MdcRadioDemoModule {}
