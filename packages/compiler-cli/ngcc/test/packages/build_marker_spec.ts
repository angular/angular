/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../../src/ngtsc/path';
import {hasBeenProcessed, markAsProcessed} from '../../src/packages/build_marker';
import {MockFileSystem} from '../helpers/mock_file_system';

function createMockFileSystem() {
  return new MockFileSystem({
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

describe('Marker files', () => {
  const COMMON_PACKAGE_PATH = AbsoluteFsPath.from('/node_modules/@angular/common/package.json');

  describe('markAsProcessed', () => {
    it('should write a property in the package.json containing the version placeholder', () => {
      const fs = createMockFileSystem();

      let pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));
      expect(pkg.__processed_by_ivy_ngcc__).toBeUndefined();
      expect(pkg.__processed_by_ivy_ngcc__).toBeUndefined();

      markAsProcessed(fs, pkg, COMMON_PACKAGE_PATH, 'fesm2015');
      pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));
      expect(pkg.__processed_by_ivy_ngcc__.fesm2015).toEqual('0.0.0-PLACEHOLDER');
      expect(pkg.__processed_by_ivy_ngcc__.esm5).toBeUndefined();

      markAsProcessed(fs, pkg, COMMON_PACKAGE_PATH, 'esm5');
      pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));
      expect(pkg.__processed_by_ivy_ngcc__.fesm2015).toEqual('0.0.0-PLACEHOLDER');
      expect(pkg.__processed_by_ivy_ngcc__.esm5).toEqual('0.0.0-PLACEHOLDER');
    });

    it('should update the packageJson object in-place', () => {
      const fs = createMockFileSystem();
      let pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));
      expect(pkg.__processed_by_ivy_ngcc__).toBeUndefined();
      markAsProcessed(fs, pkg, COMMON_PACKAGE_PATH, 'fesm2015');
      expect(pkg.__processed_by_ivy_ngcc__.fesm2015).toEqual('0.0.0-PLACEHOLDER');
    });
  });

  describe('hasBeenProcessed', () => {
    it('should return true if the marker exists for the given format property', () => {
      expect(hasBeenProcessed(
                 {name: 'test', __processed_by_ivy_ngcc__: {'fesm2015': '0.0.0-PLACEHOLDER'}},
                 'fesm2015'))
          .toBe(true);
    });
    it('should return false if the marker does not exist for the given format property', () => {
      expect(hasBeenProcessed(
                 {name: 'test', __processed_by_ivy_ngcc__: {'fesm2015': '0.0.0-PLACEHOLDER'}},
                 'module'))
          .toBe(false);
    });
    it('should return false if no markers exist',
       () => { expect(hasBeenProcessed({name: 'test'}, 'module')).toBe(false); });
    it('should throw an Error if the format has been compiled with a different version.', () => {
      expect(
          () => hasBeenProcessed(
              {name: 'test', __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0'}}, 'fesm2015'))
          .toThrowError(
              'The ngcc compiler has changed since the last ngcc build.\n' +
              'Please completely remove `node_modules` and try again.');
    });
    it('should throw an Error if any format has been compiled with a different version.', () => {
      expect(
          () => hasBeenProcessed(
              {name: 'test', __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0'}}, 'module'))
          .toThrowError(
              'The ngcc compiler has changed since the last ngcc build.\n' +
              'Please completely remove `node_modules` and try again.');
      expect(
          () => hasBeenProcessed(
              {
                name: 'test',
                __processed_by_ivy_ngcc__: {'module': '0.0.0-PLACEHOLDER', 'fesm2015': '8.0.0'}
              },
              'module'))
          .toThrowError(
              'The ngcc compiler has changed since the last ngcc build.\n' +
              'Please completely remove `node_modules` and try again.');
      expect(
          () => hasBeenProcessed(
              {
                name: 'test',
                __processed_by_ivy_ngcc__: {'module': '0.0.0-PLACEHOLDER', 'fesm2015': '8.0.0'}
              },
              'fesm2015'))
          .toThrowError(
              'The ngcc compiler has changed since the last ngcc build.\n' +
              'Please completely remove `node_modules` and try again.');
    });
  });
});
