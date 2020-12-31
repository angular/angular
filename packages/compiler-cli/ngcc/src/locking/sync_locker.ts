/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {LockFile} from './lock_file';

/**
 * SyncLocker is used to prevent more than one instance of ngcc executing at the same time,
 * when being called in a synchronous context.
 *
 * * When ngcc starts executing, it creates a file in the `compiler-cli/ngcc` folder.
 * * If it finds one is already there then it fails with a suitable error message.
 * * When ngcc completes executing, it removes the file so that future ngcc executions can start.
 */
export class SyncLocker {
  constructor(private lockFile: LockFile) {}

  /**
   * Run the given function guarded by the lock file.
   *
   * @param fn the function to run.
   * @returns the value returned from the `fn` call.
   */
  lock<T>(fn: () => T): T {
    this.create();
    try {
      return fn();
    } finally {
      this.lockFile.remove();
    }
  }

  /**
   * Write a lock file to disk, or error if there is already one there.
   */
  protected create(): void {
    try {
      this.lockFile.write();
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e;
      }
      this.handleExistingLockFile();
    }
  }

  /**
   * The lock-file already exists so raise a helpful error.
   */
  protected handleExistingLockFile(): void {
    const pid = this.lockFile.read();
    throw new Error(
        `ngcc is already running at process with id ${pid}.\n` +
        `If you are running multiple builds in parallel then you might try pre-processing your node_modules via the command line ngcc tool before starting the builds.\n` +
        `(If you are sure no ngcc process is running then you should delete the lock-file at ${
            this.lockFile.path}.)`);
  }
}
