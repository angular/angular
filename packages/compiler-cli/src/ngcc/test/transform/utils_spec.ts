/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as mockFs from 'mock-fs';
import {EntryPoint, findAllPackageJsonFiles, getEntryPoints} from '../../src/transform/utils';

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

describe('EntryPoint', () => {
  it('should expose the absolute path to the entry point file', () => {
    const entryPoint = new EntryPoint('/foo/bar', '../baz/qux/../quux.js', '/typings/foo/bar.d.ts');
    expect(entryPoint.entryFileName).toBe('/foo/baz/quux.js');
  });
});

describe('findAllPackageJsonFiles()', () => {
  beforeEach(createMockFileSystem);
  afterEach(restoreRealFileSystem);

  it('should find the `package.json` files below the specified directory', () => {
    const paths = findAllPackageJsonFiles('/node_modules/@angular/common');
    expect(paths.sort()).toEqual([
      '/node_modules/@angular/common/http/package.json',
      '/node_modules/@angular/common/http/testing/package.json',
      '/node_modules/@angular/common/other/package.json',
      '/node_modules/@angular/common/package.json',
      '/node_modules/@angular/common/testing/package.json',
    ]);
  });

  it('should not find `package.json` files under `node_modules/`', () => {
    const paths = findAllPackageJsonFiles('/node_modules/@angular/common');
    expect(paths).not.toContain('/node_modules/@angular/common/node_modules/tslib/package.json');
    expect(paths).not.toContain(
        '/node_modules/@angular/common/node_modules/tslib/node_modules/other-lib/package.json');
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

  it('should return the entry points for the specified format from each `package.json`', () => {
    const entryPoints = getEntryPoints('/node_modules/@angular/common', 'fesm2015');
    entryPoints.forEach(ep => expect(ep).toEqual(jasmine.any(EntryPoint)));

    const sortedPaths = entryPoints.map(x => x.entryFileName).sort();
    expect(sortedPaths).toEqual([
      '/node_modules/@angular/common/fesm2015/common.js',
      '/node_modules/@angular/common/fesm2015/http.js',
      '/node_modules/@angular/common/fesm2015/http/testing.js',
      '/node_modules/@angular/common/fesm2015/testing.js',
    ]);
  });

  it('should return an empty array if there are no matching `package.json` files', () => {
    const entryPoints = getEntryPoints('/node_modules/@angular/other', 'fesm2015');
    expect(entryPoints).toEqual([]);
  });

  it('should return an empty array if there are no matching formats', () => {
    const entryPoints = getEntryPoints('/node_modules/@angular/common', 'fesm3000');
    expect(entryPoints).toEqual([]);
  });

  it('should return an entry point even if the typings are not specified', () => {
    const entryPoints = getEntryPoints('/node_modules/@angular/no-typings', 'fesm2015');
    expect(entryPoints.length).toEqual(1);
    expect(entryPoints[0].entryFileName)
        .toEqual('/node_modules/@angular/no-typings/fesm2015/index.js');
    expect(entryPoints[0].entryRoot).toEqual('/node_modules/@angular/no-typings/fesm2015');
    expect(entryPoints[0].dtsEntryRoot).toEqual(entryPoints[0].entryRoot);
  });
});
