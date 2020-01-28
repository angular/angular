/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as process from 'process';
import {FileSystem, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {LockFile} from '../../src/execution/lock_file';

/**
 * This class allows us to test the protected methods of LockFile directly,
 * which are normally hidden as "protected".
 *
 * We also add logging in here to track what is being called and in what order.
 *
 * Finally this class stubs out the `exit()` method to prevent unit tests from exiting the process.
 */
class LockFileUnderTest extends LockFile {
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

runInEachFileSystem(() => {
  describe('LockFile', () => {
    describe('lock() - synchronous', () => {
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

    describe('lock() - asynchronous', () => {
      it('should guard the `fn()` with calls to `create()` and `remove()`', async() => {
        const fs = getFileSystem();
        const lockFile = new LockFileUnderTest(fs);

        await lockFile.lock(async() => {
          lockFile.log.push('fn() - before');
          // This promise forces node to do a tick in this function, ensuring that we are truly
          // testing an async scenario.
          await Promise.resolve();
          lockFile.log.push('fn() - after');
        });
        expect(lockFile.log).toEqual(['create()', 'fn() - before', 'fn() - after', 'remove()']);
      });

      it('should guard the `fn()` with calls to `create()` and `remove()`, even if it throws',
         async() => {
           let error: string = '';
           const fs = getFileSystem();
           const lockFile = new LockFileUnderTest(fs);
           lockFile.create = () => lockFile.log.push('create()');
           lockFile.remove = () => lockFile.log.push('remove()');

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
        const lockFile = new LockFileUnderTest(fs, /* handleSignals */ true);

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
        const lockFile = new LockFileUnderTest(fs, /* handleSignals */ true);

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
    });
  });
});
