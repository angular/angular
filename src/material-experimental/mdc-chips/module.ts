/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ENTER} from '@angular/cdk/keycodes';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  ErrorStateMatcher,
  MatCommonModule,
  MatRippleModule,
} from '@angular/material-experimental/mdc-core';
import {MatChip, MatChipCssInternalOnly} from './chip';
import {MAT_CHIPS_DEFAULT_OPTIONS, MatChipsDefaultOptions} from './chip-default-options';
import {MatChipEditInput} from './chip-edit-input';
import {MatChipGrid} from './chip-grid';
import {MatChipAvatar, MatChipRemove, MatChipTrailingIcon} from './chip-icons';
import {MatChipInput} from './chip-input';
import {MatChipListbox} from './chip-listbox';
import {MatChipRow} from './chip-row';
import {MatChipOption} from './chip-option';
import {MatChipSet} from './chip-set';


const CHIP_DECLARATIONS = [
  MatChip,
  MatChipAvatar,
  MatChipCssInternalOnly,
  MatChipEditInput,
  MatChipGrid,
  MatChipInput,
  MatChipListbox,
  MatChipOption,
  MatChipRemove,
  MatChipRow,
  MatChipSet,
  MatChipTrailingIcon,
];

@NgModule({
  imports: [MatCommonModule, CommonModule, MatRippleModule],
  exports: [MatCommonModule, CHIP_DECLARATIONS],
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
export class MatChipsModule {
}
