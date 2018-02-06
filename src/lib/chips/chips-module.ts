/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformModule} from '@angular/cdk/platform';
import {NgModule} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatChip, MatChipAvatar, MatChipRemove, MatChipTrailingIcon} from './chip';
import {MatChipInput} from './chip-input';
import {MatChipList} from './chip-list';

const CHIP_DECLARATIONS = [
  MatChipList,
  MatChip,
  MatChipInput,
  MatChipRemove,
  MatChipAvatar,
  MatChipTrailingIcon,
];

@NgModule({
  imports: [PlatformModule],
  exports: CHIP_DECLARATIONS,
  declarations: CHIP_DECLARATIONS,
  providers: [ErrorStateMatcher]
})
export class MatChipsModule {}
