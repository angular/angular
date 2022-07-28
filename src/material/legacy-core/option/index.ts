/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatRippleModule, MatPseudoCheckboxModule, MatCommonModule} from '@angular/material/core';
import {MatLegacyOption} from './option';
import {MatLegacyOptgroup} from './optgroup';

@NgModule({
  imports: [MatRippleModule, CommonModule, MatCommonModule, MatPseudoCheckboxModule],
  exports: [MatLegacyOption, MatLegacyOptgroup],
  declarations: [MatLegacyOption, MatLegacyOptgroup],
})
export class MatLegacyOptionModule {}

export * from './option';
export * from './optgroup';

export {
  MAT_OPTGROUP,
  MatOptionSelectionChange,
  MatOptionParentComponent,
  MAT_OPTION_PARENT_COMPONENT,
  _countGroupLabelsBeforeOption,
  _getOptionScrollPosition,
  _MatOptionBase,
  _MatOptgroupBase,
} from '@angular/material/core';
