/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as process from 'process';
import {CachedFileSystem, FileSystem} from '../../../src/ngtsc/file_system';
import {LockFile, getLockFilePath} from './lock_file';

export class LockFileWithSignalHandlers implements LockFile {
  constructor(protected fs: FileSystem) {}

  path = getLockFilePath(this.fs);

  write(): void {
    try {
      this.addSignalHandlers();
      // To avoid race conditions, we check for existence of the lock-file by actually trying to
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
   * When these occur we remove the lock-file and exit.
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
