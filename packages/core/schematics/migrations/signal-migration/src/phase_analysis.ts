/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isShim} from '@angular/compiler-cli/src/ngtsc/shims';
import {AnalysisProgramInfo} from './analysis_deps';
import {KnownInputs} from './input_detection/known_inputs';
import {MigrationHost} from './migration_host';
import {pass1__IdentifySourceFileAndDeclarationInputs} from './passes/1_identify_inputs';
import {pass3__checkIncompatiblePatterns} from './passes/3_check_incompatible_patterns';
import {pass2_IdentifySourceFileReferences} from './passes/2_find_source_file_references';
import {MigrationResult} from './result';
import {InheritanceGraph} from './utils/inheritance_graph';
import {GroupedTsAstVisitor} from './utils/grouped_ts_ast_visitor';

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
    resourceLoader,
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

  // A graph starting with source files is sufficient. We will resolve into
  // declaration files if a source file depends on such.
  const inheritanceGraph = new InheritanceGraph(typeChecker).expensivePopulate(sourceFiles);
  const pass2And3SourceFileVisitor = new GroupedTsAstVisitor(sourceFiles);

  // Register pass 2. Find all source file references.
  pass2_IdentifySourceFileReferences(
    host,
    typeChecker,
    reflector,
    resourceLoader,
    evaluator,
    templateTypeChecker,
    pass2And3SourceFileVisitor,
    knownInputs,
    result,
  );
  // Register pass 3. Check incompatible patterns pass.
  pass3__checkIncompatiblePatterns(
    host,
    inheritanceGraph,
    typeChecker,
    pass2And3SourceFileVisitor,
    knownInputs,
  );

  // Perform Pass 2 and Pass 3, efficiently in one pass.
  pass2And3SourceFileVisitor.execute();

  return {inheritanceGraph};
}
