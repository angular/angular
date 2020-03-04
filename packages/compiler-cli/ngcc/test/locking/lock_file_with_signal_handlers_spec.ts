/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as process from 'process';

import {CachedFileSystem, FileSystem, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {LockFileWithSignalHandlers} from '../../src/locking/lock_file_with_signal_handlers';

runInEachFileSystem(() => {
  describe('LockFileWithSignalHandlers', () => {
    /**
     * This class allows us to test ordering of the calls, and to avoid actually attaching signal
     * handlers and most importantly not actually exiting the process.
     */
    class LockFileUnderTest extends LockFileWithSignalHandlers {
      log: string[] = [];
      constructor(fs: FileSystem, private handleSignals = false) {
        super(fs);
        fs.ensureDir(fs.dirname(this.path));
      }
      remove() {
        this.log.push('remove()');
        super.remove();
      }
      addSignalHandlers() {
        this.log.push('addSignalHandlers()');
        if (this.handleSignals) {
          super.addSignalHandlers();
        }
      }
      write() {
        this.log.push('write()');
        super.write();
      }
      read() {
        const contents = super.read();
        this.log.push('read() => ' + contents);
        return contents;
      }
      removeSignalHandlers() {
        this.log.push('removeSignalHandlers()');
        super.removeSignalHandlers();
      }
      exit(code: number) { this.log.push(`exit(${code})`); }
    }

    describe('write()', () => {
      it('should call `addSignalHandlers()`', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        lockFile.write();
        expect(lockFile.log).toEqual(['write()', 'addSignalHandlers()']);
      });

      it('should call `removeSignalHandlers()` if there is an error', () => {
        const fs = getFileSystem();
        spyOn(fs, 'writeFile').and.throwError('WRITING ERROR');
        const lockFile = new LockFileUnderTest(fs);
        expect(() => lockFile.write()).toThrowError('WRITING ERROR');
        expect(lockFile.log).toEqual(['write()', 'addSignalHandlers()', 'removeSignalHandlers()']);
      });

      it('should remove the lock-file if CTRL-C is triggered', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs, /* handleSignals */ true);

        lockFile.write();
        expect(lockFile.log).toEqual(['write()', 'addSignalHandlers()']);

        // Simulate the CTRL-C signal
        lockFile.log.push('SIGINT');
        process.emit('SIGINT', 'SIGINT');

        expect(lockFile.log).toEqual([
          'write()', 'addSignalHandlers()', 'SIGINT', 'remove()', 'removeSignalHandlers()',
          'exit(1)'
        ]);
      });

      it('should remove the lock-file if terminal is closed', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs, /* handleSignals */ true);

        lockFile.write();
        expect(lockFile.log).toEqual(['write()', 'addSignalHandlers()']);

        // Simulate the terminal being closed
        lockFile.log.push('SIGHUP');
        process.emit('SIGHUP', 'SIGHUP');

        expect(lockFile.log).toEqual([
          'write()', 'addSignalHandlers()', 'SIGHUP', 'remove()', 'removeSignalHandlers()',
          'exit(1)'
        ]);
      });
    });

    describe('read()', () => {
      it('should return the contents of the lock-file', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.path, '188');
        expect(lockFile.read()).toEqual('188');
      });

      it('should return `{unknown}` if the lock-file does not exist', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        expect(lockFile.read()).toEqual('{unknown}');
      });

      it('should not read file from the cache, since the file may have been modified externally',
         () => {
           const rawFs = getFileSystem();
           const fs = new CachedFileSystem(rawFs);
           const lockFile = new LockFileUnderTest(fs);
           rawFs.writeFile(lockFile.path, '188');
           expect(lockFile.read()).toEqual('188');
           // We need to write to the rawFs to ensure that we don't update the cache at this point
           rawFs.writeFile(lockFile.path, '444');
           expect(lockFile.read()).toEqual('444');
         });
    });

    describe('remove()', () => {
      it('should remove the lock file from the file-system', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.path, '188');
        lockFile.remove();
        expect(fs.exists(lockFile.path)).toBe(false);
      });

      it('should not error if the lock file does not exist', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        expect(() => lockFile.remove()).not.toThrow();
      });

      it('should call removeSignalHandlers()', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.path, '188');
        lockFile.remove();
        expect(lockFile.log).toEqual(['remove()', 'removeSignalHandlers()']);
      });
    });
  });
});
