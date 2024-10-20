/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import fs from 'fs';
import path from 'path';
import {executeAnalyzePhase} from '../../../../utils/tsurge/executors/analyze_exec';
import {executeCombinePhase} from '../../../../utils/tsurge/executors/combine_exec';
import {executeMigratePhase} from '../../../../utils/tsurge/executors/migrate_exec';
import {SignalInputMigration} from '../migration';
import {writeMigrationReplacements} from '../write_replacements';
import {CompilationUnitData} from './unit_data';
import {executeGlobalMetaPhase} from '../../../../utils/tsurge/executors/global_meta_exec';

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

async function main() {
  const [mode, ...args] = process.argv.slice(2);
  const migration = new SignalInputMigration({insertTodosForSkippedFields: true});

  if (mode === 'extract') {
    const analyzeResult = await executeAnalyzePhase(migration, path.resolve(args[0]));
    process.stdout.write(JSON.stringify(analyzeResult));
  } else if (mode === 'combine') {
    const unitAPromise = readUnitMeta(path.resolve(args[0]));
    const unitBPromise = readUnitMeta(path.resolve(args[1]));

    const [unitA, unitB] = await Promise.all([unitAPromise, unitBPromise]);
    const mergedResult = await executeCombinePhase(migration, unitA, unitB);

    process.stdout.write(JSON.stringify(mergedResult));
  } else if (mode === 'globalMeta') {
    await executeGlobalMetaPhase(migration, await readUnitMeta(args[0]));
  } else if (mode === 'migrate') {
    const {replacements, projectRoot} = await executeMigratePhase(
      migration,
      JSON.parse(fs.readFileSync(path.resolve(args[1]), 'utf8')) as CompilationUnitData,
      path.resolve(args[0]),
    );

    writeMigrationReplacements(replacements, projectRoot);
  }
}

async function readUnitMeta(filePath: string): Promise<CompilationUnitData> {
  return fs.promises
    .readFile(filePath, 'utf8')
    .then((data) => JSON.parse(data) as CompilationUnitData);
}
