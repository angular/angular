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
import {LockFileAsync, LockFileBase, LockFileSync} from '../../src/execution/lock_file';
import {MockLogger} from '../helpers/mock_logger';

runInEachFileSystem(() => {
  describe('LockFileBase', () => {
    /**
     * This class allows us to test the abstract class LockFileBase.
     */
    class LockFileUnderTest extends LockFileBase {
      log: string[] = [];
      constructor(fs: FileSystem, private handleSignals = false) {
        super(fs);
        fs.ensureDir(fs.dirname(this.lockFilePath));
      }
      remove() { super.remove(); }
      addSignalHandlers() {
        this.log.push('addSignalHandlers()');
        if (this.handleSignals) {
          super.addSignalHandlers();
        }
      }
      writeLockFile() { super.writeLockFile(); }
      readLockFile() { return super.readLockFile(); }
      removeSignalHandlers() {
        this.log.push('removeSignalHandlers()');
        super.removeSignalHandlers();
      }
      exit(code: number) { this.log.push(`exit(${code})`); }
    }

    describe('writeLockFile()', () => {
      it('should call `addSignalHandlers()`', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        lockFile.writeLockFile();
        expect(lockFile.log).toEqual(['addSignalHandlers()']);
      });

      it('should call `removeSignalHandlers()` if there is an error', () => {
        const fs = getFileSystem();
        spyOn(fs, 'writeFile').and.throwError('WRITING ERROR');
        const lockFile = new LockFileUnderTest(fs);
        expect(() => lockFile.writeLockFile()).toThrowError('WRITING ERROR');
        expect(lockFile.log).toEqual(['addSignalHandlers()', 'removeSignalHandlers()']);
      });
    });

    describe('readLockFile()', () => {
      it('should return the contents of the lockfile', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.lockFilePath, '188');
        expect(lockFile.readLockFile()).toEqual('188');
      });

      it('should return `{unknown}` if the lockfile does not exist', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        expect(lockFile.readLockFile()).toEqual('{unknown}');
      });
    });

    describe('remove()', () => {
      it('should remove the lock file from the file-system', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.lockFilePath, '188');
        lockFile.remove();
        expect(fs.exists(lockFile.lockFilePath)).toBe(false);
      });

      it('should not error if the lock file does not exist', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        expect(() => lockFile.remove()).not.toThrow();
      });

      it('should call removeSignalHandlers()', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.lockFilePath, '188');
        lockFile.remove();
        expect(lockFile.log).toEqual(['removeSignalHandlers()']);
      });
    });
  });

  describe('LockFileSync', () => {
    /**
     * This class allows us to test the protected methods of LockFileSync directly,
     * which are normally hidden as "protected".
     *
     * We also add logging in here to track what is being called and in what order.
     *
     * Finally this class stubs out the `exit()` method to prevent unit tests from exiting the
     * process.
     */
    class LockFileUnderTest extends LockFileSync {
      log: string[] = [];
      constructor(fs: FileSystem, private handleSignals = false) {
        super(fs);
        fs.ensureDir(fs.dirname(this.lockFilePath));
      }
      create() {
        this.log.push('create()');
        super.create();
      }
      remove() {
        this.log.push('remove()');
        super.remove();
      }
      addSignalHandlers() {
        if (this.handleSignals) {
          super.addSignalHandlers();
        }
      }
      removeSignalHandlers() { super.removeSignalHandlers(); }
      exit(code: number) { this.log.push(`exit(${code})`); }
    }

    describe('lock()', () => {
      it('should guard the `fn()` with calls to `create()` and `remove()`', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);

        lockFile.lock(() => lockFile.log.push('fn()'));
        expect(lockFile.log).toEqual(['create()', 'fn()', 'remove()']);
      });

      it('should guard the `fn()` with calls to `create()` and `remove()`, even if it throws',
         () => {
           let error: string = '';
           const fs = getFileSystem();
           const lockFile = new LockFileUnderTest(fs);

           try {
             lockFile.lock(() => {
               lockFile.log.push('fn()');
               throw new Error('ERROR');
             });
           } catch (e) {
             error = e.message;
           }
           expect(error).toEqual('ERROR');
           expect(lockFile.log).toEqual(['create()', 'fn()', 'remove()']);
         });

      it('should remove the lockfile if CTRL-C is triggered', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs, /* handleSignals */ true);

        lockFile.lock(() => {
          lockFile.log.push('SIGINT');
          process.emit('SIGINT', 'SIGINT');
        });
        // Since the test does not actually exit process, the `remove()` is called one more time.
        expect(lockFile.log).toEqual(['create()', 'SIGINT', 'remove()', 'exit(1)', 'remove()']);
        // Clean up the signal handlers. In practice this is not needed since the process would have
        // been terminated already.
        lockFile.removeSignalHandlers();
      });

      it('should remove the lockfile if terminal is closed', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs, /* handleSignals */ true);

        lockFile.lock(() => {
          lockFile.log.push('SIGHUP');
          process.emit('SIGHUP', 'SIGHUP');
        });
        // Since this does not actually exit process, the `remove()` is called one more time.
        expect(lockFile.log).toEqual(['create()', 'SIGHUP', 'remove()', 'exit(1)', 'remove()']);
        // Clean up the signal handlers. In practice this is not needed since the process would have
        // been terminated already.
        lockFile.removeSignalHandlers();
      });
    });

    describe('create()', () => {
      it('should write a lock file to the file-system', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        expect(fs.exists(lockFile.lockFilePath)).toBe(false);
        lockFile.create();
        expect(fs.exists(lockFile.lockFilePath)).toBe(true);
      });

      it('should error if a lock file already exists', () => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.lockFilePath, '188');
        expect(() => lockFile.create())
            .toThrowError(
                `ngcc is already running at process with id 188.\n` +
                `If you are running multiple builds in parallel then you should pre-process your node_modules via the command line ngcc tool before starting the builds;\n` +
                `See https://v9.angular.io/guide/ivy#speeding-up-ngcc-compilation.\n` +
                `(If you are sure no ngcc process is running then you should delete the lockfile at ${lockFile.lockFilePath}.)`);
      });
    });
  });

  describe('LockFileAsync', () => {
    /**
     * This class allows us to test the protected methods of LockFileAsync directly,
     * which are normally hidden as "protected".
     *
     * We also add logging in here to track what is being called and in what order.
     *
     * Finally this class stubs out the `exit()` method to prevent unit tests from exiting the
     * process.
     */
    class LockFileUnderTest extends LockFileAsync {
      log: string[] = [];
      constructor(
          fs: FileSystem, retryDelay = 100, retryAttempts = 10, private handleSignals = false) {
        super(fs, new MockLogger(), retryDelay, retryAttempts);
        fs.ensureDir(fs.dirname(this.lockFilePath));
      }
      async create() {
        this.log.push('create()');
        await super.create();
      }
      remove() {
        this.log.push('remove()');
        super.remove();
      }
      addSignalHandlers() {
        if (this.handleSignals) {
          super.addSignalHandlers();
        }
      }
      removeSignalHandlers() { super.removeSignalHandlers(); }
      exit(code: number) { this.log.push(`exit(${code})`); }
      getLogger() { return this.logger as MockLogger; }
    }

    describe('lock()', () => {
      it('should guard the `fn()` with calls to `create()` and `remove()`', async() => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);

        await lockFile.lock(async() => {
          lockFile.log.push('fn() - before');
          // This promise forces node to do a tick in this function, ensuring that we are truly
          // testing an async scenario.
          await Promise.resolve();
          lockFile.log.push('fn() - after');
          return Promise.resolve();
        });
        expect(lockFile.log).toEqual(['create()', 'fn() - before', 'fn() - after', 'remove()']);
      });

      it('should guard the `fn()` with calls to `create()` and `remove()`, even if it throws',
         async() => {
           let error: string = '';
           const fs = getFileSystem();
           const lockFile = new LockFileUnderTest(fs);
           try {
             await lockFile.lock(async() => {
               lockFile.log.push('fn()');
               throw new Error('ERROR');
             });
           } catch (e) {
             error = e.message;
           }
           expect(error).toEqual('ERROR');
           expect(lockFile.log).toEqual(['create()', 'fn()', 'remove()']);
         });

      it('should remove the lockfile if CTRL-C is triggered', async() => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs, 100, 3, /* handleSignals */ true);

        await lockFile.lock(async() => {
          lockFile.log.push('SIGINT');
          process.emit('SIGINT', 'SIGINT');
        });
        // Since the test does not actually exit process, the `remove()` is called one more time.
        expect(lockFile.log).toEqual(['create()', 'SIGINT', 'remove()', 'exit(1)', 'remove()']);
        // Clean up the signal handlers. In practice this is not needed since the process would have
        // been terminated already.
        lockFile.removeSignalHandlers();
      });

      it('should remove the lockfile if terminal is closed', async() => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs, 100, 3, /* handleSignals */ true);

        await lockFile.lock(async() => {
          lockFile.log.push('SIGHUP');
          process.emit('SIGHUP', 'SIGHUP');
        });
        // Since this does not actually exit process, the `remove()` is called one more time.
        expect(lockFile.log).toEqual(['create()', 'SIGHUP', 'remove()', 'exit(1)', 'remove()']);
        // Clean up the signal handlers. In practice this is not needed since the process would have
        // been terminated already.
        lockFile.removeSignalHandlers();
      });
    });

    describe('create()', () => {
      it('should write a lock file to the file-system', async() => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        expect(fs.exists(lockFile.lockFilePath)).toBe(false);
        await lockFile.create();
        expect(fs.exists(lockFile.lockFilePath)).toBe(true);
      });

      it('should retry if another process is locking', async() => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.lockFilePath, '188');
        const promise = lockFile.lock(async() => lockFile.log.push('fn()'));
        // The lock is now waiting on the lockfile becoming free, so no `fn()` in the log.
        expect(lockFile.log).toEqual(['create()']);
        expect(lockFile.getLogger().logs.info).toEqual([[
          'Another process, with id 188, is currently running ngcc.\nWaiting up to 1s for it to finish.'
        ]]);
        fs.removeFile(lockFile.lockFilePath);
        // The lockfile has been removed, so we can create our own lockfile, call `fn()` and then
        // remove the lockfile.
        await promise;
        expect(lockFile.log).toEqual(['create()', 'fn()', 'remove()']);
      });

      it('should extend the retry timeout if the other process locking the file changes', async() => {
        // Use a cached file system to test that we are invalidating it correctly
        const rawFs = getFileSystem();
        const fs = new CachedFileSystem(rawFs);
        const lockFile = new LockFileUnderTest(fs);
        fs.writeFile(lockFile.lockFilePath, '188');
        const promise = lockFile.lock(async() => lockFile.log.push('fn()'));
        // The lock is now waiting on the lockfile becoming free, so no `fn()` in the log.
        expect(lockFile.log).toEqual(['create()']);
        expect(lockFile.getLogger().logs.info).toEqual([[
          'Another process, with id 188, is currently running ngcc.\nWaiting up to 1s for it to finish.'
        ]]);
        // We need to write to the rawFs to ensure that we don't update the cache at this point
        rawFs.writeFile(lockFile.lockFilePath, '444');
        await new Promise(resolve => setTimeout(resolve, 250));
        expect(lockFile.getLogger().logs.info).toEqual([
          [
            'Another process, with id 188, is currently running ngcc.\nWaiting up to 1s for it to finish.'
          ],
          [
            'Another process, with id 444, is currently running ngcc.\nWaiting up to 1s for it to finish.'
          ]
        ]);
        fs.removeFile(lockFile.lockFilePath);
        // The lockfile has been removed, so we can create our own lockfile, call `fn()` and then
        // remove the lockfile.
        await promise;
        expect(lockFile.log).toEqual(['create()', 'fn()', 'remove()']);
      });

      it('should error if another process does not release the lockfile before this times out',
         async() => {
           const fs = getFileSystem();
           const lockFile = new LockFileUnderTest(fs, 100, 2);
           fs.writeFile(lockFile.lockFilePath, '188');
           const promise = lockFile.lock(async() => lockFile.log.push('fn()'));
           // The lock is now waiting on the lockfile becoming free, so no `fn()` in the log.
           expect(lockFile.log).toEqual(['create()']);
           // Do not remove the lockfile and let the call to `lock()` timeout.
           let error: Error;
           await promise.catch(e => error = e);
           expect(lockFile.log).toEqual(['create()']);
           expect(error !.message)
               .toEqual(
                   `Timed out waiting 0.2s for another ngcc process, with id 188, to complete.\n` +
                   `(If you are sure no ngcc process is running then you should delete the lockfile at ${lockFile.lockFilePath}.)`);
         });
    });
  });
});
