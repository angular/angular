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
import {
  MatFormFieldModule,
  MatInputModule,
  MatPseudoCheckboxModule,
  MatSelectModule
} from '@angular/material';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {RouterModule} from '@angular/router';

import {
  AnimationsNoop,
  ClickActionCheck,
  ClickActionNoop,
  MatCheckboxDemoNestedChecklist,
  MdcCheckboxDemo
} from './mdc-checkbox-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPseudoCheckboxModule,
    ReactiveFormsModule,
    RouterModule.forChild([{path: '', component: MdcCheckboxDemo}]),
  ],
  declarations: [
    MdcCheckboxDemo, MatCheckboxDemoNestedChecklist, ClickActionCheck, ClickActionNoop,
    AnimationsNoop
  ],
})
export class MdcCheckboxDemoModule {
}
