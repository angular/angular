/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TsurgeBaseMigration} from './base_migration';
import {ProgramInfo} from './program_info';
import {Replacement} from './replacement';

/** Type describing the result of a Tsurge `migrate` stage. */
interface MigrateResult {
  replacements: Replacement[];
}

/**
 * A Tsurge migration is split into three stages:
 *    - analyze phase
 *    - merge phase
 *    - migrate phase
 *
 * The motivation for such split is that migrations may be executed
 * on individual workers, e.g. via go/tsunami or a Beam pipeline. The
 * individual workers are never seeing the full project, e.g. Google3.
 *
 * The analysis phases can operate on smaller TS project units, and later
 * then expect the isolated unit data to be merged into some sort of global
 * metadata via the `merge` phase. As a final step then, the migration
 * replacements will be computed.
 *
 * There are subtle differences in how the final stage can compute migration
 * replacements. Some migrations need program access again, while other's don't.
 * For this reason, there are two possible variants of Tsurge migrations:
 *
 *   - {@link TsurgeFunnelMigration}
 *   - {@link TsurgeComplexMigration}
 *
 *  http://go/tsurge-design
 */
export type TsurgeMigration<UnitAnalysisMetadata, CombinedGlobalMetadata> =
  | TsurgeComplexMigration<UnitAnalysisMetadata, CombinedGlobalMetadata>
  | TsurgeFunnelMigration<UnitAnalysisMetadata, CombinedGlobalMetadata>;

/**
 * A simpler variant of a {@link TsurgeComplexMigration} that does not
 * fan-out into multiple workers per compilation unit to compute
 * the final migration replacements.
 *
 * This is faster and less resource intensive as workers and TS programs
 * are only ever created once.
 *
 * This is commonly the case when migrations are refactored to eagerly
 * compute replacements in the analyze stage, and then leverage the
 * global unit data to filter replacements that turned out to be "invalid".
 */
export abstract class TsurgeFunnelMigration<
  UnitAnalysisMetadata,
  CombinedGlobalMetadata,
> extends TsurgeBaseMigration<UnitAnalysisMetadata, CombinedGlobalMetadata> {
  /**
   * Finalizes the migration result.
   *
   * This stage can be used to filter replacements, leveraging global combined analysis
   * data to compute the overall migration result, without needing new "migrate" workers
   * for every unit, as with a standard {@link TsurgeMigration}.
   *
   * @returns All replacements for the whole project.
   */
  abstract migrate(globalData: CombinedGlobalMetadata): Promise<MigrateResult>;
}

/**
 * Complex variant of a `Tsurge` migration.
 *
 * For example, every analyze worker may contribute to a list of TS
 * references that are later combined. The migrate phase can then compute actual
 * file updates for all individual compilation units, leveraging the global metadata
 * to e.g. see if there are any references from other compilation units that may be
 * problematic and prevent migration of a given file.
 */
export abstract class TsurgeComplexMigration<
  UnitAnalysisMetadata,
  CombinedGlobalMetadata,
> extends TsurgeBaseMigration<UnitAnalysisMetadata, CombinedGlobalMetadata> {
  /**
   * Migration phase. Workers will be started for every compilation unit again,
   * instantiating a new program for every unit to compute the final migration
   * replacements, leveraging combined global metadata.
   *
   * @returns Replacements for the given compilation unit (**not** the whole project!)
   */
  abstract migrate(
    globalMetadata: CombinedGlobalMetadata,
    info: ProgramInfo,
  ): Promise<MigrateResult>;
}
