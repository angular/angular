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
import {MatSlider, MatSliderThumb, MatSliderVisualThumb} from './slider';

@NgModule({
  imports: [MatCommonModule, CommonModule, MatRippleModule],
  exports: [MatSlider, MatSliderThumb],
  declarations: [MatSlider, MatSliderThumb, MatSliderVisualThumb],
})
export class MatSliderModule {}
