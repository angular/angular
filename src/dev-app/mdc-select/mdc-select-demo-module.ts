/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatSelectModule} from '@angular/material-experimental/mdc-select';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material-experimental/mdc-card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {MdcSelectDemo} from './mdc-select-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule.forChild([{path: '', component: MdcSelectDemo}]),
  ],
  declarations: [MdcSelectDemo],
})
export class MdcSelectDemoModule {}
