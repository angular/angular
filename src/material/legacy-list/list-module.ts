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
  MatLegacyList,
  MatLegacyNavList,
  MatLegacyListAvatarCssMatStyler,
  MatLegacyListIconCssMatStyler,
  MatLegacyListItem,
  MatLegacyListSubheaderCssMatStyler,
} from './list';
import {MatLegacyListOption, MatLegacySelectionList} from './selection-list';
import {MatDividerModule} from '@angular/material/divider';

@NgModule({
  imports: [MatLineModule, MatRippleModule, MatCommonModule, MatPseudoCheckboxModule, CommonModule],
  exports: [
    MatLegacyList,
    MatLegacyNavList,
    MatLegacyListItem,
    MatLegacyListAvatarCssMatStyler,
    MatLineModule,
    MatCommonModule,
    MatLegacyListIconCssMatStyler,
    MatLegacyListSubheaderCssMatStyler,
    MatPseudoCheckboxModule,
    MatLegacySelectionList,
    MatLegacyListOption,
    MatDividerModule,
  ],
  declarations: [
    MatLegacyList,
    MatLegacyNavList,
    MatLegacyListItem,
    MatLegacyListAvatarCssMatStyler,
    MatLegacyListIconCssMatStyler,
    MatLegacyListSubheaderCssMatStyler,
    MatLegacySelectionList,
    MatLegacyListOption,
  ],
})
export class MatLegacyListModule {}
