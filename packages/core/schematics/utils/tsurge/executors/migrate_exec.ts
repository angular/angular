/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TsurgeMigration} from '../migration';
import {Replacement} from '../replacement';

/**
 * Executes the migrate phase of the given migration against
 * the specified TypeScript project.
 *
 * This requires the global migration data, computed by the
 * analysis and merge phases of the migration.
 *
 * @returns a list of text replacements to apply to disk.
 */
export async function executeMigratePhase<UnitData, GlobalData>(
  migration: TsurgeMigration<UnitData, GlobalData>,
  globalMetadata: GlobalData,
  tsconfigAbsolutePath: string,
): Promise<Replacement[]> {
  const baseInfo = migration.createProgram(tsconfigAbsolutePath);
  const info = migration.prepareProgram(baseInfo);

  return await migration.migrate(globalMetadata, info);
}
