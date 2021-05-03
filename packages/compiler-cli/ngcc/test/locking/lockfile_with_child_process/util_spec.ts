/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem} from '../../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../../src/ngtsc/logging/testing';
import {removeLockFile} from '../../../src/locking/lock_file_with_child_process/util';

runInEachFileSystem(() => {
  describe('LockFileWithChildProcess utils', () => {
    let lockFilePath: AbsoluteFsPath;
    let fs: FileSystem;
    let logger: MockLogger;

    beforeEach(() => {
      fs = getFileSystem();
      logger = new MockLogger();
      lockFilePath = absoluteFrom('/lockfile/path');
      fs.ensureDir(absoluteFrom('/lockfile'));
    });

    describe('removeLockFile()', () => {
      it('should do nothing if there is no file to remove', () => {
        removeLockFile(fs, logger, absoluteFrom('/lockfile/path'), '1234');
      });

      it('should do nothing if the pid does not match', () => {
        fs.writeFile(lockFilePath, '888');
        removeLockFile(fs, logger, lockFilePath, '1234');
        expect(fs.exists(lockFilePath)).toBe(true);
        expect(fs.readFile(lockFilePath)).toEqual('888');
      });

      it('should remove the file if the pid matches', () => {
        fs.writeFile(lockFilePath, '1234');
        removeLockFile(fs, logger, lockFilePath, '1234');
        expect(fs.exists(lockFilePath)).toBe(false);
      });

      it('should re-throw any other error', () => {
        spyOn(fs, 'removeFile').and.throwError('removeFile() error');
        fs.writeFile(lockFilePath, '1234');
        expect(() => removeLockFile(fs, logger, lockFilePath, '1234'))
            .toThrowError('removeFile() error');
      });
    });
  });
});
