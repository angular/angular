/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** @docs-private */
export function getSortDuplicateSortableIdError(id: string): Error {
  return Error(`Cannot have two MatSortables with the same id (${id}).`);
}

/** @docs-private */
export function getSortHeaderNotContainedWithinSortError(): Error {
  return Error(`MatSortHeader must be placed within a parent element with the MatSort directive.`);
}

/** @docs-private */
export function getSortHeaderMissingIdError(): Error {
  return Error(`MatSortHeader must be provided with a unique id.`);
}

/** @docs-private */
export function getSortInvalidDirectionError(direction: string): Error {
  return Error(`${direction} is not a valid sort direction ('asc' or 'desc').`);
}
