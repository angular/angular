/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FileSystem, getFileSystem} from '../../file_system/index.js';
import {runInEachFileSystem} from '../../file_system/testing/index.js';
import {getRootDirs} from '../src/typescript.js';

runInEachFileSystem(() => {
  let fs: FileSystem;

  beforeEach(() => {
    fs = getFileSystem();
  });

  describe('typescript', () => {
    it('should allow relative root directories', () => {
      const mockCompilerHost = {
        getCanonicalFileName: (val: string) => val,
        getCurrentDirectory: () => '/fs-root/projects'
      };
      const result = getRootDirs(mockCompilerHost, {rootDir: './test-project-root'});
      expect(result).toEqual([fs.resolve('/fs-root/projects/test-project-root')]);
    });
  });
});
