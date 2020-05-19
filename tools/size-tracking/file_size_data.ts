/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface DirectorySizeEntry {
  size: number;
  [filePath: string]: DirectorySizeEntry|number;
}

export interface FileSizeData {
  unmapped: number;
  files: DirectorySizeEntry;
}

/** Returns a new file size data sorted by keys in ascending alphabetical order. */
export function sortFileSizeData({unmapped, files}: FileSizeData): FileSizeData {
  return {unmapped, files: _sortDirectorySizeEntryObject(files)};
}

/** Gets the name of all child size entries of the specified one. */
export function getChildEntryNames(entry: DirectorySizeEntry): string[] {
  // The "size" property is reserved for the stored size value.
  return Object.keys(entry).filter(key => key !== 'size');
}

/**
 * Returns the first size-entry that has multiple children. This is also known as
 * the omitting of the common path prefix.
 * */
export function omitCommonPathPrefix(entry: DirectorySizeEntry): DirectorySizeEntry {
  let current: DirectorySizeEntry = entry;
  while (getChildEntryNames(current).length === 1) {
    const newChild = current[getChildEntryNames(current)[0]];
    // Only omit the current node if it is a size entry. In case the new
    // child is a holding a number, then this is a file and we don'twant
    // to incorrectly omit the leaf file entries.
    if (typeof newChild === 'number') {
      break;
    }
    current = newChild;
  }
  return current;
}

function _sortDirectorySizeEntryObject(oldObject: DirectorySizeEntry): DirectorySizeEntry {
  return Object.keys(oldObject).sort(_sortSizeEntryKeys).reduce((result, key) => {
    if (typeof oldObject[key] === 'number') {
      result[key] = oldObject[key];
    } else {
      result[key] = _sortDirectorySizeEntryObject(oldObject[key] as DirectorySizeEntry);
    }
    return result;
  }, {} as DirectorySizeEntry);
}

function _sortSizeEntryKeys(a: string, b: string) {
  // The "size" property should always be the first item in the size entry.
  // This makes it easier to inspect the size of an entry in the golden.
  if (a === 'size') {
    return -1;
  } else if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  }
  return 0;
}
