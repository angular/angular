/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export type SizeMap = {
  [key: string]: number
};

export interface FileSizeData {
  unmapped: number;
  files: SizeMap;
  directories: SizeMap;
}

/** Returns a new retraced size result sorted by bytes in descending order. */
export function sortFileSizeData(oldResult: FileSizeData): FileSizeData {
  const newResult: FileSizeData = {unmapped: oldResult.unmapped, files: {}, directories: {}};

  _sortEntrySizeObject(oldResult.files, newResult.files);
  _sortEntrySizeObject(oldResult.directories, newResult.directories);

  return newResult;
}

function _sortEntrySizeObject(oldObject: SizeMap, newObject: SizeMap) {
  Object.keys(oldObject)
      .sort((a, b) => oldObject[b] - oldObject[a])
      .forEach(filePath => newObject[filePath] = oldObject[filePath]);
}
