/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, getSourceFileOrError} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {SwitchMarkerAnalyzer} from '../../src/analysis/switch_marker_analyzer';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {makeTestEntryPointBundle} from '../helpers/utils';

runInEachFileSystem(() => {
  describe('SwitchMarkerAnalyzer', () => {
    let _: typeof absoluteFrom;
    let TEST_PROGRAM: TestFile[];

    beforeEach(() => {
      _ = absoluteFrom;
      TEST_PROGRAM = [
        {
          name: _('/node_modules/test/entrypoint.js'),
          contents: `
            import {a} from './a';
            import {b} from './b';
            import {x} from '../other/x';
            import {e} from 'nested/e';
          `,
        },
        {
          name: _('/node_modules/test/a.js'),
          contents: `
            import {c} from './c';
            export const a = 1;
          `,
        },
        {
          name: _('/node_modules/test/b.js'),
          contents: `
            export const b = 42;
            var factoryB = factory__PRE_R3__;
          `,
        },
        {
          name: _('/node_modules/test/c.js'),
          contents: `
            export const c = 'So long, and thanks for all the fish!';
            var factoryC = factory__PRE_R3__;
            var factoryD = factory__PRE_R3__;
          `,
        },
        {
          name: _('/node_modules/test/node_modules/nested/e.js'),
          contents: `
            export const e = 1337;
            var factoryE = factory__PRE_R3__;
          `,
        },
        {
          name: _('/node_modules/other/x.js'),
          contents: `
            export const x = 3.142;
            var factoryX = factory__PRE_R3__;
          `,
        },
        {
          name: _('/node_modules/other/x.d.ts'),
          contents: `
            export const x: number;
          `,
        },
      ];
    });

    describe('analyzeProgram()', () => {
      it('should check for switchable markers in all the files of the program', () => {
        loadTestFiles(TEST_PROGRAM);
        const bundle = makeTestEntryPointBundle(
            'test', 'esm2015', false, [_('/node_modules/test/entrypoint.js')]);
        const program = bundle.src.program;
        const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle.src);
        const analyzer = new SwitchMarkerAnalyzer(host, bundle.entryPoint.packagePath);
        const analysis = analyzer.analyzeProgram(program);

        const entrypoint = getSourceFileOrError(program, _('/node_modules/test/entrypoint.js'));
        const a = getSourceFileOrError(program, _('/node_modules/test/a.js'));
        const b = getSourceFileOrError(program, _('/node_modules/test/b.js'));
        const c = getSourceFileOrError(program, _('/node_modules/test/c.js'));

        expect(analysis.size).toEqual(2);
        expect(analysis.has(entrypoint)).toBe(false);
        expect(analysis.has(a)).toBe(false);
        expect(analysis.has(b)).toBe(true);
        expect(analysis.get(b)!.sourceFile).toBe(b);
        expect(analysis.get(b)!.declarations.map(decl => decl.getText())).toEqual([
          'factoryB = factory__PRE_R3__'
        ]);

        expect(analysis.has(c)).toBe(true);
        expect(analysis.get(c)!.sourceFile).toBe(c);
        expect(analysis.get(c)!.declarations.map(decl => decl.getText())).toEqual([
          'factoryC = factory__PRE_R3__',
          'factoryD = factory__PRE_R3__',
        ]);
      });

      it('should ignore files that are outside the package', () => {
        loadTestFiles(TEST_PROGRAM);
        const bundle = makeTestEntryPointBundle(
            'test', 'esm2015', false, [_('/node_modules/test/entrypoint.js')]);
        const program = bundle.src.program;
        const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle.src);
        const analyzer = new SwitchMarkerAnalyzer(host, bundle.entryPoint.packagePath);
        const analysis = analyzer.analyzeProgram(program);

        const x = getSourceFileOrError(program, _('/node_modules/other/x.js'));
        expect(analysis.has(x)).toBe(false);
      });

      it('should ignore files that are inside the package\'s `node_modules/`', () => {
        loadTestFiles(TEST_PROGRAM);
        const bundle = makeTestEntryPointBundle(
            'test', 'esm2015', false, [_('/node_modules/test/entrypoint.js')]);
        const program = bundle.src.program;
        const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle.src);
        const analyzer = new SwitchMarkerAnalyzer(host, bundle.entryPoint.packagePath);
        const analysis = analyzer.analyzeProgram(program);

        const x = getSourceFileOrError(program, _('/node_modules/test/node_modules/nested/e.js'));
        expect(analysis.has(x)).toBe(false);
      });
    });
  });
});
