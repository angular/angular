/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** @docs-private */
export function getMdInputContainerPlaceholderConflictError(): Error {
  return Error('Placeholder attribute and child element were both specified.');
}

/** @docs-private */
export function getMdInputContainerUnsupportedTypeError(type: string): Error {
  return Error(`Input type "${type}" isn't supported by md-input-container.`);
}

/** @docs-private */
export function getMdInputContainerDuplicatedHintError(align: string): Error {
  return Error(`A hint was already declared for 'align="${align}"'.`);
}

/** @docs-private */
export function getMdInputContainerMissingMdInputError(): Error {
  return Error('md-input-container must contain an mdInput directive. ' +
                   'Did you forget to add mdInput to the native input or textarea element?');
}
