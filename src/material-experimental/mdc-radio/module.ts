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
import {MatRadioButton, MatRadioGroup} from './radio';

@NgModule({
  imports: [MatCommonModule, CommonModule, MatRippleModule],
  exports: [MatCommonModule, MatRadioGroup, MatRadioButton],
  declarations: [MatRadioGroup, MatRadioButton],
})
export class MatRadioModule {}
