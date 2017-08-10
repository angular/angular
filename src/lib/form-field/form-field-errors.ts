/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** @docs-private */
export function getMdFormFieldPlaceholderConflictError(): Error {
  return Error('Placeholder attribute and child element were both specified.');
}

/** @docs-private */
export function getMdFormFieldDuplicatedHintError(align: string): Error {
  return Error(`A hint was already declared for 'align="${align}"'.`);
}

/** @docs-private */
export function getMdFormFieldMissingControlError(): Error {
  return Error('md-form-field must contain a MdFormFieldControl. ' +
      'Did you forget to add mdInput to the native input or textarea element?');
}
