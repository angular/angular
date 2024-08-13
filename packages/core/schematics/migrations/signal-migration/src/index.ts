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
import {nonIgnorableIncompatibilities} from './input_detection/incompatibility';

main(path.resolve(process.argv[2]), process.argv.includes('--best-effort-mode'));

/**
 * Runs the signal input migration for the given TypeScript project.
 */
export function main(absoluteTsconfigPath: string, bestEffortMode: boolean) {
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

  // Remove all "ignorable" incompatibilities of inputs, if best effort mode is requested.
  if (bestEffortMode) {
    knownInputs.knownInputIds.forEach(({container: c}) => {
      if (c.incompatible !== null && !nonIgnorableIncompatibilities.includes(c.incompatible)) {
        c.incompatible = null;
      }
      for (const [key, i] of c.memberIncompatibility.entries()) {
        if (!nonIgnorableIncompatibilities.includes(i.reason)) {
          c.memberIncompatibility.delete(key);
        }
      }
    });
  }

  executeMigrationPhase(host, knownInputs, result, analysisDeps);

  // Apply replacements
  writeMigrationReplacements(tsHost, result);
}
