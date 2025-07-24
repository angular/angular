/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {absoluteFrom, AbsoluteFsPath, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {FileUpdate, TsCreateProgramDriver, UpdateMode} from '../../program_driver';
import {sfExtensionData, ShimReferenceTagger} from '../../shims';
import {expectCompleteReuse, makeProgram} from '../../testing';
import {OptimizeFor} from '../api';

import {setup} from '../testing';

runInEachFileSystem(() => {
  describe('template type-checking program', () => {
    it('should not be created if no components need to be checked', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker, programStrategy} = setup([
        {
          fileName,
          templates: {},
          source: `export class NotACmp {}`,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);

      templateTypeChecker.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);
      // expect() here would create a really long error message, so this is checked manually.
      if (programStrategy.getProgram() !== program) {
        fail('Template type-checking created a new ts.Program even though it had no changes.');
      }
    });

    it('should have complete reuse if no structural changes are made to shims', () => {
      const {program, host, options, typecheckPath} = makeSingleFileProgramWithTypecheckShim();
      const programStrategy = new TsCreateProgramDriver(program, host, options, ['ngtypecheck']);

      // Update /main.ngtypecheck.ts without changing its shape. Verify that the old program was
      // reused completely.
      programStrategy.updateFiles(
        new Map([[typecheckPath, createUpdate('export const VERSION = 2;')]]),
        UpdateMode.Complete,
      );

      expectCompleteReuse(programStrategy.getProgram());
    });

    it('should have complete reuse if no structural changes are made to input files', () => {
      const {program, host, options, mainPath} = makeSingleFileProgramWithTypecheckShim();
      const programStrategy = new TsCreateProgramDriver(program, host, options, ['ngtypecheck']);

      // Update /main.ts without changing its shape. Verify that the old program was reused
      // completely.
      programStrategy.updateFiles(
        new Map([[mainPath, createUpdate('export const STILL_NOT_A_COMPONENT = true;')]]),
        UpdateMode.Complete,
      );

      expectCompleteReuse(programStrategy.getProgram());
    });
  });
});

function createUpdate(text: string): FileUpdate {
  return {
    newText: text,
    originalFile: null,
  };
}

function makeSingleFileProgramWithTypecheckShim(): {
  program: ts.Program;
  host: ts.CompilerHost;
  options: ts.CompilerOptions;
  mainPath: AbsoluteFsPath;
  typecheckPath: AbsoluteFsPath;
} {
  const mainPath = absoluteFrom('/main.ts');
  const typecheckPath = absoluteFrom('/main.ngtypecheck.ts');
  const {program, host, options} = makeProgram([
    {
      name: mainPath,
      contents: 'export const NOT_A_COMPONENT = true;',
    },
    {
      name: typecheckPath,
      contents: 'export const VERSION = 1;',
    },
  ]);

  const sf = getSourceFileOrError(program, mainPath);
  const typecheckSf = getSourceFileOrError(program, typecheckPath);

  // To ensure this test is validating the correct behavior, the initial conditions of the
  // input program must be such that:
  //
  // 1) /main.ts was previously tagged with a reference to its ngtypecheck shim.
  // 2) /main.ngtypecheck.ts is marked as a shim itself.

  // Condition 1:
  const tagger = new ShimReferenceTagger(['ngtypecheck']);
  tagger.tag(sf);
  tagger.finalize();

  // Condition 2:
  sfExtensionData(typecheckSf).fileShim = {
    extension: 'ngtypecheck',
    generatedFrom: mainPath,
  };

  return {program, host, options, mainPath, typecheckPath};
}
