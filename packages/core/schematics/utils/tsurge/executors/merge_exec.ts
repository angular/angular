/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Serializable} from '../helpers/serializable';
import {TsurgeMigration} from '../migration';

/**
 * Executes the merge phase for the given migration against
 * the given set of analysis unit data.
 *
 * @returns the serializable migration global data.
 */
export async function executeMergePhase<UnitData, GlobalData>(
  migration: TsurgeMigration<UnitData, GlobalData>,
  units: UnitData[],
): Promise<Serializable<GlobalData>> {
  return await migration.merge(units);
}
