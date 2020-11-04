/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {EntryPoint} from '../../src/packages/entry_point';
import {EntryPointBundle} from '../../src/packages/entry_point_bundle';
import {InPlaceFileWriter, NGCC_BACKUP_EXTENSION} from '../../src/writing/in_place_file_writer';

runInEachFileSystem(() => {
  describe('InPlaceFileWriter', () => {
    let _: typeof absoluteFrom;

    beforeEach(() => {
      _ = absoluteFrom;
      loadTestFiles([
        {name: _('/package/path/top-level.js'), contents: 'ORIGINAL TOP LEVEL'},
        {name: _('/package/path/folder-1/file-1.js'), contents: 'ORIGINAL FILE 1'},
        {name: _('/package/path/folder-1/file-2.js'), contents: 'ORIGINAL FILE 2'},
        {name: _('/package/path/folder-2/file-3.js'), contents: 'ORIGINAL FILE 3'},
        {name: _('/package/path/folder-2/file-4.js'), contents: 'ORIGINAL FILE 4'},
        {name: _('/package/path/already-backed-up.js'), contents: 'ORIGINAL ALREADY BACKED UP'},
        {name: _('/package/path/already-backed-up.js.__ivy_ngcc_bak'), contents: 'BACKED UP'},
      ]);
    });

    describe('writeBundle()', () => {
      it('should write all the FileInfo to the disk', () => {
        const fs = getFileSystem();
        const logger = new MockLogger();
        const fileWriter = new InPlaceFileWriter(fs, logger, /* errorOnFailedEntryPoint */ true);
        fileWriter.writeBundle({} as EntryPointBundle, [
          {path: _('/package/path/top-level.js'), contents: 'MODIFIED TOP LEVEL'},
          {path: _('/package/path/folder-1/file-1.js'), contents: 'MODIFIED FILE 1'},
          {path: _('/package/path/folder-2/file-4.js'), contents: 'MODIFIED FILE 4'},
          {path: _('/package/path/folder-3/file-5.js'), contents: 'NEW FILE 5'},
        ]);
        expect(fs.readFile(_('/package/path/top-level.js'))).toEqual('MODIFIED TOP LEVEL');
        expect(fs.readFile(_('/package/path/folder-1/file-1.js'))).toEqual('MODIFIED FILE 1');
        expect(fs.readFile(_('/package/path/folder-1/file-2.js'))).toEqual('ORIGINAL FILE 2');
        expect(fs.readFile(_('/package/path/folder-2/file-3.js'))).toEqual('ORIGINAL FILE 3');
        expect(fs.readFile(_('/package/path/folder-2/file-4.js'))).toEqual('MODIFIED FILE 4');
        expect(fs.readFile(_('/package/path/folder-3/file-5.js'))).toEqual('NEW FILE 5');
      });

      it('should create backups of all files that previously existed', () => {
        const fs = getFileSystem();
        const logger = new MockLogger();
        const fileWriter = new InPlaceFileWriter(fs, logger, /* errorOnFailedEntryPoint */ true);
        fileWriter.writeBundle({} as EntryPointBundle, [
          {path: _('/package/path/top-level.js'), contents: 'MODIFIED TOP LEVEL'},
          {path: _('/package/path/folder-1/file-1.js'), contents: 'MODIFIED FILE 1'},
          {path: _('/package/path/folder-2/file-4.js'), contents: 'MODIFIED FILE 4'},
          {path: _('/package/path/folder-3/file-5.js'), contents: 'NEW FILE 5'},
        ]);
        expect(fs.readFile(_('/package/path/top-level.js.__ivy_ngcc_bak')))
            .toEqual('ORIGINAL TOP LEVEL');
        expect(fs.readFile(_('/package/path/folder-1/file-1.js.__ivy_ngcc_bak')))
            .toEqual('ORIGINAL FILE 1');
        expect(fs.exists(_('/package/path/folder-1/file-2.js.__ivy_ngcc_bak'))).toBe(false);
        expect(fs.exists(_('/package/path/folder-2/file-3.js.__ivy_ngcc_bak'))).toBe(false);
        expect(fs.readFile(_('/package/path/folder-2/file-4.js.__ivy_ngcc_bak')))
            .toEqual('ORIGINAL FILE 4');
        expect(fs.exists(_('/package/path/folder-3/file-5.js.__ivy_ngcc_bak'))).toBe(false);
      });

      it('should throw an error if the backup file already exists and errorOnFailedEntryPoint is true',
         () => {
           const fs = getFileSystem();
           const logger = new MockLogger();
           const fileWriter = new InPlaceFileWriter(fs, logger, /* errorOnFailedEntryPoint */ true);
           const absoluteBackupPath = _('/package/path/already-backed-up.js');
           expect(
               () => fileWriter.writeBundle(
                   {} as EntryPointBundle,
                   [{path: absoluteBackupPath, contents: 'MODIFIED BACKED UP'}]))
               .toThrowError(`Tried to overwrite ${
                   absoluteBackupPath}.__ivy_ngcc_bak with an ngcc back up file, which is disallowed.`);
         });

      it('should log an error, and skip writing the file, if the backup file already exists and errorOnFailedEntryPoint is false',
         () => {
           const fs = getFileSystem();
           const logger = new MockLogger();
           const fileWriter =
               new InPlaceFileWriter(fs, logger, /* errorOnFailedEntryPoint */ false);
           const absoluteBackupPath = _('/package/path/already-backed-up.js');
           fileWriter.writeBundle(
               {} as EntryPointBundle,
               [{path: absoluteBackupPath, contents: 'MODIFIED BACKED UP'}]);
           // Should not have written the new file nor overwritten the backup file.
           expect(fs.readFile(absoluteBackupPath)).toEqual('ORIGINAL ALREADY BACKED UP');
           expect(fs.readFile(_(absoluteBackupPath + '.__ivy_ngcc_bak'))).toEqual('BACKED UP');
           expect(logger.logs.error).toEqual([[
             `Tried to write ${
                 absoluteBackupPath}.__ivy_ngcc_bak with an ngcc back up file but it already exists so not writing, nor backing up, ${
                 absoluteBackupPath}.\n` +
             `This error may be caused by one of the following:\n` +
             `* two or more entry-points overlap and ngcc has been asked to process some files more than once.\n` +
             `  In this case, you should check other entry-points in this package\n` +
             `  and set up a config to ignore any that you are not using.\n` +
             `* a previous run of ngcc was killed in the middle of processing, in a way that cannot be recovered.\n` +
             `  In this case, you should try cleaning the node_modules directory and any dist directories that contain local libraries. Then try again.`
           ]]);
         });
    });

    describe('revertBundle()', () => {
      it('should revert the written files (and their backups)', () => {
        const fs = getFileSystem();
        const logger = new MockLogger();
        const fileWriter = new InPlaceFileWriter(fs, logger, /* errorOnFailedEntryPoint */ true);

        const filePath1 = _('/package/path/folder-1/file-1.js');
        const filePath2 = _('/package/path/folder-1/file-2.js');
        const fileBackupPath1 = _(`/package/path/folder-1/file-1.js${NGCC_BACKUP_EXTENSION}`);
        const fileBackupPath2 = _(`/package/path/folder-1/file-2.js${NGCC_BACKUP_EXTENSION}`);

        fileWriter.writeBundle({} as EntryPointBundle, [
          {path: filePath1, contents: 'MODIFIED FILE 1'},
          {path: filePath2, contents: 'MODIFIED FILE 2'},
        ]);
        expect(fs.readFile(filePath1)).toBe('MODIFIED FILE 1');
        expect(fs.readFile(filePath2)).toBe('MODIFIED FILE 2');
        expect(fs.readFile(fileBackupPath1)).toBe('ORIGINAL FILE 1');
        expect(fs.readFile(fileBackupPath2)).toBe('ORIGINAL FILE 2');

        fileWriter.revertBundle({} as EntryPoint, [filePath1, filePath2], []);
        expect(fs.readFile(filePath1)).toBe('ORIGINAL FILE 1');
        expect(fs.readFile(filePath2)).toBe('ORIGINAL FILE 2');
        expect(fs.exists(fileBackupPath1)).toBeFalse();
        expect(fs.exists(fileBackupPath2)).toBeFalse();
      });

      it('should just remove the written files if there is no backup', () => {
        const fs = getFileSystem();
        const logger = new MockLogger();
        const fileWriter = new InPlaceFileWriter(fs, logger, /* errorOnFailedEntryPoint */ true);

        const filePath = _('/package/path/folder-1/file-1.js');
        const fileBackupPath = _(`/package/path/folder-1/file-1.js${NGCC_BACKUP_EXTENSION}`);

        fileWriter.writeBundle({} as EntryPointBundle, [
          {path: filePath, contents: 'MODIFIED FILE 1'},
        ]);
        fs.removeFile(fileBackupPath);
        expect(fs.readFile(filePath)).toBe('MODIFIED FILE 1');
        expect(fs.exists(fileBackupPath)).toBeFalse();

        fileWriter.revertBundle({} as EntryPoint, [filePath], []);
        expect(fs.exists(filePath)).toBeFalse();
        expect(fs.exists(fileBackupPath)).toBeFalse();
      });

      it('should do nothing if the file does not exist', () => {
        const fs = getFileSystem();
        const logger = new MockLogger();
        const fileWriter = new InPlaceFileWriter(fs, logger, /* errorOnFailedEntryPoint */ true);

        const filePath = _('/package/path/non-existent.js');
        const fileBackupPath = _(`/package/path/non-existent.js${NGCC_BACKUP_EXTENSION}`);

        fs.writeFile(fileBackupPath, 'BACKUP WITHOUT FILE');
        fileWriter.revertBundle({} as EntryPoint, [filePath], []);

        expect(fs.exists(filePath)).toBeFalse();
        expect(fs.readFile(fileBackupPath)).toBe('BACKUP WITHOUT FILE');
      });
    });
  });
});
