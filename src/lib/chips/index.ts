/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdChipList} from './chip-list';
import {MdChip, MdBasicChip} from './chip';


@NgModule({
  imports: [],
  exports: [MdChipList, MdChip, MdBasicChip],
  declarations: [MdChipList, MdChip, MdBasicChip]
})
export class MdChipsModule {}


export * from './chip-list';
export * from './chip';
