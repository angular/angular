/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/path';
import {existsSync, readFileSync, readdirSync, statSync, writeFileSync} from 'fs';
import * as mockFs from 'mock-fs';
import {join} from 'path';
const Module = require('module');

import {getAngularPackagesFromRunfiles, resolveNpmTreeArtifact} from '../../../test/runfile_helpers';
import {mainNgcc} from '../../src/main';
import {markAsProcessed} from '../../src/packages/build_marker';
import {EntryPointJsonProperty, EntryPointPackageJson, SUPPORTED_FORMAT_PROPERTIES} from '../../src/packages/entry_point';
import {MockLogger} from '../helpers/mock_logger';

const _ = AbsoluteFsPath.from;

describe('ngcc main()', () => {
  beforeEach(createMockFileSystem);
  afterEach(restoreRealFileSystem);

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

  describe('with targetEntryPointPath', () => {
    it('should only compile the given package entry-point (and its dependencies).', () => {
      mainNgcc({basePath: '/node_modules', targetEntryPointPath: '@angular/common/http'});

      expect(loadPackage('@angular/common/http').__processed_by_ivy_ngcc__).toEqual({
        module: '0.0.0-PLACEHOLDER',
        es2015: '0.0.0-PLACEHOLDER',
        esm5: '0.0.0-PLACEHOLDER',
        esm2015: '0.0.0-PLACEHOLDER',
        fesm5: '0.0.0-PLACEHOLDER',
        fesm2015: '0.0.0-PLACEHOLDER',
        typings: '0.0.0-PLACEHOLDER',
      });
      // * `common` is a dependency of `common/http`, so is compiled.
      expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__).toEqual({
        module: '0.0.0-PLACEHOLDER',
        es2015: '0.0.0-PLACEHOLDER',
        esm5: '0.0.0-PLACEHOLDER',
        esm2015: '0.0.0-PLACEHOLDER',
        fesm5: '0.0.0-PLACEHOLDER',
        fesm2015: '0.0.0-PLACEHOLDER',
        typings: '0.0.0-PLACEHOLDER',
      });
      // * `core` is a dependency of `common`, so is compiled.
      expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
        module: '0.0.0-PLACEHOLDER',
        es2015: '0.0.0-PLACEHOLDER',
        esm5: '0.0.0-PLACEHOLDER',
        esm2015: '0.0.0-PLACEHOLDER',
        fesm5: '0.0.0-PLACEHOLDER',
        fesm2015: '0.0.0-PLACEHOLDER',
        typings: '0.0.0-PLACEHOLDER',
      });

      // * `common/testing` is not a dependency of `common/http` so is not compiled.
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
        expect(logger.logs.info).toContain(['The target entry-point has already been processed']);
      });

      it('should process the target if any `propertyToConsider` is not marked as processed', () => {
        const logger = new MockLogger();
        markPropertiesAsProcessed('@angular/common/http/testing', ['esm2015', 'fesm2015']);
        mainNgcc({
          basePath: '/node_modules',
          targetEntryPointPath: '@angular/common/http/testing',
          propertiesToConsider: ['fesm2015', 'esm5', 'esm2015'], logger,
        });
        expect(logger.logs.info).not.toContain([
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

           expect(logger.logs.info).not.toContain([
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

           expect(logger.logs.info).toContain([
             'The target entry-point has already been processed'
           ]);
         });
    });
  });


  function markPropertiesAsProcessed(packagePath: string, properties: EntryPointJsonProperty[]) {
    const basePath = '/node_modules';
    const targetPackageJsonPath = _(join(basePath, packagePath, 'package.json'));
    const targetPackage = loadPackage(packagePath);
    markAsProcessed(targetPackage, targetPackageJsonPath, 'typings');
    properties.forEach(property => markAsProcessed(targetPackage, targetPackageJsonPath, property));
  }


  describe('with propertiesToConsider', () => {
    it('should only compile the entry-point formats given in the `propertiesToConsider` list',
       () => {
         mainNgcc({
           basePath: '/node_modules',
           propertiesToConsider: ['main', 'esm5', 'module', 'fesm5'],
           logger: new MockLogger(),

         });

         // * the `main` property is UMD, which is not yet supported.
         // * none of the ES2015 formats are compiled as they are not on the `propertiesToConsider`
         // list.
         expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
           esm5: '0.0.0-PLACEHOLDER',
           module: '0.0.0-PLACEHOLDER',
           fesm5: '0.0.0-PLACEHOLDER',
           typings: '0.0.0-PLACEHOLDER',
         });
         expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__).toEqual({
           esm5: '0.0.0-PLACEHOLDER',
           module: '0.0.0-PLACEHOLDER',
           fesm5: '0.0.0-PLACEHOLDER',
           typings: '0.0.0-PLACEHOLDER',
         });
         expect(loadPackage('@angular/common/testing').__processed_by_ivy_ngcc__).toEqual({
           esm5: '0.0.0-PLACEHOLDER',
           module: '0.0.0-PLACEHOLDER',
           fesm5: '0.0.0-PLACEHOLDER',
           typings: '0.0.0-PLACEHOLDER',
         });
         expect(loadPackage('@angular/common/http').__processed_by_ivy_ngcc__).toEqual({
           esm5: '0.0.0-PLACEHOLDER',
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
        propertiesToConsider: ['main', 'module', 'fesm5', 'esm5'],
        compileAllFormats: false,
        logger: new MockLogger(),

      });
      // * The `main` is UMD, which is not yet supported, and so is not compiled.
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
      expect(readFileSync(`/node_modules/@angular/common/esm5/src/common_module.js`, 'utf8'))
          .not.toMatch(ANGULAR_CORE_IMPORT_REGEX);
      // Or create a backup of the original
      expect(existsSync(`/node_modules/@angular/common/esm5/src/common_module.js.__ivy_ngcc_bak`))
          .toBe(false);

      // Creates new files
      expect(readFileSync(
                 `/node_modules/@angular/common/__ivy_ngcc__/esm5/src/common_module.js`, 'utf8'))
          .toMatch(ANGULAR_CORE_IMPORT_REGEX);

      // Copies over files (unchanged) that did not need compiling
      expect(existsSync(`/node_modules/@angular/common/__ivy_ngcc__/esm5/src/version.js`));
      expect(readFileSync(`/node_modules/@angular/common/__ivy_ngcc__/esm5/src/version.js`, 'utf8'))
          .toEqual(readFileSync(`/node_modules/@angular/common/esm5/src/version.js`, 'utf8'));

      // Overwrites .d.ts files (as usual)
      expect(readFileSync(`/node_modules/@angular/common/common.d.ts`, 'utf8'))
          .toMatch(ANGULAR_CORE_IMPORT_REGEX);
      expect(existsSync(`/node_modules/@angular/common/common.d.ts.__ivy_ngcc_bak`)).toBe(true);
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
});


function createMockFileSystem() {
  mockFs({
    '/node_modules/@angular': loadAngularPackages(),
    '/node_modules/rxjs': loadDirectory(resolveNpmTreeArtifact('rxjs', 'index.js')),
    '/node_modules/tslib': loadDirectory(resolveNpmTreeArtifact('tslib', 'tslib.js')),
    '/node_modules/test-package': {
      'package.json': '{"name": "test-package", "es2015": "./index.js", "typings": "./index.d.ts"}',
      'index.js':
          'import {AppModule} from "@angular/common"; export class MyApp extends AppModule;',
      'index.d.s':
          'import {AppModule} from "@angular/common"; export declare class MyApp extends AppModule;',
    }
  });
  spyOn(Module, '_resolveFilename').and.callFake(mockResolve);
}

function restoreRealFileSystem() {
  mockFs.restore();
}


/** Load the built Angular packages into an in-memory structure. */
function loadAngularPackages(): Directory {
  const packagesDirectory: Directory = {};

  getAngularPackagesFromRunfiles().forEach(
      ({name, pkgPath}) => { packagesDirectory[name] = loadDirectory(pkgPath); });

  return packagesDirectory;
}

/**
 * Load real files from the filesystem into an "in-memory" structure,
 * which can be used with `mock-fs`.
 * @param directoryPath the path to the directory we want to load.
 */
function loadDirectory(directoryPath: string): Directory {
  const directory: Directory = {};

  readdirSync(directoryPath).forEach(item => {
    const itemPath = join(directoryPath, item);
    if (statSync(itemPath).isDirectory()) {
      directory[item] = loadDirectory(itemPath);
    } else {
      directory[item] = readFileSync(itemPath, 'utf-8');
    }
  });

  return directory;
}

interface Directory {
  [pathSegment: string]: string|Directory;
}

/**
 * A mock implementation of the node.js Module._resolveFilename function,
 * which we are spying on to support mocking out the file-system in these tests.
 *
 * @param request the path to a module that needs resolving.
 */
function mockResolve(request: string): string|null {
  if (existsSync(request)) {
    const stat = statSync(request);
    if (stat.isFile()) {
      return request;
    } else if (stat.isDirectory()) {
      const pIndex = mockResolve(request + '/index');
      if (pIndex && existsSync(pIndex)) {
        return pIndex;
      }
    }
  }
  for (const ext of ['.js', '.d.ts']) {
    if (existsSync(request + ext)) {
      return request + ext;
    }
  }
  if (request.indexOf('/node_modules') === 0) {
    // We already tried adding node_modules so give up.
    return null;
  } else {
    return mockResolve(join('/node_modules', request));
  }
}

function loadPackage(packageName: string): EntryPointPackageJson {
  return JSON.parse(readFileSync(`/node_modules/${packageName}/package.json`, 'utf8'));
}
