/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../../src/ngtsc/path';
import {EntryPoint} from '../../src/packages/entry_point';
import {EntryPointBundle} from '../../src/packages/entry_point_bundle';
import {InPlaceFileWriter} from '../../src/writing/in_place_file_writer';
import {MockFileSystem} from '../helpers/mock_file_system';

const _ = AbsoluteFsPath.from;

function createMockFileSystem() {
  return new MockFileSystem({
    '/package/path': {
      'top-level.js': 'ORIGINAL TOP LEVEL',
      'folder-1': {
        'file-1.js': 'ORIGINAL FILE 1',
        'file-2.js': 'ORIGINAL FILE 2',
      },
      'folder-2': {
        'file-3.js': 'ORIGINAL FILE 3',
        'file-4.js': 'ORIGINAL FILE 4',
      },
      'already-backed-up.js.__ivy_ngcc_bak': 'BACKED UP',
    }
  });
}

describe('InPlaceFileWriter', () => {
  it('should write all the FileInfo to the disk', () => {
    const fs = createMockFileSystem();
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
    const fs = createMockFileSystem();
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
    const fs = createMockFileSystem();
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
