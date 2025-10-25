/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Expand a provided set of range values into a singel array of all values in the range.
 *
 * For example,  [[1,3], [12-13]] is expanded to [1,2,3,12,13].
 */
export function expandRangeStringValues(rangeString: string | undefined): number[] {
  if (rangeString === undefined) {
    return [];
  }
  const getAllValuesFromRange = (range: any[]) => {
    const [start, end] = range;
    for (let i = start; i <= end; i++) {
      result.push(i - 1);
    }
  };

  let result: number[] = [];
  try {
    const boundaryValueArray = JSON.parse(rangeString) as any;
    if (!Array.isArray(boundaryValueArray)) {
      throw new Error('Provided token has wrong format!\n' /* boundaryValueArray */);
    }
    // Flat Array
    if (
      boundaryValueArray.length === 2 &&
      !Array.isArray(boundaryValueArray[0]) &&
      !Array.isArray(boundaryValueArray[1])
    ) {
      getAllValuesFromRange(boundaryValueArray);
    } else {
      for (const range of boundaryValueArray) {
        if (Array.isArray(range) && range.length === 2) {
          getAllValuesFromRange(range);
        } else if (!Number.isNaN(range)) {
          result.push(Number(range - 1));
        } else {
          throw new Error('Input has wrong format!\n' /* range */);
        }
      }
    }

    return result;
  } catch {
    return [];
  }
}
