/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MAT_MENU_DEFAULT_OPTIONS, MatMenu} from './menu-directive';
import {MatMenuItem} from './menu-item';
import {MAT_MENU_SCROLL_STRATEGY_PROVIDER, MatMenuTrigger} from './menu-trigger';


@NgModule({
  imports: [
    A11yModule,
    CommonModule,
    MatCommonModule,
    MatRippleModule,
    OverlayModule,
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
