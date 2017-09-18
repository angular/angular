/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {MdCommonModule, GestureConfig} from '@angular/material/core';
import {MdSlider} from './slider';
import {BidiModule} from '@angular/material/core';
import {A11yModule} from '@angular/cdk/a11y';


@NgModule({
  imports: [CommonModule, MdCommonModule, BidiModule, A11yModule],
  exports: [MdSlider, MdCommonModule],
  declarations: [MdSlider],
  providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}]
})
export class MdSliderModule {}


export * from './slider';
