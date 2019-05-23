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
import {NgccConfiguration} from '../../src/packages/configuration';
import {SUPPORTED_FORMAT_PROPERTIES, getEntryPointInfo} from '../../src/packages/entry_point';
import {MockLogger} from '../helpers/mock_logger';

runInEachFileSystem(() => {
  describe('getEntryPointInfo()', () => {
    let SOME_PACKAGE: AbsoluteFsPath;
    let _: typeof absoluteFrom;
    let fs: FileSystem;

    beforeEach(() => {
      _ = absoluteFrom;
      SOME_PACKAGE = _('/project/node_modules/some_package');
      fs = getFileSystem();
    });

    it('should return an object containing absolute paths to the formats of the specified entry-point',
       () => {
         loadTestFiles([
           {
             name: _('/project/node_modules/some_package/valid_entry_point/package.json'),
             contents: createPackageJson('valid_entry_point')
           },
           {
             name: _(
                 '/project/node_modules/some_package/valid_entry_point/valid_entry_point.metadata.json'),
             contents: 'some meta data'
           },
         ]);
         const config = new NgccConfiguration(fs, _('/project'));
         const entryPoint = getEntryPointInfo(
             fs, config, new MockLogger(), SOME_PACKAGE,
             _('/project/node_modules/some_package/valid_entry_point'));
         expect(entryPoint).toEqual({
           name: 'some_package/valid_entry_point',
           package: SOME_PACKAGE,
           path: _('/project/node_modules/some_package/valid_entry_point'),
           typings:
               _(`/project/node_modules/some_package/valid_entry_point/valid_entry_point.d.ts`),
           packageJson: loadPackageJson(fs, '/project/node_modules/some_package/valid_entry_point'),
           compiledByAngular: true,
         });
       });

    it('should return null if configured to ignore the specified entry-point', () => {
      loadTestFiles([
        {
          name: _('/project/node_modules/some_package/valid_entry_point/package.json'),
          contents: createPackageJson('valid_entry_point'),
        },
        {
          name: _(
              '/project/node_modules/some_package/valid_entry_point/valid_entry_point.metadata.json'),
          contents: 'some meta data',
        },
      ]);
      const config = new NgccConfiguration(fs, _('/project'));
      spyOn(config, 'getConfig').and.returnValue({
        entryPoints:
            {[_('/project/node_modules/some_package/valid_entry_point')]: {ignore: true}}
      });
      const entryPoint = getEntryPointInfo(
          fs, config, new MockLogger(), SOME_PACKAGE,
          _('/project/node_modules/some_package/valid_entry_point'));
      expect(entryPoint).toBe(null);
    });

    it('should override the properties on package.json if the entry-point is configured', () => {
      loadTestFiles([
        {
          name: _('/project/node_modules/some_package/valid_entry_point/package.json'),
          contents: createPackageJson('valid_entry_point'),
        },
        {
          name: _(
              '/project/node_modules/some_package/valid_entry_point/valid_entry_point.metadata.json'),
          contents: 'some meta data',
        },
      ]);
      const config = new NgccConfiguration(fs, _('/project'));
      const override = {
        typings: './some_other.d.ts',
        esm2015: './some_other.js',
      };
      spyOn(config, 'getConfig').and.returnValue({
        entryPoints: {[_('/project/node_modules/some_package/valid_entry_point')]: {override}}
      });
      const entryPoint = getEntryPointInfo(
          fs, config, new MockLogger(), SOME_PACKAGE,
          _('/project/node_modules/some_package/valid_entry_point'));
      const overriddenPackageJson = {
          ...loadPackageJson(fs, '/project/node_modules/some_package/valid_entry_point'),
          ...override};
      expect(entryPoint).toEqual({
        name: 'some_package/valid_entry_point',
        package: SOME_PACKAGE,
        path: _('/project/node_modules/some_package/valid_entry_point'),
        typings: _('/project/node_modules/some_package/valid_entry_point/some_other.d.ts'),
        packageJson: overriddenPackageJson,
        compiledByAngular: true,
      });
    });

    it('should return null if there is no package.json at the entry-point path', () => {
      loadTestFiles([
        {
          name: _(
              '/project/node_modules/some_package/missing_package_json/missing_package_json.metadata.json'),
          contents: 'some meta data'
        },
      ]);
      const config = new NgccConfiguration(fs, _('/project'));
      const entryPoint = getEntryPointInfo(
          fs, config, new MockLogger(), SOME_PACKAGE,
          _('/project/node_modules/some_package/missing_package_json'));
      expect(entryPoint).toBe(null);
    });

    it('should return a configured entry-point if there is no package.json at the entry-point path',
       () => {
         loadTestFiles([
           // no package.json!
           {
             name: _(
                 '/project/node_modules/some_package/missing_package_json/missing_package_json.metadata.json'),
             contents: 'some meta data',
           },
         ]);
         const config = new NgccConfiguration(fs, _('/project'));
         const override =
             JSON.parse(createPackageJson('missing_package_json', {excludes: ['name']}));
         spyOn(config, 'getConfig').and.returnValue({
           entryPoints:
               {[_('/project/node_modules/some_package/missing_package_json')]: {override}}
         });
         const entryPoint = getEntryPointInfo(
             fs, config, new MockLogger(), SOME_PACKAGE,
             _('/project/node_modules/some_package/missing_package_json'));
         expect(entryPoint).toEqual({
           name: 'some_package/missing_package_json',
           package: SOME_PACKAGE,
           path: _('/project/node_modules/some_package/missing_package_json'),
           typings: _(
               '/project/node_modules/some_package/missing_package_json/missing_package_json.d.ts'),
           packageJson: {name: 'some_package/missing_package_json', ...override},
           compiledByAngular: true,
         });
       });


    it('should return null if there is no typings or types field in the package.json', () => {
      loadTestFiles([
        {
          name: _('/project/node_modules/some_package/missing_typings/package.json'),
          contents: createPackageJson('missing_typings', {excludes: ['typings']})
        },
        {
          name:
              _('/project/node_modules/some_package/missing_typings/missing_typings.metadata.json'),
          contents: 'some meta data'
        },
      ]);
      const config = new NgccConfiguration(fs, _('/project'));
      const entryPoint = getEntryPointInfo(
          fs, config, new MockLogger(), SOME_PACKAGE,
          _('/project/node_modules/some_package/missing_typings'));
      expect(entryPoint).toBe(null);
    });

    for (let prop of SUPPORTED_FORMAT_PROPERTIES) {
      // Ignore the UMD format
      if (prop === 'main') continue;
      // Let's give 'module' a specific path, otherwise compute it based on the property.
      const typingsPath = prop === 'module' ? 'index' : `${prop}/missing_typings`;

      it(`should return an object if it can guess the typings path from the "${prop}" field`, () => {
        loadTestFiles([
          {
            name: _('/project/node_modules/some_package/missing_typings/package.json'),
            contents: createPackageJson('missing_typings', {excludes: ['typings']}),
          },
          {
            name: _(
                `/project/node_modules/some_package/missing_typings/${typingsPath}.metadata.json`),
            contents: 'some meta data',
          },
          {
            name: _(`/project/node_modules/some_package/missing_typings/${typingsPath}.d.ts`),
            contents: '// some typings file',
          },
        ]);
        const config = new NgccConfiguration(fs, _('/project'));
        const entryPoint = getEntryPointInfo(
            fs, config, new MockLogger(), SOME_PACKAGE,
            _('/project/node_modules/some_package/missing_typings'));
        expect(entryPoint).toEqual({
          name: 'some_package/missing_typings',
          package: SOME_PACKAGE,
          path: _('/project/node_modules/some_package/missing_typings'),
          typings: _(`/project/node_modules/some_package/missing_typings/${typingsPath}.d.ts`),
          packageJson: loadPackageJson(fs, '/project/node_modules/some_package/missing_typings'),
          compiledByAngular: true,
        });
      });
    }

    it('should return an object with `compiledByAngular` set to false if there is no metadata.json file next to the typing file',
       () => {
         loadTestFiles([
           {
             name: _('/project/node_modules/some_package/missing_metadata/package.json'),
             contents: createPackageJson('missing_metadata')
           },
         ]);
         const config = new NgccConfiguration(fs, _('/project'));
         const entryPoint = getEntryPointInfo(
             fs, config, new MockLogger(), SOME_PACKAGE,
             _('/project/node_modules/some_package/missing_metadata'));
         expect(entryPoint).toEqual({
           name: 'some_package/missing_metadata',
           package: SOME_PACKAGE,
           path: _('/project/node_modules/some_package/missing_metadata'),
           typings: _(`/project/node_modules/some_package/missing_metadata/missing_metadata.d.ts`),
           packageJson: loadPackageJson(fs, '/project/node_modules/some_package/missing_metadata'),
           compiledByAngular: false,
         });
       });

    it('should return an object with `compiledByAngular` set to true if there is no metadata.json file but the entry-point has a configuration',
       () => {
         loadTestFiles([
           {
             name: _('/project/node_modules/some_package/missing_metadata/package.json'),
             contents: createPackageJson('missing_metadata'),
           },
           // no metadata.json!
         ]);
         const config = new NgccConfiguration(fs, _('/project'));
         spyOn(config, 'getConfig').and.returnValue({
           entryPoints: {[_('/project/node_modules/some_package/missing_metadata')]: {}}
         });
         const entryPoint = getEntryPointInfo(
             fs, config, new MockLogger(), SOME_PACKAGE,
             _('/project/node_modules/some_package/missing_metadata'));
         expect(entryPoint).toEqual({
           name: 'some_package/missing_metadata',
           package: SOME_PACKAGE,
           path: _('/project/node_modules/some_package/missing_metadata'),
           typings: _('/project/node_modules/some_package/missing_metadata/missing_metadata.d.ts'),
           packageJson: loadPackageJson(fs, '/project/node_modules/some_package/missing_metadata'),
           compiledByAngular: true,
         });
       });

    it('should work if the typings field is named `types', () => {
      loadTestFiles([
        {
          name: _('/project/node_modules/some_package/types_rather_than_typings/package.json'),
          contents: createPackageJson('types_rather_than_typings', {}, 'types')
        },
        {
          name: _(
              '/project/node_modules/some_package/types_rather_than_typings/types_rather_than_typings.metadata.json'),
          contents: 'some meta data'
        },
      ]);
      const config = new NgccConfiguration(fs, _('/project'));
      const entryPoint = getEntryPointInfo(
          fs, config, new MockLogger(), SOME_PACKAGE,
          _('/project/node_modules/some_package/types_rather_than_typings'));
      expect(entryPoint).toEqual({
        name: 'some_package/types_rather_than_typings',
        package: SOME_PACKAGE,
        path: _('/project/node_modules/some_package/types_rather_than_typings'),
        typings: _(
            `/project/node_modules/some_package/types_rather_than_typings/types_rather_than_typings.d.ts`),
        packageJson:
            loadPackageJson(fs, '/project/node_modules/some_package/types_rather_than_typings'),
        compiledByAngular: true,
      });
    });

    it('should work with Angular Material style package.json', () => {
      loadTestFiles([
        {
          name: _('/project/node_modules/some_package/material_style/package.json'),
          contents: `{
            "name": "some_package/material_style",
            "typings": "./material_style.d.ts",
            "main": "./bundles/material_style.umd.js",
            "module": "./esm5/material_style.es5.js",
            "es2015": "./esm2015/material_style.js"
          }`
        },
        {
          name: _('/project/node_modules/some_package/material_style/material_style.metadata.json'),
          contents: 'some meta data'
        },
      ]);
      const config = new NgccConfiguration(fs, _('/project'));
      const entryPoint = getEntryPointInfo(
          fs, config, new MockLogger(), SOME_PACKAGE,
          _('/project/node_modules/some_package/material_style'));
      expect(entryPoint).toEqual({
        name: 'some_package/material_style',
        package: SOME_PACKAGE,
        path: _('/project/node_modules/some_package/material_style'),
        typings: _(`/project/node_modules/some_package/material_style/material_style.d.ts`),
        packageJson: loadPackageJson(fs, '/project/node_modules/some_package/material_style'),
        compiledByAngular: true,
      });
    });

    it('should return null if the package.json is not valid JSON', () => {
      loadTestFiles([
        // package.json might not be a valid JSON
        // for example, @schematics/angular contains a package.json blueprint
        // with unexpected symbols
        {
          name: _('/project/node_modules/some_package/unexpected_symbols/package.json'),
          contents: '{"devDependencies": {<% if (!minimal) { %>"@types/jasmine": "~2.8.8" <% } %>}}'
        },
      ]);
      const config = new NgccConfiguration(fs, _('/project'));
      const entryPoint = getEntryPointInfo(
          fs, config, new MockLogger(), SOME_PACKAGE,
          _('/project/node_modules/some_package/unexpected_symbols'));
      expect(entryPoint).toBe(null);
    });
  });

  function createPackageJson(
      packageName: string, {excludes}: {excludes?: string[]} = {},
      typingsProp: string = 'typings'): string {
    const packageJson: any = {
      name: `some_package/${packageName}`,
      [typingsProp]: `./${packageName}.d.ts`,
      fesm2015: `./fesm2015/${packageName}.js`,
      esm2015: `./esm2015/${packageName}.js`,
      es2015: `./es2015/${packageName}.js`,
      fesm5: `./fesm5/${packageName}.js`,
      esm5: `./esm5/${packageName}.js`,
      main: `./bundles/${packageName}.umd.js`,
      module: './index.js',
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
