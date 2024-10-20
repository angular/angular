/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom, FileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {isShim} from '@angular/compiler-cli/src/ngtsc/shims';
import {createNgtscProgram} from './helpers/ngtsc_program';
import {BaseProgramInfo, ProgramInfo} from './program_info';
import {getRootDirs} from '@angular/compiler-cli/src/ngtsc/util/src/typescript';
import {Serializable} from './helpers/serializable';

/**
 * Type describing statistics that could be tracked
 * by migrations.
 *
 * Statistics may be tracked depending on the runner.
 */
export interface MigrationStats {
  counters: Record<string, number>;
}

/**
 * @private
 *
 * Base class for the possible Tsurge migration variants.
 *
 * For example, this class exposes methods to conveniently create
 * TypeScript programs, while also allowing migration authors to override.
 */
export abstract class TsurgeBaseMigration<UnitAnalysisMetadata, CombinedGlobalMetadata> {
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

    // Sort it by length in reverse order (longest first). This speeds up lookups,
    // since there's no need to keep going through the array once a match is found.
    const sortedRootDirs = getRootDirs(info.host, info.userOptions).sort(
      (a, b) => b.length - a.length,
    );

    // TODO: Consider also following TS's logic here, finding the common source root.
    // See: Program#getCommonSourceDirectory.
    const primaryRoot = absoluteFrom(
      info.userOptions.rootDir ?? sortedRootDirs.at(-1) ?? info.program.getCurrentDirectory(),
    );

    return {
      ...info,
      sourceFiles,
      fullProgramSourceFiles,
      sortedRootDirs,
      projectRoot: primaryRoot,
    };
  }

  /** Analyzes the given TypeScript project and returns serializable compilation unit data. */
  abstract analyze(info: ProgramInfo): Promise<Serializable<UnitAnalysisMetadata>>;

  /**
   * Combines two unit analyses into a single analysis metadata.
   * This is necessary to allow for parallel merging of metadata.
   */
  abstract combine(
    unitA: UnitAnalysisMetadata,
    unitB: UnitAnalysisMetadata,
  ): Promise<Serializable<UnitAnalysisMetadata>>;

  /**
   * Converts combined compilation into global metadata result that
   * is then available for migrate and stats stages.
   */
  abstract globalMeta(
    combinedData: UnitAnalysisMetadata,
  ): Promise<Serializable<CombinedGlobalMetadata>>;

  /** Extract statistics based on the global metadata. */
  abstract stats(globalMetadata: CombinedGlobalMetadata): Promise<MigrationStats>;
}
