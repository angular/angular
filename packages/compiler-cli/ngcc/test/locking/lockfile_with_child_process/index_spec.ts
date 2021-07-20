/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ChildProcess} from 'child_process';
import * as process from 'process';

import {FileSystem, getFileSystem} from '../../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../../src/ngtsc/logging/testing';
import {getLockFilePath} from '../../../src/locking/lock_file';
import {LockFileWithChildProcess} from '../../../src/locking/lock_file_with_child_process';

runInEachFileSystem(() => {
  describe('LockFileWithChildProcess', () => {
    /**
     * This class allows us to test ordering of the calls, and to avoid actually attaching signal
     * handlers and most importantly not actually exiting the process.
     */
    class LockFileUnderTest extends LockFileWithChildProcess {
      // Note that log is initialized in the `createUnlocker()` function that is called from
      // super(), so we can't initialize it here.
      log!: string[];
      constructor(fs: FileSystem) {
        super(fs, new MockLogger());
        fs.ensureDir(fs.dirname(this.path));
      }
      override remove() {
        this.log.push('remove()');
        super.remove();
      }
      override write() {
        this.log.push('write()');
        super.write();
      }
      override read() {
        const contents = super.read();
        this.log.push('read() => ' + contents);
        return contents;
      }
      override createUnlocker(): ChildProcess {
        this.log = this.log || [];
        this.log.push('createUnlocker()');
        const log = this.log;
        // Normally this would fork a child process and return it.
        // But we don't want to do that in these tests.
        return <any>{
          disconnect() {
            log.push('unlocker.disconnect()');
          }
        };
      }
    }

    describe('constructor', () => {
      it('should create the unlocker process', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        expect(lockFile.log).toEqual(['createUnlocker()']);
      });
    });

    describe('write()', () => {
      it('should write the lock-file to disk', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        expect(fs.exists(getLockFilePath(fs))).toBe(false);
        lockFile.write();
        expect(fs.exists(getLockFilePath(fs))).toBe(true);
        expect(fs.readFile(getLockFilePath(fs))).toEqual('' + process.pid);
      });

      it('should create the unlocker process if it is not already created', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        lockFile.log = [];
        (lockFile as any).unlocker = null;
        lockFile.write();
        expect(lockFile.log).toEqual(['write()', 'createUnlocker()']);
        expect((lockFile as any).unlocker).not.toBe(null);
      });
    });

    describe('read()', () => {
      it('should return the contents of the lock-file', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.path, '' + process.pid);
        expect(lockFile.read()).toEqual('' + process.pid);
      });

      it('should return `{unknown}` if the lock-file does not exist', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        expect(lockFile.read()).toEqual('{unknown}');
      });
    });

    describe('remove()', () => {
      it('should remove the lock file from the file-system', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.path, '' + process.pid);
        lockFile.remove();
        expect(fs.exists(lockFile.path)).toBe(false);
      });

      it('should not error if the lock file does not exist', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        expect(() => lockFile.remove()).not.toThrow();
      });

      it('should disconnect the unlocker child process', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.path, '' + process.pid);
        lockFile.remove();
        expect(lockFile.log).toEqual(['createUnlocker()', 'remove()', 'unlocker.disconnect()']);
        expect((lockFile as any).unlocker).toBe(null);
      });
    });
  });
});
