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
import {ApplyRefactoringProgressFn} from '@angular/language-service/api';
import ts from 'typescript';
import {
  isInputContainerNode,
  SignalInputMigration,
  MigrationConfig,
  getMessageForClassIncompatibility,
  getMessageForInputIncompatibility,
} from '@angular/core/schematics/migrations/signal-migration/src';
import {groupReplacementsByFile} from '@angular/core/schematics/utils/tsurge/helpers/group_replacements';
import {isTypeScriptFile} from '../utils';
import {findTightestNode, getParentClassDeclaration} from '../utils/ts_utils';
import type {ActiveRefactoring} from './refactoring';

/**
 * Base language service refactoring action that can convert `@Input()`
 * declarations to signal inputs.
 *
 * The user can click on an `@Input` property declaration in e.g. the VSCode
 * extension and ask for the input to be migrated. All references, imports and
 * the declaration are updated automatically.
 */
abstract class BaseConvertToSignalInputRefactoring implements ActiveRefactoring {
  abstract config: MigrationConfig;

  constructor(private project: ts.server.Project) {}

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
      ...this.config,
      upgradeAnalysisPhaseToAvoidBatch: true,
      reportProgressFn: reportProgress,
      shouldMigrateInput: (input) => input.descriptor.node === containingProp,
    });

    await migration.analyze(
      migration.prepareProgram({
        ngCompiler: compiler,
        program: compiler.getCurrentProgram(),
        userOptions: compilerOptions,
        programAbsoluteRootFileNames: [],
        host: {
          getCanonicalFileName: (file) => this.project.projectService.toCanonicalFileName(file),
          getCurrentDirectory: () => this.project.getCurrentDirectory(),
        },
      }),
    );

    if (migration.upgradedAnalysisPhaseResults === null) {
      return {
        edits: [],
        notApplicableReason: 'Unexpected error. No analysis result is available.',
      };
    }

    const {knownInputs, replacements, projectRoot} = migration.upgradedAnalysisPhaseResults;
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
      const aggressiveModeRecommendation = !this.config.bestEffortMode
        ? `\n—— Consider using the "(forcibly, ignoring errors)" action to forcibly convert.`
        : '';

      if (memberIncompatibility !== undefined) {
        const {short, extra} = getMessageForInputIncompatibility(memberIncompatibility.reason);
        return {
          edits: [],
          notApplicableReason: `${short}\n${extra}${aggressiveModeRecommendation}`,
        };
      }
      if (classIncompatibility !== null) {
        const {short, extra} = getMessageForClassIncompatibility(classIncompatibility);
        return {
          edits: [],
          notApplicableReason: `${short}\n${extra}${aggressiveModeRecommendation}`,
        };
      }
      return {
        edits: [],
        notApplicableReason:
          'Input cannot be migrated, but no reason was found. ' +
          'Consider reporting a bug to the Angular team.',
      };
    }

    const fileUpdates = Array.from(groupReplacementsByFile(replacements).entries());
    const edits: ts.FileTextChanges[] = fileUpdates.map(([relativePath, changes]) => {
      return {
        fileName: fs.join(projectRoot, relativePath),
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

export class ConvertToSignalInputRefactoring extends BaseConvertToSignalInputRefactoring {
  static id = 'convert-to-signal-input-safe-mode';
  static description = 'Convert @Input() to a signal input (safe)';
  override config: MigrationConfig = {};
}
export class ConvertToSignalInputBestEffortRefactoring extends BaseConvertToSignalInputRefactoring {
  static id = 'convert-to-signal-input-best-effort-mode';
  static description = 'Convert @Input() to a signal input (forcibly, ignoring errors)';
  override config: MigrationConfig = {bestEffortMode: true};
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
