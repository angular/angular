/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {dirname} from 'path';
import {fileURLToPath} from 'url';
import {AbsoluteFsPath, PathManipulation} from '../../../src/ngtsc/file_system';

// Note: The the identifier in `fileURLToPath` will be set defined as part of bundling. We cannot
// use `import.meta.url` directly as this code currently still runs in CommonJS for devmode.
// TODO(devversion): replace all of this with `import.meta.url` once devmode is using ESM.
declare const __ESM_IMPORT_META_URL__: string;
export const containingDirPath =
    typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(__ESM_IMPORT_META_URL__));

export function getLockFilePath(fs: PathManipulation) {
  return fs.resolve(containingDirPath, '__ngcc_lock_file__');
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
