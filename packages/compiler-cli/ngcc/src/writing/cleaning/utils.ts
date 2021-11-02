/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, ReadonlyFileSystem} from '../../../../src/ngtsc/file_system';

/**
 * Returns true if the given `path` is a directory (not a symlink) and actually exists.
 *
 * @param fs the current filesystem
 * @param path the path to check
 */
export function isLocalDirectory(fs: ReadonlyFileSystem, path: AbsoluteFsPath): boolean {
  if (fs.exists(path)) {
    const stat = fs.lstat(path);
    return stat.isDirectory();
  } else {
    return false;
  }
}
