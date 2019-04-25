/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {GestureConfig, MatListModule} from '@angular/material';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import {E2eAppLayout, Home} from './e2e-app-layout';

@NgModule({
  imports: [
    CommonModule,
    MatListModule,
    RouterModule,
  ],
  declarations: [E2eAppLayout, Home],
  exports: [E2eAppLayout],

  // We need to pass this in here, because the gesture config currently doesn't for lazy-loaded
  // modules. See https://github.com/angular/components/issues/4595#issuecomment-416641018.
  providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}]
})
export class E2eAppModule {
}
