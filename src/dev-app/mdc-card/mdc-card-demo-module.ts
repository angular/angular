/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material-experimental/mdc-card';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {RouterModule} from '@angular/router';
import {MdcCardDemo} from './mdc-card-demo';

@NgModule({
  imports: [
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule,
    RouterModule.forChild([{path: '', component: MdcCardDemo}]),
  ],
  declarations: [MdcCardDemo],
})
export class MdcCardDemoModule {}
