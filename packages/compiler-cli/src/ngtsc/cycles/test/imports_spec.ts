/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {absoluteFrom, getFileSystem, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {NOOP_PERF_RECORDER} from '../../perf';
import {ImportGraph} from '../src/imports';
import {importPath, makeProgramFromGraph} from './util';

runInEachFileSystem(() => {
  describe('ImportGraph', () => {
    let _: typeof absoluteFrom;
    beforeEach(() => _ = absoluteFrom);

    describe('importsOf()', () => {
      it('should record imports of a simple program', () => {
        const {program, graph} = makeImportGraph('a:b;b:c;c');
        const a = getSourceFileOrError(program, (_('/a.ts')));
        const b = getSourceFileOrError(program, (_('/b.ts')));
        const c = getSourceFileOrError(program, (_('/c.ts')));
        expect(importsToString(graph.importsOf(a))).toBe('b');
        expect(importsToString(graph.importsOf(b))).toBe('c');
      });
    });

    describe('transitiveImportsOf()', () => {
      it('should calculate transitive imports of a simple program', () => {
        const {program, graph} = makeImportGraph('a:b;b:c;c');
        const a = getSourceFileOrError(program, (_('/a.ts')));
        const b = getSourceFileOrError(program, (_('/b.ts')));
        const c = getSourceFileOrError(program, (_('/c.ts')));
        expect(importsToString(graph.transitiveImportsOf(a))).toBe('a,b,c');
      });

      it('should calculate transitive imports in a more complex program (with a cycle)', () => {
        const {program, graph} = makeImportGraph('a:*b,*c;b:*e,*f;c:*g,*h;e:f;f;g:e;h:g');
        const c = getSourceFileOrError(program, (_('/c.ts')));
        expect(importsToString(graph.transitiveImportsOf(c))).toBe('c,e,f,g,h');
      });

      it('should reflect the addition of a synthetic import', () => {
        const {program, graph} = makeImportGraph('a:b,c,d;b;c;d:b');
        const b = getSourceFileOrError(program, (_('/b.ts')));
        const c = getSourceFileOrError(program, (_('/c.ts')));
        const d = getSourceFileOrError(program, (_('/d.ts')));
        expect(importsToString(graph.importsOf(b))).toEqual('');
        expect(importsToString(graph.transitiveImportsOf(d))).toEqual('b,d');
        graph.addSyntheticImport(b, c);
        expect(importsToString(graph.importsOf(b))).toEqual('c');
        expect(importsToString(graph.transitiveImportsOf(d))).toEqual('b,c,d');
      });
    });

    describe('findPath()', () => {
      it('should be able to compute the path between two source files if there is a cycle', () => {
        const {program, graph} = makeImportGraph('a:*b,*c;b:*e,*f;c:*g,*h;e:f;f;g:e;h:g');
        const a = getSourceFileOrError(program, (_('/a.ts')));
        const b = getSourceFileOrError(program, (_('/b.ts')));
        const c = getSourceFileOrError(program, (_('/c.ts')));
        const e = getSourceFileOrError(program, (_('/e.ts')));
        expect(importPath(graph.findPath(a, a)!)).toBe('a');
        expect(importPath(graph.findPath(a, b)!)).toBe('a,b');
        expect(importPath(graph.findPath(c, e)!)).toBe('c,g,e');
        expect(graph.findPath(e, c)).toBe(null);
        expect(graph.findPath(b, c)).toBe(null);
      });

      it('should handle circular dependencies within the path between `from` and `to`', () => {
        // a -> b -> c -> d
        // ^----/    |
        // ^---------/
        const {program, graph} = makeImportGraph('a:b;b:a,c;c:a,d;d');
        const a = getSourceFileOrError(program, (_('/a.ts')));
        const c = getSourceFileOrError(program, (_('/c.ts')));
        const d = getSourceFileOrError(program, (_('/d.ts')));
        expect(importPath(graph.findPath(a, d)!)).toBe('a,b,c,d');
      });
    });
  });

  function makeImportGraph(graph: string): {program: ts.Program, graph: ImportGraph} {
    const {program} = makeProgramFromGraph(getFileSystem(), graph);
    return {
      program,
      graph: new ImportGraph(program.getTypeChecker(), NOOP_PERF_RECORDER),
    };
  }

  function importsToString(imports: Set<ts.SourceFile>): string {
    const fs = getFileSystem();
    return Array.from(imports)
        .map(sf => fs.basename(sf.fileName).replace('.ts', ''))
        .sort()
        .join(',');
  }
});
