/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCommonModule} from '@angular/material/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatMenu, MAT_MENU_DEFAULT_OPTIONS} from './menu-directive';
import {MatMenuItem} from './menu-item';
import {MatMenuTrigger, MAT_MENU_SCROLL_STRATEGY_PROVIDER} from './menu-trigger';
import {MatRippleModule} from '@angular/material/core';


@NgModule({
  imports: [
    OverlayModule,
    CommonModule,
    MatRippleModule,
    MatCommonModule,
  ],
  exports: [MatMenu, MatMenuItem, MatMenuTrigger, MatCommonModule],
  declarations: [MatMenu, MatMenuItem, MatMenuTrigger],
  providers: [
    MAT_MENU_SCROLL_STRATEGY_PROVIDER,
    {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useValue: {
        overlapTrigger: true,
        xPosition: 'after',
        yPosition: 'below',
      },
    }
  ],
})
export class MatMenuModule {}
