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
import {MatLegacySlider} from './slider';

/**
 * @deprecated Use `MatSliderModule` from `@angular/material/slider` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@NgModule({
  imports: [CommonModule, MatCommonModule],
  exports: [MatLegacySlider, MatCommonModule],
  declarations: [MatLegacySlider],
})
export class MatLegacySliderModule {}
