/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ObserversModule} from '@angular/cdk/observers';
import {MatRippleModule, MatCommonModule} from '@angular/material/core';
import {MatCheckbox} from './checkbox';
import {MatCheckboxRequiredValidator} from './checkbox-required-validator';
import {A11yModule} from '@angular/cdk/a11y';

@NgModule({
  imports: [CommonModule, MatRippleModule, MatCommonModule, ObserversModule, A11yModule],
  exports: [MatCheckbox, MatCheckboxRequiredValidator, MatCommonModule],
  declarations: [MatCheckbox, MatCheckboxRequiredValidator],
})
export class MatCheckboxModule {}
