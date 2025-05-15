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
 * 1P Logic: Executes the `globalMeta` stage for the given migration
 * to convert the combined unit data into global meta.
 *
 * @returns the serializable global meta.
 */
export async function executeGlobalMetaPhase<UnitData, GlobalData>(
  migration: TsurgeMigration<UnitData, GlobalData>,
  combinedUnitData: UnitData,
): Promise<Serializable<GlobalData>> {
  return await migration.globalMeta(combinedUnitData);
}
