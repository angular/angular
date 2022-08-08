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
import {MatSlideToggle} from './slide-toggle';
import {MatSlideToggleRequiredValidator} from './slide-toggle-required-validator';

/** This module is used by both original and MDC-based slide-toggle implementations. */
@NgModule({
  exports: [MatSlideToggleRequiredValidator],
  declarations: [MatSlideToggleRequiredValidator],
})
export class _MatSlideToggleRequiredValidatorModule {}

@NgModule({
  imports: [_MatSlideToggleRequiredValidatorModule, MatCommonModule, MatRippleModule, CommonModule],
  exports: [_MatSlideToggleRequiredValidatorModule, MatSlideToggle, MatCommonModule],
  declarations: [MatSlideToggle],
})
export class MatSlideToggleModule {}
