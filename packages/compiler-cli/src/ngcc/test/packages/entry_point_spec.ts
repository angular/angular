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
         name: 'some-package/valid_entry_point',
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

  it('should return null if there is no typings or types field in the package.json', () => {
    const entryPoint = getEntryPointInfo('/some_package', '/some_package/missing_typings');
    expect(entryPoint).toBe(null);
  });

  it('should return null if there is no esm2015 nor fesm2015 field in the package.json', () => {
    const entryPoint = getEntryPointInfo('/some_package', '/some_package/missing_esm2015');
    expect(entryPoint).toBe(null);
  });

  it('should return null if there is no metadata.json file next to the typing file', () => {
    const entryPoint = getEntryPointInfo('/some_package', '/some_package/missing_metadata.json');
    expect(entryPoint).toBe(null);
  });

  it('should work if the typings field is named `types', () => {
    const entryPoint =
        getEntryPointInfo('/some_package', '/some_package/types_rather_than_typings');
    expect(entryPoint).toEqual({
      name: 'some-package/types_rather_than_typings',
      package: '/some_package',
      path: '/some_package/types_rather_than_typings',
      typings: `/some_package/types_rather_than_typings/types_rather_than_typings.d.ts`,
      fesm2015: `/some_package/types_rather_than_typings/fesm2015/types_rather_than_typings.js`,
      esm2015: `/some_package/types_rather_than_typings/esm2015/types_rather_than_typings.js`,
      fesm5: `/some_package/types_rather_than_typings/fesm2015/types_rather_than_typings.js`,
      esm5: `/some_package/types_rather_than_typings/esm2015/types_rather_than_typings.js`,
      umd: `/some_package/types_rather_than_typings/bundles/types_rather_than_typings.umd.js`,
    });
  });

  it('should work with Angular Material style package.json', () => {
    const entryPoint = getEntryPointInfo('/some_package', '/some_package/material_style');
    expect(entryPoint).toEqual({
      name: 'some_package/material_style',
      package: '/some_package',
      path: '/some_package/material_style',
      typings: `/some_package/material_style/material_style.d.ts`,
      fesm2015: `/some_package/material_style/esm2015/material_style.js`,
      fesm5: `/some_package/material_style/esm5/material_style.es5.js`,
      umd: `/some_package/material_style/bundles/material_style.umd.js`,
    });
  });

  it('should return null if the package.json is not valid JSON', () => {
    const entryPoint = getEntryPointInfo('/some_package', '/some_package/unexpected_symbols');
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
        'package.json': createPackageJson('missing_typings', {excludes: ['typings']}),
        'missing_typings.metadata.json': 'some meta data',
      },
      'types_rather_than_typings': {
        'package.json': createPackageJson('types_rather_than_typings', {}, 'types'),
        'types_rather_than_typings.metadata.json': 'some meta data',
      },
      'missing_esm2015': {
        'package.json': createPackageJson('missing_fesm2015', {excludes: ['esm2015', 'fesm2015']}),
        'missing_esm2015.metadata.json': 'some meta data',
      },
      'missing_metadata': {
        'package.json': createPackageJson('missing_metadata'),
        // no metadata.json!
      },
      'material_style': {
        'package.json': `{
          "name": "some_package/material_style",
          "typings": "./material_style.d.ts",
          "main": "./bundles/material_style.umd.js",
          "module": "./esm5/material_style.es5.js",
          "es2015": "./esm2015/material_style.js"
        }`,
        'material_style.metadata.json': 'some meta data',
      },
      'unexpected_symbols': {
        // package.json might not be a valid JSON
        // for example, @schematics/angular contains a package.json blueprint
        // with unexpected symbols
        'package.json':
            '{"devDependencies": {<% if (!minimal) { %>"@types/jasmine": "~2.8.8" <% } %>}}',
      },
    }
  });
}

function restoreRealFileSystem() {
  mockFs.restore();
}

function createPackageJson(
    packageName: string, {excludes}: {excludes?: string[]} = {},
    typingsProp: string = 'typings'): string {
  const packageJson: any = {
    name: `some-package/${packageName}`,
    [typingsProp]: `./${packageName}.d.ts`,
    fesm2015: `./fesm2015/${packageName}.js`,
    esm2015: `./esm2015/${packageName}.js`,
    fesm5: `./fesm2015/${packageName}.js`,
    esm5: `./esm2015/${packageName}.js`,
    main: `./bundles/${packageName}.umd.js`,
  };
  if (excludes) {
    excludes.forEach(exclude => delete packageJson[exclude]);
  }
  return JSON.stringify(packageJson);
}
