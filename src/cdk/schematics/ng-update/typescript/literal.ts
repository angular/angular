/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Finds all start indices of the given search string in the input string. */
export function findAllSubstringIndices(input: string, search: string): number[] {
  const result: number[] = [];
  let i = -1;
  while ((i = input.indexOf(search, i + 1)) !== -1) {
    result.push(i);
  }
  return result;
}
