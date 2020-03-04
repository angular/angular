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
import {LockFileWithSignalHandlers, SyncLocker} from '../../src/execution/lock_file';
import {MockLockFile} from '../helpers/mock_lock_file';

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

      it('should remove the lockFile if CTRL-C is triggered', () => {
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

      it('should remove the lockFile if terminal is closed', () => {
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
      it('should return the contents of the lockFile', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.path, '188');
        expect(lockFile.read()).toEqual('188');
      });

      it('should return `{unknown}` if the lockFile does not exist', () => {
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

  describe('SyncLocker', () => {
    describe('lock()', () => {
      it('should guard the `fn()` with calls to `write()` and `remove()`', () => {
        const fs = getFileSystem();
        const log: string[] = [];
        const lockFile = new MockLockFile(fs, log);
        const locker = new SyncLocker(lockFile);

        locker.lock(() => log.push('fn()'));

        expect(log).toEqual(['write()', 'fn()', 'remove()']);
      });

      it('should guard the `fn()` with calls to `write()` and `remove()`, even if it throws',
         () => {
           let error: string = '';
           const fs = getFileSystem();
           const log: string[] = [];
           const lockFile = new MockLockFile(fs, log);
           const locker = new SyncLocker(lockFile);

           try {
             locker.lock(() => {
               log.push('fn()');
               throw new Error('ERROR');
             });
           } catch (e) {
             error = e.message;
           }
           expect(error).toEqual('ERROR');
           expect(log).toEqual(['write()', 'fn()', 'remove()']);
         });

      it('should error if a lock file already exists', () => {
        const fs = getFileSystem();
        const log: string[] = [];
        const lockFile = new MockLockFile(fs, log);
        const locker = new SyncLocker(lockFile);

        spyOn(lockFile, 'write').and.callFake(() => { throw {code: 'EEXIST'}; });
        spyOn(lockFile, 'read').and.returnValue('188');

        expect(() => locker.lock(() => {}))
            .toThrowError(
                `ngcc is already running at process with id 188.\n` +
                `If you are running multiple builds in parallel then you should pre-process your node_modules via the command line ngcc tool before starting the builds;\n` +
                `See https://v9.angular.io/guide/ivy#speeding-up-ngcc-compilation.\n` +
                `(If you are sure no ngcc process is running then you should delete the lockFile at ${lockFile.path}.)`);
      });
    });
  });
});
