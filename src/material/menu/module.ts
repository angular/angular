/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MatMenu} from './menu';
import {MatMenuItem} from './menu-item';
import {MatMenuContent} from './menu-content';
import {MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER, MatMenuTrigger} from './menu-trigger';

@NgModule({
  imports: [CommonModule, MatRippleModule, MatCommonModule, OverlayModule],
  exports: [
    CdkScrollableModule,
    MatMenu,
    MatCommonModule,
    MatMenuItem,
    MatMenuContent,
    MatMenuTrigger,
  ],
  declarations: [MatMenu, MatMenuItem, MatMenuContent, MatMenuTrigger],
  providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class MatMenuModule {}
