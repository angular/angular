/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NodeJSFileSystem} from '@angular/compiler-cli';
import {TsurgeMigration} from '../migration';
import {Serializable} from '../helpers/serializable';

/**
 * 1P Logic: Executes the analyze phase of the given migration against
 * the specified TypeScript project.
 *
 * @returns the serializable migration unit data.
 */
export async function executeAnalyzePhase<UnitData, GlobalData>(
  migration: TsurgeMigration<UnitData, GlobalData, unknown>,
  tsconfigAbsolutePath: string,
): Promise<Serializable<UnitData>> {
  const info = migration.createProgram(tsconfigAbsolutePath, new NodeJSFileSystem());

  return await migration.analyze(info);
}
