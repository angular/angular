/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as mockFs from 'mock-fs';
import {getEntryPointInfo} from '../../src/packages/entry_point';


describe('getEntryPointInfo()', () => {
  beforeEach(createMockFileSystem);
  afterEach(restoreRealFileSystem);

  it('should return an object containing absolute paths to the formats of the specified entry-point',
     () => {
       const entryPoint = getEntryPointInfo('/some_package', '/some_package/valid_entry_point');
       expect(entryPoint).toEqual({
         name: 'some-package',
         package: '/some_package',
         path: '/some_package/valid_entry_point',
         typings: `/some_package/valid_entry_point/valid_entry_point.d.ts`,
         fesm2015: `/some_package/valid_entry_point/fesm2015/valid_entry_point.js`,
         esm2015: `/some_package/valid_entry_point/esm2015/valid_entry_point.js`,
         fesm5: `/some_package/valid_entry_point/fesm2015/valid_entry_point.js`,
         esm5: `/some_package/valid_entry_point/esm2015/valid_entry_point.js`,
         umd: `/some_package/valid_entry_point/bundles/valid_entry_point.umd.js`,
       });
     });

  it('should return null if there is no package.json at the entry-point path', () => {
    const entryPoint = getEntryPointInfo('/some_package', '/some_package/missing_package_json');
    expect(entryPoint).toBe(null);
  });

  it('should return null if there is no typings field in the package.json', () => {
    const entryPoint = getEntryPointInfo('/some_package', '/some_package/missing_typings');
    expect(entryPoint).toBe(null);
  });

  it('should return null if there is no esm2015 field in the package.json', () => {
    const entryPoint = getEntryPointInfo('/some_package', '/some_package/missing_esm2015');
    expect(entryPoint).toBe(null);
  });

  it('should return null if there is no metadata.json file next to the typing file', () => {
    const entryPoint = getEntryPointInfo('/some_package', '/some_package/missing_metadata.json');
    expect(entryPoint).toBe(null);
  });
});

function createMockFileSystem() {
  mockFs({
    '/some_package': {
      'valid_entry_point': {
        'package.json': createPackageJson('valid_entry_point'),
        'valid_entry_point.metadata.json': 'some meta data',
      },
      'missing_package_json': {
        // no package.json!
        'missing_package_json.metadata.json': 'some meta data',
      },
      'missing_typings': {
        'package.json': createPackageJson('missing_typings', {exclude: 'typings'}),
        'missing_typings.metadata.json': 'some meta data',
      },
      'missing_esm2015': {
        'package.json': createPackageJson('missing_esm2015', {exclude: 'esm2015'}),
        'missing_esm2015.metadata.json': 'some meta data',
      },
      'missing_metadata': {
        'package.json': createPackageJson('missing_metadata'),
        // no metadata.json!
      }
    }
  });
}

function restoreRealFileSystem() {
  mockFs.restore();
}

function createPackageJson(packageName: string, {exclude}: {exclude?: string} = {}): string {
  const packageJson: any = {
    name: 'some-package',
    typings: `./${packageName}.d.ts`,
    fesm2015: `./fesm2015/${packageName}.js`,
    esm2015: `./esm2015/${packageName}.js`,
    fesm5: `./fesm2015/${packageName}.js`,
    esm5: `./esm2015/${packageName}.js`,
    main: `./bundles/${packageName}.umd.js`,
  };
  if (exclude) {
    delete packageJson[exclude];
  }
  return JSON.stringify(packageJson);
}
