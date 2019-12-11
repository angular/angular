/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
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
