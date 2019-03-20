/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import * as mockFs from 'mock-fs';

import {AbsoluteFsPath} from '../../../src/ngtsc/path';
import {checkMarker, writeMarker} from '../../src/packages/build_marker';
import {EntryPoint} from '../../src/packages/entry_point';

function createMockFileSystem() {
  mockFs({
    '/node_modules/@angular/common': {
      'package.json': `{
        "fesm2015": "./fesm2015/common.js",
        "fesm5": "./fesm5/common.js",
        "typings": "./common.d.ts"
      }`,
      'fesm2015': {
        'common.js': 'DUMMY CONTENT',
        'http.js': 'DUMMY CONTENT',
        'http/testing.js': 'DUMMY CONTENT',
        'testing.js': 'DUMMY CONTENT',
      },
      'http': {
        'package.json': `{
          "fesm2015": "../fesm2015/http.js",
          "fesm5": "../fesm5/http.js",
          "typings": "./http.d.ts"
        }`,
        'testing': {
          'package.json': `{
            "fesm2015": "../../fesm2015/http/testing.js",
            "fesm5": "../../fesm5/http/testing.js",
            "typings": "../http/testing.d.ts"
          }`,
        },
      },
      'other': {
        'package.json': '{ }',
      },
      'testing': {
        'package.json': `{
          "fesm2015": "../fesm2015/testing.js",
          "fesm5": "../fesm5/testing.js",
          "typings": "../testing.d.ts"
        }`,
      },
      'node_modules': {
        'tslib': {
          'package.json': '{ }',
          'node_modules': {
            'other-lib': {
              'package.json': '{ }',
            },
          },
        },
      },
    },
    '/node_modules/@angular/no-typings': {
      'package.json': `{
        "fesm2015": "./fesm2015/index.js"
      }`,
      'fesm2015': {
        'index.js': 'DUMMY CONTENT',
        'index.d.ts': 'DUMMY CONTENT',
      },
    },
    '/node_modules/@angular/other': {
      'not-package.json': '{ "fesm2015": "./fesm2015/other.js" }',
      'package.jsonot': '{ "fesm5": "./fesm5/other.js" }',
    },
    '/node_modules/@angular/other2': {
      'node_modules_not': {
        'lib1': {
          'package.json': '{ }',
        },
      },
      'not_node_modules': {
        'lib2': {
          'package.json': '{ }',
        },
      },
    },
  });
}

function restoreRealFileSystem() {
  mockFs.restore();
}

function createEntryPoint(path: string): EntryPoint {
  const absolutePath = AbsoluteFsPath.from(path);
  return {
    name: 'some-package',
    path: absolutePath,
    package: absolutePath,
    typings: AbsoluteFsPath.from('/typings'),
    packageJson: JSON.parse(readFileSync(path + '/package.json', 'utf8'))
  };
}

describe('Marker files', () => {
  beforeEach(createMockFileSystem);
  afterEach(restoreRealFileSystem);

  describe('writeMarker', () => {
    it('should write a property in the package.json containing the version placeholder', () => {
      let pkg = JSON.parse(readFileSync('/node_modules/@angular/common/package.json', 'utf8'));
      expect(pkg.__modified_by_ngcc__).toBeUndefined();
      expect(pkg.__modified_by_ngcc__).toBeUndefined();

      writeMarker(createEntryPoint('/node_modules/@angular/common'), 'fesm2015');
      pkg = JSON.parse(readFileSync('/node_modules/@angular/common/package.json', 'utf8'));
      expect(pkg.__modified_by_ngcc__.fesm2015).toEqual('0.0.0-PLACEHOLDER');
      expect(pkg.__modified_by_ngcc__.esm5).toBeUndefined();

      writeMarker(createEntryPoint('/node_modules/@angular/common'), 'esm5');
      pkg = JSON.parse(readFileSync('/node_modules/@angular/common/package.json', 'utf8'));
      expect(pkg.__modified_by_ngcc__.fesm2015).toEqual('0.0.0-PLACEHOLDER');
      expect(pkg.__modified_by_ngcc__.esm5).toEqual('0.0.0-PLACEHOLDER');
    });
  });

  describe('checkMarker', () => {
    it('should return false if the marker property does not exist', () => {
      expect(checkMarker(createEntryPoint('/node_modules/@angular/common'), 'fesm2015'))
          .toBe(false);
    });

    it('should return true if the marker property exists and contains the correct version', () => {
      const pkg = JSON.parse(readFileSync('/node_modules/@angular/common/package.json', 'utf8'));
      pkg.__modified_by_ngcc__ = {fesm2015: '0.0.0-PLACEHOLDER'};
      writeFileSync('/node_modules/@angular/common/package.json', JSON.stringify(pkg), 'utf8');
      expect(checkMarker(createEntryPoint('/node_modules/@angular/common'), 'fesm2015')).toBe(true);
    });

    it('should throw if the marker property exists but contains the wrong version', () => {
      const pkg = JSON.parse(readFileSync('/node_modules/@angular/common/package.json', 'utf8'));
      pkg.__modified_by_ngcc__ = {fesm2015: 'WRONG_VERSION'};
      writeFileSync('/node_modules/@angular/common/package.json', JSON.stringify(pkg), 'utf8');
      expect(() => checkMarker(createEntryPoint('/node_modules/@angular/common'), 'fesm2015'))
          .toThrowError(
              'The ngcc compiler has changed since the last ngcc build.\n' +
              'Please completely remove `node_modules` and try again.');
    });
  });
});
