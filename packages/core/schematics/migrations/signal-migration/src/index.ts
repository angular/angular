/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import path from 'path';

import {createAndPrepareAnalysisProgram} from './create_program';
import {KnownInputs} from './input_detection/known_inputs';
import {MigrationHost} from './migration_host';
import {pass4__checkInheritanceOfInputs} from './passes/4_check_inheritance';
import {executeAnalysisPhase} from './phase_analysis';
import {executeMigrationPhase} from './phase_migrate';
import {MigrationResult} from './result';
import {writeMigrationReplacements} from './write_replacements';

main(path.resolve(process.argv[2]));

/**
 * Runs the signal input migration for the given TypeScript project.
 */
export function main(absoluteTsconfigPath: string) {
  const analysisDeps = createAndPrepareAnalysisProgram(absoluteTsconfigPath);
  const {tsHost, tsconfig, basePath, sourceFiles, metaRegistry} = analysisDeps;
  const knownInputs = new KnownInputs();
  const result = new MigrationResult();
  const host = new MigrationHost(
    /* projectDir */ tsconfig.options.rootDir ?? basePath,
    /* isMigratingCore */ true,
    tsconfig.options,
    sourceFiles,
  );

  const {inheritanceGraph} = executeAnalysisPhase(host, knownInputs, result, analysisDeps);

  pass4__checkInheritanceOfInputs(host, inheritanceGraph, metaRegistry, knownInputs);

  executeMigrationPhase(host, knownInputs, result, analysisDeps);

  // Apply replacements
  writeMigrationReplacements(tsHost, result);
}
