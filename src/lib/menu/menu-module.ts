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
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatMenuContent} from './menu-content';
import {MatMenu} from './menu-directive';
import {MatMenuItem} from './menu-item';
import {
  MatMenuTrigger,
  MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER,
} from './menu-trigger';


@NgModule({
  imports: [
    CommonModule,
    MatCommonModule,
    MatRippleModule,
    OverlayModule,
  ],
  exports: [MatMenu, MatMenuItem, MatMenuTrigger, MatMenuContent, MatCommonModule],
  declarations: [MatMenu, MatMenuItem, MatMenuTrigger, MatMenuContent],
  providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class MatMenuModule {}
