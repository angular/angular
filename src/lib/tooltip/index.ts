/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';
import {PlatformModule} from '@angular/cdk/platform';
import {MdCommonModule} from '../core';
import {MdTooltip, TooltipComponent, MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER} from './tooltip';
import {A11yModule, ARIA_DESCRIBER_PROVIDER} from '@angular/cdk/a11y';


@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    MdCommonModule,
    PlatformModule,
    A11yModule,
  ],
  exports: [MdTooltip, TooltipComponent, MdCommonModule],
  declarations: [MdTooltip, TooltipComponent],
  entryComponents: [TooltipComponent],
  providers: [MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER, ARIA_DESCRIBER_PROVIDER],
})
export class MdTooltipModule {}


export * from './tooltip';
