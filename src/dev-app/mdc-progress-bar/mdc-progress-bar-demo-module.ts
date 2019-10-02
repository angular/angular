/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MatProgressBarModule} from '@angular/material-experimental/mdc-progress-bar';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MdcProgressBarDemo} from './mdc-progress-bar-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatProgressBarModule,
    MatButtonModule,
    MatButtonToggleModule,
    RouterModule.forChild([{path: '', component: MdcProgressBarDemo}]),
  ],
  declarations: [MdcProgressBarDemo],
})
export class MdcProgressBarDemoModule {
}
