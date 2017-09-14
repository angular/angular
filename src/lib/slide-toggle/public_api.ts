/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ObserversModule} from '@angular/cdk/observers';
import {PlatformModule} from '@angular/cdk/platform';
import {NgModule} from '@angular/core';
import {
  FOCUS_ORIGIN_MONITOR_PROVIDER,
  GestureConfig,
  MdCommonModule,
  MdRippleModule,
} from '@angular/material/core';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {MdSlideToggle} from './slide-toggle';


@NgModule({
  imports: [MdRippleModule, MdCommonModule, PlatformModule, ObserversModule],
  exports: [MdSlideToggle, MdCommonModule],
  declarations: [MdSlideToggle],
  providers: [
    FOCUS_ORIGIN_MONITOR_PROVIDER,
    {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}
  ],
})
export class MdSlideToggleModule {}


export * from './slide-toggle';
