/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdSelect, MdSelectTrigger, MD_SELECT_SCROLL_STRATEGY_PROVIDER} from './select';
import {MdCommonModule, MdOptionModule} from '../core';
import {OverlayModule} from '@angular/cdk/overlay';


@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    MdOptionModule,
    MdCommonModule,
  ],
  exports: [MdSelect, MdSelectTrigger, MdOptionModule, MdCommonModule],
  declarations: [MdSelect, MdSelectTrigger],
  providers: [MD_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class MdSelectModule {}


export * from './select';
export {fadeInContent, transformPanel, transformPlaceholder} from './select-animations';
