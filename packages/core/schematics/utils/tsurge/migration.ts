/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FileSystem} from '../../../../compiler-cli/src/ngtsc/file_system';
import {NgtscProgram} from '../../../../compiler-cli/src/ngtsc/program';
import assert from 'assert';
import path from 'path';
import ts from 'typescript';
import {isShim} from '../../../../compiler-cli/src/ngtsc/shims';
import {createNgtscProgram} from './helpers/ngtsc_program';
import {Serializable} from './helpers/serializable';
import {Replacement} from './replacement';
import {BaseProgramInfo, ProgramInfo} from './program_info';

/**
 * Class defining a `Tsurge` migration.
 *
 * A tsurge migration is split into three stages:
 *    - analyze phase
 *    - merge phase
 *    - migrate phase
 *
 * The motivation for such split is that migrations may be executed
 * on individual workers, e.g. via go/tsunami or a Beam pipeline. The
 * individual workers are never seeing the full project, e.g. Google3.
 *
 * The analysis phases can operate on smaller TS project units, and later
 * the expect the isolated unit data to be merged into some sort of global
 * metadata via the `merge` phase. For example, every analyze worker may
 * contribute to a list of TS references that are later combined.
 *
 * The migrate phase can then compute actual file updates for all individual
 * compilation units, leveraging the global metadata to e.g. see if there are
 * any references from other compilation units that may be problematic and prevent
 * migration of a given file.
 *
 * More details can be found in the design doc for signal input migration,
 * or in the testing examples.
 *
 * TODO: Link design doc.
 */
export abstract class TsurgeMigration<
  UnitAnalysisMetadata,
  CombinedGlobalMetadata,
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

  /** Analyzes the given TypeScript project and returns serializable compilation unit data. */
  abstract analyze(program: PreparationInfo): Promise<Serializable<UnitAnalysisMetadata>>;

  /** Merges all compilation unit data from previous analysis phases into a global metadata. */
  abstract merge(units: UnitAnalysisMetadata[]): Promise<Serializable<CombinedGlobalMetadata>>;

  /**
   * Computes migration updates for the given TypeScript project, leveraging the global
   * metadata built up from all analyzed projects and their merged "unit data".
   */
  abstract migrate(
    globalMetadata: CombinedGlobalMetadata,
    program: PreparationInfo,
  ): Promise<Replacement[]>;
}
