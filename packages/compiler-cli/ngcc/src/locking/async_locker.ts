/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NGCC_TIMED_OUT_EXIT_CODE} from '../constants';
import {Logger} from '../logging/logger';

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
    return fn().finally(() => this.lockFile.remove());
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
          // Check to see if the process identified by the PID is still running. Because the
          // process *should* clean up after itself, we only check for a stale lock file when the
          // PID changes and only once. This may mean you have to wait if the process is killed
          // after the first check and isn't given the chance to clean up after itself.
          if (!this.isProcessRunning(pid)) {
            // try to re-lock one last time in case there was a race condition checking the process.
            try {
              return this.lockFile.write();
            } catch (e2) {
              if (e2.code !== 'EEXIST') {
                throw e2;
              }
            }

            // finally check that the lock was held by the same process this whole time.
            const finalPid = this.lockFile.read();
            if (finalPid === pid) {
              throw new TimeoutError(this.lockFileMessage(
                  `Lock found, but no process with PID ${pid} seems to be running.`));
            } else {
              // attempts is still 0, but adjust the PID so the message below is correct.
              pid = finalPid;
            }
          }

          this.logger.info(this.lockFileMessage(
              `Another process, with id ${pid}, is currently running ngcc.\n` +
              `Waiting up to ${this.retryDelay * this.retryAttempts / 1000}s for it to finish.`));
        }
        // The file is still locked by another process so wait for a bit and retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
    // If we fall out of the loop then we ran out of rety attempts
    throw new TimeoutError(this.lockFileMessage(`Timed out waiting ${
        this.retryAttempts * this.retryDelay /
        1000}s for another ngcc process, with id ${pid}, to complete.`));
  }

  protected isProcessRunning(pid: string): boolean {
    // let the normal logic run if this is not called with a valid PID
    if (isNaN(+pid)) {
      this.logger.debug(`Cannot check if invalid PID "${pid}" is running, a number is expected.`);
      return true;
    }

    try {
      process.kill(+pid, 0);
      return true;
    } catch (e) {
      // If the process doesn't exist ESRCH will be thrown, if the error is not that, throw it.
      if (e.code !== 'ESRCH') {
        throw e;
      }

      return false;
    }
  }

  private lockFileMessage(message: string): string {
    return message +
        `\n(If you are sure no ngcc process is running then you should delete the lock-file at ${
               this.lockFile.path}.)`;
  }
}
