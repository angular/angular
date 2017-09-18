/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VIEWPORT_RULER_PROVIDER} from '@angular/cdk/overlay';
import {
  MdRippleModule,
  MdCommonModule,
  UNIQUE_SELECTION_DISPATCHER_PROVIDER,
} from '@angular/material/core';
import {MdRadioGroup, MdRadioButton} from './radio';
import {A11yModule} from '@angular/cdk/a11y';

@NgModule({
  imports: [CommonModule, MdRippleModule, MdCommonModule, A11yModule],
  exports: [MdRadioGroup, MdRadioButton, MdCommonModule],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER, VIEWPORT_RULER_PROVIDER],
  declarations: [MdRadioGroup, MdRadioButton],
})
export class MdRadioModule {}


export * from './radio';
