/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {Serializable} from '../helpers/serializable';
import {TsurgeMigration} from '../migration';
import {NgtscProgram} from '../../../../../compiler-cli/src/ngtsc/program';

/**
 * Executes the merge phase for the given migration against
 * the given set of analysis unit data.
 *
 * @returns the serializable migration global data.
 */
export async function executeMergePhase<
  UnitData,
  GlobalData,
  TsProgramType extends ts.Program | NgtscProgram,
>(
  migration: TsurgeMigration<UnitData, GlobalData, TsProgramType, unknown>,
  units: UnitData[],
): Promise<Serializable<GlobalData>> {
  return await migration.merge(units);
}
