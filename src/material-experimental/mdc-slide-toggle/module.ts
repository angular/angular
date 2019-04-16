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
import {MatSlideToggle} from './slide-toggle';

@NgModule({
  imports: [MatCommonModule, CommonModule],
  exports: [MatSlideToggle, MatCommonModule],
  declarations: [MatSlideToggle],
})
export class MatSlideToggleModule {
}
