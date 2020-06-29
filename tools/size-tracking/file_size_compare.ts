/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectorySizeEntry, FileSizeData, getChildEntryNames} from './file_size_data';

export interface SizeDifference {
  filePath?: string;
  message: string;
}

export interface Threshold {
  /**
   * Maximum difference percentage. Exceeding this causes a reported size
   * difference. Percentage difference is helpful for small files where
   * the byte threshold is not exceeded but the change is relatively large
   * for the small file and should be reported.
   */
  maxPercentageDiff: number;
  /**
   * Maximum byte difference. Exceeding this causes a reported size difference.
   * The max byte threshold works good for large files where change is relatively
   * small but still needs to reported as it causes an overall size regression.
   */
  maxByteDiff: number;
}

/** Compares two file size data objects and returns an array of size differences. */
export function compareFileSizeData(
    actual: FileSizeData, expected: FileSizeData, threshold: Threshold) {
  return [
    ...compareSizeEntry(actual.files, expected.files, '/', threshold),
    ...compareActualSizeToExpected(actual.unmapped, expected.unmapped, '<unmapped>', threshold)
  ];
}

/** Compares two file size entries and returns an array of size differences. */
function compareSizeEntry(
    actual: DirectorySizeEntry|number, expected: DirectorySizeEntry|number, filePath: string,
    threshold: Threshold) {
  if (typeof actual !== 'number' && typeof expected !== 'number') {
    return compareDirectorySizeEntry(actual, expected, filePath, threshold);
  } else {
    return compareActualSizeToExpected(<number>actual, <number>expected, filePath, threshold);
  }
}

/**
 * Compares two size numbers and returns a size difference if the difference
 * percentage exceeds the specified maximum percentage or the byte size
 * difference exceeds the maximum byte difference.
 */
function compareActualSizeToExpected(
    actualSize: number, expectedSize: number, filePath: string,
    threshold: Threshold): SizeDifference[] {
  const diffPercentage = getDifferencePercentage(actualSize, expectedSize);
  const byteDiff = Math.abs(expectedSize - actualSize);
  const diffs: SizeDifference[] = [];
  if (diffPercentage > threshold.maxPercentageDiff) {
    diffs.push({
      filePath: filePath,
      message: `Differs by ${diffPercentage.toFixed(2)}% from the expected size ` +
          `(actual = ${actualSize}, expected = ${expectedSize})`
    });
  }
  if (byteDiff > threshold.maxByteDiff) {
    diffs.push({
      filePath: filePath,
      message: `Differs by ${byteDiff}B from the expected size ` +
          `(actual = ${actualSize}, expected = ${expectedSize})`
    });
  }
  return diffs;
}

/**
 * Compares two size directory size entries and returns an array of found size
 * differences within that directory.
 */
function compareDirectorySizeEntry(
    actual: DirectorySizeEntry, expected: DirectorySizeEntry, filePath: string,
    threshold: Threshold): SizeDifference[] {
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
