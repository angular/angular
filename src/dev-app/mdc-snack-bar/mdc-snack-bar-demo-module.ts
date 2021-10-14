/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatSnackBarModule} from '@angular/material-experimental/mdc-snack-bar';
import {RouterModule} from '@angular/router';
import {MdcSnackBarDemo} from './mdc-snack-bar-demo';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {MatSelectModule} from '@angular/material-experimental/mdc-select';

@NgModule({
  imports: [
    MatSnackBarModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterModule.forChild([{path: '', component: MdcSnackBarDemo}]),
  ],
  declarations: [MdcSnackBarDemo],
})
export class MdcSnackBarDemoModule {}
