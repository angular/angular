/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import path from 'path';
import {absoluteFrom, FileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {isShim} from '@angular/compiler-cli/src/ngtsc/shims';
import {createNgtscProgram} from './helpers/ngtsc_program';
import {BaseProgramInfo, ProgramInfo} from './program_info';

/**
 * Base class for the possible Tsurge migration variants.
 *
 * For example, this class exposes methods to conveniently create
 * TypeScript programs, while also allowing migration authors to override.
 */
export abstract class TsurgeBaseMigration {
  // By default, ngtsc programs are being created.
  createProgram(tsconfigAbsPath: string, fs?: FileSystem): BaseProgramInfo {
    return createNgtscProgram(tsconfigAbsPath, fs);
  }

  // Optional function to prepare the base `ProgramInfo` even further,
  // for the analyze and migrate phases. E.g. determining source files.
  prepareProgram(info: BaseProgramInfo): ProgramInfo {
    const fullProgramSourceFiles = [...info.program.getSourceFiles()];
    const sourceFiles = fullProgramSourceFiles.filter(
      (f) =>
        !f.isDeclarationFile &&
        // Note `isShim` will work for the initial program, but for TCB programs, the shims are no longer annotated.
        !isShim(f) &&
        !f.fileName.endsWith('.ngtypecheck.ts'),
    );

    const basePath = path.dirname(info.tsconfigAbsolutePath);
    const projectDirAbsPath = absoluteFrom(info.userOptions.rootDir ?? basePath);

    return {
      ...info,
      sourceFiles,
      fullProgramSourceFiles,
      projectDirAbsPath,
    };
  }
}
