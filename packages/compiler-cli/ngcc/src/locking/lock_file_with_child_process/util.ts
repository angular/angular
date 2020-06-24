/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem} from '../../../../src/ngtsc/file_system';
import {Logger} from '../../../../src/ngtsc/logging';

/**
 * Remove the lock-file at the provided `lockFilePath` from the given file-system.
 *
 * It only removes the file if the pid stored in the file matches the provided `pid`.
 * The provided `pid` is of the process that is exiting and so no longer needs to hold the lock.
 */
export function removeLockFile(
    fs: FileSystem, logger: Logger, lockFilePath: AbsoluteFsPath, pid: string) {
  try {
    logger.debug(`Attempting to remove lock-file at ${lockFilePath}.`);
    const lockFilePid = fs.readFile(lockFilePath);
    if (lockFilePid === pid) {
      logger.debug(`PIDs match (${pid}), so removing ${lockFilePath}.`);
      fs.removeFile(lockFilePath);
    } else {
      logger.debug(
          `PIDs do not match (${pid} and ${lockFilePid}), so not removing ${lockFilePath}.`);
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      logger.debug(`The lock-file at ${lockFilePath} was already removed.`);
      // File already removed so quietly exit
    } else {
      throw e;
    }
  }
}
