/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Converts a `string` version into an array of numbers
 * @example
 * toNumbers('2.0.1'); // returns [2, 0, 1]
 */
export function toNumbers(value: string): number[] {
  // Drop any suffixes starting with `-` so that versions like `1.2.3-rc.5` are treated as `1.2.3`.
  const suffixIndex = value.lastIndexOf('-');
  return value
    .slice(0, suffixIndex === -1 ? value.length : suffixIndex)
    .split('.')
    .map((segment) => {
      const parsed = parseInt(segment, 10);

      if (isNaN(parsed)) {
        throw Error(`Unable to parse version string ${value}.`);
      }

      return parsed;
    });
}

/**
 * Compares two arrays of positive numbers with lexicographical order in mind.
 *
 * However - unlike lexicographical order - for arrays of different length we consider:
 * [1, 2, 3] = [1, 2, 3, 0] instead of [1, 2, 3] < [1, 2, 3, 0]
 *
 * @param a The 'left hand' array in the comparison test
 * @param b The 'right hand' in the comparison test
 * @returns {-1|0|1} The comparison result: 1 if a is greater, -1 if b is greater, 0 is the two
 * arrays are equals
 */
export function compareNumbers(a: number[], b: number[]): -1 | 0 | 1 {
  const max = Math.max(a.length, b.length);
  const min = Math.min(a.length, b.length);

  for (let i = 0; i < min; i++) {
    if (a[i] > b[i]) return 1;
    if (a[i] < b[i]) return -1;
  }

  if (min !== max) {
    const longestArray = a.length === max ? a : b;

    // The result to return in case the to arrays are considered different (1 if a is greater,
    // -1 if b is greater)
    const comparisonResult = a.length === max ? 1 : -1;

    // Check that at least one of the remaining elements is greater than 0 to consider that the two
    // arrays are different (e.g. [1, 0] and [1] are considered the same but not [1, 0, 1] and [1])
    for (let i = min; i < max; i++) {
      if (longestArray[i] > 0) {
        return comparisonResult;
      }
    }
  }

  return 0;
}

/**
 * Checks if a TypeScript version is:
 * - greater or equal than the provided `low` version,
 * - lower or equal than an optional `high` version.
 *
 * @param version The TypeScript version
 * @param low The minimum version
 * @param high The maximum version
 */
export function isVersionBetween(version: string, low: string, high?: string): boolean {
  const tsNumbers = toNumbers(version);
  if (high !== undefined) {
    return (
      compareNumbers(toNumbers(low), tsNumbers) <= 0 &&
      compareNumbers(toNumbers(high), tsNumbers) >= 0
    );
  }
  return compareNumbers(toNumbers(low), tsNumbers) <= 0;
}

/**
 * Compares two versions
 *
 * @param v1 The 'left hand' version in the comparison test
 * @param v2 The 'right hand' version in the comparison test
 * @returns {-1|0|1} The comparison result: 1 if v1 is greater, -1 if v2 is greater, 0 is the two
 * versions are equals
 */
export function compareVersions(v1: string, v2: string): -1 | 0 | 1 {
  return compareNumbers(toNumbers(v1), toNumbers(v2));
}
