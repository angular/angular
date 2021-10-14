/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCardModule} from '@angular/material-experimental/mdc-card';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatChipsModule} from '@angular/material-experimental/mdc-chips';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {MdcChipsDemo} from './mdc-chips-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatToolbarModule,
    ReactiveFormsModule,
    RouterModule.forChild([{path: '', component: MdcChipsDemo}]),
  ],
  declarations: [MdcChipsDemo],
})
export class MdcChipsDemoModule {}
