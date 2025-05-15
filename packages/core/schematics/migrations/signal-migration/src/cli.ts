/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import path from 'path';

import assert from 'assert';
import {SignalInputMigration} from './migration';
import {writeMigrationReplacements} from './write_replacements';
import {NodeJSFileSystem} from '../../../../../compiler-cli';

main(
  path.resolve(process.argv[2]),
  process.argv.includes('--best-effort-mode'),
  process.argv.includes('--insert-todos'),
).catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

/**
 * Runs the signal input migration for the given TypeScript project.
 */
export async function main(
  absoluteTsconfigPath: string,
  bestEffortMode: boolean,
  insertTodosForSkippedFields: boolean,
) {
  const migration = new SignalInputMigration({
    bestEffortMode,
    insertTodosForSkippedFields,
    upgradeAnalysisPhaseToAvoidBatch: true,
  });
  const info = migration.createProgram(absoluteTsconfigPath, new NodeJSFileSystem());

  await migration.analyze(info);

  assert(
    migration.upgradedAnalysisPhaseResults,
    'Expected upgraded analysis phase results; batch mode is disabled.',
  );

  const {replacements, projectRoot} = migration.upgradedAnalysisPhaseResults;

  // Apply replacements
  writeMigrationReplacements(replacements, projectRoot);
}
