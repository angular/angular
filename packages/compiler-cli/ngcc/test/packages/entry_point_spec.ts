/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteFsPath, FileSystem, absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../test/helpers';
import {getEntryPointInfo} from '../../src/packages/entry_point';
import {MockLogger} from '../helpers/mock_logger';

runInEachFileSystem(() => {
  describe('getEntryPointInfo()', () => {
    let SOME_PACKAGE: AbsoluteFsPath;
    let _: typeof absoluteFrom;
    let fs: FileSystem;

    beforeEach(() => {
      setupMockFileSystem();
      SOME_PACKAGE = absoluteFrom('/some_package');
      _ = absoluteFrom;
      fs = getFileSystem();
    });

    it('should return an object containing absolute paths to the formats of the specified entry-point',
       () => {
         const entryPoint = getEntryPointInfo(
             fs, new MockLogger(), SOME_PACKAGE, _('/some_package/valid_entry_point'));
         expect(entryPoint).toEqual({
           name: 'some-package/valid_entry_point',
           package: SOME_PACKAGE,
           path: _('/some_package/valid_entry_point'),
           typings: _(`/some_package/valid_entry_point/valid_entry_point.d.ts`),
           packageJson: loadPackageJson(fs, '/some_package/valid_entry_point'),
           compiledByAngular: true,
         });
       });

    it('should return null if there is no package.json at the entry-point path', () => {
      const entryPoint = getEntryPointInfo(
          fs, new MockLogger(), SOME_PACKAGE, _('/some_package/missing_package_json'));
      expect(entryPoint).toBe(null);
    });

    it('should return null if there is no typings or types field in the package.json', () => {
      const entryPoint =
          getEntryPointInfo(fs, new MockLogger(), SOME_PACKAGE, _('/some_package/missing_typings'));
      expect(entryPoint).toBe(null);
    });

    it('should return an object with `compiledByAngular` set to false if there is no metadata.json file next to the typing file',
       () => {
         const entryPoint = getEntryPointInfo(
             fs, new MockLogger(), SOME_PACKAGE, _('/some_package/missing_metadata'));
         expect(entryPoint).toEqual({
           name: 'some-package/missing_metadata',
           package: SOME_PACKAGE,
           path: _('/some_package/missing_metadata'),
           typings: _(`/some_package/missing_metadata/missing_metadata.d.ts`),
           packageJson: loadPackageJson(fs, '/some_package/missing_metadata'),
           compiledByAngular: false,
         });
       });

    it('should work if the typings field is named `types', () => {
      const entryPoint = getEntryPointInfo(
          fs, new MockLogger(), SOME_PACKAGE, _('/some_package/types_rather_than_typings'));
      expect(entryPoint).toEqual({
        name: 'some-package/types_rather_than_typings',
        package: SOME_PACKAGE,
        path: _('/some_package/types_rather_than_typings'),
        typings: _(`/some_package/types_rather_than_typings/types_rather_than_typings.d.ts`),
        packageJson: loadPackageJson(fs, '/some_package/types_rather_than_typings'),
        compiledByAngular: true,
      });
    });

    it('should work with Angular Material style package.json', () => {
      const entryPoint =
          getEntryPointInfo(fs, new MockLogger(), SOME_PACKAGE, _('/some_package/material_style'));
      expect(entryPoint).toEqual({
        name: 'some_package/material_style',
        package: SOME_PACKAGE,
        path: _('/some_package/material_style'),
        typings: _(`/some_package/material_style/material_style.d.ts`),
        packageJson: loadPackageJson(fs, '/some_package/material_style'),
        compiledByAngular: true,
      });
    });

    it('should return null if the package.json is not valid JSON', () => {
      const entryPoint = getEntryPointInfo(
          fs, new MockLogger(), SOME_PACKAGE, _('/some_package/unexpected_symbols'));
      expect(entryPoint).toBe(null);
    });
  });

  function setupMockFileSystem(): void {
    const _ = absoluteFrom;
    loadTestFiles([
      {
        name: _('/some_package/valid_entry_point/package.json'),
        contents: createPackageJson('valid_entry_point')
      },
      {
        name: _('/some_package/valid_entry_point/valid_entry_point.metadata.json'),
        contents: 'some meta data'
      },
      // no package.json!
      {
        name: _('/some_package/missing_package_json/missing_package_json.metadata.json'),
        contents: 'some meta data'
      },
      {
        name: _('/some_package/missing_typings/package.json'),
        contents: createPackageJson('missing_typings', {excludes: ['typings']})
      },
      {
        name: _('/some_package/missing_typings/missing_typings.metadata.json'),
        contents: 'some meta data'
      },
      {
        name: _('/some_package/types_rather_than_typings/package.json'),
        contents: createPackageJson('types_rather_than_typings', {}, 'types')
      },
      {
        name: _('/some_package/types_rather_than_typings/types_rather_than_typings.metadata.json'),
        contents: 'some meta data'
      },
      {
        name: _('/some_package/missing_esm2015/package.json'),
        contents: createPackageJson('missing_fesm2015', {excludes: ['esm2015', 'fesm2015']})
      },
      {
        name: _('/some_package/missing_esm2015/missing_esm2015.metadata.json'),
        contents: 'some meta data'
      },
      // no metadata.json!
      {
        name: _('/some_package/missing_metadata/package.json'),
        contents: createPackageJson('missing_metadata')
      },
      {
        name: _('/some_package/material_style/package.json'),
        contents: `{
          "name": "some_package/material_style",
          "typings": "./material_style.d.ts",
          "main": "./bundles/material_style.umd.js",
          "module": "./esm5/material_style.es5.js",
          "es2015": "./esm2015/material_style.js"
        }`
      },
      {
        name: _('/some_package/material_style/material_style.metadata.json'),
        contents: 'some meta data'
      },
      // package.json might not be a valid JSON
      // for example, @schematics/angular contains a package.json blueprint
      // with unexpected symbols
      {
        name: _('/some_package/unexpected_symbols/package.json'),
        contents: '{"devDependencies": {<% if (!minimal) { %>"@types/jasmine": "~2.8.8" <% } %>}}'
      },
    ]);
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
});

export function loadPackageJson(fs: FileSystem, packagePath: string) {
  return JSON.parse(fs.readFile(fs.resolve(packagePath + '/package.json')));
}
