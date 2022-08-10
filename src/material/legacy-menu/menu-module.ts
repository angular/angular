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
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER} from '@angular/material/menu';
import {MatLegacyMenu} from './menu';
import {MatLegacyMenuContent} from './menu-content';
import {MatLegacyMenuItem} from './menu-item';
import {MatLegacyMenuTrigger} from './menu-trigger';

@NgModule({
  imports: [CommonModule, MatCommonModule, MatRippleModule, OverlayModule],
  exports: [
    CdkScrollableModule,
    MatCommonModule,
    MatLegacyMenu,
    MatLegacyMenuItem,
    MatLegacyMenuTrigger,
    MatLegacyMenuContent,
  ],
  declarations: [MatLegacyMenu, MatLegacyMenuItem, MatLegacyMenuTrigger, MatLegacyMenuContent],
  providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class MatLegacyMenuModule {}
