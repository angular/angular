/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {MatLegacyFormFieldModule} from './form-field-module';
export {MatLegacyError} from './error';
export {
  MatLegacyFormFieldAppearance,
  LegacyFloatLabelType,
  MatLegacyFormFieldDefaultOptions,
  MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS,
  MatLegacyFormField,
} from './form-field';
export {_MAT_LEGACY_HINT, MatLegacyHint} from './hint';
export {MatLegacyPlaceholder} from './placeholder';
export {MatLegacyPrefix} from './prefix';
export {MatLegacySuffix} from './suffix';
export {MatLegacyLabel} from './label';

export {
  /**
   * @deprecated Use `MAT_FORM_FIELD` from `@angular/material/form-field` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_FORM_FIELD as MAT_LEGACY_FORM_FIELD,

  /**
   * @deprecated Use `MatFormFieldControl` from `@angular/material/form-field` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatFormFieldControl as MatLegacyFormFieldControl,

  /**
   * @deprecated Use `getMatFormFieldDuplicatedHintError` from `@angular/material/form-field` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  getMatFormFieldDuplicatedHintError as getMatLegacyFormFieldDuplicatedHintError,

  /**
   * @deprecated Use `getMatFormFieldMissingControlError` from `@angular/material/form-field` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  getMatFormFieldMissingControlError as getMatLegacyFormFieldMissingControlError,

  /**
   * @deprecated Use `getMatFormFieldPlaceholderConflictError` from `@angular/material/form-field` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  getMatFormFieldPlaceholderConflictError as getMatLegacyFormFieldPlaceholderConflictError,

  /**
   * @deprecated Use `matFormFieldAnimations` from `@angular/material/form-field` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  matFormFieldAnimations as matLegacyFormFieldAnimations,

  /**
   * @deprecated Use `MAT_SUFFIX` from `@angular/material/form-field` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_SUFFIX as MAT_LEGACY_SUFFIX,

  /**
   * @deprecated Use `MAT_ERROR` from `@angular/material/form-field` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_ERROR as MAT_LEGACY_ERROR,

  /**
   * @deprecated Use `MAT_PREFIX` from `@angular/material/form-field` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_PREFIX as MAT_LEGACY_PREFIX,
} from '@angular/material/form-field';
