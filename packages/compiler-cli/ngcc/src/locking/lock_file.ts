/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import module from 'module';

import {AbsoluteFsPath, PathManipulation} from '../../../src/ngtsc/file_system';

export function getLockFilePath(fs: PathManipulation) {
  // NodeJS `import.meta.resolve` is experimental. We leverage `require`.
  const requireFn = module.createRequire(import.meta.url);
  // The lock file location is resolved based on the location of the `ngcc` entry-point as this
  // allows us to have a consistent position for the lock file to reside. We are unable to rely
  // on `__dirname` (or equivalent) as this code is being bundled and different entry-points
  // will have dedicated bundles where the lock file location would differ then.
  const ngccEntryPointFile = requireFn.resolve('@angular/compiler-cli/package.json');
  return fs.resolve(ngccEntryPointFile, '../../../.ngcc_lock_file');
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
