/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLineModule, MatPseudoCheckboxModule, MatRippleModule} from '@angular/material/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatActionList} from './action-list';
import {
  MatList,
  MatListAvatarCssMatStyler,
  MatListIconCssMatStyler,
  MatListItem,
  MatListSubheaderCssMatStyler,
} from './list';
import {MatNavList} from './nav-list';
import {MatListOption, MatSelectionList} from './selection-list';

@NgModule({
  imports: [
    CommonModule,
    MatLineModule,
    MatRippleModule,
    MatPseudoCheckboxModule,
  ],
  exports: [
    MatList,
    MatActionList,
    MatNavList,
    MatSelectionList,
    MatListItem,
    MatListOption,
    MatListAvatarCssMatStyler,
    MatListIconCssMatStyler,
    MatListSubheaderCssMatStyler,
    MatDividerModule,
    MatLineModule,
  ],
  declarations: [
    MatList,
    MatActionList,
    MatNavList,
    MatSelectionList,
    MatListItem,
    MatListOption,
    MatListAvatarCssMatStyler,
    MatListIconCssMatStyler,
    MatListSubheaderCssMatStyler,
  ]
})
export class MatListModule {}
