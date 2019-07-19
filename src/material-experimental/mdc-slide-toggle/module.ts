/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {_MatSlideToggleRequiredValidatorModule} from '@angular/material/slide-toggle';
import {MatSlideToggle} from './slide-toggle';

@NgModule({
  imports: [
    _MatSlideToggleRequiredValidatorModule,
    MatCommonModule,
    MatRippleModule,
    CommonModule
  ],
  exports: [
    _MatSlideToggleRequiredValidatorModule,
    MatSlideToggle,
    MatCommonModule
  ],
  declarations: [MatSlideToggle],
})
export class MatSlideToggleModule {
}
