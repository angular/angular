/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TsurgeMigration} from '../migration';
import {NodeJSFileSystem} from '../../../../../compiler-cli/src/ngtsc/file_system';
import {Serializable} from '../helpers/serializable';

/**
 * Executes the analyze phase of the given migration against
 * the specified TypeScript project.
 *
 * @returns the serializable migration unit data.
 */
export async function executeAnalyzePhase<UnitData, GlobalData>(
  migration: TsurgeMigration<UnitData, GlobalData>,
  tsconfigAbsolutePath: string,
): Promise<Serializable<UnitData>> {
  const fs = new NodeJSFileSystem();

  const baseInfo = migration.createProgram(tsconfigAbsolutePath, fs);
  const info = migration.prepareProgram(baseInfo);

  return await migration.analyze(info);
}
