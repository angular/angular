/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom, AbsoluteFsPath, getFileSystem, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {NgccConfiguration, ProcessedNgccPackageConfig} from '../../src/packages/configuration';
import {EntryPoint, EntryPointJsonProperty, EntryPointPackageJson, getEntryPointFormat, getEntryPointInfo, IGNORED_ENTRY_POINT, INCOMPATIBLE_ENTRY_POINT, isEntryPoint, NO_ENTRY_POINT, SUPPORTED_FORMAT_PROPERTIES} from '../../src/packages/entry_point';

runInEachFileSystem(() => {
  describe('getEntryPointInfo()', () => {
    let SOME_PACKAGE: AbsoluteFsPath;
    let _: typeof absoluteFrom;
    let fs: ReadonlyFileSystem;

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
           path: _('/project/node_modules/some_package/valid_entry_point'),
           packageName: 'some_package',
           packagePath: SOME_PACKAGE,
           packageJson: loadPackageJson(fs, '/project/node_modules/some_package/valid_entry_point'),
           typings:
               _(`/project/node_modules/some_package/valid_entry_point/valid_entry_point.d.ts`),
           compiledByAngular: true,
           ignoreMissingDependencies: false,
           generateDeepReexports: false,
         });
       });

    it('should return `IGNORED_ENTRY_POINT` if configured to ignore the specified entry-point', () => {
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
      spyOn(config, 'getPackageConfig')
          .and.returnValue(new ProcessedNgccPackageConfig(
              fs, _('/project/node_modules/some_package'),
              {entryPoints: {'./valid_entry_point': {ignore: true}}}));
      const entryPoint = getEntryPointInfo(
          fs, config, new MockLogger(), SOME_PACKAGE,
          _('/project/node_modules/some_package/valid_entry_point'));
      expect(entryPoint).toBe(IGNORED_ENTRY_POINT);
    });

    it('should retrieve the entry-point\'s version from the package\'s `package.json`', () => {
      const entryPointPath = fs.join(SOME_PACKAGE, 'valid_entry_point');

      loadTestFiles([
        {
          name: _('/project/ngcc.config.js'),
          contents: `
            module.exports = {
              packages: {
                'some_package@3': {
                  entryPoints: {valid_entry_point: {override: {packageVersion: '3'}}},
                },
                'some_package@2': {
                  entryPoints: {valid_entry_point: {override: {packageVersion: '2'}}},
                },
                'some_package@1': {
                  entryPoints: {valid_entry_point: {override: {packageVersion: '1'}}},
                },
              },
            };
          `,
        },
        {
          name: fs.join(SOME_PACKAGE, 'package.json'),
          contents: createPackageJson('', {version: '1.0.0'}),
        },
        {
          name: fs.join(entryPointPath, 'package.json'),
          contents: createPackageJson('valid_entry_point', {version: '2.0.0'}),
        },
        {
          name: fs.join(entryPointPath, 'valid_entry_point.metadata.json'),
          contents: 'some meta data',
        },
      ]);

      const config = new NgccConfiguration(fs, _('/project'));
      const info = getEntryPointInfo(fs, config, new MockLogger(), SOME_PACKAGE, entryPointPath) as
          EntryPoint;

      expect(info.packageJson).toEqual(jasmine.objectContaining({packageVersion: '1'}));
    });

    it('should use `null` for version if it cannot be retrieved from a `package.json`', () => {
      const entryPointPath = fs.join(SOME_PACKAGE, 'valid_entry_point');

      loadTestFiles([
        {
          name: _('/project/ngcc.config.js'),
          contents: `
            module.exports = {
              packages: {
                'some_package@3': {
                  entryPoints: {valid_entry_point: {override: {packageVersion: '3'}}},
                },
                'some_package@2': {
                  entryPoints: {valid_entry_point: {override: {packageVersion: '2'}}},
                },
                'some_package@1': {
                  entryPoints: {valid_entry_point: {override: {packageVersion: '1'}}},
                },
              },
            };
          `,
        },
        {
          name: fs.join(SOME_PACKAGE, 'package.json'),
          contents: createPackageJson(''),
        },
        {
          name: fs.join(entryPointPath, 'package.json'),
          contents: createPackageJson('valid_entry_point'),
        },
        {
          name: fs.join(entryPointPath, 'valid_entry_point.metadata.json'),
          contents: 'some meta data',
        },
      ]);

      const config = new NgccConfiguration(fs, _('/project'));
      const info = getEntryPointInfo(fs, config, new MockLogger(), SOME_PACKAGE, entryPointPath) as
          EntryPoint;

      expect(info.packageJson).toEqual(jasmine.objectContaining({packageVersion: '3'}));
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
      spyOn(config, 'getPackageConfig')
          .and.returnValue(new ProcessedNgccPackageConfig(
              fs, _('/project/node_modules/some_package'),
              {entryPoints: {'./valid_entry_point': {override}}}));
      const entryPoint = getEntryPointInfo(
          fs, config, new MockLogger(), SOME_PACKAGE,
          _('/project/node_modules/some_package/valid_entry_point'));
      const overriddenPackageJson = {
        ...loadPackageJson(fs, '/project/node_modules/some_package/valid_entry_point'),
        ...override
      };
      expect(entryPoint).toEqual({
        name: 'some_package/valid_entry_point',
        path: _('/project/node_modules/some_package/valid_entry_point'),
        packageName: 'some_package',
        packagePath: SOME_PACKAGE,
        packageJson: overriddenPackageJson,
        typings: _('/project/node_modules/some_package/valid_entry_point/some_other.d.ts'),
        compiledByAngular: true,
        ignoreMissingDependencies: false,
        generateDeepReexports: false,
      });
    });

    it('should return `NO_ENTRY_POINT` if there is no package.json at the entry-point path', () => {
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
      expect(entryPoint).toBe(NO_ENTRY_POINT);
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
             JSON.parse(createPackageJson('missing_package_json', {excludes: ['name']})) as
             Partial<EntryPointPackageJson>;
         spyOn(config, 'getPackageConfig')
             .and.returnValue(new ProcessedNgccPackageConfig(
                 fs, _('/project/node_modules/some_package/'),
                 {entryPoints: {'./missing_package_json': {override}}}));
         const entryPoint = getEntryPointInfo(
             fs, config, new MockLogger(), SOME_PACKAGE,
             _('/project/node_modules/some_package/missing_package_json'));
         expect(entryPoint).toEqual({
           name: 'some_package/missing_package_json',
           path: _('/project/node_modules/some_package/missing_package_json'),
           packageName: 'some_package',
           packagePath: SOME_PACKAGE,
           packageJson: {name: 'some_package/missing_package_json', ...override},
           typings: _(
               '/project/node_modules/some_package/missing_package_json/missing_package_json.d.ts'),
           compiledByAngular: true,
           ignoreMissingDependencies: false,
           generateDeepReexports: false,
         });
       });

    [false, true].forEach(isScoped => {
      const nameWithScope = (baseName: string) => `${isScoped ? '@some-scope/' : ''}${baseName}`;
      const getPackageName = (packagePath: AbsoluteFsPath, entryPointPath: AbsoluteFsPath) => {
        const config = new NgccConfiguration(fs, _('/project'));
        const logger = new MockLogger();
        const entryPoint = getEntryPointInfo(fs, config, logger, packagePath, entryPointPath);

        if (!isEntryPoint(entryPoint)) {
          return fail(`Expected an entry point but got ${entryPoint}`);
        }

        return entryPoint.packageName;
      };
      const setUpPackageWithEntryPointPackageJson =
          (entryPointName: string, entryPointPath: AbsoluteFsPath) => {
            // Ensure a `package.json` exists for the entry-point (containing `entryPointName`).
            loadTestFiles([
              {
                name: fs.join(entryPointPath, 'package.json'),
                contents: JSON.stringify({name: entryPointName, typings: './index.d.ts'}),
              },
            ]);
          };
      const setUpPackageWithoutEntryPointPackageJson =
          (packagePath: AbsoluteFsPath, entryPointPath: AbsoluteFsPath) => {
            // Ensure there is an ngcc config for the entry-point providing a `typings` field  to
            // avoid returning `INCOMPATIBLE_ENTRY_POINT` (since there is no `package.json`).
            loadTestFiles([
              {
                name: fs.join(packagePath, 'ngcc.config.js'),
                contents: `
                  module.exports = {
                    entryPoints: {
                      '${fs.relative(packagePath, entryPointPath)}': {
                        override: {typings: './index.d.ts'},
                      },
                    },
                  };
                `,
              },
            ]);
          };

      describe(`should compute the containing ${isScoped ? 'scoped ' : ''}package's name`, () => {
        it('for a primary entry-point with a `package.json`', () => {
          const packagePath = _(`/project/node_modules/${nameWithScope('on-disk-package-name')}`);
          const entryPointPath = packagePath;
          const expectedPackageName = nameWithScope('package-json-package-name');

          setUpPackageWithEntryPointPackageJson(expectedPackageName, entryPointPath);

          expect(getPackageName(packagePath, entryPointPath)).toBe(expectedPackageName);
        });

        it('for a primary entry-point without a `package.json`', () => {
          const packagePath = _(`/project/node_modules/${nameWithScope('on-disk-package-name')}`);
          const entryPointPath = packagePath;
          const expectedPackageName = nameWithScope('on-disk-package-name');

          setUpPackageWithoutEntryPointPackageJson(packagePath, entryPointPath);

          expect(getPackageName(packagePath, entryPointPath)).toBe(expectedPackageName);
        });

        it('for a secondary entry-point with a `package.json`', () => {
          const packagePath = _(`/project/node_modules/${nameWithScope('on-disk-package-name')}`);
          const entryPointPath = fs.join(packagePath, 'some-entry-point');
          const expectedPackageName = nameWithScope('package-json-package-name');

          setUpPackageWithEntryPointPackageJson(
              `${expectedPackageName}/some-entry-point`, entryPointPath);

          expect(getPackageName(packagePath, entryPointPath)).toBe(expectedPackageName);
        });

        it('for a secondary entry-point without a `package.json`', () => {
          const packagePath = _(`/project/node_modules/${nameWithScope('on-disk-package-name')}`);
          const entryPointPath = fs.join(packagePath, 'some-entry-point');
          const expectedPackageName = nameWithScope('on-disk-package-name');

          setUpPackageWithoutEntryPointPackageJson(packagePath, entryPointPath);

          expect(getPackageName(packagePath, entryPointPath)).toBe(expectedPackageName);
        });

        it('for a primary entry-point without a `package.json` in nested `node_modules/`', () => {
          const packagePath = _(`/project/node_modules/other-package/node_modules/${
              nameWithScope('on-disk-package-name')}`);
          const entryPointPath = packagePath;
          const expectedPackageName = nameWithScope('on-disk-package-name');

          setUpPackageWithoutEntryPointPackageJson(packagePath, entryPointPath);

          expect(getPackageName(packagePath, entryPointPath)).toBe(expectedPackageName);
        });

        it('for a secondary entry-point without a `package.json` in nested `node_modules/`', () => {
          const packagePath = _(`/project/node_modules/other-package/node_modules/${
              nameWithScope('on-disk-package-name')}`);
          const entryPointPath = fs.join(packagePath, 'some-entry-point');
          const expectedPackageName = nameWithScope('on-disk-package-name');

          setUpPackageWithoutEntryPointPackageJson(packagePath, entryPointPath);

          expect(getPackageName(packagePath, entryPointPath)).toBe(expectedPackageName);
        });

        it('for a primary entry-point with a `package.json` outside `node_modules/`', () => {
          const packagePath = _(`/project/libs/${nameWithScope('on-disk-package-name')}`);
          const entryPointPath = packagePath;
          const expectedPackageName = nameWithScope('package-json-package-name');

          setUpPackageWithEntryPointPackageJson(expectedPackageName, entryPointPath);

          expect(getPackageName(packagePath, entryPointPath)).toBe(expectedPackageName);
        });

        it('for a primary entry-point without a `package.json` outside `node_modules/`', () => {
          const packagePath = _(`/project/libs/${nameWithScope('on-disk-package-name')}`);
          const entryPointPath = packagePath;
          const expectedPackageName = nameWithScope('on-disk-package-name');

          setUpPackageWithoutEntryPointPackageJson(packagePath, entryPointPath);

          expect(getPackageName(packagePath, entryPointPath)).toBe(expectedPackageName);
        });

        it('for a secondary entry-point with a `package.json` outside `node_modules/`', () => {
          const packagePath = _(`/project/libs/${nameWithScope('on-disk-package-name')}`);
          const entryPointPath = fs.join(packagePath, 'some-entry-point');
          const expectedPackageName = nameWithScope('package-json-package-name');

          setUpPackageWithEntryPointPackageJson(expectedPackageName, entryPointPath);

          expect(getPackageName(packagePath, entryPointPath)).toBe(expectedPackageName);
        });

        it('for a secondary entry-point without a `package.json` outside `node_modules/`', () => {
          const packagePath = _(`/project/libs/${nameWithScope('on-disk-package-name')}`);
          const entryPointPath = fs.join(packagePath, 'some-entry-point');
          const expectedPackageName = nameWithScope('on-disk-package-name');

          setUpPackageWithoutEntryPointPackageJson(packagePath, entryPointPath);

          expect(getPackageName(packagePath, entryPointPath)).toBe(expectedPackageName);
        });
      });
    });

    it('should return `INCOMPATIBLE_ENTRY_POINT` if there is no typings or types field in the package.json',
       () => {
         loadTestFiles([
           {
             name: _('/project/node_modules/some_package/missing_typings/package.json'),
             contents: createPackageJson('missing_typings', {excludes: ['typings']})
           },
           {
             name: _(
                 '/project/node_modules/some_package/missing_typings/missing_typings.metadata.json'),
             contents: 'some meta data'
           },
         ]);
         const config = new NgccConfiguration(fs, _('/project'));
         const entryPoint = getEntryPointInfo(
             fs, config, new MockLogger(), SOME_PACKAGE,
             _('/project/node_modules/some_package/missing_typings'));
         expect(entryPoint).toBe(INCOMPATIBLE_ENTRY_POINT);
       });

    it('should return `INCOMPATIBLE_ENTRY_POINT` if the typings or types field is not a string in the package.json',
       () => {
         loadTestFiles([
           {
             name: _('/project/node_modules/some_package/typings_array/package.json'),
             contents: createPackageJson('typings_array', {typingsIsArray: true})
           },
           {
             name: _(
                 '/project/node_modules/some_package/typings_array/missing_typings.metadata.json'),
             contents: 'some meta data'
           },
         ]);
         const config = new NgccConfiguration(fs, _('/project'));
         const entryPoint = getEntryPointInfo(
             fs, config, new MockLogger(), SOME_PACKAGE,
             _('/project/node_modules/some_package/typings_array'));
         expect(entryPoint).toBe(INCOMPATIBLE_ENTRY_POINT);
       });

    for (let prop of SUPPORTED_FORMAT_PROPERTIES) {
      // Ignore the UMD format
      if (prop === 'main' || prop === 'browser') continue;
      // Let's give 'module' a specific path, otherwise compute it based on the property.
      const typingsPath = prop === 'module' ? 'index' : `${prop}/missing_typings`;

      it(`should return an object if it can guess the typings path from the "${prop}" field`,
         () => {
           loadTestFiles([
             {
               name: _('/project/node_modules/some_package/missing_typings/package.json'),
               contents: createPackageJson('missing_typings', {excludes: ['typings']}),
             },
             {
               name: _(`/project/node_modules/some_package/missing_typings/${
                   typingsPath}.metadata.json`),
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
             path: _('/project/node_modules/some_package/missing_typings'),
             packageName: 'some_package',
             packagePath: SOME_PACKAGE,
             packageJson: loadPackageJson(fs, '/project/node_modules/some_package/missing_typings'),
             typings: _(`/project/node_modules/some_package/missing_typings/${typingsPath}.d.ts`),
             compiledByAngular: true,
             ignoreMissingDependencies: false,
             generateDeepReexports: false,
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
           path: _('/project/node_modules/some_package/missing_metadata'),
           packageName: 'some_package',
           packagePath: SOME_PACKAGE,
           packageJson: loadPackageJson(fs, '/project/node_modules/some_package/missing_metadata'),
           typings: _(`/project/node_modules/some_package/missing_metadata/missing_metadata.d.ts`),
           compiledByAngular: false,
           ignoreMissingDependencies: false,
           generateDeepReexports: false,
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
         spyOn(config, 'getPackageConfig')
             .and.returnValue(new ProcessedNgccPackageConfig(
                 fs, _('/project/node_modules/some_package'),
                 {entryPoints: {'./missing_metadata': {}}}));
         const entryPoint = getEntryPointInfo(
             fs, config, new MockLogger(), SOME_PACKAGE,
             _('/project/node_modules/some_package/missing_metadata'));
         expect(entryPoint).toEqual({
           name: 'some_package/missing_metadata',
           path: _('/project/node_modules/some_package/missing_metadata'),
           packageName: 'some_package',
           packagePath: SOME_PACKAGE,
           packageJson: loadPackageJson(fs, '/project/node_modules/some_package/missing_metadata'),
           typings: _('/project/node_modules/some_package/missing_metadata/missing_metadata.d.ts'),
           compiledByAngular: true,
           ignoreMissingDependencies: false,
           generateDeepReexports: false,
         });
       });

    it('should work if the typings field is named `types', () => {
      loadTestFiles([
        {
          name: _('/project/node_modules/some_package/types_rather_than_typings/package.json'),
          contents: createPackageJson('types_rather_than_typings', {typingsProp: 'types'})
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
        path: _('/project/node_modules/some_package/types_rather_than_typings'),
        packageName: 'some_package',
        packagePath: SOME_PACKAGE,
        packageJson:
            loadPackageJson(fs, '/project/node_modules/some_package/types_rather_than_typings'),
        typings: _(
            `/project/node_modules/some_package/types_rather_than_typings/types_rather_than_typings.d.ts`),
        compiledByAngular: true,
        ignoreMissingDependencies: false,
        generateDeepReexports: false,
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
        path: _('/project/node_modules/some_package/material_style'),
        packageName: 'some_package',
        packagePath: SOME_PACKAGE,
        packageJson: loadPackageJson(fs, '/project/node_modules/some_package/material_style'),
        typings: _(`/project/node_modules/some_package/material_style/material_style.d.ts`),
        compiledByAngular: true,
        ignoreMissingDependencies: false,
        generateDeepReexports: false,
      });
    });

    it('should return `INCOMPATIBLE_ENTRY_POINT` if the package.json is not valid JSON', () => {
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
      expect(entryPoint).toBe(INCOMPATIBLE_ENTRY_POINT);
    });
  });

  describe('getEntryPointFormat()', () => {
    let SOME_PACKAGE: AbsoluteFsPath;
    let _: typeof absoluteFrom;
    let fs: ReadonlyFileSystem;
    let entryPoint: EntryPoint;

    beforeEach(() => {
      _ = absoluteFrom;
      SOME_PACKAGE = _('/project/node_modules/some_package');
      fs = getFileSystem();
      loadTestFiles([{
        name: _('/project/node_modules/some_package/valid_entry_point/package.json'),
        contents: createPackageJson('valid_entry_point')
      }]);
      const config = new NgccConfiguration(fs, _('/project'));
      const result = getEntryPointInfo(
          fs, config, new MockLogger(), SOME_PACKAGE,
          _('/project/node_modules/some_package/valid_entry_point'));
      if (!isEntryPoint(result)) {
        return fail(`Expected an entry point but got ${result}`);
      }
      entryPoint = result;
    });

    it('should return `esm2015` format for `fesm2015` property', () => {
      expect(getEntryPointFormat(fs, entryPoint, 'fesm2015')).toBe('esm2015');
    });

    it('should return `esm5` format for `fesm5` property', () => {
      expect(getEntryPointFormat(fs, entryPoint, 'fesm5')).toBe('esm5');
    });

    it('should return `esm2015` format for `es2015` property', () => {
      expect(getEntryPointFormat(fs, entryPoint, 'es2015')).toBe('esm2015');
    });

    it('should return `esm2015` format for `esm2015` property', () => {
      expect(getEntryPointFormat(fs, entryPoint, 'esm2015')).toBe('esm2015');
    });

    it('should return `esm5` format for `esm5` property', () => {
      expect(getEntryPointFormat(fs, entryPoint, 'esm5')).toBe('esm5');
    });

    it('should return `esm5` format for `module` property', () => {
      expect(getEntryPointFormat(fs, entryPoint, 'module')).toBe('esm5');
    });

    it('should return `esm2015` format for `module` property if it points to esm2015 output',
       () => {
         entryPoint.packageJson['module'] = '../fesm2015/valid-entry-point.js';
         expect(getEntryPointFormat(fs, entryPoint, 'module')).toBe('esm2015');
       });

    (['browser', 'main'] as EntryPointJsonProperty[]).forEach(browserOrMain => {
      it('should return `esm5` for `' + browserOrMain +
             '` if the file contains import or export statements',
         () => {
           const name = _(
               '/project/node_modules/some_package/valid_entry_point/bundles/valid_entry_point/index.js');
           loadTestFiles([{name, contents: `import * as core from '@angular/core;`}]);
           expect(getEntryPointFormat(fs, entryPoint, browserOrMain)).toBe('esm5');

           loadTestFiles([{name, contents: `import {Component} from '@angular/core;`}]);
           expect(getEntryPointFormat(fs, entryPoint, browserOrMain)).toBe('esm5');

           loadTestFiles([{name, contents: `export function foo() {}`}]);
           expect(getEntryPointFormat(fs, entryPoint, browserOrMain)).toBe('esm5');

           loadTestFiles([{name, contents: `export * from 'abc';`}]);
           expect(getEntryPointFormat(fs, entryPoint, browserOrMain)).toBe('esm5');
         });

      it('should return `umd` for `' + browserOrMain +
             '` if the file contains a UMD wrapper function',
         () => {
           loadTestFiles([{
             name: _(
                 '/project/node_modules/some_package/valid_entry_point/bundles/valid_entry_point/index.js'),
             contents: `
        (function (global, factory) {
          typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
          typeof define === 'function' && define.amd ? define('@angular/common', ['exports', '@angular/core'], factory) :
          (global = global || self, factory((global.ng = global.ng || {}, global.ng.common = {}), global.ng.core));
        }(this, function (exports, core) { 'use strict'; }));
      `
           }]);
           expect(getEntryPointFormat(fs, entryPoint, browserOrMain)).toBe('umd');
         });

      it('should return `commonjs` for `' + browserOrMain +
             '` if the file does not contain a UMD wrapper function',
         () => {
           loadTestFiles([{
             name: _(
                 '/project/node_modules/some_package/valid_entry_point/bundles/valid_entry_point/index.js'),
             contents: `
          const core = require('@angular/core);
          module.exports = {};
        `
           }]);
           expect(getEntryPointFormat(fs, entryPoint, browserOrMain)).toBe('commonjs');
         });

      it('should resolve the format path with suitable postfixes', () => {
        loadTestFiles([{
          name: _(
              '/project/node_modules/some_package/valid_entry_point/bundles/valid_entry_point/index.js'),
          contents: `
        (function (global, factory) {
          typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
          typeof define === 'function' && define.amd ? define('@angular/common', ['exports', '@angular/core'], factory) :
          (global = global || self, factory((global.ng = global.ng || {}, global.ng.common = {}), global.ng.core));
        }(this, function (exports, core) { 'use strict'; }));
      `
        }]);

        entryPoint.packageJson.main = './bundles/valid_entry_point/index';
        expect(getEntryPointFormat(fs, entryPoint, browserOrMain)).toBe('umd');

        entryPoint.packageJson.main = './bundles/valid_entry_point';
        expect(getEntryPointFormat(fs, entryPoint, browserOrMain)).toBe('umd');
      });
    });

    it('should return `undefined` if the `browser` property is not a string', () => {
      entryPoint.packageJson.browser = {} as any;
      expect(getEntryPointFormat(fs, entryPoint, 'browser')).toBeUndefined();
    });
  });
});

export function createPackageJson(
    entryPointName: string, {excludes, typingsProp = 'typings', typingsIsArray, version}: {
      excludes?: string[],
      typingsProp?: string,
      typingsIsArray?: boolean,
      version?: string
    } = {}): string {
  const packageJson: EntryPointPackageJson = {
    name: (entryPointName === '') ? 'some_package' : `some_package/${entryPointName}`,
    version,
    [typingsProp]: typingsIsArray ? [`./${entryPointName}.d.ts`] : `./${entryPointName}.d.ts`,
    fesm2015: `./fesm2015/${entryPointName}.js`,
    esm2015: `./esm2015/${entryPointName}.js`,
    es2015: `./es2015/${entryPointName}.js`,
    fesm5: `./fesm5/${entryPointName}.js`,
    esm5: `./esm5/${entryPointName}.js`,
    main: `./bundles/${entryPointName}/index.js`,
    browser: `./bundles/${entryPointName}/index.js`,
    module: './index.js',
  };
  if (excludes) {
    excludes.forEach(exclude => delete packageJson[exclude]);
  }
  return JSON.stringify(packageJson);
}

export function loadPackageJson(fs: ReadonlyFileSystem, packagePath: string) {
  return JSON.parse(fs.readFile(fs.resolve(packagePath + '/package.json'))) as
      EntryPointPackageJson;
}
