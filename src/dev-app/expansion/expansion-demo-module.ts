/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkAccordionModule} from '@angular/cdk/accordion';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
  MatSlideToggleModule
} from '@angular/material';
import {ExpansionDemo} from './expansion-demo';

@NgModule({
  imports: [
    CdkAccordionModule, CommonModule, FormsModule, MatButtonModule, MatCheckboxModule,
    MatExpansionModule, MatFormFieldModule, MatInputModule, MatRadioModule, MatSlideToggleModule
  ],
  declarations: [ExpansionDemo],
})
export class ExpansionDemoModule {
}
