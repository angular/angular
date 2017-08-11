/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdCommonModule} from '../core';
import {OverlayModule} from '@angular/cdk/overlay';
import {MdMenu, MD_MENU_DEFAULT_OPTIONS} from './menu-directive';
import {MdMenuItem} from './menu-item';
import {MdMenuTrigger, MD_MENU_SCROLL_STRATEGY_PROVIDER} from './menu-trigger';
import {MdRippleModule} from '../core/ripple/index';


@NgModule({
  imports: [
    OverlayModule,
    CommonModule,
    MdRippleModule,
    MdCommonModule,
  ],
  exports: [MdMenu, MdMenuItem, MdMenuTrigger, MdCommonModule],
  declarations: [MdMenu, MdMenuItem, MdMenuTrigger],
  providers: [
    MD_MENU_SCROLL_STRATEGY_PROVIDER,
    {
      provide: MD_MENU_DEFAULT_OPTIONS,
      useValue: {
        overlapTrigger: true,
        xPosition: 'after',
        yPosition: 'below',
      },
    }
  ],
})
export class MdMenuModule {}


export * from './menu';
export {fadeInItems, transformMenu} from './menu-animations';
