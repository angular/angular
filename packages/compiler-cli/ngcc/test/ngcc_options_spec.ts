/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../src/ngtsc/logging/testing';

import {clearTsConfigCache, getSharedSetup, NgccOptions} from '../src/ngcc_options';



runInEachFileSystem(() => {
  let fs: FileSystem;
  let _abs: typeof absoluteFrom;
  let projectPath: AbsoluteFsPath;

  beforeEach(() => {
    fs = getFileSystem();
    _abs = absoluteFrom;
    projectPath = _abs('/project');
  });

  describe('getSharedSetup()', () => {
    let pathToProjectTsConfig: AbsoluteFsPath;
    let pathToCustomTsConfig: AbsoluteFsPath;

    beforeEach(() => {
      clearTsConfigCache();
      pathToProjectTsConfig = fs.resolve(projectPath, 'tsconfig.json');
      fs.ensureDir(fs.dirname(pathToProjectTsConfig));
      fs.writeFile(pathToProjectTsConfig, '{"files": ["src/index.ts"]}');
      pathToCustomTsConfig = _abs('/path/to/tsconfig.json');
      fs.ensureDir(fs.dirname(pathToCustomTsConfig));
      fs.writeFile(pathToCustomTsConfig, '{"files": ["custom/index.ts"]}');
    });

    it('should load the tsconfig.json at the project root if tsConfigPath is `undefined`', () => {
      const setup = getSharedSetup({...createOptions()});
      expect(setup.tsConfigPath).toBeUndefined();
      expect(setup.tsConfig?.rootNames).toEqual([fs.resolve(projectPath, 'src/index.ts')]);
    });

    it('should load a specific tsconfig.json if tsConfigPath is a string', () => {
      const setup = getSharedSetup({...createOptions(), tsConfigPath: pathToCustomTsConfig});
      expect(setup.tsConfigPath).toEqual(pathToCustomTsConfig);
      expect(setup.tsConfig?.rootNames).toEqual([_abs('/path/to/custom/index.ts')]);
    });

    it('should not load a tsconfig.json if tsConfigPath is `null`', () => {
      const setup = getSharedSetup({...createOptions(), tsConfigPath: null});
      expect(setup.tsConfigPath).toBe(null);
      expect(setup.tsConfig).toBe(null);
    });
  });

  /**
   * This function creates an object that contains the minimal required properties for NgccOptions.
   */
  function createOptions(): NgccOptions {
    return {
      async: false,
      basePath: fs.resolve(projectPath, 'node_modules'),
      propertiesToConsider: ['es2015'],
      compileAllFormats: false,
      createNewEntryPointFormats: false,
      logger: new MockLogger(),
      fileSystem: getFileSystem(),
      errorOnFailedEntryPoint: true,
      enableI18nLegacyMessageIdFormat: true,
      invalidateEntryPointManifest: false,
    };
  }
});
