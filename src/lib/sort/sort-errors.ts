/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** @docs-private */
export function getMdSortDuplicateMdSortableIdError(id: string): Error {
  return Error(`Cannot have two MdSortables with the same id (${id}).`);
}

/** @docs-private */
export function getMdSortHeaderNotContainedWithinMdSortError(): Error {
  return Error(`MdSortHeader must be placed within a parent element with the MdSort directive.`);
}

/** @docs-private */
export function getMdSortHeaderMissingIdError(): Error {
  return Error(`MdSortHeader must be provided with a unique id.`);
}
