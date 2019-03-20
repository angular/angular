/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync, readFileSync} from 'fs';
import * as mockFs from 'mock-fs';

import {EntryPoint} from '../../src/packages/entry_point';
import {EntryPointBundle} from '../../src/packages/entry_point_bundle';
import {InPlaceFileWriter} from '../../src/writing/in_place_file_writer';

function createMockFileSystem() {
  mockFs({
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

function restoreRealFileSystem() {
  mockFs.restore();
}

describe('InPlaceFileWriter', () => {
  beforeEach(createMockFileSystem);
  afterEach(restoreRealFileSystem);

  it('should write all the FileInfo to the disk', () => {
    const fileWriter = new InPlaceFileWriter();
    fileWriter.writeBundle({} as EntryPoint, {} as EntryPointBundle, [
      {path: '/package/path/top-level.js', contents: 'MODIFIED TOP LEVEL'},
      {path: '/package/path/folder-1/file-1.js', contents: 'MODIFIED FILE 1'},
      {path: '/package/path/folder-2/file-4.js', contents: 'MODIFIED FILE 4'},
      {path: '/package/path/folder-3/file-5.js', contents: 'NEW FILE 5'},
    ]);
    expect(readFileSync('/package/path/top-level.js', 'utf8')).toEqual('MODIFIED TOP LEVEL');
    expect(readFileSync('/package/path/folder-1/file-1.js', 'utf8')).toEqual('MODIFIED FILE 1');
    expect(readFileSync('/package/path/folder-1/file-2.js', 'utf8')).toEqual('ORIGINAL FILE 2');
    expect(readFileSync('/package/path/folder-2/file-3.js', 'utf8')).toEqual('ORIGINAL FILE 3');
    expect(readFileSync('/package/path/folder-2/file-4.js', 'utf8')).toEqual('MODIFIED FILE 4');
    expect(readFileSync('/package/path/folder-3/file-5.js', 'utf8')).toEqual('NEW FILE 5');
  });

  it('should create backups of all files that previously existed', () => {
    const fileWriter = new InPlaceFileWriter();
    fileWriter.writeBundle({} as EntryPoint, {} as EntryPointBundle, [
      {path: '/package/path/top-level.js', contents: 'MODIFIED TOP LEVEL'},
      {path: '/package/path/folder-1/file-1.js', contents: 'MODIFIED FILE 1'},
      {path: '/package/path/folder-2/file-4.js', contents: 'MODIFIED FILE 4'},
      {path: '/package/path/folder-3/file-5.js', contents: 'NEW FILE 5'},
    ]);
    expect(readFileSync('/package/path/top-level.js.__ivy_ngcc_bak', 'utf8'))
        .toEqual('ORIGINAL TOP LEVEL');
    expect(readFileSync('/package/path/folder-1/file-1.js.__ivy_ngcc_bak', 'utf8'))
        .toEqual('ORIGINAL FILE 1');
    expect(existsSync('/package/path/folder-1/file-2.js.__ivy_ngcc_bak')).toBe(false);
    expect(existsSync('/package/path/folder-2/file-3.js.__ivy_ngcc_bak')).toBe(false);
    expect(readFileSync('/package/path/folder-2/file-4.js.__ivy_ngcc_bak', 'utf8'))
        .toEqual('ORIGINAL FILE 4');
    expect(existsSync('/package/path/folder-3/file-5.js.__ivy_ngcc_bak')).toBe(false);
  });

  it('should error if the backup file already exists', () => {
    const fileWriter = new InPlaceFileWriter();
    expect(
        () => fileWriter.writeBundle(
            {} as EntryPoint, {} as EntryPointBundle,
            [
              {path: '/package/path/already-backed-up.js', contents: 'MODIFIED BACKED UP'},
            ]))
        .toThrowError(
            'Tried to overwrite /package/path/already-backed-up.js.__ivy_ngcc_bak with an ngcc back up file, which is disallowed.');
  });
});
