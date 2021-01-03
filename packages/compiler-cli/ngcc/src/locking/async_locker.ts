/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Logger} from '../../../src/ngtsc/logging';
import {NGCC_TIMED_OUT_EXIT_CODE} from '../constants';

import {LockFile} from './lock_file';

class TimeoutError extends Error {
  code = NGCC_TIMED_OUT_EXIT_CODE;
}

/**
 * AsyncLocker is used to prevent more than one instance of ngcc executing at the same time,
 * when being called in an asynchronous context.
 *
 * * When ngcc starts executing, it creates a file in the `compiler-cli/ngcc` folder.
 * * If it finds one is already there then it pauses and waits for the file to be removed by the
 *   other process. If the file is not removed within a set timeout period given by
 *   `retryDelay*retryAttempts` an error is thrown with a suitable error message.
 * * If the process locking the file changes, then we restart the timeout.
 * * When ngcc completes executing, it removes the file so that future ngcc executions can start.
 */
export class AsyncLocker {
  constructor(
      private lockFile: LockFile, protected logger: Logger, private retryDelay: number,
      private retryAttempts: number) {}

  /**
   * Run a function guarded by the lock file.
   *
   * @param fn The function to run.
   */
  async lock<T>(fn: () => Promise<T>): Promise<T> {
    await this.create();
    try {
      return await fn();
    } finally {
      this.lockFile.remove();
    }
  }

  protected async create() {
    let pid: string = '';
    for (let attempts = 0; attempts < this.retryAttempts; attempts++) {
      try {
        return this.lockFile.write();
      } catch (e) {
        if (e.code !== 'EEXIST') {
          throw e;
        }
        const newPid = this.lockFile.read();
        if (newPid !== pid) {
          // The process locking the file has changed, so restart the timeout
          attempts = 0;
          pid = newPid;
        }
        if (attempts === 0) {
          this.logger.info(
              `Another process, with id ${pid}, is currently running ngcc.\n` +
              `Waiting up to ${this.retryDelay * this.retryAttempts / 1000}s for it to finish.\n` +
              `(If you are sure no ngcc process is running then you should delete the lock-file at ${
                  this.lockFile.path}.)`);
        }
        // The file is still locked by another process so wait for a bit and retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
    // If we fall out of the loop then we ran out of rety attempts
    throw new TimeoutError(
        `Timed out waiting ${
            this.retryAttempts * this.retryDelay /
            1000}s for another ngcc process, with id ${pid}, to complete.\n` +
        `(If you are sure no ngcc process is running then you should delete the lock-file at ${
            this.lockFile.path}.)`);
  }
}
