/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  MatCommonModule,
  MatLineModule,
  MatPseudoCheckboxModule,
  MatRippleModule,
} from '@angular/material/core';
import {
  MatList,
  MatNavList,
  MatListAvatarCssMatStyler,
  MatListIconCssMatStyler,
  MatListItem,
  MatListSubheaderCssMatStyler,
} from './list';
import {MatListOption, MatSelectionList} from './selection-list';
import {MatDividerModule} from '@angular/material/divider';


@NgModule({
  imports: [MatLineModule, MatRippleModule, MatCommonModule, MatPseudoCheckboxModule, CommonModule],
  exports: [
    MatList,
    MatNavList,
    MatListItem,
    MatListAvatarCssMatStyler,
    MatLineModule,
    MatCommonModule,
    MatListIconCssMatStyler,
    MatListSubheaderCssMatStyler,
    MatPseudoCheckboxModule,
    MatSelectionList,
    MatListOption,
    MatDividerModule
  ],
  declarations: [
    MatList,
    MatNavList,
    MatListItem,
    MatListAvatarCssMatStyler,
    MatListIconCssMatStyler,
    MatListSubheaderCssMatStyler,
    MatSelectionList,
    MatListOption
  ],
})
export class MatListModule {}
