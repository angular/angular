/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ModuleResolver} from '../../imports';
import {getSourceFile} from '../../testing/in_memory_typescript';
import {CycleAnalyzer} from '../src/analyzer';
import {ImportGraph} from '../src/imports';

import {makeProgramFromGraph} from './util';

describe('cycle analyzer', () => {
  it('should not detect a cycle when there isn\'t one', () => {
    const {program, analyzer} = makeAnalyzer('a:b,c;b;c');
    const b = getSourceFile(program, '/b.ts') !;
    const c = getSourceFile(program, '/c.ts') !;
    expect(analyzer.wouldCreateCycle(b, c)).toBe(false);
    expect(analyzer.wouldCreateCycle(c, b)).toBe(false);
  });

  it('should detect a simple cycle between two files', () => {
    const {program, analyzer} = makeAnalyzer('a:b;b');
    const a = getSourceFile(program, '/a.ts') !;
    const b = getSourceFile(program, '/b.ts') !;
    expect(analyzer.wouldCreateCycle(a, b)).toBe(false);
    expect(analyzer.wouldCreateCycle(b, a)).toBe(true);
  });

  it('should detect a cycle with a re-export in the chain', () => {
    const {program, analyzer} = makeAnalyzer('a:*b;b:c;c');
    const a = getSourceFile(program, '/a.ts') !;
    const c = getSourceFile(program, '/c.ts') !;
    expect(analyzer.wouldCreateCycle(a, c)).toBe(false);
    expect(analyzer.wouldCreateCycle(c, a)).toBe(true);
  });

  it('should detect a cycle in a more complex program', () => {
    const {program, analyzer} = makeAnalyzer('a:*b,*c;b:*e,*f;c:*g,*h;e:f;f:c;g;h:g');
    const b = getSourceFile(program, '/b.ts') !;
    const g = getSourceFile(program, '/g.ts') !;
    expect(analyzer.wouldCreateCycle(b, g)).toBe(false);
    expect(analyzer.wouldCreateCycle(g, b)).toBe(true);
  });

  it('should detect a cycle caused by a synthetic edge', () => {
    const {program, analyzer} = makeAnalyzer('a:b,c;b;c');
    const b = getSourceFile(program, '/b.ts') !;
    const c = getSourceFile(program, '/c.ts') !;
    expect(analyzer.wouldCreateCycle(b, c)).toBe(false);
    analyzer.recordSyntheticImport(c, b);
    expect(analyzer.wouldCreateCycle(b, c)).toBe(true);
  });
});

function makeAnalyzer(graph: string): {program: ts.Program, analyzer: CycleAnalyzer} {
  const {program, options, host} = makeProgramFromGraph(graph);
  return {
    program,
    analyzer: new CycleAnalyzer(new ImportGraph(new ModuleResolver(program, options, host))),
  };
}
