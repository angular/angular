/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdChipList} from './chip-list';
import {MdBasicChip, MdChip, MdChipRemove} from './chip';
import {MdChipInput} from './chip-input';

export * from './chip-list';
export * from './chip';
export * from './chip-input';

@NgModule({
  imports: [],
  exports: [MdChipList, MdChip, MdChipInput, MdChipRemove, MdChipRemove, MdBasicChip],
  declarations: [MdChipList, MdChip, MdChipInput, MdChipRemove,  MdChipRemove, MdBasicChip]
})
export class MdChipsModule {}
