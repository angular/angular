/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbsoluteFsPath, NodeJSFileSystem} from '@angular/compiler-cli';
import {TsurgeMigration} from '../migration';
import {Replacement} from '../replacement';

/**
 * 1P Logic: Executes the migrate phase of the given migration against
 * the specified TypeScript project.
 *
 * This requires the global migration data, computed by the
 * analysis and merge phases of the migration.
 *
 * @returns a list of text replacements to apply to disk and the
 *   absolute project directory path (to allow for applying).
 */
export async function executeMigratePhase<UnitData, GlobalData>(
  migration: TsurgeMigration<UnitData, GlobalData, unknown>,
  globalMetadata: GlobalData,
  tsconfigAbsolutePath: string,
): Promise<{replacements: Replacement[]; projectRoot: AbsoluteFsPath}> {
  // In 1P, we never need to use a virtual file system.
  const info = migration.createProgram(tsconfigAbsolutePath, new NodeJSFileSystem());

  return {
    ...(await migration.migrate(globalMetadata, info)),
    projectRoot: info.projectRoot,
  };
}
