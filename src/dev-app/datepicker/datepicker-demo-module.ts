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
  MatButtonModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatSelectModule
} from '@angular/material';
import {RouterModule} from '@angular/router';
import {CustomHeader, CustomHeaderNgContent, DatepickerDemo} from './datepicker-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule.forChild([{path: '', component: DatepickerDemo}]),
  ],
  declarations: [CustomHeader, CustomHeaderNgContent, DatepickerDemo],
  entryComponents: [CustomHeader, CustomHeaderNgContent],
})
export class DatepickerDemoModule {
}
