/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as os from 'os';

import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../src/ngtsc/logging/testing';

import {clearTsConfigCache, getMaxNumberOfWorkers, getSharedSetup, NgccOptions} from '../src/ngcc_options';



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

    it('should warn about a solution-style tsconfig if the tsConfigPath is inferred', () => {
      fs.writeFile(fs.resolve(projectPath, 'tsconfig.app.json'), '{"files": ["src/index.ts"]}');
      fs.writeFile(fs.resolve(projectPath, 'tsconfig.test.json'), '{"files": ["src/test.ts"]}');
      fs.writeFile(pathToProjectTsConfig, JSON.stringify({
        'files': [],
        'references': [
          {'path': 'tsconfig.app.json'},
          {'path': 'tsconfig.test.json'},
        ]
      }));
      const setup = getSharedSetup({...createOptions()});
      expect(setup.tsConfigPath).toBeUndefined();
      expect(setup.tsConfig?.rootNames).toEqual([]);
      expect((setup.logger as MockLogger).logs.warn).toEqual([[
        `The inferred tsconfig file "${
            pathToProjectTsConfig}" appears to be "solution-style" since it contains no root files but does contain project references.\n` +
        `This is probably not wanted, since ngcc is unable to infer settings like "paths" mappings from such a file.\n` +
        `Perhaps you should have explicitly specified one of the referenced projects using the --tsconfig option. For example:\n\n` +
        `  ngcc ... --tsconfig "tsconfig.app.json"\n` +
        `  ngcc ... --tsconfig "tsconfig.test.json"\n` +
        `\nFind out more about solution-style tsconfig at https://devblogs.microsoft.com/typescript/announcing-typescript-3-9/#solution-style-tsconfig.\n` +
        `If you did intend to use this file, then you can hide this warning by providing it explicitly:\n\n` +
        `  ngcc ... --tsconfig "tsconfig.json"`
      ]]);
    });

    it('should not warn about a solution-style tsconfig if the tsConfigPath is explicit', () => {
      fs.writeFile(fs.resolve(projectPath, 'tsconfig.app.json'), '{"files": ["src/index.ts"]}');
      fs.writeFile(fs.resolve(projectPath, 'tsconfig.test.json'), '{"files": ["src/test.ts"]}');
      fs.writeFile(pathToProjectTsConfig, JSON.stringify({
        'files': [],
        'references': [
          {'path': 'tsconfig.app.json'},
          {'path': 'tsconfig.test.json'},
        ]
      }));
      const setup = getSharedSetup({...createOptions(), tsConfigPath: pathToProjectTsConfig});
      expect(setup.tsConfigPath).toEqual(pathToProjectTsConfig);
      expect(setup.tsConfig?.rootNames).toEqual([]);
      expect((setup.logger as MockLogger).logs.warn).toEqual([]);
    });

    it('should not modify `compileAllFormats` if `typingsOnly` is falsy', () => {
      let setup = getSharedSetup({...createOptions(), compileAllFormats: true, typingsOnly: false});
      expect(setup.typingsOnly).toBe(false);
      expect(setup.compileAllFormats).toBe(true);

      setup = getSharedSetup({...createOptions(), compileAllFormats: true});
      expect(setup.typingsOnly).toBe(false);
      expect(setup.compileAllFormats).toBe(true);
    });

    it('should force `compileAllFormats` to false if `typingsOnly` is true', () => {
      const setup =
          getSharedSetup({...createOptions(), compileAllFormats: true, typingsOnly: true});
      expect(setup.typingsOnly).toBe(true);
      expect(setup.compileAllFormats).toBe(false);
    });
  });

  describe('getMaxNumberOfWorkers', () => {
    let processEnv: NodeJS.ProcessEnv;
    let cpuSpy: jasmine.Spy;
    beforeEach(() => {
      processEnv = process.env;
      process.env = {...process.env};
      cpuSpy = spyOn(os, 'cpus');
    });
    afterEach(() => {
      process.env = processEnv;
    });

    it('should use NGCC_MAX_WORKERS environment variable if set', () => {
      process.env.NGCC_MAX_WORKERS = '16';
      expect(getMaxNumberOfWorkers()).toBe(16);
      process.env.NGCC_MAX_WORKERS = '8';
      expect(getMaxNumberOfWorkers()).toBe(8);
      process.env.NGCC_MAX_WORKERS = ' 8 ';
      expect(getMaxNumberOfWorkers()).toBe(8);
    });

    it('should throw an error if NGCC_MAX_WORKERS is less than 1', () => {
      process.env.NGCC_MAX_WORKERS = '0';
      expect(() => getMaxNumberOfWorkers())
          .toThrow(new Error('NGCC_MAX_WORKERS should be at least 1.'));
      process.env.NGCC_MAX_WORKERS = '-1';
      expect(() => getMaxNumberOfWorkers())
          .toThrow(new Error('NGCC_MAX_WORKERS should be at least 1.'));
    });

    it('should throw an error if NGCC_MAX_WORKERS is not an integer', () => {
      process.env.NGCC_MAX_WORKERS = 'a';
      expect(() => getMaxNumberOfWorkers())
          .toThrow(new Error('NGCC_MAX_WORKERS should be an integer.'));
      process.env.NGCC_MAX_WORKERS = '1.5';
      expect(() => getMaxNumberOfWorkers())
          .toThrow(new Error('NGCC_MAX_WORKERS should be an integer.'));
      process.env.NGCC_MAX_WORKERS = '-';
      expect(() => getMaxNumberOfWorkers())
          .toThrow(new Error('NGCC_MAX_WORKERS should be an integer.'));
    });

    it('should fallback to the number of cpus, minus one (for the master process), with a maximum of 4 workers',
       () => {
         simulateNumberOfCpus(1);
         expect(getMaxNumberOfWorkers()).toBe(1);
         simulateNumberOfCpus(2);
         expect(getMaxNumberOfWorkers()).toBe(1);
         simulateNumberOfCpus(4);
         expect(getMaxNumberOfWorkers()).toBe(3);
         simulateNumberOfCpus(6);
         expect(getMaxNumberOfWorkers()).toBe(4);
         simulateNumberOfCpus(8);
         expect(getMaxNumberOfWorkers()).toBe(4);
       });

    function simulateNumberOfCpus(cpus: number): void {
      cpuSpy.and.returnValue(new Array(cpus).fill({model: 'Mock CPU'} as any));
    }
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
