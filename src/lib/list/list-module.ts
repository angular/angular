/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
  MatDividerCssMatStyler,
  MatList,
  MatListAvatarCssMatStyler,
  MatListCssMatStyler,
  MatListDivider,
  MatListIconCssMatStyler,
  MatListItem,
  MatListSubheaderCssMatStyler,
  MatNavListCssMatStyler,
} from './list';
import {MatListOption, MatSelectionList} from './selection-list';


@NgModule({
  imports: [MatLineModule, MatRippleModule, MatCommonModule, MatPseudoCheckboxModule, CommonModule],
  exports: [
    MatList,
    MatListItem,
    MatListDivider,
    MatListAvatarCssMatStyler,
    MatLineModule,
    MatCommonModule,
    MatListIconCssMatStyler,
    MatListCssMatStyler,
    MatNavListCssMatStyler,
    MatDividerCssMatStyler,
    MatListSubheaderCssMatStyler,
    MatPseudoCheckboxModule,
    MatSelectionList,
    MatListOption
  ],
  declarations: [
    MatList,
    MatListItem,
    MatListDivider,
    MatListAvatarCssMatStyler,
    MatListIconCssMatStyler,
    MatListCssMatStyler,
    MatNavListCssMatStyler,
    MatDividerCssMatStyler,
    MatListSubheaderCssMatStyler,
    MatSelectionList,
    MatListOption
  ],
})
export class MatListModule {}
