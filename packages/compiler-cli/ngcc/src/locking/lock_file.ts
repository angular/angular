/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, PathManipulation} from '../../../src/ngtsc/file_system';

export function getLockFilePath(fs: PathManipulation) {
  return fs.resolve(require.resolve('@angular/compiler-cli/ngcc'), '../__ngcc_lock_file__');
}

export interface LockFile {
  path: AbsoluteFsPath;
  /**
   * Write a lock file to disk containing the PID of the current process.
   */
  write(): void;

  /**
   * Read the PID, of the process holding the lock, from the lock-file.
   *
   * It is feasible that the lock-file was removed between the call to `write()` that effectively
   * checks for existence and this attempt to read the file. If so then this method should just
   * gracefully return `"{unknown}"`.
   */
  read(): string;

  /**
   * Remove the lock file from disk, whether or not it exists.
   */
  remove(): void;
}
