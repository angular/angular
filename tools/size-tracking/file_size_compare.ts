/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectorySizeEntry, FileSizeData, getChildEntryNames} from './file_size_data';

export interface SizeDifference {
  filePath?: string;
  message: string;
}

/** Compares two file size data objects and returns an array of size differences. */
export function compareFileSizeData(
    actual: FileSizeData, expected: FileSizeData, threshold: number) {
  const diffs: SizeDifference[] = compareSizeEntry(actual.files, expected.files, '/', threshold);
  const unmappedBytesDiff = getDifferencePercentage(actual.unmapped, expected.unmapped);
  if (unmappedBytesDiff > threshold) {
    diffs.push({
      message: `Unmapped bytes differ by ${unmappedBytesDiff.toFixed(2)}% from ` +
          `the expected size (actual = ${actual.unmapped}, expected = ${expected.unmapped})`
    });
  }
  return diffs;
}

/** Compares two file size entries and returns an array of size differences. */
function compareSizeEntry(
    actual: DirectorySizeEntry | number, expected: DirectorySizeEntry | number, filePath: string,
    threshold: number) {
  if (typeof actual !== 'number' && typeof expected !== 'number') {
    return compareDirectorySizeEntry(
        <DirectorySizeEntry>actual, <DirectorySizeEntry>expected, filePath, threshold);
  } else {
    return compareActualSizeToExpected(<number>actual, <number>expected, filePath, threshold);
  }
}

/**
 * Compares two size numbers and returns a size difference when the percentage difference
 * exceeds the specified threshold.
 */
function compareActualSizeToExpected(
    actualSize: number, expectedSize: number, filePath: string,
    threshold: number): SizeDifference[] {
  const diffPercentage = getDifferencePercentage(actualSize, expectedSize);
  if (diffPercentage > threshold) {
    return [{
      filePath: filePath,
      message: `Differs by ${diffPercentage.toFixed(2)}% from the expected size ` +
          `(actual = ${actualSize}, expected = ${expectedSize})`
    }];
  }
  return [];
}

/**
 * Compares two size directory size entries and returns an array of found size
 * differences within that directory.
 */
function compareDirectorySizeEntry(
    actual: DirectorySizeEntry, expected: DirectorySizeEntry, filePath: string,
    threshold: number): SizeDifference[] {
  const diffs: SizeDifference[] =
      [...compareActualSizeToExpected(actual.size, expected.size, filePath, threshold)];

  getChildEntryNames(expected).forEach(childName => {
    if (actual[childName] === undefined) {
      diffs.push(
          {filePath: filePath + childName, message: 'Expected file/directory is not included.'});
      return;
    }

    diffs.push(...compareSizeEntry(
        actual[childName], expected[childName], filePath + childName, threshold));
  });

  getChildEntryNames(actual).forEach(childName => {
    if (expected[childName] === undefined) {
      diffs.push({
        filePath: filePath + childName,
        message: 'Unexpected file/directory included (not part of golden).'
      });
    }
  });

  return diffs;
}

/** Gets the difference of the two size values in percentage. */
function getDifferencePercentage(actualSize: number, expectedSize: number) {
  return (Math.abs(actualSize - expectedSize) / ((expectedSize + actualSize) / 2)) * 100;
}
