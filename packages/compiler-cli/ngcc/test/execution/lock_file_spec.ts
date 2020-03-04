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
import {AsyncLocker, LockFileWithSignalHandlers, SyncLocker} from '../../src/execution/lock_file';
import {MockLockFile} from '../helpers/mock_lock_file';
import {MockLogger} from '../helpers/mock_logger';

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

  describe('AsyncLocker', () => {
    describe('lock()', () => {
      it('should guard the `fn()` with calls to `write()` and `remove()`', async() => {
        const fs = getFileSystem();
        const log: string[] = [];
        const lockFile = new MockLockFile(fs, log);
        const locker = new AsyncLocker(lockFile, new MockLogger(), 100, 10);

        await locker.lock(async() => {
          log.push('fn() - before');
          // This promise forces node to do a tick in this function, ensuring that we are truly
          // testing an async scenario.
          await Promise.resolve();
          log.push('fn() - after');
          return Promise.resolve();
        });
        expect(log).toEqual(['write()', 'fn() - before', 'fn() - after', 'remove()']);
      });

      it('should guard the `fn()` with calls to `write()` and `remove()`, even if it throws',
         async() => {
           let error: string = '';
           const fs = getFileSystem();
           const log: string[] = [];
           const lockFile = new MockLockFile(fs, log);
           const locker = new AsyncLocker(lockFile, new MockLogger(), 100, 10);

           try {
             await locker.lock(async() => {
               log.push('fn()');
               throw new Error('ERROR');
             });
           } catch (e) {
             error = e.message;
           }
           expect(error).toEqual('ERROR');
           expect(log).toEqual(['write()', 'fn()', 'remove()']);
         });

      it('should retry if another process is locking', async() => {
        const fs = getFileSystem();
        const log: string[] = [];
        const lockFile = new MockLockFile(fs, log);
        const logger = new MockLogger();
        const locker = new AsyncLocker(lockFile, logger, 100, 10);

        let lockFileContents: string|null = '188';
        spyOn(lockFile, 'write').and.callFake(() => {
          log.push('write()');
          if (lockFileContents) {
            throw {code: 'EEXIST'};
          }
        });
        spyOn(lockFile, 'read').and.callFake(() => {
          log.push('read() => ' + lockFileContents);
          return lockFileContents;
        });

        const promise = locker.lock(async() => log.push('fn()'));
        // The lock is now waiting on the lockFile becoming free, so no `fn()` in the log.
        expect(log).toEqual(['write()', 'read() => 188']);
        expect(logger.logs.info).toEqual([[
          'Another process, with id 188, is currently running ngcc.\nWaiting up to 1s for it to finish.'
        ]]);

        lockFileContents = null;
        // The lockFile has been removed, so we can create our own lockFile, call `fn()` and then
        // remove the lockFile.
        await promise;
        expect(log).toEqual(['write()', 'read() => 188', 'write()', 'fn()', 'remove()']);
      });

      it('should extend the retry timeout if the other process locking the file changes', async() => {
        const fs = getFileSystem();
        const log: string[] = [];
        const lockFile = new MockLockFile(fs, log);
        const logger = new MockLogger();
        const locker = new AsyncLocker(lockFile, logger, 100, 10);

        let lockFileContents: string|null = '188';
        spyOn(lockFile, 'write').and.callFake(() => {
          log.push('write()');
          if (lockFileContents) {
            throw {code: 'EEXIST'};
          }
        });
        spyOn(lockFile, 'read').and.callFake(() => {
          log.push('read() => ' + lockFileContents);
          return lockFileContents;
        });

        async() => {
          const promise = locker.lock(async() => log.push('fn()'));
          // The lock is now waiting on the lockFile becoming free, so no `fn()` in the log.
          expect(log).toEqual(['write()', 'read() => 188']);
          expect(logger.logs.info).toEqual([[
            'Another process, with id 188, is currently running ngcc.\nWaiting up to 1s for it to finish.'
          ]]);

          lockFileContents = '444';
          // The lockFile has been taken over by another process
          await new Promise(resolve => setTimeout(resolve, 250));
          expect(log).toEqual(['write()', 'read() => 188', 'write()', 'read() => 444']);
          expect(logger.logs.info).toEqual([
            [
              'Another process, with id 188, is currently running ngcc.\nWaiting up to 1s for it to finish.'
            ],
            [
              'Another process, with id 444, is currently running ngcc.\nWaiting up to 1s for it to finish.'
            ]
          ]);

          lockFileContents = null;
          // The lockFile has been removed, so we can create our own lockFile, call `fn()` and then
          // remove the lockFile.
          await promise;
          expect(log).toEqual([
            'write()', 'read() => 188', 'write()', 'read() => 444', 'write()', 'fn()', 'remove()'
          ]);
        };
      });

      it('should error if another process does not release the lockFile before this times out',
         async() => {
           const fs = getFileSystem();
           const log: string[] = [];
           const lockFile = new MockLockFile(fs, log);
           const logger = new MockLogger();
           const locker = new AsyncLocker(lockFile, logger, 100, 2);

           let lockFileContents: string|null = '188';
           spyOn(lockFile, 'write').and.callFake(() => {
             log.push('write()');
             if (lockFileContents) {
               throw {code: 'EEXIST'};
             }
           });
           spyOn(lockFile, 'read').and.callFake(() => {
             log.push('read() => ' + lockFileContents);
             return lockFileContents;
           });

           const promise = locker.lock(async() => log.push('fn()'));

           // The lock is now waiting on the lockFile becoming free, so no `fn()` in the log.
           expect(log).toEqual(['write()', 'read() => 188']);
           // Do not remove the lockFile and let the call to `lock()` timeout.
           let error: Error;
           await promise.catch(e => error = e);
           expect(log).toEqual(['write()', 'read() => 188', 'write()', 'read() => 188']);
           expect(error !.message)
               .toEqual(
                   `Timed out waiting 0.2s for another ngcc process, with id 188, to complete.\n` +
                   `(If you are sure no ngcc process is running then you should delete the lockFile at ${lockFile.path}.)`);
         });
    });
  });
});
