/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export type CompilationModeRunner = (compilationMode: 'full'|'partial') => void;

export interface RunInEachCompilationModeFn {
  (callback: CompilationModeRunner): void;
  full(callback: CompilationModeRunner): void;
  partial(callback: CompilationModeRunner): void;
}

function runInEachCompilationModeFn(callback: CompilationModeRunner) {
  runCompilationMode('full', callback, false);
  runCompilationMode('partial', callback, false);
}

function runCompilationMode(
    compilationMode: 'full'|'partial', callback: CompilationModeRunner, error: boolean) {
  describe(`<<CompilationMode: ${compilationMode}>>`, () => {
    callback(compilationMode);
    if (error) {
      afterAll(() => {
        throw new Error(`runCompilationMode limited to ${compilationMode}, cannot pass`);
      });
    }
  });
}

export const runInEachCompilationMode = runInEachCompilationModeFn as RunInEachCompilationModeFn;

runInEachCompilationMode.full = (callback: CompilationModeRunner) =>
    runCompilationMode('full', callback, true);
runInEachCompilationMode.partial = (callback: CompilationModeRunner) =>
    runCompilationMode('partial', callback, true);
