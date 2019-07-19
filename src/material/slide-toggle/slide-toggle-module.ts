/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ObserversModule} from '@angular/cdk/observers';
import {NgModule} from '@angular/core';
import {GestureConfig, MatCommonModule, MatRippleModule} from '@angular/material/core';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {MatSlideToggle} from './slide-toggle';
import {MatSlideToggleRequiredValidator} from './slide-toggle-required-validator';

/** This module is used by both original and MDC-based slide-toggle implementations. */
@NgModule({
  exports: [MatSlideToggleRequiredValidator],
  declarations: [MatSlideToggleRequiredValidator],
})
// tslint:disable-next-line:class-name
export class _MatSlideToggleRequiredValidatorModule {
}

@NgModule({
  imports: [
    _MatSlideToggleRequiredValidatorModule,
    MatRippleModule,
    MatCommonModule,
    ObserversModule,
  ],
  exports: [
    _MatSlideToggleRequiredValidatorModule,
    MatSlideToggle,
    MatCommonModule
  ],
  declarations: [MatSlideToggle],
  providers: [
    {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}
  ],
})
export class MatSlideToggleModule {}
