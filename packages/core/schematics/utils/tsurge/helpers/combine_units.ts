/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TsurgeMigration} from '../migration';

/**
 * Synchronously combines unit data for the given migration.
 *
 * Note: This helper is useful for testing and execution of
 * Tsurge migrations in non-batchable environments. In general,
 * prefer parallel execution of combining via e.g. Beam combiners.
 */
export async function synchronouslyCombineUnitData<UnitData>(
  migration: TsurgeMigration<UnitData, unknown, unknown>,
  unitDatas: UnitData[],
): Promise<UnitData | null> {
  if (unitDatas.length === 0) {
    return null;
  }
  if (unitDatas.length === 1) {
    return unitDatas[0];
  }

  let combined = unitDatas[0];

  for (let i = 1; i < unitDatas.length; i++) {
    const other = unitDatas[i];
    combined = await migration.combine(combined, other);
  }

  return combined;
}
