/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';
import {NgtscCompilerHost} from '../src/compiler_host';
import {absoluteFrom, getFileSystem} from '../src/helpers';
import {runInEachFileSystem} from '../testing';

runInEachFileSystem(() => {
  describe('NgtscCompilerHost', () => {
    describe('fileExists()', () => {
      it('should return `false` for an existing directory', () => {
        const directory = absoluteFrom('/a/b/c');
        const fs = getFileSystem();
        fs.ensureDir(directory);
        const host = new NgtscCompilerHost(fs);
        expect(host.fileExists(directory)).toBe(false);
      });
    });

    describe('readFile()', () => {
      it('should return `undefined` for an existing directory', () => {
        const directory = absoluteFrom('/a/b/c');
        const fs = getFileSystem();
        fs.ensureDir(directory);
        const host = new NgtscCompilerHost(fs);
        expect(host.readFile(directory)).toBe(undefined);
      });
    });

    describe('getSourceFile()', () => {
      it('should return `undefined` for an existing directory', () => {
        const directory = absoluteFrom('/a/b/c');
        const fs = getFileSystem();
        fs.ensureDir(directory);
        const host = new NgtscCompilerHost(fs);
        expect(host.getSourceFile(directory, ts.ScriptTarget.ES2015)).toBe(undefined);
      });
    });

    describe('useCaseSensitiveFileNames()', () => {
      it('should return the same as `FileSystem.isCaseSensitive()', () => {
        const directory = absoluteFrom('/a/b/c');
        const fs = getFileSystem();
        fs.ensureDir(directory);
        const host = new NgtscCompilerHost(fs);
        expect(host.useCaseSensitiveFileNames()).toEqual(fs.isCaseSensitive());
      });
    });

    describe('getCanonicalFileName()', () => {
      it('should return the original filename if FS is case-sensitive or lower case otherwise',
         () => {
           const directory = absoluteFrom('/a/b/c');
           const fs = getFileSystem();
           fs.ensureDir(directory);
           const host = new NgtscCompilerHost(fs);
           expect(host.getCanonicalFileName(('AbCd.ts')))
               .toEqual(fs.isCaseSensitive() ? 'AbCd.ts' : 'abcd.ts');
         });
    });
  });
});
