/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {isTypeScriptFile} from '../utils';
import {findTightestNode, getParentClassDeclaration} from '../ts_utils';
import {MetaKind} from '@angular/compiler-cli/src/ngtsc/metadata';
import ts from 'typescript';
import type {Refactoring} from './refactoring';
import {prepareAnalysisInfo} from '../../../core/schematics/migrations/signal-migration/src/create_program';
import {KnownInputs} from '../../../core/schematics/migrations/signal-migration/src/input_detection/known_inputs';
import {MigrationResult} from '../../../core/schematics/migrations/signal-migration/src/result';
import {executeAnalysisPhase} from '../../../core/schematics/migrations/signal-migration/src/phase_analysis';
import {executeMigrationPhase} from '../../../core/schematics/migrations/signal-migration/src/phase_migrate';
import {pass4__checkInheritanceOfInputs} from '../../../core/schematics/migrations/signal-migration/src/passes/4_check_inheritance';
import {MigrationHost} from '../../../core/schematics/migrations/signal-migration/src/migration_host';
import {CompilerOptions} from '@angular/compiler-cli';
import {
  getInputDescriptor,
  isInputDescriptor,
} from '../../../core/schematics/migrations/signal-migration/src/utils/input_id';
import {isInputContainerNode} from '../../../core/schematics/migrations/signal-migration/src/input_detection/input_node';
import {
  ClassIncompatibilityReason,
  InputIncompatibilityReason,
} from '@angular/core/schematics/migrations/signal-migration/src/input_detection/incompatibility';
import {ApplyRefactoringProgressFn} from '@angular/language-service/api';

/**
 * Language service refactoring action that can convert `@Input()`
 * declarations to signal inputs.
 *
 * The user can click on an `@Input` property declaration in e.g. the VSCode
 * extension and ask for the input to be migrated. All references, imports and
 * the declaration are updated automatically.
 */
export class ConvertToSignalInputRefactoring implements Refactoring {
  id = 'convert-to-signal-input';
  description = '(experimental fixer): Convert @Input() to a signal input';

  isApplicable(
    compiler: NgCompiler,
    fileName: string,
    positionOrRange: number | ts.TextRange,
  ): boolean {
    if (!isTypeScriptFile(fileName)) {
      return false;
    }

    const sf = compiler.getCurrentProgram().getSourceFile(fileName);
    if (sf === undefined) {
      return false;
    }

    const start = typeof positionOrRange === 'number' ? positionOrRange : positionOrRange.pos;
    const node = findTightestNode(sf, start);
    if (node === undefined) {
      return false;
    }

    const classDecl = getParentClassDeclaration(node);
    if (classDecl === undefined) {
      return false;
    }

    const meta = compiler.getMeta(classDecl);
    if (meta === undefined || meta?.kind !== MetaKind.Directive) {
      return false;
    }

    const containingProp = findParentPropertyDeclaration(node);
    if (containingProp === null) {
      return false;
    }
    if (!ts.isIdentifier(containingProp.name) && !ts.isStringLiteralLike(containingProp.name)) {
      return false;
    }

    const inputMeta = meta.inputs.getByClassPropertyName(containingProp.name.text);
    if (inputMeta === null || inputMeta.isSignal) {
      return false;
    }
    return true;
  }

  computeEditsForFix(
    compiler: NgCompiler,
    compilerOptions: CompilerOptions,
    fileName: string,
    positionOrRange: number | ts.TextRange,
    reportProgress: ApplyRefactoringProgressFn,
  ): ts.RefactorEditInfo {
    const sf = compiler.getCurrentProgram().getSourceFile(fileName);
    if (sf === undefined) {
      return {edits: []};
    }

    const start = typeof positionOrRange === 'number' ? positionOrRange : positionOrRange.pos;
    const node = findTightestNode(sf, start);
    if (node === undefined) {
      return {edits: []};
    }

    const containingProp = findParentPropertyDeclaration(node);
    if (containingProp === null || !isInputContainerNode(containingProp)) {
      return {edits: [], notApplicableReason: 'Not an input property.'};
    }

    reportProgress(0, 'Starting input migration. Analyzing..');

    const analysisDeps = prepareAnalysisInfo(compiler.getCurrentProgram(), compiler);
    const {sourceFiles, metaRegistry} = analysisDeps;
    const knownInputs = new KnownInputs();
    const result = new MigrationResult();
    const host = new MigrationHost(
      /* projectDir */ '/',
      /* isMigratingCore */ false,
      compilerOptions,
      sourceFiles,
    );

    // Analyze.
    const {inheritanceGraph} = executeAnalysisPhase(host, knownInputs, result, analysisDeps);
    reportProgress(40, 'Analyzed input references. Migrating..');

    const inputDescr = getInputDescriptor(host, containingProp);
    const targetInput = knownInputs.get(inputDescr);
    if (targetInput === undefined) {
      return {
        edits: [],
        notApplicableReason: 'Input not found in migration registry. Unexpected error.',
      };
    }

    // Mark all other inputs as incompatible.
    // Note that we still analyzed the whole application for potential references.
    // Only migrate references to the target input.
    Array.from(result.sourceInputs.keys()).forEach(
      (i) =>
        i.key !== inputDescr.key &&
        knownInputs.markInputAsIncompatible(i, {
          context: null,
          reason: InputIncompatibilityReason.IgnoredBecauseOfLanguageServiceRefactoringRange,
        }),
    );
    result.references = result.references.filter(
      // Note: References to the whole class are not migrated as we are not migrating all inputs.
      // We can revisit this at a later time.
      (r) => isInputDescriptor(r.target) && r.target.key === inputDescr.key,
    );

    // Propagate incompatibility to derived classes, and check inheritance.
    pass4__checkInheritanceOfInputs(host, inheritanceGraph, metaRegistry, knownInputs);

    // Check for incompatibility. If present, report it.
    if (targetInput.isIncompatible()) {
      const memberIncompatibility = targetInput.container.memberIncompatibility.get(inputDescr.key);
      const classIncompatibility = targetInput.container.incompatible;

      return {
        edits: [],
        // TODO: Output a better human-readable message here. For now this is better than a noop.
        notApplicableReason: `Input cannot be migrated: ${
          memberIncompatibility !== undefined
            ? InputIncompatibilityReason[memberIncompatibility.reason]
            : classIncompatibility !== null
              ? ClassIncompatibilityReason[classIncompatibility]
              : 'unknown'
        }`,
      };
    }

    reportProgress(60, 'Generating changes to migrate `@Input`...');
    executeMigrationPhase(host, knownInputs, result, analysisDeps);

    const edits: ts.FileTextChanges[] = Array.from(result.replacements.entries()).map(
      ([fileName, changes]) => {
        return {
          fileName,
          textChanges: changes.map((c) => ({
            newText: c.toInsert,
            span: {
              start: c.pos,
              length: c.end - c.pos,
            },
          })),
        };
      },
    );

    if (edits.length === 0) {
      return {
        edits: [],
        notApplicableReason: 'No edits were generated. Consider reporting this as a bug.',
      };
    }

    return {edits};
  }
}

function findParentPropertyDeclaration(node: ts.Node): ts.PropertyDeclaration | null {
  while (!ts.isPropertyDeclaration(node) && !ts.isSourceFile(node)) {
    node = node.parent;
  }
  if (ts.isSourceFile(node)) {
    return null;
  }
  return node;
}
