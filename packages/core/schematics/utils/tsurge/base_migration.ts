/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import assert from 'assert';
import path from 'path';
import ts from 'typescript';
import {FileSystem} from '../../../../compiler-cli/src/ngtsc/file_system';
import {NgtscProgram} from '../../../../compiler-cli/src/ngtsc/program';
import {isShim} from '../../../../compiler-cli/src/ngtsc/shims';
import {createNgtscProgram} from './helpers/ngtsc_program';
import {BaseProgramInfo, ProgramInfo} from './program_info';

/**
 * Base class for the possible Tsurge migration variants.
 *
 * For example, this class exposes methods to conveniently create
 * TypeScript programs, while also allowing migration authors to override.
 */
export abstract class TsurgeBaseMigration<
  TsProgramType extends ts.Program | NgtscProgram = NgtscProgram,
  PreparationInfo = ProgramInfo<TsProgramType>,
> {
  // By default, ngtsc programs are being created.
  createProgram(tsconfigAbsPath: string, fs?: FileSystem): BaseProgramInfo<TsProgramType> {
    return createNgtscProgram(tsconfigAbsPath, fs) as BaseProgramInfo<TsProgramType>;
  }

  // Optional function to prepare the base `ProgramInfo` even further,
  // for the analyze and migrate phases. E.g. determining source files.
  prepareProgram(info: BaseProgramInfo<TsProgramType>): PreparationInfo {
    assert(info.program instanceof NgtscProgram);

    const userProgram = info.program.getTsProgram();
    const fullProgramSourceFiles = userProgram.getSourceFiles();
    const sourceFiles = fullProgramSourceFiles.filter(
      (f) =>
        !f.isDeclarationFile &&
        // Note `isShim` will work for the initial program, but for TCB programs, the shims are no longer annotated.
        !isShim(f) &&
        !f.fileName.endsWith('.ngtypecheck.ts'),
    );

    const basePath = path.dirname(info.tsconfigAbsolutePath);
    const projectDirAbsPath = info.userOptions.rootDir ?? basePath;

    return {
      ...info,
      sourceFiles,
      fullProgramSourceFiles,
      projectDirAbsPath,
    } as PreparationInfo;
  }
}
