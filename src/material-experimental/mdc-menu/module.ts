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
import {_MatMenuDirectivesModule} from '@angular/material/menu';
import {MatMenu, MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER} from './menu';
import {MatMenuItem} from './menu-item';

@NgModule({
  imports: [
    CommonModule,
    MatRippleModule,
    MatCommonModule,
    OverlayModule,
    _MatMenuDirectivesModule
  ],
  exports: [MatMenu, MatMenuItem, _MatMenuDirectivesModule],
  declarations: [MatMenu, MatMenuItem],
  providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class MatMenuModule {}
