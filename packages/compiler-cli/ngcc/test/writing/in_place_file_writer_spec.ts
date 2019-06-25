/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../test/helpers';
import {EntryPoint} from '../../src/packages/entry_point';
import {EntryPointBundle} from '../../src/packages/entry_point_bundle';
import {InPlaceFileWriter} from '../../src/writing/in_place_file_writer';

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
        {name: _('/package/path/already-backed-up.js.__ivy_ngcc_bak'), contents: 'BACKED UP'},
      ]);
    });

    it('should write all the FileInfo to the disk', () => {
      const fs = getFileSystem();
      const fileWriter = new InPlaceFileWriter(fs);
      fileWriter.writeBundle({} as EntryPoint, {} as EntryPointBundle, [
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
      const fileWriter = new InPlaceFileWriter(fs);
      fileWriter.writeBundle({} as EntryPoint, {} as EntryPointBundle, [
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

    it('should error if the backup file already exists', () => {
      const fs = getFileSystem();
      const fileWriter = new InPlaceFileWriter(fs);
      const absoluteBackupPath = _('/package/path/already-backed-up.js');
      expect(
          () => fileWriter.writeBundle(
              {} as EntryPoint, {} as EntryPointBundle,
              [
                {path: absoluteBackupPath, contents: 'MODIFIED BACKED UP'},
              ]))
          .toThrowError(
              `Tried to overwrite ${absoluteBackupPath}.__ivy_ngcc_bak with an ngcc back up file, which is disallowed.`);
    });
  });
});
