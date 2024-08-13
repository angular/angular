/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createAndPrepareAnalysisProgram} from '../create_program';
import {KnownInputs} from '../input_detection/known_inputs';
import {MigrationHost} from '../migration_host';
import {pass4__checkInheritanceOfInputs} from '../passes/4_check_inheritance';
import {executeAnalysisPhase} from '../phase_analysis';
import {executeMigrationPhase} from '../phase_migrate';
import {MigrationResult} from '../result';
import {InputUniqueKey} from '../utils/input_id';
import {writeMigrationReplacements} from '../write_replacements';
import {IncompatibilityType, MetadataFile} from './metadata_file';

/**
 * Batch mode.
 *
 * Migrates the given compilation unit, leveraging the global analysis metadata
 * that was created as the merge of all individual project units.
 */
export function migrateTarget(absoluteTsconfigPath: string, mergedMetadata: MetadataFile) {
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

  // Populate from batch metadata.
  for (const [_key, info] of Object.entries(mergedMetadata.knownInputs)) {
    const key = _key as unknown as InputUniqueKey;

    // irrelevant for this compilation unit.
    if (!knownInputs.has({key})) {
      continue;
    }

    const inputMetadata = knownInputs.get({key})!;
    if (!inputMetadata.isIncompatible() && info.isIncompatible) {
      if (info.isIncompatible.kind === IncompatibilityType.VIA_CLASS) {
        knownInputs.markDirectiveAsIncompatible(
          inputMetadata.container.clazz,
          info.isIncompatible.reason,
        );
      } else {
        knownInputs.markInputAsIncompatible(inputMetadata.descriptor, {
          context: null, // No context serializable.
          reason: info.isIncompatible.reason,
        });
      }
    }
  }

  pass4__checkInheritanceOfInputs(host, inheritanceGraph, metaRegistry, knownInputs);
  executeMigrationPhase(host, knownInputs, result, analysisDeps);

  return {
    replacements: result.replacements,
    apply: () => writeMigrationReplacements(tsHost, result),
  };
}
