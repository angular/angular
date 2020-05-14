/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ChildProcess, fork} from 'child_process';

import {AbsoluteFsPath, FileSystem} from '../../../../src/ngtsc/file_system';
import {Logger, LogLevel} from '../../../../src/ngtsc/logging';
import {getLockFilePath, LockFile} from '../lock_file';

import {removeLockFile} from './util';

/// <reference types="node" />

/**
 * This `LockFile` implementation uses a child-process to remove the lock file when the main process
 * exits (for whatever reason).
 *
 * There are a few milliseconds between the child-process being forked and it registering its
 * `disconnect` event, which is responsible for tidying up the lock-file in the event that the main
 * process exits unexpectedly.
 *
 * We eagerly create the unlocker child-process so that it maximizes the time before the lock-file
 * is actually written, which makes it very unlikely that the unlocker would not be ready in the
 * case that the developer hits Ctrl-C or closes the terminal within a fraction of a second of the
 * lock-file being created.
 *
 * The worst case scenario is that ngcc is killed too quickly and leaves behind an orphaned
 * lock-file. In which case the next ngcc run will display a helpful error message about deleting
 * the lock-file.
 */
export class LockFileWithChildProcess implements LockFile {
  path: AbsoluteFsPath;
  private unlocker: ChildProcess|null;

  constructor(protected fs: FileSystem, protected logger: Logger) {
    this.path = getLockFilePath(fs);
    this.unlocker = this.createUnlocker(this.path);
  }


  write(): void {
    if (this.unlocker === null) {
      // In case we already disconnected the previous unlocker child-process, perhaps by calling
      // `remove()`. Normally the LockFile should only be used once per instance.
      this.unlocker = this.createUnlocker(this.path);
    }
    this.logger.debug(`Attemping to write lock-file at ${this.path} with PID ${process.pid}`);
    // To avoid race conditions, check for existence of the lock-file by trying to create it.
    // This will throw an error if the file already exists.
    this.fs.writeFile(this.path, process.pid.toString(), /* exclusive */ true);
    this.logger.debug(`Written lock-file at ${this.path} with PID ${process.pid}`);
  }

  read(): string {
    try {
      return this.fs.readFile(this.path);
    } catch {
      return '{unknown}';
    }
  }

  remove() {
    removeLockFile(this.fs, this.logger, this.path, process.pid.toString());
    if (this.unlocker !== null) {
      // If there is an unlocker child-process then disconnect from it so that it can exit itself.
      this.unlocker.disconnect();
      this.unlocker = null;
    }
  }

  protected createUnlocker(path: AbsoluteFsPath): ChildProcess {
    this.logger.debug('Forking unlocker child-process');
    const logLevel =
        this.logger.level !== undefined ? this.logger.level.toString() : LogLevel.info.toString();
    const isWindows = process.platform === 'win32';
    const unlocker = fork(
        __dirname + '/unlocker.js', [path, logLevel],
        {detached: true, stdio: isWindows ? 'pipe' : 'inherit'});
    if (isWindows) {
      unlocker.stdout?.on('data', process.stdout.write.bind(process.stdout));
      unlocker.stderr?.on('data', process.stderr.write.bind(process.stderr));
    }
    return unlocker;
  }
}
