/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {SwitchMarkerAnalyzer} from '../../src/analysis/switch_marker_analyzer';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {makeProgram} from '../helpers/utils';

const TEST_PROGRAM = [
  {
    name: 'entrypoint.js',
    contents: `
    import {a} from './a';
    import {b} from './b';
    `
  },
  {
    name: 'a.js',
    contents: `
    import {c} from './c';
    export const a = 1;
    `
  },
  {
    name: 'b.js',
    contents: `
    export const b = 42;
    var factoryB = factory__PRE_R3__;
    `
  },
  {
    name: 'c.js',
    contents: `
    export const c = 'So long, and thanks for all the fish!';
    var factoryC = factory__PRE_R3__;
    var factoryD = factory__PRE_R3__;
    `
  },
];

describe('SwitchMarkerAnalyzer', () => {
  describe('analyzeProgram()', () => {
    it('should check for switchable markers in all the files of the program', () => {
      const program = makeProgram(...TEST_PROGRAM);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const analyzer = new SwitchMarkerAnalyzer(host);
      const analysis = analyzer.analyzeProgram(program);

      const entrypoint = program.getSourceFile('entrypoint.js') !;
      const a = program.getSourceFile('a.js') !;
      const b = program.getSourceFile('b.js') !;
      const c = program.getSourceFile('c.js') !;

      expect(analysis.size).toEqual(2);
      expect(analysis.has(entrypoint)).toBe(false);
      expect(analysis.has(a)).toBe(false);
      expect(analysis.has(b)).toBe(true);
      expect(analysis.get(b) !.sourceFile).toBe(b);
      expect(analysis.get(b) !.declarations.map(decl => decl.getText())).toEqual([
        'factoryB = factory__PRE_R3__'
      ]);

      expect(analysis.has(c)).toBe(true);
      expect(analysis.get(c) !.sourceFile).toBe(c);
      expect(analysis.get(c) !.declarations.map(decl => decl.getText())).toEqual([
        'factoryC = factory__PRE_R3__',
        'factoryD = factory__PRE_R3__',
      ]);
    });
  });
});
