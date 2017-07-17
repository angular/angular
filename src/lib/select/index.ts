/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdSelect, MD_SELECT_SCROLL_STRATEGY_PROVIDER} from './select';
import {MdCommonModule, OverlayModule, MdOptionModule} from '../core';


@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    MdOptionModule,
    MdCommonModule,
  ],
  exports: [MdSelect, MdOptionModule, MdCommonModule],
  declarations: [MdSelect],
  providers: [MD_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class MdSelectModule {}


export * from './select';
export {fadeInContent, transformPanel, transformPlaceholder} from './select-animations';
