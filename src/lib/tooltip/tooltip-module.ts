/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule, ARIA_DESCRIBER_PROVIDER} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {PlatformModule} from '@angular/cdk/platform';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {
  MAT_TOOLTIP_SCROLL_STRATEGY_PROVIDER,
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatTooltip,
  TooltipComponent,
} from './tooltip';


@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    MatCommonModule,
    PlatformModule,
    A11yModule,
  ],
  exports: [MatTooltip, TooltipComponent, MatCommonModule],
  declarations: [MatTooltip, TooltipComponent],
  entryComponents: [TooltipComponent],
  providers: [
    MAT_TOOLTIP_SCROLL_STRATEGY_PROVIDER,
    ARIA_DESCRIBER_PROVIDER,
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: {
        showDelay: 0,
        hideDelay: 0,
        touchendHideDelay: 1500
      }
    }
  ],
})
export class MatTooltipModule {}
