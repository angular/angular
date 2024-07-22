/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isShim} from '../../../../../compiler-cli/src/ngtsc/shims';
import {AnalysisProgramInfo} from './create_program';
import {KnownInputs} from './input_detection/known_inputs';
import {MigrationHost} from './migration_host';
import {pass1__IdentifySourceFileAndDeclarationInputs} from './passes/1_identify_inputs';
import {pass3__checkIncompatiblePatterns} from './passes/3_check_incompatible_patterns';
import {pass2_IdentifySourceFileReferences} from './passes/2_find_source_file_references';
import {MigrationResult} from './result';
import {InheritanceGraph} from './utils/inheritance_graph';

/**
 * Executes the analysis phase of the migration.
 *
 * This includes:
 *   - finding all inputs
 *   - finding all references
 *   - determining incompatible inputs
 *   - checking inheritance
 */
export function executeAnalysisPhase(
  host: MigrationHost,
  knownInputs: KnownInputs,
  result: MigrationResult,
  {
    sourceFiles,
    programFiles,
    reflector,
    dtsMetadataReader,
    typeChecker,
    templateTypeChecker,
    evaluator,
    refEmitter,
  }: AnalysisProgramInfo,
) {
  // Pass 1
  programFiles.forEach(
    (sf) =>
      // Shim shim files. Those are unnecessary and might cause unexpected slowness.
      // e.g. `ngtypecheck` files.
      !isShim(sf) &&
      pass1__IdentifySourceFileAndDeclarationInputs(
        sf,
        host,
        typeChecker,
        reflector,
        dtsMetadataReader,
        evaluator,
        refEmitter,
        knownInputs,
        result,
      ),
  );

  // Pass 2
  sourceFiles.forEach((sf) =>
    pass2_IdentifySourceFileReferences(
      sf,
      host,
      typeChecker,
      reflector,
      templateTypeChecker,
      knownInputs,
      result,
    ),
  );

  // Source files is fine. We will resolve into declaration files if a source
  // file depends on such.
  const inheritanceGraph = new InheritanceGraph(typeChecker).expensivePopulate(sourceFiles);

  // Check pass
  // TODO: Combine with source file iterations above for speed up??
  pass3__checkIncompatiblePatterns(host, sourceFiles, inheritanceGraph, typeChecker, knownInputs);

  return {inheritanceGraph};
}
