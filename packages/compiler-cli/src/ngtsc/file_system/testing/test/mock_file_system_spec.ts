/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getFileSystem} from '../../src/helpers';
import {FileSystem} from '../../src/types';
import {runInEachFileSystem} from '../src/test_helper';

runInEachFileSystem(() => {
  describe('MockFileSystem', () => {
    let fs: FileSystem;

    beforeEach(() => {
      fs = getFileSystem();
    });

    it('should support symlinks', () => {
      const targetPath = fs.resolve('/link/target');
      const symlinkPath = fs.resolve('/src/symlink');
      const packageJsonInTarget = fs.resolve(targetPath, 'package.json');
      const packageJsonUsingSymlink = fs.resolve(symlinkPath, 'package.json');

      fs.ensureDir(targetPath);
      fs.ensureDir(fs.resolve('/src'));
      fs.writeFile(packageJsonInTarget, '{}');
      fs.symlink(targetPath, symlinkPath);

      expect(fs.exists(packageJsonUsingSymlink)).toBe(true);
      expect(fs.exists(fs.resolve(symlinkPath, 'unknown.json'))).toBe(false);
      expect(fs.readFile(packageJsonInTarget)).toBe('{}');

      expect(fs.realpath(packageJsonUsingSymlink)).toBe(packageJsonInTarget);
      expect(fs.realpath(packageJsonInTarget)).toBe(packageJsonInTarget);

      expect(fs.stat(symlinkPath).isSymbolicLink()).toBe(false);
      expect(fs.lstat(symlinkPath).isSymbolicLink()).toBe(true);

      expect(fs.stat(packageJsonUsingSymlink).isSymbolicLink()).toBe(false);
      expect(fs.lstat(packageJsonUsingSymlink).isSymbolicLink()).toBe(false);
    });
  });
});
