/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as mockFs from 'mock-fs';
import { findAllPackageJsonFiles, getEntryPoints } from '../../src/parser/parser';

function createMockFileSystem() {
  mockFs({
    '/node_modules/@angular/common': {
      'package.json': '{ "fesm2015": "./fesm2015/common.js", "fesm5": "./fesm5/common.js" }',
      'fesm2015': {
        'common.js': 'DUMMY CONTENT',
        'http.js': 'DUMMY CONTENT',
        'http/testing.js': 'DUMMY CONTENT',
        'testing.js': 'DUMMY CONTENT',
      },
      'http': {
        'package.json': '{ "fesm2015": "../fesm2015/http.js", "fesm5": "../fesm5/http.js" }',
        'testing': {
          'package.json': '{ "fesm2015": "../../fesm2015/http/testing.js", "fesm5": "../../fesm5/http/testing.js" }',
        },
      },
      'testing': {
        'package.json': '{ "fesm2015": "../fesm2015/testing.js", "fesm5": "../fesm5/testing.js" }',
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

describe('findAllPackageJsonFiles()', () => {
  beforeEach(createMockFileSystem);
  afterEach(restoreRealFileSystem);

  it('should find the `package.json` files below the specified directory', () => {
    const paths = findAllPackageJsonFiles('/node_modules/@angular/common');
    expect(paths.sort()).toEqual([
      '/node_modules/@angular/common/http/package.json',
      '/node_modules/@angular/common/http/testing/package.json',
      '/node_modules/@angular/common/package.json',
      '/node_modules/@angular/common/testing/package.json',
    ]);
  });

  it('should not find `package.json` files under `node_modules/`', () => {
    const paths = findAllPackageJsonFiles('/node_modules/@angular/common');
    expect(paths).not.toContain('/node_modules/@angular/common/node_modules/tslib/package.json');
    expect(paths).not.toContain('/node_modules/@angular/common/node_modules/tslib/node_modules/other-lib/package.json');
  });

  it('should exactly match the name of `package.json` files', () => {
    const paths = findAllPackageJsonFiles('/node_modules/@angular/other');
    expect(paths).toEqual([]);
  });

  it('should exactly match the name of `node_modules/` directory', () => {
    const paths = findAllPackageJsonFiles('/node_modules/@angular/other2');
    expect(paths).toEqual([
      '/node_modules/@angular/other2/node_modules_not/lib1/package.json',
      '/node_modules/@angular/other2/not_node_modules/lib2/package.json',
    ]);
  });
});

describe('getEntryPoints()', () => {
  beforeEach(createMockFileSystem);
  afterEach(restoreRealFileSystem);

  it('should return the paths for the specified format from each package.json', () => {
    const paths = getEntryPoints('/node_modules/@angular/common', 'fesm2015');
    expect(paths.sort()).toEqual([
      '/node_modules/@angular/common/fesm2015/common.js',
      '/node_modules/@angular/common/fesm2015/http.js',
      '/node_modules/@angular/common/fesm2015/http/testing.js',
      '/node_modules/@angular/common/fesm2015/testing.js',
    ]);
  });

  it('should return an empty array if there are no matching package.json files', () => {
    const paths = getEntryPoints('/node_modules/@angular/other', 'fesm2015');
    expect(paths).toEqual([]);
  });

  it('should return an empty array if there are no matching formats', () => {
    const paths = getEntryPoints('/node_modules/@angular/other', 'main');
    expect(paths).toEqual([]);
  });
});
