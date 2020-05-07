/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
});
