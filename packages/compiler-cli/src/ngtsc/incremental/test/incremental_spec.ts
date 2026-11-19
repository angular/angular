/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {NOOP_PERF_RECORDER} from '../../perf';
import {makeProgram} from '../../testing';
import {TraitCompiler} from '../../transform';
import {IncrementalCompilation} from '../src/incremental';

runInEachFileSystem(() => {
  describe('incremental reconciliation', () => {
    it('should treat source files with changed versions as changed', () => {
      const FOO_PATH = absoluteFrom('/foo.ts');
      const {program} = makeProgram([{name: FOO_PATH, contents: `export const FOO = true;`}]);
      const fooSf = getSourceFileOrError(program, FOO_PATH);
      const traitCompiler = {getAnalyzedRecords: () => new Map()} as TraitCompiler;

      const versionMapFirst = new Map([[FOO_PATH, 'version.1']]);
      const firstCompilation = IncrementalCompilation.fresh(versionMapFirst);
      firstCompilation.recordSuccessfulAnalysis(traitCompiler);
      firstCompilation.recordSuccessfulEmit(fooSf);

      const versionMapSecond = new Map([[FOO_PATH, 'version.2']]);
      const secondCompilation = IncrementalCompilation.incremental(
        program,
        versionMapSecond,
        program,
        firstCompilation.state,
        new Set(),
        NOOP_PERF_RECORDER,
      );

      secondCompilation.recordSuccessfulAnalysis(traitCompiler);
      expect(secondCompilation.safeToSkipEmit(fooSf)).toBeFalse();
    });

    it('should fall back to a fresh compilation when a .d.ts file is deleted', () => {
      const FOO_PATH = absoluteFrom('/foo.ts');
      const GLOBALS_PATH = absoluteFrom('/globals.d.ts');
      const {program: oldProgram} = makeProgram([
        {name: FOO_PATH, contents: `export const FOO = true;`},
        {name: GLOBALS_PATH, contents: `declare global { interface Foo {} } export {};`},
      ]);
      const oldFooSf = getSourceFileOrError(oldProgram, FOO_PATH);
      const traitCompiler = {getAnalyzedRecords: () => new Map()} as TraitCompiler;

      const versionMapFirst = new Map([
        [FOO_PATH, 'version.1'],
        [GLOBALS_PATH, 'version.1'],
      ]);
      const firstCompilation = IncrementalCompilation.fresh(versionMapFirst);
      firstCompilation.recordSuccessfulAnalysis(traitCompiler);
      firstCompilation.recordSuccessfulEmit(oldFooSf);

      const {program: newProgram} = makeProgram([
        {name: FOO_PATH, contents: `export const FOO = true;`},
      ]);
      const newFooSf = getSourceFileOrError(newProgram, FOO_PATH);
      const versionMapSecond = new Map([[FOO_PATH, 'version.1']]);
      const secondCompilation = IncrementalCompilation.incremental(
        newProgram,
        versionMapSecond,
        oldProgram,
        firstCompilation.state,
        new Set(),
        NOOP_PERF_RECORDER,
      );

      secondCompilation.recordSuccessfulAnalysis(traitCompiler);
      expect(secondCompilation.safeToSkipEmit(newFooSf)).toBeFalse();
    });
  });
});
