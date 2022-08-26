/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {
  MatLegacyCheckboxChange,
  MAT_LEGACY_CHECKBOX_CONTROL_VALUE_ACCESSOR,
  MatLegacyCheckbox,
} from './checkbox';
export {MatLegacyCheckboxModule} from './checkbox-module';

export {
  MAT_CHECKBOX_REQUIRED_VALIDATOR as MAT_LEGACY_CHECKBOX_REQUIRED_VALIDATOR,
  MatCheckboxClickAction as MatLegacyCheckboxClickAction,
  MatCheckboxRequiredValidator as MatLegacyCheckboxRequiredValidator,
  _MatCheckboxRequiredValidatorModule as _MatLegacyCheckboxRequiredValidatorModule,
  /**
   * @deprecated
   * @breaking-change 9.0.0
   */
  TransitionCheckState as LegacyTransitionCheckState,
  MAT_CHECKBOX_DEFAULT_OPTIONS_FACTORY as MAT_LEGACY_CHECKBOX_DEFAULT_OPTIONS_FACTORY,
  MatCheckboxDefaultOptions as MatLegacyCheckboxDefaultOptions,
  MAT_CHECKBOX_DEFAULT_OPTIONS as MAT_LEGACY_CHECKBOX_DEFAULT_OPTIONS,
} from '@angular/material/checkbox';
