/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * To create smaller locale files, we remove duplicated data.
 * To make this work we store the data in arrays, where `undefined` indicates that the
 * value is a duplicate of the previous value in the array.
 * e.g. consider an array like: [x, y, undefined, z, undefined, undefined]
 * The first `undefined` is equivalent to y, the second and third are equivalent to z
 * Note that the first value in an array is always defined.
 *
 * Also since we need to know which data is assumed similar, it is important that we store those
 * similar data in arrays to mark the delimitation between values that have different meanings
 * (e.g. months and days).
 *
 * For further size improvements, "undefined" values will be replaced by a constant in the arrays
 * as the last step of the file generation (in generateLocale and generateLocaleExtra).
 * e.g.: [x, y, undefined, z, undefined, undefined] will be [x, y, u, z, u, u]
 *
 * In some cases, we also trim the trailing `undefined` values in the array, as they
 * don't add any information. We don't always want to do it as sometimes returned array is destructured.
 */
export function removeDuplicates(data: unknown[], shouldTrim = false): unknown[] {
  const dedup = [data[0]];
  let prevStringified = JSON.stringify(data[0]);
  let nextStringified;

  for (let i = 1; i < data.length; i++) {
    nextStringified = JSON.stringify(data[i]);
    if (nextStringified !== prevStringified) {
      prevStringified = nextStringified;
      dedup.push(data[i]);
    } else {
      dedup.push(undefined);
    }
  }

  return shouldTrim ? trimTrailingUndefined(dedup) : dedup;
}

function trimTrailingUndefined(arr: unknown[]): unknown[] {
  let i = arr.length - 1;
  while (i >= 0 && arr[i] === undefined) {
    i--;
  }
  return arr.slice(0, i + 1);
}
