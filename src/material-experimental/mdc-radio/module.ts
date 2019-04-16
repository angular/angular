/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatRadio} from './radio';

@NgModule({
  imports: [MatCommonModule, CommonModule],
  exports: [MatRadio, MatCommonModule],
  declarations: [MatRadio],
})
export class MatRadioModule {
}
