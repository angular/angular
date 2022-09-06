/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {A11yModule} from '@angular/cdk/a11y';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MatLegacyTooltip, LegacyTooltipComponent} from './tooltip';
import {MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER} from '@angular/material/tooltip';

/**
 * @deprecated Use `MatTooltipModule` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@NgModule({
  imports: [A11yModule, CommonModule, OverlayModule, MatCommonModule],
  exports: [MatLegacyTooltip, LegacyTooltipComponent, MatCommonModule, CdkScrollableModule],
  declarations: [MatLegacyTooltip, LegacyTooltipComponent],
  providers: [MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class MatLegacyTooltipModule {}
