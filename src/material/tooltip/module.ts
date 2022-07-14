/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MatCommonModule} from '@angular/material/core';
import {
  MatTooltip,
  TooltipComponent,
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
} from './tooltip';

@NgModule({
  imports: [A11yModule, CommonModule, OverlayModule, MatCommonModule],
  exports: [MatTooltip, TooltipComponent, MatCommonModule, CdkScrollableModule],
  declarations: [MatTooltip, TooltipComponent],
  providers: [MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class MatTooltipModule {}
