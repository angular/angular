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
  /**
   * @deprecated Use `MAT_CHECKBOX_REQUIRED_VALIDATOR` from `@angular/material/checkbox` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_CHECKBOX_REQUIRED_VALIDATOR as MAT_LEGACY_CHECKBOX_REQUIRED_VALIDATOR,

  /**
   * @deprecated Use `MatCheckboxClickAction` from `@angular/material/checkbox` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatCheckboxClickAction as MatLegacyCheckboxClickAction,

  /**
   * @deprecated Use `MatCheckboxRequiredValidator` from `@angular/material/checkbox` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatCheckboxRequiredValidator as MatLegacyCheckboxRequiredValidator,

  /**
   * @deprecated Use `_MatCheckboxRequiredValidatorModule` from `@angular/material/checkbox` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  _MatCheckboxRequiredValidatorModule as _MatLegacyCheckboxRequiredValidatorModule,

  /**
   * @deprecated Use `TransitionCheckState` from `@angular/material/checkbox` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  TransitionCheckState as LegacyTransitionCheckState,

  /**
   * @deprecated Use `MAT_CHECKBOX_DEFAULT_OPTIONS_FACTORY` from `@angular/material/checkbox` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_CHECKBOX_DEFAULT_OPTIONS_FACTORY as MAT_LEGACY_CHECKBOX_DEFAULT_OPTIONS_FACTORY,

  /**
   * @deprecated Use `MatCheckboxDefaultOptions` from `@angular/material/checkbox` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatCheckboxDefaultOptions as MatLegacyCheckboxDefaultOptions,

  /**
   * @deprecated Use `MAT_CHECKBOX_DEFAULT_OPTIONS` from `@angular/material/checkbox` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_CHECKBOX_DEFAULT_OPTIONS as MAT_LEGACY_CHECKBOX_DEFAULT_OPTIONS,
} from '@angular/material/checkbox';
