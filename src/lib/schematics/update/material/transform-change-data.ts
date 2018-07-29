/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export type ReadableChange<T> = {
  pr: string;
  changes: T[]
};

/**
 * For readability and a good overview of breaking changes, the changes data always includes
 * the related Pull Request link. Since this data is not needed when performing the upgrade, this
 * data can be removed and the changes data can be flattened into a easy queryable array.
 */
export function transformChanges<T>(allChanges: ReadableChange<T>[]): T[] {
  return allChanges.reduce((result, changes) => result.concat(changes.changes), []);
}
