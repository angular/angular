/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFrom as _, AbsoluteFsPath, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {makeProgram} from '../../testing';
import {ShimAdapter} from '../src/adapter';
import {ShimReferenceTagger} from '../src/reference_tagger';

import {TestShimGenerator} from './util';

runInEachFileSystem(() => {
  describe('ShimReferenceTagger', () => {
    it('should tag a source file with its appropriate shims', () => {
      const tagger = new ShimReferenceTagger(['test1', 'test2']);

      const fileName = _('/file.ts');
      const sf = makeArbitrarySf(fileName);
      expect(sf.referencedFiles).toEqual([]);

      tagger.tag(sf);
      expectReferencedFiles(sf, ['/file.test1.ts', '/file.test2.ts']);
    });

    it('should not tag .d.ts files', () => {
      const tagger = new ShimReferenceTagger(['test1', 'test2']);

      const fileName = _('/file.d.ts');
      const sf = makeArbitrarySf(fileName);

      expectReferencedFiles(sf, []);
      tagger.tag(sf);
      expectReferencedFiles(sf, []);
    });

    it('should not tag .js files', () => {
      const tagger = new ShimReferenceTagger(['test1', 'test2']);

      const fileName = _('/file.js');
      const sf = makeArbitrarySf(fileName);

      expectReferencedFiles(sf, []);
      tagger.tag(sf);
      expectReferencedFiles(sf, []);
    });

    it('should not tag shim files', () => {
      const tagger = new ShimReferenceTagger(['test1', 'test2']);
      const fileName = _('/file.ts');
      const {host} = makeProgram([
        {name: fileName, contents: 'export declare const UNIMPORTANT = true;'},
      ]);
      const shimAdapter =
          new ShimAdapter(host, [], [], [new TestShimGenerator()], /* oldProgram */ null);

      const shimSf = shimAdapter.maybeGenerate(_('/file.testshim.ts'))!;
      expect(shimSf.referencedFiles).toEqual([]);

      tagger.tag(shimSf);
      expect(shimSf.referencedFiles).toEqual([]);
    });

    it('should remove tags during finalization', () => {
      const tagger = new ShimReferenceTagger(['test1', 'test2']);

      const fileName = _('/file.ts');
      const sf = makeArbitrarySf(fileName);

      expectReferencedFiles(sf, []);

      tagger.tag(sf);
      expectReferencedFiles(sf, ['/file.test1.ts', '/file.test2.ts']);

      tagger.finalize();
      expectReferencedFiles(sf, []);
    });

    it('should not remove references it did not add during finalization', () => {
      const tagger = new ShimReferenceTagger(['test1', 'test2']);
      const fileName = _('/file.ts');
      const libFileName = _('/lib.d.ts');

      const sf = makeSf(fileName, `
        /// <reference path="/lib.d.ts" />
        export const UNIMPORTANT = true;
      `);

      expectReferencedFiles(sf, [libFileName]);

      tagger.tag(sf);
      expectReferencedFiles(sf, ['/file.test1.ts', '/file.test2.ts', libFileName]);

      tagger.finalize();
      expectReferencedFiles(sf, [libFileName]);
    });

    it('should not tag shims after finalization', () => {
      const tagger = new ShimReferenceTagger(['test1', 'test2']);
      tagger.finalize();

      const fileName = _('/file.ts');
      const sf = makeArbitrarySf(fileName);

      tagger.tag(sf);
      expectReferencedFiles(sf, []);
    });
  });
});

function makeSf(fileName: AbsoluteFsPath, contents: string): ts.SourceFile {
  return ts.createSourceFile(fileName, contents, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function makeArbitrarySf(fileName: AbsoluteFsPath): ts.SourceFile {
  const declare = fileName.endsWith('.d.ts') ? 'declare ' : '';
  return makeSf(fileName, `export ${declare}const UNIMPORTANT = true;`);
}

function expectReferencedFiles(sf: ts.SourceFile, files: string[]): void {
  const actual = sf.referencedFiles.map(f => _(f.fileName)).sort();
  const expected = files.map(fileName => _(fileName)).sort();
  expect(actual).toEqual(expected);
}
