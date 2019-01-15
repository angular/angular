/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ModuleResolver} from '../../imports';
import {ImportGraph} from '../src/imports';

import {makeProgramFromGraph} from './util';

describe('import graph', () => {
  it('should record imports of a simple program', () => {
    const {program, graph} = makeImportGraph('a:b;b:c;c');
    const a = program.getSourceFile('a.ts') !;
    const b = program.getSourceFile('b.ts') !;
    const c = program.getSourceFile('c.ts') !;
    expect(importsToString(graph.importsOf(a))).toBe('b');
    expect(importsToString(graph.importsOf(b))).toBe('c');
  });

  it('should calculate transitive imports of a simple program', () => {
    const {program, graph} = makeImportGraph('a:b;b:c;c');
    const a = program.getSourceFile('a.ts') !;
    const b = program.getSourceFile('b.ts') !;
    const c = program.getSourceFile('c.ts') !;
    expect(importsToString(graph.transitiveImportsOf(a))).toBe('a,b,c');
  });

  it('should calculate transitive imports in a more complex program (with a cycle)', () => {
    const {program, graph} = makeImportGraph('a:*b,*c;b:*e,*f;c:*g,*h;e:f;f;g:e;h:g');
    const c = program.getSourceFile('c.ts') !;
    expect(importsToString(graph.transitiveImportsOf(c))).toBe('c,e,f,g,h');
  });

  it('should reflect the addition of a synthetic import', () => {
    const {program, graph} = makeImportGraph('a:b,c,d;b;c;d:b');
    const b = program.getSourceFile('b.ts') !;
    const c = program.getSourceFile('c.ts') !;
    const d = program.getSourceFile('d.ts') !;
    expect(importsToString(graph.importsOf(b))).toEqual('');
    expect(importsToString(graph.transitiveImportsOf(d))).toEqual('b,d');
    graph.addSyntheticImport(b, c);
    expect(importsToString(graph.importsOf(b))).toEqual('c');
    expect(importsToString(graph.transitiveImportsOf(d))).toEqual('b,c,d');
  });
});

function makeImportGraph(graph: string): {program: ts.Program, graph: ImportGraph} {
  const {program, options, host} = makeProgramFromGraph(graph);
  return {
    program,
    graph: new ImportGraph(new ModuleResolver(program, options, host)),
  };
}

function importsToString(imports: Set<ts.SourceFile>): string {
  return Array.from(imports).map(sf => sf.fileName.substr(1).replace('.ts', '')).sort().join(',');
}
