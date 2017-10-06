/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ObserversModule} from '@angular/cdk/observers';
import {PlatformModule} from '@angular/cdk/platform';
import {NgModule} from '@angular/core';
import {
  GestureConfig,
  MatCommonModule,
  MatRippleModule,
} from '@angular/material/core';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {A11yModule} from '@angular/cdk/a11y';
import {MatSlideToggle} from './slide-toggle';


@NgModule({
  imports: [MatRippleModule, MatCommonModule, PlatformModule, ObserversModule, A11yModule],
  exports: [MatSlideToggle, MatCommonModule],
  declarations: [MatSlideToggle],
  providers: [
    {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}
  ],
})
export class MatSlideToggleModule {}
