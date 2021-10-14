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
import {MatCardModule} from '@angular/material-experimental/mdc-card';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {MatPaginatorModule} from '@angular/material-experimental/mdc-paginator';
import {MatSlideToggleModule} from '@angular/material-experimental/mdc-slide-toggle';
import {RouterModule} from '@angular/router';
import {MdcPaginatorDemo} from './mdc-paginator-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    RouterModule.forChild([{path: '', component: MdcPaginatorDemo}]),
  ],
  declarations: [MdcPaginatorDemo],
})
export class MdcPaginatorDemoModule {}
