/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Returns an error to be thrown when attempting to find an unexisting column.
 * @param id Id whose lookup failed.
 * @docs-private
 */
export function getTableUnknownColumnError(id: string) {
  return Error(`cdk-table: Could not find column with id "${id}".`);
}

/**
 * Returns an error to be thrown when two column definitions have the same name.
 * @docs-private
 */
export function getTableDuplicateColumnNameError(name: string) {
  return Error(`cdk-table: Duplicate column definition name provided: "${name}".`);
}
