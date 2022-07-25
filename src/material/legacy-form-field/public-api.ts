/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './form-field-module';
export * from './error';
export * from './form-field';
export * from './hint';
export * from './placeholder';
export * from './prefix';
export * from './suffix';
export * from './label';

export {
  MAT_FORM_FIELD,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldControl as MatLegacyFormFieldControl,
  getMatFormFieldDuplicatedHintError,
  getMatFormFieldMissingControlError,
  getMatFormFieldPlaceholderConflictError,
  matFormFieldAnimations,
  MAT_SUFFIX,
  MAT_ERROR,
  MAT_PREFIX,
} from '@angular/material/form-field';
