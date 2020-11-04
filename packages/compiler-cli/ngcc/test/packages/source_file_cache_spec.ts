/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFrom, FileSystem, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {EntryPointFileCache, isAngularDts, isDefaultLibrary, SharedFileCache} from '../../src/packages/source_file_cache';

runInEachFileSystem(() => {
  describe('caching', () => {
    let _: typeof absoluteFrom;
    let fs: FileSystem;
    beforeEach(() => {
      _ = absoluteFrom;
      fs = getFileSystem();
      loadTestFiles([
        {
          name: _('/node_modules/typescript/lib/lib.es5.d.ts'),
          contents: `export declare interface Array {}`,
        },
        {
          name: _('/node_modules/typescript/lib/lib.dom.d.ts'),
          contents: `export declare interface Window {}`,
        },
        {
          name: _('/node_modules/@angular/core/core.d.ts'),
          contents: `export declare interface Component {}`,
        },
        {
          name: _('/node_modules/@angular/common/common.d.ts'),
          contents: `export declare interface NgIf {}`,
        },
        {
          name: _('/index.ts'),
          contents: `export const index = true;`,
        },
        {
          name: _('/main.ts'),
          contents: `export const main = true;`,
        },
      ]);
    });

    describe('SharedFileCache', () => {
      it('should cache a parsed source file for default libraries', () => {
        const cache = new SharedFileCache(fs);

        const libEs5 = cache.getCachedSourceFile('/node_modules/typescript/lib/lib.es5.d.ts')!;
        expect(libEs5).not.toBeUndefined();
        expect(libEs5.text).toContain('Array');

        const libDom = cache.getCachedSourceFile('/node_modules/typescript/lib/lib.dom.d.ts')!;
        expect(libDom).not.toBeUndefined();
        expect(libDom.text).toContain('Window');

        const libEs5_2 = cache.getCachedSourceFile('/node_modules/typescript/lib/lib.es5.d.ts')!;
        expect(libEs5_2).toBe(libEs5);

        const libDom_2 = cache.getCachedSourceFile('/node_modules/typescript/lib/lib.dom.d.ts')!;
        expect(libDom_2).toBe(libDom);
      });

      it('should cache a parsed source file for @angular scoped packages', () => {
        const cache = new SharedFileCache(fs);

        const core = cache.getCachedSourceFile('/node_modules/@angular/core/core.d.ts')!;
        expect(core).not.toBeUndefined();
        expect(core.text).toContain('Component');

        const common = cache.getCachedSourceFile('/node_modules/@angular/common/common.d.ts')!;
        expect(common).not.toBeUndefined();
        expect(common.text).toContain('NgIf');

        const core_2 = cache.getCachedSourceFile('/node_modules/@angular/core/core.d.ts')!;
        expect(core_2).toBe(core);

        const common_2 = cache.getCachedSourceFile('/node_modules/@angular/common/common.d.ts')!;
        expect(common_2).toBe(common);
      });

      it('should reparse @angular d.ts files when they change', () => {
        const cache = new SharedFileCache(fs);

        const core = cache.getCachedSourceFile('/node_modules/@angular/core/core.d.ts')!;
        expect(core).not.toBeUndefined();
        expect(core.text).toContain('Component');

        const common = cache.getCachedSourceFile('/node_modules/@angular/common/common.d.ts')!;
        expect(common).not.toBeUndefined();
        expect(common.text).toContain('NgIf');

        fs.writeFile(
            _('/node_modules/@angular/core/core.d.ts'), `export declare interface Directive {}`);

        const core_2 = cache.getCachedSourceFile('/node_modules/@angular/core/core.d.ts')!;
        expect(core_2).not.toBe(core);
        expect(core_2.text).toContain('Directive');

        const core_3 = cache.getCachedSourceFile('/node_modules/@angular/core/core.d.ts')!;
        expect(core_3).toBe(core_2);

        const common_2 = cache.getCachedSourceFile('/node_modules/@angular/common/common.d.ts')!;
        expect(common_2).toBe(common);
      });

      it('should not cache files that are not default library files inside of the typescript package',
         () => {
           const cache = new SharedFileCache(fs);

           expect(cache.getCachedSourceFile('/node_modules/typescript/lib/typescript.d.ts'))
               .toBeUndefined();
           expect(cache.getCachedSourceFile('/typescript/lib.es5.d.ts')).toBeUndefined();
         });
    });

    describe('isDefaultLibrary()', () => {
      it('should accept lib files inside of the typescript package', () => {
        expect(isDefaultLibrary(_('/node_modules/typescript/lib/lib.es5.d.ts'), fs)).toBe(true);
        expect(isDefaultLibrary(_('/node_modules/typescript/lib/lib.dom.d.ts'), fs)).toBe(true);
        expect(isDefaultLibrary(_('/node_modules/typescript/lib/lib.es2015.core.d.ts'), fs))
            .toBe(true);
        expect(isDefaultLibrary(_('/root/node_modules/typescript/lib/lib.es5.d.ts'), fs))
            .toBe(true);
      });
      it('should reject non lib files inside of the typescript package', () => {
        expect(isDefaultLibrary(_('/node_modules/typescript/lib/typescript.d.ts'), fs)).toBe(false);
        expect(isDefaultLibrary(_('/node_modules/typescript/lib/lib.es5.ts'), fs)).toBe(false);
        expect(isDefaultLibrary(_('/node_modules/typescript/lib/lib.d.ts'), fs)).toBe(false);
        expect(isDefaultLibrary(_('/node_modules/typescript/lib.es5.d.ts'), fs)).toBe(false);
      });
      it('should reject lib files outside of the typescript package', () => {
        expect(isDefaultLibrary(_('/node_modules/ttypescript/lib/lib.es5.d.ts'), fs)).toBe(false);
        expect(isDefaultLibrary(_('/node_modules/ttypescript/lib/lib.es5.d.ts'), fs)).toBe(false);
        expect(isDefaultLibrary(_('/typescript/lib/lib.es5.d.ts'), fs)).toBe(false);
      });
    });

    describe('isAngularDts()', () => {
      it('should accept .d.ts files inside of the @angular scope', () => {
        expect(isAngularDts(_('/node_modules/@angular/core/core.d.ts'), fs)).toBe(true);
        expect(isAngularDts(_('/node_modules/@angular/common/common.d.ts'), fs)).toBe(true);
      });
      it('should reject non-.d.ts files inside @angular scoped packages', () => {
        expect(isAngularDts(_('/node_modules/@angular/common/src/common.ts'), fs)).toBe(false);
      });
      it('should reject .d.ts files nested deeply inside @angular scoped packages', () => {
        expect(isAngularDts(_('/node_modules/@angular/common/src/common.d.ts'), fs)).toBe(false);
      });
      it('should reject .d.ts files directly inside the @angular scope', () => {
        expect(isAngularDts(_('/node_modules/@angular/common.d.ts'), fs)).toBe(false);
      });
      it('should reject files that are not inside node_modules', () => {
        expect(isAngularDts(_('/@angular/core/core.d.ts'), fs)).toBe(false);
      });
    });

    describe('EntryPointFileCache', () => {
      let sharedFileCache: SharedFileCache;
      beforeEach(() => {
        sharedFileCache = new SharedFileCache(fs);
      });

      it('should prefer source files cached in SharedFileCache', () => {
        const cache1 = new EntryPointFileCache(fs, sharedFileCache);
        const libEs5_1 = cache1.getCachedSourceFile(
            '/node_modules/typescript/lib/lib.es5.d.ts', ts.ScriptTarget.ESNext)!;
        expect(libEs5_1).not.toBeUndefined();
        expect(libEs5_1.text).toContain('Array');
        expect(libEs5_1.languageVersion).toBe(ts.ScriptTarget.ES2015);

        const cache2 = new EntryPointFileCache(fs, sharedFileCache);
        const libEs5_2 = cache2.getCachedSourceFile(
            '/node_modules/typescript/lib/lib.es5.d.ts', ts.ScriptTarget.ESNext)!;
        expect(libEs5_1).toBe(libEs5_2);
      });

      it('should cache source files that are not default library files', () => {
        const cache = new EntryPointFileCache(fs, sharedFileCache);
        const index = cache.getCachedSourceFile('/index.ts', ts.ScriptTarget.ESNext)!;
        expect(index).not.toBeUndefined();
        expect(index.text).toContain('index');
        expect(index.languageVersion).toBe(ts.ScriptTarget.ESNext);

        const main = cache.getCachedSourceFile('/main.ts', ts.ScriptTarget.ESNext)!;
        expect(main).not.toBeUndefined();
        expect(main.text).toContain('main');
        expect(main.languageVersion).toBe(ts.ScriptTarget.ESNext);

        const index_2 = cache.getCachedSourceFile('/index.ts', ts.ScriptTarget.ESNext)!;
        expect(index_2).toBe(index);

        const main_2 = cache.getCachedSourceFile('/main.ts', ts.ScriptTarget.ESNext)!;
        expect(main_2).toBe(main);
      });

      it('should not share non-library files across multiple cache instances', () => {
        const cache1 = new EntryPointFileCache(fs, sharedFileCache);
        const cache2 = new EntryPointFileCache(fs, sharedFileCache);

        const index1 = cache1.getCachedSourceFile('/index.ts', ts.ScriptTarget.ESNext)!;
        const index2 = cache2.getCachedSourceFile('/index.ts', ts.ScriptTarget.ESNext)!;
        expect(index1).not.toBe(index2);
      });

      it('should return undefined if the file does not exist', () => {
        const cache = new EntryPointFileCache(fs, sharedFileCache);
        expect(cache.getCachedSourceFile('/nonexistent.ts', ts.ScriptTarget.ESNext))
            .toBeUndefined();
      });

      it('should return undefined if the path is a directory', () => {
        const cache = new EntryPointFileCache(fs, sharedFileCache);
        expect(cache.getCachedSourceFile('/node_modules', ts.ScriptTarget.ESNext)).toBeUndefined();
      });
    });
  });
});
