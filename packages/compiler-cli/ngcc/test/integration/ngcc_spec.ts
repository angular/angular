/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, absoluteFrom, getFileSystem, join} from '../../../src/ngtsc/file_system';
import {Folder, MockFileSystem, runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles, loadTestFiles} from '../../../test/helpers';
import {mainNgcc} from '../../src/main';
import {markAsProcessed} from '../../src/packages/build_marker';
import {EntryPointJsonProperty, EntryPointPackageJson, SUPPORTED_FORMAT_PROPERTIES} from '../../src/packages/entry_point';
import {MockLogger} from '../helpers/mock_logger';

const testFiles = loadStandardTestFiles({fakeCore: false, rxjs: true});

runInEachFileSystem(() => {
  describe('ngcc main()', () => {
    let _: typeof absoluteFrom;
    let fs: FileSystem;

    beforeEach(() => {
      _ = absoluteFrom;
      fs = getFileSystem();
      initMockFileSystem(fs, testFiles);
    });

    it('should run ngcc without errors for esm2015', () => {
      expect(() => mainNgcc({basePath: '/node_modules', propertiesToConsider: ['esm2015']}))
          .not.toThrow();
    });

    it('should run ngcc without errors for esm5', () => {
      expect(() => mainNgcc({
               basePath: '/node_modules',
               propertiesToConsider: ['esm5'],
               logger: new MockLogger(),
             }))
          .not.toThrow();
    });

    it('should run ngcc without errors when "main" property is not present', () => {
      mainNgcc({
        basePath: '/dist',
        propertiesToConsider: ['main', 'es2015'],
        logger: new MockLogger(),
      });

      expect(loadPackage('local-package', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
        es2015: '0.0.0-PLACEHOLDER',
        typings: '0.0.0-PLACEHOLDER',
      });
    });

    describe('with targetEntryPointPath', () => {
      it('should only compile the given package entry-point (and its dependencies).', () => {
        const STANDARD_MARKERS = {
          main: '0.0.0-PLACEHOLDER',
          module: '0.0.0-PLACEHOLDER',
          es2015: '0.0.0-PLACEHOLDER',
          esm5: '0.0.0-PLACEHOLDER',
          esm2015: '0.0.0-PLACEHOLDER',
          fesm5: '0.0.0-PLACEHOLDER',
          fesm2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        };

        mainNgcc({basePath: '/node_modules', targetEntryPointPath: '@angular/common/http/testing'});
        expect(loadPackage('@angular/common/http/testing').__processed_by_ivy_ngcc__)
            .toEqual(STANDARD_MARKERS);
        // * `common/http` is a dependency of `common/http/testing`, so is compiled.
        expect(loadPackage('@angular/common/http').__processed_by_ivy_ngcc__)
            .toEqual(STANDARD_MARKERS);
        // * `core` is a dependency of `common/http`, so is compiled.
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual(STANDARD_MARKERS);
        // * `common` is a private (only in .js not .d.ts) dependency so is compiled.
        expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__).toEqual(STANDARD_MARKERS);
        // * `common/testing` is not a dependency so is not compiled.
        expect(loadPackage('@angular/common/testing').__processed_by_ivy_ngcc__).toBeUndefined();
      });

      it('should mark a non-Angular package target as processed', () => {
        mainNgcc({basePath: '/node_modules', targetEntryPointPath: 'test-package'});

        // `test-package` has no Angular but is marked as processed.
        expect(loadPackage('test-package').__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
        });

        // * `core` is a dependency of `test-package`, but it is not processed, since test-package
        // was not processed.
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toBeUndefined();
      });
    });

    describe('early skipping of target entry-point', () => {
      describe('[compileAllFormats === true]', () => {
        it('should skip all processing if all the properties are marked as processed', () => {
          const logger = new MockLogger();
          markPropertiesAsProcessed('@angular/common/http/testing', SUPPORTED_FORMAT_PROPERTIES);
          mainNgcc({
            basePath: '/node_modules',
            targetEntryPointPath: '@angular/common/http/testing', logger,
          });
          expect(logger.logs.debug).toContain([
            'The target entry-point has already been processed'
          ]);
        });

        it('should process the target if any `propertyToConsider` is not marked as processed',
           () => {
             const logger = new MockLogger();
             markPropertiesAsProcessed('@angular/common/http/testing', ['esm2015', 'fesm2015']);
             mainNgcc({
               basePath: '/node_modules',
               targetEntryPointPath: '@angular/common/http/testing',
               propertiesToConsider: ['fesm2015', 'esm5', 'esm2015'], logger,
             });
             expect(logger.logs.debug).not.toContain([
               'The target entry-point has already been processed'
             ]);
           });
      });

      describe('[compileAllFormats === false]', () => {
        it('should process the target if the first matching `propertyToConsider` is not marked as processed',
           () => {
             const logger = new MockLogger();
             markPropertiesAsProcessed('@angular/common/http/testing', ['esm2015']);
             mainNgcc({
               basePath: '/node_modules',
               targetEntryPointPath: '@angular/common/http/testing',
               propertiesToConsider: ['esm5', 'esm2015'],
               compileAllFormats: false, logger,
             });

             expect(logger.logs.debug).not.toContain([
               'The target entry-point has already been processed'
             ]);
           });

        it('should skip all processing if the first matching `propertyToConsider` is marked as processed',
           () => {
             const logger = new MockLogger();
             markPropertiesAsProcessed('@angular/common/http/testing', ['esm2015']);
             mainNgcc({
               basePath: '/node_modules',
               targetEntryPointPath: '@angular/common/http/testing',
               // Simulate a property that does not exist on the package.json and will be ignored.
               propertiesToConsider: ['missing', 'esm2015', 'esm5'],
               compileAllFormats: false, logger,
             });

             expect(logger.logs.debug).toContain([
               'The target entry-point has already been processed'
             ]);
           });
      });
    });


    function markPropertiesAsProcessed(packagePath: string, properties: EntryPointJsonProperty[]) {
      const basePath = _('/node_modules');
      const targetPackageJsonPath = join(basePath, packagePath, 'package.json');
      const targetPackage = loadPackage(packagePath);
      markAsProcessed(fs, targetPackage, targetPackageJsonPath, 'typings');
      properties.forEach(
          property => markAsProcessed(fs, targetPackage, targetPackageJsonPath, property));
    }


    describe('with propertiesToConsider', () => {
      it('should only compile the entry-point formats given in the `propertiesToConsider` list',
         () => {
           mainNgcc({
             basePath: '/node_modules',
             propertiesToConsider: ['main', 'esm5', 'module', 'fesm5'],
             logger: new MockLogger(),

           });

           // The ES2015 formats are not compiled as they are not in `propertiesToConsider`.
           expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
             esm5: '0.0.0-PLACEHOLDER',
             main: '0.0.0-PLACEHOLDER',
             module: '0.0.0-PLACEHOLDER',
             fesm5: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
           expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__).toEqual({
             esm5: '0.0.0-PLACEHOLDER',
             main: '0.0.0-PLACEHOLDER',
             module: '0.0.0-PLACEHOLDER',
             fesm5: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
           expect(loadPackage('@angular/common/testing').__processed_by_ivy_ngcc__).toEqual({
             esm5: '0.0.0-PLACEHOLDER',
             main: '0.0.0-PLACEHOLDER',
             module: '0.0.0-PLACEHOLDER',
             fesm5: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
           expect(loadPackage('@angular/common/http').__processed_by_ivy_ngcc__).toEqual({
             esm5: '0.0.0-PLACEHOLDER',
             main: '0.0.0-PLACEHOLDER',
             module: '0.0.0-PLACEHOLDER',
             fesm5: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
         });
    });

    describe('with compileAllFormats set to false', () => {
      it('should only compile the first matching format', () => {
        mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['module', 'fesm5', 'esm5'],
          compileAllFormats: false,
          logger: new MockLogger(),

        });
        // * In the Angular packages fesm5 and module have the same underlying format,
        //   so both are marked as compiled.
        // * The `esm5` is not compiled because we stopped after the `fesm5` format.
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          fesm5: '0.0.0-PLACEHOLDER',
          module: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__).toEqual({
          fesm5: '0.0.0-PLACEHOLDER',
          module: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/common/testing').__processed_by_ivy_ngcc__).toEqual({
          fesm5: '0.0.0-PLACEHOLDER',
          module: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/common/http').__processed_by_ivy_ngcc__).toEqual({
          fesm5: '0.0.0-PLACEHOLDER',
          module: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
      });

      it('should cope with compiling the same entry-point multiple times with different formats',
         () => {
           mainNgcc({
             basePath: '/node_modules',
             propertiesToConsider: ['module'],
             compileAllFormats: false,
             logger: new MockLogger(),

           });
           expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
             module: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
           // If ngcc tries to write out the typings files again, this will throw an exception.
           mainNgcc({
             basePath: '/node_modules',
             propertiesToConsider: ['esm5'],
             compileAllFormats: false,
             logger: new MockLogger(),
           });
           expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
             esm5: '0.0.0-PLACEHOLDER',
             module: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
         });
    });

    describe('with createNewEntryPointFormats', () => {
      it('should create new files rather than overwriting the originals', () => {
        const ANGULAR_CORE_IMPORT_REGEX = /import \* as ɵngcc\d+ from '@angular\/core';/;
        mainNgcc({
          basePath: '/node_modules',
          createNewEntryPointFormats: true,
          propertiesToConsider: ['esm5'],
          logger: new MockLogger(),

        });

        // Updates the package.json
        expect(loadPackage('@angular/common').esm5).toEqual('./esm5/common.js');
        expect((loadPackage('@angular/common') as any).esm5_ivy_ngcc)
            .toEqual('__ivy_ngcc__/esm5/common.js');

        // Doesn't touch original files
        expect(fs.readFile(_(`/node_modules/@angular/common/esm5/src/common_module.js`)))
            .not.toMatch(ANGULAR_CORE_IMPORT_REGEX);
        // Or create a backup of the original
        expect(
            fs.exists(_(`/node_modules/@angular/common/esm5/src/common_module.js.__ivy_ngcc_bak`)))
            .toBe(false);

        // Creates new files
        expect(
            fs.readFile(_(`/node_modules/@angular/common/__ivy_ngcc__/esm5/src/common_module.js`)))
            .toMatch(ANGULAR_CORE_IMPORT_REGEX);

        // Copies over files (unchanged) that did not need compiling
        expect(fs.exists(_(`/node_modules/@angular/common/__ivy_ngcc__/esm5/src/version.js`)));
        expect(fs.readFile(_(`/node_modules/@angular/common/__ivy_ngcc__/esm5/src/version.js`)))
            .toEqual(fs.readFile(_(`/node_modules/@angular/common/esm5/src/version.js`)));

        // Overwrites .d.ts files (as usual)
        expect(fs.readFile(_(`/node_modules/@angular/common/common.d.ts`)))
            .toMatch(ANGULAR_CORE_IMPORT_REGEX);
        expect(fs.exists(_(`/node_modules/@angular/common/common.d.ts.__ivy_ngcc_bak`))).toBe(true);
      });
    });

    describe('logger', () => {
      it('should log info message to the console by default', () => {
        const consoleInfoSpy = spyOn(console, 'info');
        mainNgcc({basePath: '/node_modules', propertiesToConsider: ['esm2015']});
        expect(consoleInfoSpy)
            .toHaveBeenCalledWith('Compiling @angular/common/http : esm2015 as esm2015');
      });

      it('should use a custom logger if provided', () => {
        const logger = new MockLogger();
        mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['esm2015'], logger,
        });
        expect(logger.logs.info).toContain(['Compiling @angular/common/http : esm2015 as esm2015']);
      });
    });

    describe('with pathMappings', () => {
      it('should find and compile packages accessible via the pathMappings', () => {
        mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['es2015'],
          pathMappings: {paths: {'*': ['dist/*']}, baseUrl: '/'},
        });
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('local-package', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
      });
    });

    describe('with configuration files', () => {
      it('should process a configured deep-import as an entry-point', () => {
        loadTestFiles([
          {
            name: _('/ngcc.config.js'),
            contents: `module.exports = { packages: {
            'deep_import': {
              entryPoints: {
                './entry_point': { override: { typings: '../entry_point.d.ts', es2015: '../entry_point.js' } }
              }
            }
          }};`,
          },
          {
            name: _('/node_modules/deep_import/package.json'),
            contents: '{"name": "deep-import", "es2015": "./index.js", "typings": "./index.d.ts"}',
          },
          {
            name: _('/node_modules/deep_import/entry_point.js'),
            contents: `
              import {Component} from '@angular/core';
              @Component({selector: 'entry-point'})
              export class EntryPoint {}
            `,
          },
          {
            name: _('/node_modules/deep_import/entry_point.d.ts'),
            contents: `
              import {Component} from '@angular/core';
              @Component({selector: 'entry-point'})
              export class EntryPoint {}
            `,
          },
        ]);
        mainNgcc({
          basePath: '/node_modules',
          targetEntryPointPath: 'deep_import/entry_point',
          propertiesToConsider: ['es2015']
        });
        // The containing package is not processed
        expect(loadPackage('deep_import').__processed_by_ivy_ngcc__).toBeUndefined();
        // But the configured entry-point and its dependency (@angular/core) are processed.
        expect(loadPackage('deep_import/entry_point').__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
      });

      it('should not process ignored entry-points', () => {
        loadTestFiles([
          {
            name: _('/ngcc.config.js'),
            contents: `module.exports = { packages: {
            '@angular/core': {
              entryPoints: {
                './testing': {ignore: true}
              },
            },
            '@angular/common': {
              entryPoints: {
                '.': {ignore: true}
              },
            }
          }};`,
          },
        ]);
        mainNgcc({basePath: '/node_modules', propertiesToConsider: ['es2015']});
        // We process core but not core/testing.
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/core/testing').__processed_by_ivy_ngcc__).toBeUndefined();
        // We do not compile common but we do compile its sub-entry-points.
        expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__).toBeUndefined();
        expect(loadPackage('@angular/common/http').__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
      });
    });

    function loadPackage(
        packageName: string, basePath: AbsoluteFsPath = _('/node_modules')): EntryPointPackageJson {
      return JSON.parse(fs.readFile(fs.resolve(basePath, packageName, 'package.json')));
    }

    function initMockFileSystem(fs: FileSystem, testFiles: Folder) {
      if (fs instanceof MockFileSystem) {
        fs.init(testFiles);
      }

      // a random test package that no metadata.json file so not compiled by Angular.
      loadTestFiles([
        {
          name: _('/node_modules/test-package/package.json'),
          contents: '{"name": "test-package", "es2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {
          name: _('/node_modules/test-package/index.js'),
          contents:
              'import {AppModule} from "@angular/common"; export class MyApp extends AppModule {};'
        },
        {
          name: _('/node_modules/test-package/index.d.ts'),
          contents:
              'import {AppModule} from "@angular/common"; export declare class MyApp extends AppModule;'
        },
      ]);

      // An Angular package that has been built locally and stored in the `dist` directory.
      loadTestFiles([
        {
          name: _('/dist/local-package/package.json'),
          contents: '{"name": "local-package", "es2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/dist/local-package/index.metadata.json'), contents: 'DUMMY DATA'},
        {
          name: _('/dist/local-package/index.js'),
          contents:
              `import {Component} from '@angular/core';\nexport class AppComponent {};\nAppComponent.decorators = [\n{ type: Component, args: [{selector: 'app', template: '<h2>Hello</h2>'}] }\n];`
        },
        {
          name: _('/dist/local-package/index.d.ts'),
          contents: `export declare class AppComponent {};`
        },
      ]);
    }
  });
});
