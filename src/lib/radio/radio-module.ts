/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatRadioButton, MatRadioGroup} from './radio';


@NgModule({
  imports: [CommonModule, MatRippleModule, MatCommonModule, A11yModule],
  exports: [MatRadioGroup, MatRadioButton, MatCommonModule],
  declarations: [MatRadioGroup, MatRadioButton],
})
export class MatRadioModule {}
