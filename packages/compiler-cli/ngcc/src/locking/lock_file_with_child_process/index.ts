/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ChildProcess, fork} from 'child_process';
import {pid} from 'process';
import {AbsoluteFsPath, CachedFileSystem, FileSystem} from '../../../../src/ngtsc/file_system';
import {Logger} from '../../logging/logger';
import {LockFile, getLockFilePath} from '../lock_file';
import {removeLockFile} from './util';

/**
 * This LockFile implenentation uses a child-process to remove the lock file when the main process
 * exits (for whatever reason).
 *
 * There is a few milliseconds between the child-process being forked and it registering its
 * `disconnect` event, which is responsible for tidying up the lockFile in the even that the main
 * process exits unexpectedly.
 *
 * We eagerly create the unlocker child-process so that it maximizes the time before the lockFile is
 * actually written, which makes it very unlikely that the unlocker would not be ready in the case
 * that the developer hits Ctrl-C or closes the terminal within a fraction of a second of the
 * lockfile being created.
 *
 * The worst case scenario is that ngcc is killed too quickly and leaves behind an orphaned
 * lockFile. In which case the next ngcc run will display a helpful error message about deleting the
 * lockFile.
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
      // In case we already disconnected the previous unlocker child process, perhaps by calling
      // `remove()` Normally the LockFile should only be used once per instance.
      this.unlocker = this.createUnlocker(this.path);
    }
    // To avoid race conditions, check for existence of the lockFile by trying to create it.
    // This will throw an error if the file already exists.
    return this.fs.writeFile(this.path, pid.toString(), /* exclusive */ true);
  }

  read(): string {
    try {
      if (this.fs instanceof CachedFileSystem) {
        // The lockFile file is "volatile", it might be changed by an external process,
        // so we must not rely upon the cached value when reading it.
        this.fs.invalidateCaches(this.path);
      }
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
    return fork(
        this.fs.resolve(__dirname, './unlocker.js'), [path, this.logger.level.toString()],
        { detached: true});
  }
}
