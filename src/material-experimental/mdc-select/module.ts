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
import {MatCommonModule, MatOptionModule} from '@angular/material-experimental/mdc-core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MAT_SELECT_SCROLL_STRATEGY_PROVIDER} from '@angular/material/select';
import {MatSelect, MatSelectTrigger} from './select';

@NgModule({
  imports: [CommonModule, OverlayModule, MatOptionModule, MatCommonModule],
  exports: [
    CdkScrollableModule,
    MatFormFieldModule,
    MatSelect,
    MatSelectTrigger,
    MatOptionModule,
    MatCommonModule,
  ],
  declarations: [MatSelect, MatSelectTrigger],
  providers: [MAT_SELECT_SCROLL_STRATEGY_PROVIDER],
})
export class MatSelectModule {}
