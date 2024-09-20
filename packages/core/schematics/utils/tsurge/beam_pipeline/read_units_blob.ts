/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'fs';
import * as readline from 'readline';
import {TsurgeMigration} from '../migration';

/**
 * Integrating a `Tsurge` migration requires the "merging" of all
 * compilation unit data into a single "global migration data".
 *
 * This is achieved in a Beam pipeline by having a pipeline stage that
 * takes all compilation unit worker data and writing it into a single
 * buffer, delimited by new lines (`\n`).
 *
 * This "merged bytes files", containing all unit data, one per line, can
 * then be parsed by this function and fed into the migration merge logic.
 *
 * @returns All compilation unit data for the migration.
 */
export function readCompilationUnitBlob<UnitData, GlobalData>(
  _migrationForTypeSafety: TsurgeMigration<UnitData, GlobalData>,
  mergedUnitDataByteAbsFilePath: string,
): Promise<UnitData[]> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(mergedUnitDataByteAbsFilePath, 'utf8'),
      crlfDelay: Infinity,
    });

    const unitData: UnitData[] = [];
    let failed = false;
    rl.on('line', (line) => {
      const trimmedLine = line.trim();
      if (trimmedLine === '') {
        return;
      }

      try {
        const parsed = JSON.parse(trimmedLine) as UnitData;
        unitData.push(parsed);
      } catch (e) {
        failed = true;
        reject(new Error(`Could not parse data line: ${e} — ${trimmedLine}`));
        rl.close();
      }
    });

    rl.on('close', async () => {
      if (!failed) {
        resolve(unitData);
      }
    });
  });
}
