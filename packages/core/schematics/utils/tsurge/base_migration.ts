/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom, FileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {getRootDirs} from '@angular/compiler-cli/src/ngtsc/util/src/typescript';
import {isShim} from '@angular/compiler-cli/src/ngtsc/shims';
import {ProgramInfo} from './program_info';
import {Serializable} from './helpers/serializable';
import {createBaseProgramInfo, getProgramInfoFromBaseInfo} from './helpers/create_program';

/** Type helper extracting the stats type of a migration. */
export type MigrationStats<T> =
  T extends TsurgeBaseMigration<unknown, unknown, infer Stats> ? Stats : never;

/**
 * @private
 *
 * Base class for the possible Tsurge migration variants.
 *
 * For example, this class exposes methods to conveniently create
 * TypeScript programs, while also allowing migration authors to override.
 */
export abstract class TsurgeBaseMigration<
  UnitAnalysisMetadata,
  CombinedGlobalMetadata,
  // Note: Even when optional, they can be inferred from implementations.
  Stats = unknown,
> {
  /**
   * Creates the TypeScript program for a given compilation unit.
   *
   * By default:
   *  - In 3P: Ngtsc programs are being created.
   *  - In 1P: Ngtsc or TS programs are created based on the Blaze target.
   */
  createProgram(
    tsconfigAbsPath: string,
    fs: FileSystem,
    optionsOverride?: NgCompilerOptions,
  ): ProgramInfo {
    return getProgramInfoFromBaseInfo(createBaseProgramInfo(tsconfigAbsPath, fs, optionsOverride));
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
  abstract stats(globalMetadata: CombinedGlobalMetadata): Promise<Serializable<Stats>>;
}
