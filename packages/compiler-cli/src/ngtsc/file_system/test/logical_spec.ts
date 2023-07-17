/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscCompilerHost} from '../src/compiler_host';
import {absoluteFrom, getFileSystem} from '../src/helpers';
import {LogicalFileSystem, LogicalProjectPath} from '../src/logical';
import {runInEachFileSystem} from '../testing';

runInEachFileSystem(() => {
  describe('logical paths', () => {
    let _: typeof absoluteFrom;
    let host: NgtscCompilerHost;

    beforeEach(() => {
      _ = absoluteFrom;
      host = new NgtscCompilerHost(getFileSystem());
    });

    describe('LogicalFileSystem', () => {
      it('should determine logical paths in a single root file system', () => {
        const fs = new LogicalFileSystem([_('/test')], host);
        expect(fs.logicalPathOfFile(_('/test/foo/foo.ts')))
            .toEqual('/foo/foo' as LogicalProjectPath);
        expect(fs.logicalPathOfFile(_('/test/bar/bar.ts')))
            .toEqual('/bar/bar' as LogicalProjectPath);
        expect(fs.logicalPathOfFile(_('/not-test/bar.ts'))).toBeNull();
      });

      it('should determine logical paths in a multi-root file system', () => {
        const fs = new LogicalFileSystem([_('/test/foo'), _('/test/bar')], host);
        expect(fs.logicalPathOfFile(_('/test/foo/foo.ts'))).toEqual('/foo' as LogicalProjectPath);
        expect(fs.logicalPathOfFile(_('/test/bar/bar.ts'))).toEqual('/bar' as LogicalProjectPath);
      });

      it('should continue to work when one root is a child of another', () => {
        const fs = new LogicalFileSystem([_('/test'), _('/test/dist')], host);
        expect(fs.logicalPathOfFile(_('/test/foo.ts'))).toEqual('/foo' as LogicalProjectPath);
        expect(fs.logicalPathOfFile(_('/test/dist/foo.ts'))).toEqual('/foo' as LogicalProjectPath);
      });

      it('should always return `/` prefixed logical paths', () => {
        const rootFs = new LogicalFileSystem([_('/')], host);
        expect(rootFs.logicalPathOfFile(_('/foo/foo.ts')))
            .toEqual('/foo/foo' as LogicalProjectPath);

        const nonRootFs = new LogicalFileSystem([_('/test/')], host);
        expect(nonRootFs.logicalPathOfFile(_('/test/foo/foo.ts')))
            .toEqual('/foo/foo' as LogicalProjectPath);
      });

      it('should maintain casing of logical paths', () => {
        const fs = new LogicalFileSystem([_('/Test')], host);
        expect(fs.logicalPathOfFile(_('/Test/foo/Foo.ts')))
            .toEqual('/foo/Foo' as LogicalProjectPath);
        expect(fs.logicalPathOfFile(_('/Test/foo/foo.ts')))
            .toEqual('/foo/foo' as LogicalProjectPath);
        expect(fs.logicalPathOfFile(_('/Test/bar/bAR.ts')))
            .toEqual('/bar/bAR' as LogicalProjectPath);
      });

      it('should use case-sensitivity when matching rootDirs', () => {
        const fs = new LogicalFileSystem([_('/Test')], host);
        if (host.useCaseSensitiveFileNames()) {
          expect(fs.logicalPathOfFile(_('/test/car/CAR.ts'))).toBe(null);
        } else {
          expect(fs.logicalPathOfFile(_('/test/car/CAR.ts')))
              .toEqual('/car/CAR' as LogicalProjectPath);
        }
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

      it('should maintain casing in relative path between logical files', () => {
        const res = LogicalProjectPath.relativePathBetween(
            '/fOO' as LogicalProjectPath, '/bAR' as LogicalProjectPath);
        expect(res).toEqual('./bAR');
      });
    });
  });
});
