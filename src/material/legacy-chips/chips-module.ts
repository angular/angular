/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ENTER} from '@angular/cdk/keycodes';
import {NgModule} from '@angular/core';
import {ErrorStateMatcher, MatCommonModule} from '@angular/material/core';
import {
  MatLegacyChip,
  MatLegacyChipAvatar,
  MatLegacyChipRemove,
  MatLegacyChipTrailingIcon,
} from './chip';
import {
  MAT_LEGACY_CHIPS_DEFAULT_OPTIONS,
  MatLegacyChipsDefaultOptions,
} from './chip-default-options';
import {MatLegacyChipInput} from './chip-input';
import {MatLegacyChipList} from './chip-list';

const CHIP_DECLARATIONS = [
  MatLegacyChipList,
  MatLegacyChip,
  MatLegacyChipInput,
  MatLegacyChipRemove,
  MatLegacyChipAvatar,
  MatLegacyChipTrailingIcon,
];

@NgModule({
  imports: [MatCommonModule],
  exports: CHIP_DECLARATIONS,
  declarations: CHIP_DECLARATIONS,
  providers: [
    ErrorStateMatcher,
    {
      provide: MAT_LEGACY_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [ENTER],
      } as MatLegacyChipsDefaultOptions,
    },
  ],
})
export class MatLegacyChipsModule {}
