/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerOptions} from '@angular/compiler-cli';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {MetaKind} from '@angular/compiler-cli/src/ngtsc/metadata';
import {
  ClassIncompatibilityReason,
  InputIncompatibilityReason,
} from '@angular/core/schematics/migrations/signal-migration/src/input_detection/incompatibility';
import {ApplyRefactoringProgressFn} from '@angular/language-service/api';
import ts from 'typescript';
import {
  InputNode,
  isInputContainerNode,
} from '../../../core/schematics/migrations/signal-migration/src/input_detection/input_node';
import {KnownInputInfo} from '../../../core/schematics/migrations/signal-migration/src/input_detection/known_inputs';
import {SignalInputMigration} from '../../../core/schematics/migrations/signal-migration/src/migration';
import {
  getInputDescriptor,
  isInputDescriptor,
} from '../../../core/schematics/migrations/signal-migration/src/utils/input_id';
import {groupReplacementsByFile} from '../../../core/schematics/utils/tsurge/helpers/group_replacements';
import {findTightestNode, getParentClassDeclaration} from '../utils/ts_utils';
import {isTypeScriptFile} from '../utils';
import type {Refactoring} from './refactoring';

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

  migration: SignalInputMigration | null = null;

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

  async computeEditsForFix(
    compiler: NgCompiler,
    compilerOptions: CompilerOptions,
    fileName: string,
    positionOrRange: number | ts.TextRange,
    reportProgress: ApplyRefactoringProgressFn,
  ): Promise<ts.RefactorEditInfo> {
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

    // TS incorrectly narrows to `null` if we don't explicitly widen the type.
    // See: https://github.com/microsoft/TypeScript/issues/11498.
    let targetInput: KnownInputInfo | null = null as KnownInputInfo | null;

    this.migration ??= new SignalInputMigration();
    this.migration.upgradeAnalysisPhaseToAvoidBatch = true;
    this.migration.reportProgressFn = reportProgress;
    this.migration.beforeMigrateHook = getBeforeMigrateHookToFilterAllUnrelatedInputs(
      containingProp,
      (i) => (targetInput = i),
    );

    await this.migration.analyze(
      this.migration.prepareProgram({
        ngCompiler: compiler,
        program: compiler.getCurrentProgram(),
        userOptions: compilerOptions,
        programAbsoluteRootPaths: [],
        tsconfigAbsolutePath: '',
      }),
    );

    if (this.migration.upgradedAnalysisPhaseResults === null || targetInput === null) {
      return {
        edits: [],
        notApplicableReason: 'Unexpected error. No edits could be computed.',
      };
    }

    // Check for incompatibility, and report if it prevented migration.
    if (targetInput.isIncompatible()) {
      const {container, descriptor} = targetInput;
      const memberIncompatibility = container.memberIncompatibility.get(descriptor.key);
      const classIncompatibility = container.incompatible;

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

    const edits: ts.FileTextChanges[] = Array.from(
      groupReplacementsByFile(this.migration.upgradedAnalysisPhaseResults.replacements).entries(),
    ).map(([fileName, changes]) => {
      return {
        fileName,
        textChanges: changes.map((c) => ({
          newText: c.data.toInsert,
          span: {
            start: c.data.position,
            length: c.data.end - c.data.position,
          },
        })),
      };
    });

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

function getBeforeMigrateHookToFilterAllUnrelatedInputs(
  containingProp: InputNode,
  setTargetInput: (i: KnownInputInfo) => void,
): SignalInputMigration['beforeMigrateHook'] {
  return (host, knownInputs, result) => {
    const {key} = getInputDescriptor(host, containingProp);
    const targetInput = knownInputs.get({key});

    if (targetInput === undefined) {
      return;
    }

    setTargetInput(targetInput);

    // Mark all other inputs as incompatible.
    // Note that we still analyzed the whole application for potential references.
    // Only migrate references to the target input.
    for (const input of result.sourceInputs.keys()) {
      if (input.key !== key) {
        knownInputs.markInputAsIncompatible(input, {
          context: null,
          reason: InputIncompatibilityReason.IgnoredBecauseOfLanguageServiceRefactoringRange,
        });
      }
    }

    result.references = result.references.filter(
      // Note: References to the whole class are not migrated as we are not migrating all inputs.
      // We can revisit this at a later time.
      (r) => isInputDescriptor(r.target) && r.target.key === key,
    );
  };
}
