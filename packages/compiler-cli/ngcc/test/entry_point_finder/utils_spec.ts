/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';

import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {getBasePaths} from '../../src/entry_point_finder/utils';

runInEachFileSystem(() => {
  let _: typeof absoluteFrom;
  let logger: MockLogger;

  beforeEach(() => {
    _ = absoluteFrom;
    logger = new MockLogger();
  });

  describe('getBasePaths', () => {
    it('should just return the `sourceDirectory if there are no `pathMappings', () => {
      const sourceDirectory = _('/path/to/project/node_modules');
      const basePaths = getBasePaths(logger, sourceDirectory, undefined);
      expect(basePaths).toEqual([sourceDirectory]);
    });

    it('should use each path mapping prefix', () => {
      const projectDirectory = _('/path/to/project');
      const fs = getFileSystem();
      fs.ensureDir(fs.resolve(projectDirectory, 'dist-1'));
      fs.ensureDir(fs.resolve(projectDirectory, 'sub-folder/dist-2'));
      fs.ensureDir(fs.resolve(projectDirectory, 'libs'));

      const sourceDirectory = _('/path/to/project/node_modules');
      const pathMappings = {
        baseUrl: projectDirectory,
        paths: {'@dist': ['dist-1', 'sub-folder/dist-2'], '@lib/*': ['libs/*']}
      };
      const basePaths = getBasePaths(logger, sourceDirectory, pathMappings);
      expect(basePaths).toEqual([
        sourceDirectory,
        fs.resolve(projectDirectory, 'dist-1'),
        fs.resolve(projectDirectory, 'libs'),
        fs.resolve(projectDirectory, 'sub-folder/dist-2'),
      ]);
    });

    it('should find base-paths that start with a wildcard prefix', () => {
      const projectDirectory = _('/path/to/project');
      const fs = getFileSystem();
      fs.ensureDir(fs.resolve(projectDirectory, 'dist'));
      fs.ensureDir(fs.resolve(projectDirectory, 'dist-a'));
      fs.ensureDir(fs.resolve(projectDirectory, 'dist-b'));

      const sourceDirectory = _('/path/to/project/node_modules');
      const pathMappings = {baseUrl: projectDirectory, paths: {'@dist*': ['dist*']}};
      const basePaths = getBasePaths(logger, sourceDirectory, pathMappings);
      expect(basePaths).toEqual([
        sourceDirectory,
        fs.resolve(projectDirectory, 'dist'),
        fs.resolve(projectDirectory, 'dist-a'),
        fs.resolve(projectDirectory, 'dist-b'),
      ]);
    });

    it('should not be confused by folders that have the same starting string', () => {
      const projectDirectory = _('/path/to/project');
      const fs = getFileSystem();
      fs.ensureDir(fs.resolve(projectDirectory, 'a/b'));
      fs.ensureDir(fs.resolve(projectDirectory, 'a/b-2'));
      fs.ensureDir(fs.resolve(projectDirectory, 'a/b/c'));

      const sourceDirectory = _('/path/to/project/node_modules');
      const pathMappings = {baseUrl: projectDirectory, paths: {'@dist': ['a/b', 'a/b-2', 'a/b/c']}};
      const basePaths = getBasePaths(logger, sourceDirectory, pathMappings);
      expect(basePaths).toEqual([
        sourceDirectory,
        fs.resolve(projectDirectory, 'a/b'),
        fs.resolve(projectDirectory, 'a/b-2'),
      ]);
    });

    it('should discard paths that are already contained by another path', () => {
      const projectDirectory = _('/path/to/project');
      const fs = getFileSystem();
      fs.ensureDir(fs.resolve(projectDirectory, 'dist-1'));
      fs.ensureDir(fs.resolve(projectDirectory, 'dist-1/sub-folder'));
      fs.ensureDir(fs.resolve(projectDirectory, 'node_modules/libs'));

      const sourceDirectory = _('/path/to/project/node_modules');
      const pathMappings = {
        baseUrl: projectDirectory,
        paths: {'@dist': ['dist-1', 'dist-1/sub-folder'], '@lib/*': ['node_modules/libs/*']}
      };
      const basePaths = getBasePaths(logger, sourceDirectory, pathMappings);
      expect(basePaths).toEqual([
        sourceDirectory,
        fs.resolve(projectDirectory, 'dist-1'),
      ]);
    });

    it('should use the containing directory of path mapped files', () => {
      const projectDirectory = _('/path/to/project');
      const fs = getFileSystem();
      fs.ensureDir(fs.resolve(projectDirectory, 'dist-1'));
      fs.writeFile(fs.resolve(projectDirectory, 'dist-1/file.js'), 'dummy content');

      const sourceDirectory = _('/path/to/project/node_modules');
      const pathMappings = {baseUrl: projectDirectory, paths: {'@dist': ['dist-1/file.js']}};
      const basePaths = getBasePaths(logger, sourceDirectory, pathMappings);
      expect(basePaths).toEqual([
        sourceDirectory,
        fs.resolve(projectDirectory, 'dist-1'),
      ]);
    });

    it('should always include the `sourceDirectory` if it is a node_modules directory in the returned basePaths, even if it is contained by another basePath',
       () => {
         const projectDirectory = _('/path/to/project');
         const sourceDirectory = _('/path/to/project/node_modules');
         const fs = getFileSystem();
         fs.ensureDir(fs.resolve(sourceDirectory));

         const pathMappings = {baseUrl: projectDirectory, paths: {'*': ['./*']}};
         const basePaths = getBasePaths(logger, sourceDirectory, pathMappings);
         expect(basePaths).toEqual([
           sourceDirectory,
           projectDirectory,
         ]);
       });

    it('should log a warning if baseUrl is the root path', () => {
      const fs = getFileSystem();
      fs.ensureDir(fs.resolve('/dist'));

      const sourceDirectory = _('/path/to/project/node_modules');
      const pathMappings = {baseUrl: _('/'), paths: {'@dist': ['dist']}};
      const basePaths = getBasePaths(logger, sourceDirectory, pathMappings);
      expect(basePaths).toEqual([
        fs.resolve('/dist'),
        sourceDirectory,
      ]);
      expect(logger.logs.warn).toEqual([
        [`The provided pathMappings baseUrl is the root path ${_('/')}.\n` +
         `This is likely to mess up how ngcc finds entry-points and is probably not correct.\n` +
         `Please check your path mappings configuration such as in the tsconfig.json file.`]
      ]);
    });

    it('should discard basePaths that do not exists and log a debug message', () => {
      const projectDirectory = _('/path/to/project');
      const fs = getFileSystem();
      fs.ensureDir(fs.resolve(projectDirectory, 'dist-1'));
      fs.ensureDir(fs.resolve(projectDirectory, 'sub-folder'));

      const sourceDirectory = _('/path/to/project/node_modules');
      const pathMappings = {
        baseUrl: projectDirectory,
        paths: {'@dist': ['dist-1', 'sub-folder/dist-2'], '@lib/*': ['libs/*']}
      };
      const basePaths = getBasePaths(logger, sourceDirectory, pathMappings);
      expect(basePaths).toEqual([
        sourceDirectory,
        fs.resolve(projectDirectory, 'dist-1'),
      ]);
      expect(logger.logs.debug).toEqual([
        [`The basePath "${
             fs.resolve(projectDirectory, 'sub-folder/dist-2')}" computed from baseUrl "${
             projectDirectory}" and path mapping "sub-folder/dist-2" does not exist in the file-system.\n` +
         `It will not be scanned for entry-points.`],
        [`The basePath "${fs.resolve(projectDirectory, 'libs')}" computed from baseUrl "${
             projectDirectory}" and path mapping "libs/*" does not exist in the file-system.\n` +
         `It will not be scanned for entry-points.`],
      ]);
    });
  });
});
