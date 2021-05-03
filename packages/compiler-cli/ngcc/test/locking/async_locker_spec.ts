/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {AsyncLocker} from '../../src/locking/async_locker';
import {MockLockFile} from '../helpers/mock_lock_file';

runInEachFileSystem(() => {
  describe('AsyncLocker', () => {
    describe('lock()', () => {
      it('should guard the `fn()` with calls to `write()` and `remove()`', async () => {
        const fs = getFileSystem();
        const log: string[] = [];
        const lockFile = new MockLockFile(fs, log);
        const locker = new AsyncLocker(lockFile, new MockLogger(), 100, 10);

        await locker.lock(async () => {
          log.push('fn() - before');
          // This promise forces node to do a tick in this function, ensuring that we are truly
          // testing an async scenario.
          await Promise.resolve();
          log.push('fn() - after');
        });
        expect(log).toEqual(['write()', 'fn() - before', 'fn() - after', 'remove()']);
      });

      it('should guard the `fn()` with calls to `write()` and `remove()`, even if it throws',
         async () => {
           let error: string = '';
           const fs = getFileSystem();
           const log: string[] = [];
           const lockFile = new MockLockFile(fs, log);
           const locker = new AsyncLocker(lockFile, new MockLogger(), 100, 10);

           try {
             await locker.lock(async () => {
               log.push('fn()');
               throw new Error('ERROR');
             });
           } catch (e) {
             error = e.message;
           }
           expect(error).toEqual('ERROR');
           expect(log).toEqual(['write()', 'fn()', 'remove()']);
         });

      it('should retry if another process is locking', async () => {
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
          if (lockFileContents === null) {
            throw {code: 'ENOENT'};
          }
          return lockFileContents;
        });

        const promise = locker.lock(async () => log.push('fn()'));
        // The lock is now waiting on the lock-file becoming free, so no `fn()` in the log.
        expect(log).toEqual(['write()', 'read() => 188']);
        expect(logger.logs.info).toEqual([[
          'Another process, with id 188, is currently running ngcc.\nWaiting up to 1s for it to finish.\n' +
          `(If you are sure no ngcc process is running then you should delete the lock-file at ${
              lockFile.path}.)`
        ]]);

        lockFileContents = null;
        // The lock-file has been removed, so we can create our own lock-file, call `fn()` and then
        // remove the lock-file.
        await promise;
        expect(log).toEqual(['write()', 'read() => 188', 'write()', 'fn()', 'remove()']);
      });

      it('should extend the retry timeout if the other process locking the file changes', async () => {
        const fs = getFileSystem();
        const log: string[] = [];
        const lockFile = new MockLockFile(fs, log);
        const logger = new MockLogger();
        const locker = new AsyncLocker(lockFile, logger, 200, 5);

        let lockFileContents: string|null = '188';
        spyOn(lockFile, 'write').and.callFake(() => {
          log.push('write()');
          if (lockFileContents) {
            throw {code: 'EEXIST'};
          }
        });
        spyOn(lockFile, 'read').and.callFake(() => {
          log.push('read() => ' + lockFileContents);
          if (lockFileContents === null) {
            throw {code: 'ENOENT'};
          }
          return lockFileContents;
        });

        const promise = locker.lock(async () => log.push('fn()'));
        // The lock is now waiting on the lock-file becoming free, so no `fn()` in the log.
        expect(log).toEqual(['write()', 'read() => 188']);
        expect(logger.logs.info).toEqual([[
          'Another process, with id 188, is currently running ngcc.\nWaiting up to 1s for it to finish.\n' +
          `(If you are sure no ngcc process is running then you should delete the lock-file at ${
              lockFile.path}.)`
        ]]);

        lockFileContents = '444';
        // The lock-file has been taken over by another process - wait for the next attempt
        await new Promise(resolve => setTimeout(resolve, 250));
        expect(log).toEqual(['write()', 'read() => 188', 'write()', 'read() => 444']);
        expect(logger.logs.info).toEqual([
          ['Another process, with id 188, is currently running ngcc.\nWaiting up to 1s for it to finish.\n' +
           `(If you are sure no ngcc process is running then you should delete the lock-file at ${
               lockFile.path}.)`],
          ['Another process, with id 444, is currently running ngcc.\nWaiting up to 1s for it to finish.\n' +
           `(If you are sure no ngcc process is running then you should delete the lock-file at ${
               lockFile.path}.)`]
        ]);

        lockFileContents = null;
        // The lock-file has been removed, so we can create our own lock-file, call `fn()` and
        // then remove the lock-file.
        await promise;
        expect(log).toEqual([
          'write()', 'read() => 188', 'write()', 'read() => 444', 'write()', 'fn()', 'remove()'
        ]);
      });

      it('should error if another process does not release the lock-file before this times out',
         async () => {
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
             if (lockFileContents === null) {
               throw {code: 'ENOENT'};
             }
             return lockFileContents;
           });

           const promise = locker.lock(async () => log.push('fn()'));

           // The lock is now waiting on the lock-file becoming free, so no `fn()` in the log.
           expect(log).toEqual(['write()', 'read() => 188']);
           // Do not remove the lock-file and let the call to `lock()` timeout.
           let error: Error;
           await promise.catch(e => error = e);
           expect(log).toEqual(['write()', 'read() => 188', 'write()', 'read() => 188']);
           expect(error!.message)
               .toEqual(
                   `Timed out waiting 0.2s for another ngcc process, with id 188, to complete.\n` +
                   `(If you are sure no ngcc process is running then you should delete the lock-file at ${
                       lockFile.path}.)`);
         });
    });
  });
});
