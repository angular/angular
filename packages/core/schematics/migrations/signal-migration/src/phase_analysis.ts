/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
import {
  isHostBindingReference,
  isTemplateReference,
  isTsReference,
} from './passes/reference_resolution/reference_kinds';
import {FieldIncompatibilityReason} from './passes/problematic_patterns/incompatibility';

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
    fullProgramSourceFiles,
    reflector,
    dtsMetadataReader,
    typeChecker,
    templateTypeChecker,
    resourceLoader,
    evaluator,
  }: AnalysisProgramInfo,
) {
  // Pass 1
  fullProgramSourceFiles.forEach(
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
        knownInputs,
        result,
      ),
  );

  const fieldNamesToConsiderForReferenceLookup = new Set<string>();
  for (const input of knownInputs.knownInputIds.values()) {
    if (host.config.shouldMigrateInput?.(input) === false) {
      continue;
    }
    fieldNamesToConsiderForReferenceLookup.add(input.descriptor.node.name.text);
  }

  // A graph starting with source files is sufficient. We will resolve into
  // declaration files if a source file depends on such.
  const inheritanceGraph = new InheritanceGraph(typeChecker).expensivePopulate(sourceFiles);
  const pass2And3SourceFileVisitor = new GroupedTsAstVisitor(sourceFiles);

  // Register pass 2. Find all source file references.
  pass2_IdentifySourceFileReferences(
    host.programInfo,
    typeChecker,
    reflector,
    resourceLoader,
    evaluator,
    templateTypeChecker,
    pass2And3SourceFileVisitor,
    knownInputs,
    result,
    fieldNamesToConsiderForReferenceLookup,
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

  // Determine incompatible inputs based on resolved references.
  for (const reference of result.references) {
    if (isTsReference(reference) && reference.from.isWrite) {
      knownInputs.markFieldIncompatible(reference.target, {
        reason: FieldIncompatibilityReason.WriteAssignment,
        context: reference.from.node,
      });
    }
    if (isTemplateReference(reference) || isHostBindingReference(reference)) {
      if (reference.from.isWrite) {
        knownInputs.markFieldIncompatible(reference.target, {
          reason: FieldIncompatibilityReason.WriteAssignment,
          // No TS node context available for template or host bindings.
          context: null,
        });
      }
    }

    // TODO: Remove this when we support signal narrowing in templates.
    // https://github.com/angular/angular/pull/55456.
    if (isTemplateReference(reference)) {
      if (reference.from.isLikelyPartOfNarrowing) {
        knownInputs.markFieldIncompatible(reference.target, {
          reason: FieldIncompatibilityReason.PotentiallyNarrowedInTemplateButNoSupportYet,
          context: null,
        });
      }
    }
  }

  return {inheritanceGraph};
}
