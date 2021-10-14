/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {MatSelectModule} from '@angular/material-experimental/mdc-select';
import {MatTooltipModule} from '@angular/material-experimental/mdc-tooltip';
import {RouterModule} from '@angular/router';
import {MdcTooltipDemo} from './mdc-tooltip-demo';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    RouterModule.forChild([{path: '', component: MdcTooltipDemo}]),
  ],
  declarations: [MdcTooltipDemo],
})
export class MdcTooltipDemoModule {}
