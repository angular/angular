/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LogicalFileSystem, LogicalProjectPath} from '../src/logical';
import {AbsoluteFsPath} from '../src/types';

describe('logical paths', () => {
  describe('LogicalFileSystem', () => {
    it('should determine logical paths in a single root file system', () => {
      const fs = new LogicalFileSystem([abs('/test')]);
      expect(fs.logicalPathOfFile(abs('/test/foo/foo.ts')))
          .toEqual('/foo/foo' as LogicalProjectPath);
      expect(fs.logicalPathOfFile(abs('/test/bar/bar.ts')))
          .toEqual('/bar/bar' as LogicalProjectPath);
      expect(fs.logicalPathOfFile(abs('/not-test/bar.ts'))).toBeNull();
    });

    it('should determine logical paths in a multi-root file system', () => {
      const fs = new LogicalFileSystem([abs('/test/foo'), abs('/test/bar')]);
      expect(fs.logicalPathOfFile(abs('/test/foo/foo.ts'))).toEqual('/foo' as LogicalProjectPath);
      expect(fs.logicalPathOfFile(abs('/test/bar/bar.ts'))).toEqual('/bar' as LogicalProjectPath);
    });

    it('should continue to work when one root is a child of another', () => {
      const fs = new LogicalFileSystem([abs('/test'), abs('/test/dist')]);
      expect(fs.logicalPathOfFile(abs('/test/foo.ts'))).toEqual('/foo' as LogicalProjectPath);
      expect(fs.logicalPathOfFile(abs('/test/dist/foo.ts'))).toEqual('/foo' as LogicalProjectPath);
    });

    it('should always return `/` prefixed logical paths', () => {
      const rootFs = new LogicalFileSystem([abs('/')]);
      expect(rootFs.logicalPathOfFile(abs('/foo/foo.ts')))
          .toEqual('/foo/foo' as LogicalProjectPath);

      const nonRootFs = new LogicalFileSystem([abs('/test/')]);
      expect(nonRootFs.logicalPathOfFile(abs('/test/foo/foo.ts')))
          .toEqual('/foo/foo' as LogicalProjectPath);
    });
  });

  describe('utilities', () => {
    it('should give a relative path between two adjacent logical files', () => {
      const res = LogicalProjectPath.relativePathBetween(
          '/foo' as LogicalProjectPath, '/bar' as LogicalProjectPath);
      expect(res).toEqual('./bar');
    });

    it('should give a relative path between two non-adjacent logical files', () => {
      const res = LogicalProjectPath.relativePathBetween(
          '/foo/index' as LogicalProjectPath, '/bar/index' as LogicalProjectPath);
      expect(res).toEqual('../bar/index');
    });
  });
});

function abs(file: string): AbsoluteFsPath {
  return AbsoluteFsPath.from(file);
}
