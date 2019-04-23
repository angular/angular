/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FileSizeData, SizeMap} from './file_size_data';

export interface SizeDifference {
  filePath?: string;
  message: string;
}

/** Compares two file size data objects and returns an array of size differences. */
export function compareFileSizeData(
    actual: FileSizeData, expected: FileSizeData, threshold: number) {
  const diffs: SizeDifference[] = [
    ...compareSizeMap(actual.files, expected.files, threshold),
    ...compareSizeMap(actual.directories, expected.directories, threshold),
  ];

  const unmappedBytesDiff = getDifferencePercentage(actual.unmapped, expected.unmapped);
  if (unmappedBytesDiff > threshold) {
    diffs.push({
      message: `Unmapped bytes differ by ${unmappedBytesDiff.toFixed(2)}% from ` +
          `the expected size (actual = ${actual.unmapped}, expected = ${expected.unmapped})`
    });
  }
  return diffs;
}

/** Compares two size maps with a specified threshold in percentage. */
function compareSizeMap(actual: SizeMap, expected: SizeMap, threshold: number) {
  const diffs: SizeDifference[] = [];

  Object.keys(expected).forEach(filePath => {
    // In case the golden file expects a given file, but there is no data for
    // that file, the difference needs to be reported.
    if (actual[filePath] === undefined) {
      diffs.push({filePath, message: 'Expected file/directory is not included.'});
      return;
    }

    const actualSize = actual[filePath];
    const expectedSize = expected[filePath];
    const diffPercentage = getDifferencePercentage(actualSize, expectedSize);

    if (diffPercentage > threshold) {
      diffs.push({
        filePath: filePath,
        message: `Differs by ${diffPercentage.toFixed(2)}% from the expected size ` +
            `(actual = ${actualSize}, expected = ${expectedSize})`
      });
    }
  });

  // Ensure that there is no new file that is not part of the golden file.
  Object.keys(actual).forEach(filePath => {
    if (expected[filePath] === undefined) {
      diffs.push({filePath, message: 'Unexpected file/directory included (not part of golden).'});
    }
  });
  return diffs;
}

/** Gets the difference of the two size values in percentage. */
function getDifferencePercentage(actualSize: number, expectedSize: number) {
  return (Math.abs(actualSize - expectedSize) / ((expectedSize + actualSize) / 2)) * 100;
}
