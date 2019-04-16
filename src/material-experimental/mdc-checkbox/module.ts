/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {_MatCheckboxRequiredValidatorModule} from '@angular/material/checkbox';
import {MatCommonModule} from '@angular/material/core';
import {MatCheckbox} from './checkbox';

@NgModule({
  imports: [MatCommonModule, CommonModule, _MatCheckboxRequiredValidatorModule],
  exports: [MatCheckbox, MatCommonModule, _MatCheckboxRequiredValidatorModule],
  declarations: [MatCheckbox],
})
export class MatCheckboxModule {
}
