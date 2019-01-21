/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync, readFileSync, writeFileSync} from 'fs';
import * as mockFs from 'mock-fs';

import {checkMarkerFile, writeMarkerFile} from '../../src/packages/build_marker';
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
  return {name: 'some-package', path, package: '', typings: ''};
}

describe('Marker files', () => {
  beforeEach(createMockFileSystem);
  afterEach(restoreRealFileSystem);

  describe('writeMarkerFile', () => {
    it('should write a file containing the version placeholder', () => {
      expect(existsSync('/node_modules/@angular/common/__modified_by_ngcc_for_fesm2015__'))
          .toBe(false);
      expect(existsSync('/node_modules/@angular/common/__modified_by_ngcc_for_esm5__')).toBe(false);

      writeMarkerFile(createEntryPoint('/node_modules/@angular/common'), 'fesm2015');
      expect(existsSync('/node_modules/@angular/common/__modified_by_ngcc_for_fesm2015__'))
          .toBe(true);
      expect(existsSync('/node_modules/@angular/common/__modified_by_ngcc_for_esm5__')).toBe(false);
      expect(
          readFileSync('/node_modules/@angular/common/__modified_by_ngcc_for_fesm2015__', 'utf8'))
          .toEqual('0.0.0-PLACEHOLDER');

      writeMarkerFile(createEntryPoint('/node_modules/@angular/common'), 'esm5');
      expect(existsSync('/node_modules/@angular/common/__modified_by_ngcc_for_fesm2015__'))
          .toBe(true);
      expect(existsSync('/node_modules/@angular/common/__modified_by_ngcc_for_esm5__')).toBe(true);
      expect(
          readFileSync('/node_modules/@angular/common/__modified_by_ngcc_for_fesm2015__', 'utf8'))
          .toEqual('0.0.0-PLACEHOLDER');
      expect(readFileSync('/node_modules/@angular/common/__modified_by_ngcc_for_esm5__', 'utf8'))
          .toEqual('0.0.0-PLACEHOLDER');
    });
  });

  describe('checkMarkerFile', () => {
    it('should return false if the marker file does not exist', () => {
      expect(checkMarkerFile(createEntryPoint('/node_modules/@angular/common'), 'fesm2015'))
          .toBe(false);
    });

    it('should return true if the marker file exists and contains the correct version', () => {
      writeFileSync(
          '/node_modules/@angular/common/__modified_by_ngcc_for_fesm2015__', '0.0.0-PLACEHOLDER',
          'utf8');
      expect(checkMarkerFile(createEntryPoint('/node_modules/@angular/common'), 'fesm2015'))
          .toBe(true);
    });

    it('should throw if the marker file exists but contains the wrong version', () => {
      writeFileSync(
          '/node_modules/@angular/common/__modified_by_ngcc_for_fesm2015__', 'WRONG_VERSION',
          'utf8');
      expect(() => checkMarkerFile(createEntryPoint('/node_modules/@angular/common'), 'fesm2015'))
          .toThrowError(
              'The ngcc compiler has changed since the last ngcc build.\n' +
              'Please completely remove `node_modules` and try again.');
    });
  });
});
