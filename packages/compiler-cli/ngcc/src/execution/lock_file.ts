/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as process from 'process';
import {FileSystem} from '../../../src/ngtsc/file_system';

/**
 * The LockFile is used to prevent more than one instance of ngcc executing at the same time.
 *
 * When ngcc starts executing, it creates a file in the `compiler-cli/ngcc` folder. If it finds one
 * is already there then it fails with a suitable error message.
 * When ngcc completes executing, it removes the file so that future ngcc executions can start.
 */
export class LockFile {
  lockFilePath =
      this.fs.resolve(require.resolve('@angular/compiler-cli/ngcc'), '../__ngcc_lock_file__');

  constructor(private fs: FileSystem) {}

  /**
   * Run a function guarded by the lock file.
   *
   * Note that T can be a Promise. If so, we run the `remove()` call in the promise's `finally`
   * handler. Otherwise we run the `remove()` call in the `try...finally` block.
   *
   * @param fn The function to run.
   */
  lock<T>(fn: () => T): T {
    let isAsync = false;
    this.create();
    try {
      const result = fn();
      if (result instanceof Promise) {
        isAsync = true;
        // The cast is necessary because TS cannot deduce that T is now a promise here.
        return result.finally(() => this.remove()) as unknown as T;
      } else {
        return result;
      }
    } finally {
      if (!isAsync) {
        this.remove();
      }
    }
  }

  /**
   * Write a lock file to disk, or error if there is already one there.
   */
  protected create() {
    try {
      this.addSignalHandlers();
      // To avoid race conditions, we check for existence of the lockfile
      // by actually trying to create it exclusively
      this.fs.writeFile(this.lockFilePath, process.pid.toString(), /* exclusive */ true);
    } catch (e) {
      this.removeSignalHandlers();
      if (e.code !== 'EEXIST') {
        throw e;
      }

      // The lockfile already exists so raise a helpful error.
      // It is feasible that the lockfile was removed between the previous check for existence
      // and this file-read. If so then we still error but as gracefully as possible.
      let pid: string;
      try {
        pid = this.fs.readFile(this.lockFilePath);
      } catch {
        pid = '{unknown}';
      }

      throw new Error(
          `ngcc is already running at process with id ${pid}.\n` +
          `If you are running multiple builds in parallel then you should pre-process your node_modules via the command line ngcc tool before starting the builds;\n` +
          `See https://v9.angular.io/guide/ivy#speeding-up-ngcc-compilation.\n` +
          `(If you are sure no ngcc process is running then you should delete the lockfile at ${this.lockFilePath}.)`);
    }
  }

  /**
   * Remove the lock file from disk.
   */
  protected remove() {
    this.removeSignalHandlers();
    if (this.fs.exists(this.lockFilePath)) {
      this.fs.removeFile(this.lockFilePath);
    }
  }

  protected addSignalHandlers() {
    process.once('SIGINT', this.signalHandler);
    process.once('SIGHUP', this.signalHandler);
  }

  protected removeSignalHandlers() {
    process.removeListener('SIGINT', this.signalHandler);
    process.removeListener('SIGHUP', this.signalHandler);
  }

  /**
   * This handle needs to be defined as a property rather than a method
   * so that it can be passed around as a bound function.
   */
  protected signalHandler =
      () => {
        this.remove();
        this.exit(1);
      }

  /**
   * This function wraps `process.exit()` which makes it easier to manage in unit tests,
   * since it is not possible to mock out `process.exit()` when it is called from signal handlers.
   */
  protected exit(code: number): void {
    process.exit(code);
  }
}
