/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdCommonModule, MdLineModule, MdPseudoCheckboxModule, MdRippleModule} from '../core';
import {CommonModule} from '@angular/common';
import {
  MdDividerCssMatStyler,
  MdList,
  MdListAvatarCssMatStyler,
  MdListCssMatStyler,
  MdListDivider,
  MdListIconCssMatStyler,
  MdListItem,
  MdListSubheaderCssMatStyler,
  MdNavListCssMatStyler
} from './list';
import {MdListOption, MdSelectionList} from './selection-list';

@NgModule({
  imports: [MdLineModule, MdRippleModule, MdCommonModule, MdPseudoCheckboxModule, CommonModule],
  exports: [
    MdList,
    MdListItem,
    MdListDivider,
    MdListAvatarCssMatStyler,
    MdLineModule,
    MdCommonModule,
    MdListIconCssMatStyler,
    MdListCssMatStyler,
    MdNavListCssMatStyler,
    MdDividerCssMatStyler,
    MdListSubheaderCssMatStyler,
    MdPseudoCheckboxModule,
    MdSelectionList,
    MdListOption
  ],
  declarations: [
    MdList,
    MdListItem,
    MdListDivider,
    MdListAvatarCssMatStyler,
    MdListIconCssMatStyler,
    MdListCssMatStyler,
    MdNavListCssMatStyler,
    MdDividerCssMatStyler,
    MdListSubheaderCssMatStyler,
    MdSelectionList,
    MdListOption
  ],
})
export class MdListModule {}


export * from './list';
export * from './selection-list';
