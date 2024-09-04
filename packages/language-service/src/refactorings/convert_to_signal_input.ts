/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerOptions} from '@angular/compiler-cli';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {MetaKind} from '@angular/compiler-cli/src/ngtsc/metadata';
import {
  ClassIncompatibilityReason,
  InputIncompatibilityReason,
} from '@angular/core/schematics/migrations/signal-migration/src/input_detection/incompatibility';
import {ApplyRefactoringProgressFn} from '@angular/language-service/api';
import ts from 'typescript';
import {isInputContainerNode} from '../../../core/schematics/migrations/signal-migration/src/input_detection/input_node';
import {SignalInputMigration} from '../../../core/schematics/migrations/signal-migration/src/migration';
import {groupReplacementsByFile} from '../../../core/schematics/utils/tsurge/helpers/group_replacements';
import {findTightestNode, getParentClassDeclaration} from '../utils/ts_utils';
import type {ActiveRefactoring} from './refactoring';
import {isTypeScriptFile} from '../utils';

/**
 * Language service refactoring action that can convert `@Input()`
 * declarations to signal inputs.
 *
 * The user can click on an `@Input` property declaration in e.g. the VSCode
 * extension and ask for the input to be migrated. All references, imports and
 * the declaration are updated automatically.
 */
export class ConvertToSignalInputRefactoring implements ActiveRefactoring {
  static id = 'convert-to-signal-input';
  static description = '(experimental fixer): Convert @Input() to a signal input';

  static isApplicable(
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

    const fs = getFileSystem();
    const migration = new SignalInputMigration({
      upgradeAnalysisPhaseToAvoidBatch: true,
      reportProgressFn: reportProgress,
      shouldMigrateInput: (input) => input.descriptor.node === containingProp,
    });

    await migration.analyze(
      migration.prepareProgram({
        ngCompiler: compiler,
        program: compiler.getCurrentProgram(),
        userOptions: compilerOptions,
        programAbsoluteRootPaths: [],
        tsconfigAbsolutePath: '/',
      }),
    );

    if (migration.upgradedAnalysisPhaseResults === null) {
      return {
        edits: [],
        notApplicableReason: 'Unexpected error. No analysis result is available.',
      };
    }

    const {knownInputs, replacements, projectAbsDirPath} = migration.upgradedAnalysisPhaseResults;
    const targetInput = Array.from(knownInputs.knownInputIds.values()).find(
      (i) => i.descriptor.node === containingProp,
    );

    if (targetInput === undefined) {
      return {
        edits: [],
        notApplicableReason: 'Unexpected error. Could not find target input in registry.',
      };
    }

    // Check for incompatibility, and report when it prevented migration.
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

    const fileUpdates = Array.from(groupReplacementsByFile(replacements).entries());
    const edits: ts.FileTextChanges[] = fileUpdates.map(([relativePath, changes]) => {
      return {
        fileName: fs.join(projectAbsDirPath, relativePath),
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
