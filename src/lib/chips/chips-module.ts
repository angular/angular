/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ENTER} from '@angular/cdk/keycodes';
import {NgModule} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatChip, MatChipAvatar, MatChipRemove, MatChipTrailingIcon} from './chip';
import {MAT_CHIPS_DEFAULT_OPTIONS, MatChipsDefaultOptions} from './chip-default-options';
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
  exports: CHIP_DECLARATIONS,
  declarations: CHIP_DECLARATIONS,
  providers: [
    ErrorStateMatcher,
    {
      provide: MAT_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [ENTER]
      } as MatChipsDefaultOptions
    }
  ]
})
export class MatChipsModule {}
