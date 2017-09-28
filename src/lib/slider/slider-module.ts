/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {BidiModule} from '@angular/cdk/bidi';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {GestureConfig, MatCommonModule} from '@angular/material/core';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {MatSlider} from './slider';


@NgModule({
  imports: [CommonModule, MatCommonModule, BidiModule, A11yModule],
  exports: [MatSlider, MatCommonModule],
  declarations: [MatSlider],
  providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}]
})
export class MatSliderModule {}
