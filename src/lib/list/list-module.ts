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
  MatDividerCssMatStyler,
  MatList,
  MatNavList,
  MatListAvatarCssMatStyler,
  MatListDivider,
  MatListIconCssMatStyler,
  MatListItem,
  MatListSubheaderCssMatStyler,
} from './list';
import {MatListOption, MatSelectionList} from './selection-list';


@NgModule({
  imports: [MatLineModule, MatRippleModule, MatCommonModule, MatPseudoCheckboxModule, CommonModule],
  exports: [
    MatList,
    MatNavList,
    MatListItem,
    MatListDivider,
    MatListAvatarCssMatStyler,
    MatLineModule,
    MatCommonModule,
    MatListIconCssMatStyler,
    MatDividerCssMatStyler,
    MatListSubheaderCssMatStyler,
    MatPseudoCheckboxModule,
    MatSelectionList,
    MatListOption
  ],
  declarations: [
    MatList,
    MatNavList,
    MatListItem,
    MatListDivider,
    MatListAvatarCssMatStyler,
    MatListIconCssMatStyler,
    MatDividerCssMatStyler,
    MatListSubheaderCssMatStyler,
    MatSelectionList,
    MatListOption
  ],
})
export class MatListModule {}
