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
  MAT_FORM_FIELD as MAT_LEGACY_FORM_FIELD,
  MatFormFieldControl as MatLegacyFormFieldControl,
  getMatFormFieldDuplicatedHintError as getMatLegacyFormFieldDuplicatedHintError,
  getMatFormFieldMissingControlError as getMatLegacyFormFieldMissingControlError,
  getMatFormFieldPlaceholderConflictError as getMatLegacyFormFieldPlaceholderConflictError,
  matFormFieldAnimations as matLegacyFormFieldAnimations,
  MAT_SUFFIX as MAT_LEGACY_SUFFIX,
  MAT_ERROR as MAT_LEGACY_ERROR,
  MAT_PREFIX as MAT_LEGACY_PREFIX,
} from '@angular/material/form-field';
