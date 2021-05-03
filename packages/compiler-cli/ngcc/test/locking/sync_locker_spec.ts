/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {SyncLocker} from '../../src/locking/sync_locker';
import {MockLockFile} from '../helpers/mock_lock_file';

runInEachFileSystem(() => {
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

        spyOn(lockFile, 'write').and.callFake(() => {
          throw {code: 'EEXIST'};
        });
        spyOn(lockFile, 'read').and.returnValue('188');

        expect(() => locker.lock(() => {}))
            .toThrowError(
                `ngcc is already running at process with id 188.\n` +
                `If you are running multiple builds in parallel then you might try pre-processing your node_modules via the command line ngcc tool before starting the builds.\n` +
                `(If you are sure no ngcc process is running then you should delete the lock-file at ${
                    lockFile.path}.)`);
      });
    });
  });
});
