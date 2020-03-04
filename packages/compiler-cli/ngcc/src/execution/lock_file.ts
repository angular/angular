/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as process from 'process';

import {AbsoluteFsPath, CachedFileSystem, FileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../logging/logger';

let _lockFilePath: AbsoluteFsPath;
export function getLockFilePath(fs: FileSystem) {
  if (!_lockFilePath) {
    _lockFilePath =
        fs.resolve(require.resolve('@angular/compiler-cli/ngcc'), '../__ngcc_lock_file__');
  }
  return _lockFilePath;
}

export interface LockFile {
  path: AbsoluteFsPath;
  /**
   * Write a lock file to disk containing the PID of the current process.
   */
  write(): void;

  /**
   * Read the PID, of the process holding the lock, from the lockFile.
   *
   * It is feasible that the lockFile was removed between the call to `write()` that effectively
   * checks for existence and this attempt to read the file. If so then this method should just
   * gracefully return `"{unknown}"`.
   */
  read(): string;

  /**
   * Remove the lock file from disk, whether or not it exists.
   */
  remove(): void;
}

export class LockFileWithSignalHandlers implements LockFile {
  constructor(protected fs: FileSystem) {}

  path = getLockFilePath(this.fs);

  write(): void {
    try {
      this.addSignalHandlers();
      // To avoid race conditions, we check for existence of the lockFile by actually trying to
      // create it exclusively.
      return this.fs.writeFile(this.path, process.pid.toString(), /* exclusive */ true);
    } catch (e) {
      this.removeSignalHandlers();
      throw e;
    }
  }

  read(): string {
    try {
      if (this.fs instanceof CachedFileSystem) {
        // This file is "volatile", it might be changed by an external process,
        // so we cannot rely upon the cached value when reading it.
        this.fs.invalidateCaches(this.path);
      }
      return this.fs.readFile(this.path);
    } catch {
      return '{unknown}';
    }
  }

  remove() {
    this.removeSignalHandlers();
    if (this.fs.exists(this.path)) {
      this.fs.removeFile(this.path);
    }
  }

  /**
   * Capture CTRL-C and terminal closing events.
   * When these occur we remove the lockFile and exit.
   */
  protected addSignalHandlers() {
    process.addListener('SIGINT', this.signalHandler);
    process.addListener('SIGHUP', this.signalHandler);
  }

  /**
   * Clear the event handlers to prevent leakage.
   */
  protected removeSignalHandlers() {
    process.removeListener('SIGINT', this.signalHandler);
    process.removeListener('SIGHUP', this.signalHandler);
  }

  /**
   * This handler needs to be defined as a property rather than a method
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
   * The lockFile already exists so raise a helpful error.
   */
  protected handleExistingLockFile(): void {
    const pid = this.lockFile.read();
    throw new Error(
        `ngcc is already running at process with id ${pid}.\n` +
        `If you are running multiple builds in parallel then you should pre-process your node_modules via the command line ngcc tool before starting the builds;\n` +
        `See https://v9.angular.io/guide/ivy#speeding-up-ngcc-compilation.\n` +
        `(If you are sure no ngcc process is running then you should delete the lockFile at ${this.lockFile.path}.)`);
  }
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
          this.logger.info(
              `Another process, with id ${pid}, is currently running ngcc.\n` +
              `Waiting up to ${this.retryDelay*this.retryAttempts/1000}s for it to finish.`);
        }
        // The file is still locked by another process so wait for a bit and retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
    // If we fall out of the loop then we ran out of rety attempts
    throw new Error(
        `Timed out waiting ${this.retryAttempts * this.retryDelay/1000}s for another ngcc process, with id ${pid}, to complete.\n` +
        `(If you are sure no ngcc process is running then you should delete the lockFile at ${this.lockFile.path}.)`);
  }
}
