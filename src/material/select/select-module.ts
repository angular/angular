/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatOptionModule} from '@angular/material/core';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MAT_SELECT_SCROLL_STRATEGY_PROVIDER, MatSelect, MatSelectTrigger} from './select';

@NgModule({
  imports: [CommonModule, OverlayModule, MatOptionModule, MatCommonModule],
  exports: [
    CdkScrollableModule,
    MatLegacyFormFieldModule,
    MatSelect,
    MatSelectTrigger,
    MatOptionModule,
    MatCommonModule,
  ],
  declarations: [MatSelect, MatSelectTrigger],
  providers: [MAT_SELECT_SCROLL_STRATEGY_PROVIDER],
})
export class MatSelectModule {}
